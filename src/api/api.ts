// ⚠️ GANTI dengan URL API yang valid!
// Untuk testing, gunakan JSONPlaceholder atau buat mock data
const API_BASE_URL =
  'https://f67948d1-b323-42e1-8d44-a149ccb731f5-00-rrgtwgd2jsgf.pike.replit.dev/';

// 🔹 Tipe data dasar
export interface User {
  id: number;
  name: string;
  email: string;
  balance: number;
}

export interface Transaction {
  id?: number;
  category: string;
  amount: number;
  date: string;
  description?: string;
}

export interface Category {
  id: number;
  name: string;
  color?: string;
}

export interface Budget {
  id: number | string;
  category: string;
  limit: number;
  spent: number;
  period?: 'monthly' | 'weekly';
  date?: string;
}

export interface Saving {
  id: number | string;
  goal: string;
  amount: number;
  target?: number;
  targetDate?: string;
  icon?: string;
}

// 🔹 Mock data sementara untuk testing
const mockUser: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  balance: 5000000,
};

const mockTransactions: Transaction[] = [
  {
    id: 1,
    category: 'Makanan',
    amount: 150000,
    date: '2025-01-15',
    description: 'Belanja bulanan',
  },
  {
    id: 2,
    category: 'Transport',
    amount: 50000,
    date: '2025-01-14',
    description: 'Bensin motor',
  },
  {
    id: 3,
    category: 'Hiburan',
    amount: 200000,
    date: '2025-01-13',
    description: 'Nonton bioskop',
  },
];

const mockBudgets: Budget[] = [
  {
    id: 1,
    category: 'Makanan',
    limit: 2000000,
    spent: 1500000,
  },
  {
    id: 2,
    category: 'Transport',
    limit: 500000,
    spent: 350000,
  },
  {
    id: 3,
    category: 'Hiburan',
    limit: 1000000,
    spent: 800000,
  },
];

const mockSavings: Saving[] = [
  {
    id: 1,
    goal: 'Liburan ke Bali',
    amount: 5000000,
    target: 15000000,
    targetDate: '2025-12-31',
    icon: 'airplane',
  },
  {
    id: 2,
    goal: 'Dana Darurat',
    amount: 10000000,
    target: 30000000,
    targetDate: '2025-12-31',
    icon: 'shield-checkmark',
  },
  {
    id: 3,
    goal: 'Beli Laptop',
    amount: 8000000,
    target: 20000000,
    targetDate: '2025-06-30',
    icon: 'laptop',
  },
];

// 🔹 Fetch user data
export const fetchUserData = async (): Promise<User> => {
  try {
    // Gunakan mock data untuk testing
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulasi delay
    return mockUser;

    // Uncomment ini jika API sudah siap:
    // const response = await fetch(`${API_BASE_URL}/user/1`);
    // if (!response.ok) throw new Error('Failed to fetch user data');
    // return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    // Return mock data jika error
    return mockUser;
  }
};

// 🔹 Fetch transactions
export const fetchTransactions = async (): Promise<Transaction[]> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTransactions;

    // Uncomment jika API siap:
    // const response = await fetch(`${API_BASE_URL}/transactions?_sort=date&_order=desc`);
    // if (!response.ok) throw new Error('Failed to fetch transactions');
    // return await response.json();
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return mockTransactions;
  }
};

// 🔹 Fetch categories
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 1, name: 'Makanan', color: '#10B981' },
      { id: 2, name: 'Transport', color: '#3B82F6' },
      { id: 3, name: 'Hiburan', color: '#F59E0B' },
    ];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// 🔹 Fetch budgets
export const fetchBudgets = async (): Promise<Budget[]> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockBudgets;

    // Uncomment jika API siap:
    // const response = await fetch(`${API_BASE_URL}/budgets`);
    // if (!response.ok) throw new Error('Failed to fetch budgets');
    // return await response.json();
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return mockBudgets;
  }
};

// 🔹 Fetch savings
export const fetchSavings = async (): Promise<Saving[]> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSavings;

    // Uncomment jika API siap:
    // const response = await fetch(`${API_BASE_URL}/savings`);
    // if (!response.ok) throw new Error('Failed to fetch savings');
    // return await response.json();
  } catch (error) {
    console.error('Error fetching savings:', error);
    return mockSavings;
  }
};

// 🔹 Add new transaction
export const addTransaction = async (
  transaction: Transaction,
): Promise<Transaction> => {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    if (!response.ok) throw new Error('Failed to add transaction');
    return await response.json();
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

// 🔹 Delete transaction
export const deleteTransaction = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete transaction');
    return true;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};
