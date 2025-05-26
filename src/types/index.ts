export interface User {
  id: string;
  email: string;
  phoneNumber: string;
  name: string;
  country: string;
  city: string;
  profilePhoto?: string;
  role: 'admin' | 'member';
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  convertedAmount: number; // Amount in GNF
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'wedding' | 'funeral' | 'other';
  budget: number;
  status: 'planned' | 'in_progress' | 'completed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyReport {
  id: string;
  month: string;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  membersStatus: {
    userId: string;
    status: 'paid' | 'pending' | 'overdue';
    amount: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  auth: AuthState;
  transactions: Transaction[];
  events: Event[];
  reports: MonthlyReport[];
} 