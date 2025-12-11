export interface EventEntity {
  id: string;
  artists: Artist[];
  category: string;
  collectionName: string;
  collectionSymbol: string;
  createdAt: number;
  date: string;
  description: string;
  edition: number;
  endDate: number;
  image: string;
  location: string;
  locationLink: string;
  name: string;
  producer: string;
  startDate: number;
  tickets: Ticket[];
  time: string;
}

interface Artist {
  description: string;
  name: string;
}

interface Ticket {
  id: string;
  availableTickets: number;
  description: string;
  imageUrl: string;
  name: string;
  price: number;
  priceWithoutTax: number;
  tax: number;
}
