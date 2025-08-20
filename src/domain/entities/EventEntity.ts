export interface EventEntity {
  id: string;
  artists: Artist[];
  availableTickets: number;
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
  prs: PR[];
  startDate: number;
  tickets: Ticket[];
  time: string;
}

interface Artist {
  description: string;
  name: string;
}

interface PR {
  id: string;
  email: string;
  name: string;
  phone: string;
  photo: string;
}

interface Ticket {
  id: string;
  description: string;
  imageUrl: string;
  name: string;
  price: number;
  priceWithoutTax: number;
  tax: number;
}
