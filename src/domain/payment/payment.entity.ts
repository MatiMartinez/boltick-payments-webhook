export interface PaymentEntity {
  createdAt: number;
  id: string;
  items: Item[];
  payment?: Payment;
  phone: string;
  provider: string;
  status: Status;
  user: string;
  callbackStatus?: Status;
}

interface Item {
  title: string;
  quantity: number;
  unit_price: number;
}

interface Payment {
  amount: number;
  code: string;
  id: string;
  updatedAt: number;
}

export type Status = 'Pending' | 'Approved' | 'Rejected';
