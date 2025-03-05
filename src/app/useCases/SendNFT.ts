import { v4 as uuid } from 'uuid';

import { NFT } from '@domain/Payment';
import { SendNFTDTO } from '@dtos/SendNFT';
import { PaymentRepository } from '@repositories/PaymentRepository';
import { S3Service } from '@services/S3/S3Service';
import { SolanaService } from '@services/Solana/SolanaService';

export class SendNFTUseCase {
  constructor(
    private PaymentRepository: PaymentRepository,
    private S3Service: S3Service,
    private SolanaService: SolanaService
  ) {}

  async execute(input: SendNFTDTO) {
    const payment = await this.PaymentRepository.getPaymentById(input.id);
    if (payment.paymentStatus !== 'Approved') return payment;

    const index = payment.nfts.findIndex((element) => element.id === input.nft.id);

    if (index === -1) {
      throw new Error('The NFT does not exist.');
    }

    if (payment.nfts[index].mint) {
      throw new Error('The NFT has already been minted.');
    }

    const uri = await this.uploadMetadata(input.nft, input.paymentId);

    const mintedNFT = await this.SolanaService.mintNFT({
      name: input.nft.collectionName,
      symbol: input.nft.collectionSymbol,
      uri: uri,
    });

    await this.SolanaService.sendNFT(input.userAddress, mintedNFT);

    const newArr = [...payment.nfts];
    newArr[index] = {
      ...newArr[index],
      mint: mintedNFT.address.toBase58(),
      mintDate: new Date().getTime(),
      transactionId: input.paymentId,
    };

    const updatedPayment = await this.PaymentRepository.updateNFT(payment.userId, payment.createdAt, {
      nfts: newArr,
      updatedAt: new Date().getTime(),
    });

    return updatedPayment;
  }

  private async uploadMetadata(nft: NFT, paymentId: string): Promise<string> {
    const bucket = 'boltick-metadata';
    const fileName = `nfts/${uuid()}.json`;

    const image = this.chooseImage(nft.type);
    const s3Uri = `${bucket}/${fileName}`;

    await this.S3Service.uploadFile(bucket, fileName, {
      createdAt: new Date().getTime(),
      imageUrl: image,
      paymentId: paymentId,
      type: nft.type,
      unitPrice: nft.unitPrice,
      used: 0,
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
}
