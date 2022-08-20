export interface Transfer {
  id: number;
  fromAccountId: number;
  toAccountId: number;
  senderId: number;
  recipientId: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
}
