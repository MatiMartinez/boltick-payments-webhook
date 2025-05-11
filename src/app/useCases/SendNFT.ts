import { v4 as uuid } from 'uuid';

import { NFT, Payment } from '@domain/Payment';
import { SendNFTDTO } from '@dtos/SendNFT';
import { PaymentRepository } from '@repositories/PaymentRepository';
import { S3Service } from '@services/S3/S3Service';
import { SolanaService } from '@services/Solana/SolanaService';
import { events } from '@db/events';

export class SendNFTUseCase {
  constructor(
    private PaymentRepository: PaymentRepository,
    private S3Service: S3Service,
    private SolanaService: SolanaService
  ) {}

  async execute(input: SendNFTDTO) {
    const payment = await this.PaymentRepository.getPaymentById(input.id);
    if (payment.paymentStatus !== 'Approved') {
      throw new Error('Payment is not approved.');
    }

    const currentEvent = events.find((el) => el.id === payment.eventId);
    if (!currentEvent) {
      throw new Error('The NFT event does not exist.');
    }

    const index = payment.nfts.findIndex((element) => element.id === input.nftId);
    if (index === -1) {
      throw new Error('The NFT does not exist.');
    }

    const currentNft = payment.nfts[index];
    if (currentNft.mint) {
      throw new Error('The NFT has already been minted.');
    }

    const ticketNumber = this.generateTicketId(currentNft.collectionSymbol, currentEvent.edition);

    const uri = await this.uploadMetadata(currentNft, payment, ticketNumber);

    const mintedNFT = await this.SolanaService.mintNFT({
      name: currentNft.collectionName,
      symbol: currentNft.collectionSymbol,
      uri: uri,
    });

    await this.SolanaService.sendNFT(payment.walletPublicKey, mintedNFT);

    const newArr = [...payment.nfts];
    newArr[index] = {
      ...newArr[index],
      metadataUrl: uri,
      mint: mintedNFT.address.toBase58(),
      mintDate: new Date().getTime(),
      ticketNumber: ticketNumber,
      transactionId: payment.paymentDetails?.id ?? '',
    };

    await this.PaymentRepository.updateNFT(payment.userId, payment.createdAt, {
      nfts: newArr,
      updatedAt: new Date().getTime(),
    });

    return true;
  }

  private async uploadMetadata(nft: NFT, payment: Payment, ticketNumber: string): Promise<string> {
    const bucket = 'boltick-metadata';
    const fileName = `nfts/${uuid()}.json`;

    const image = this.chooseImage(nft.type);
    const s3Uri = `${bucket}/${fileName}`;

    await this.S3Service.uploadFile(bucket, fileName, {
      payment: {
        id: payment.id,
        userId: payment.userId,
        eventId: payment.eventId,
      },
      nft: {
        id: nft.id,
        collectionName: nft.collectionName,
        collectionSymbol: nft.collectionSymbol,
        ticketNumber: ticketNumber,
        type: nft.type,
        unitPrice: nft.unitPrice,
      },
      createdAt: new Date().getTime(),
      imageUrl: image,
      used: 0,
      useDate: 0,
    });

    return s3Uri;
  }

  private chooseImage(type: string): string {
    const images: Record<string, string> = {
      General: 'https://d1p1oqc35oee7y.cloudfront.net/paax/general.png',
      VIP: 'https://d1p1oqc35oee7y.cloudfront.net/paax/vip.png',
    };

    return images[type] || '';
  }

  private generateTicketId(companyPrefix: string, eventNumber: number): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetter1 = letters.charAt(Math.floor(Math.random() * letters.length));
    const randomLetter2 = letters.charAt(Math.floor(Math.random() * letters.length));

    const randomDigits = Math.floor(100000 + Math.random() * 900000);

    const prefix = companyPrefix.substring(0, 3).toUpperCase();
    const eventCode = eventNumber.toString().padStart(2, '0');

    return `${prefix}${eventCode}-${randomLetter1}${randomLetter2}${randomDigits}`;
  }
}
