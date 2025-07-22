export interface Event {
  id: string;
  artists: Artist[];
  category: string;
  collectionName: string;
  collectionSymbol: string;
  createdAt: number;
  date: string;
  description: string;
  edition: number;
  image: string;
  location: string;
  name: string;
  tickets: Ticket[];
  time: string;
}

interface Artist {
  description: string;
  name: string;
}

interface Ticket {
  id: string;
  description: string;
  name: string;
  price: number;
  tax: number;
  priceWithoutTax: number;
}
