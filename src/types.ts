export interface Friend {
  id: string;
  name: string;
  phone: string;
}

export interface Expense {
  id: string;
  tripName: string;
  date: string;
  currency: string;
  friends: Friend[];
  transactions: Transaction[];
  totalAmount: number;
}

export interface Transaction {
  id: string;
  paidBy: string;
  amount: number;
  description: string;
  date: string;
  splitBetween: string[]; // IDs of friends involved in split
}

export interface Split {
  from: string;
  to: string;
  amount: number;
}

export type Currency = {
  code: string;
  symbol: string;
  name: string;
};