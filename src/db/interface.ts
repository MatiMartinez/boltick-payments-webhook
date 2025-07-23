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
  locationLink: string;
  name: string;
  prs: PR[];
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
