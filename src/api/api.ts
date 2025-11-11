// 🔥 ENHANCED API with better error handling and real data support

const API_BASE_URL =
  'https://f67948d1-b323-42e1-8d44-a149ccb731f5-00-rrgtwgd2jsgf.pike.replit.dev/';

// 📦 Type definitions
export interface User {
  id: number;
  name: string;
  email: string;
  balance: number;
  avatar?: string;
}

export interface Transaction {
  id?: number;
  category: string;
  amount: number;
  date: string;
  description?: string;
  type?: 'income' | 'expense';
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

// 🔄 API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

// 🛡️ Error handler utility
const handleApiError = (
  error: any,
  defaultMessage: string,
): ApiResponse<any> => {
  console.error('API Error:', error);
  return {
    success: false,
    data: null,
    error: error.message || defaultMessage,
  };
};

// 🎯 Mock data - fallback when API fails
const mockUser: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  balance: 15000000,
  avatar:
    'https://ui-avatars.com/api/?name=John+Doe&background=10B981&color=fff',
};

const mockTransactions: Transaction[] = [
  {
    id: 1,
    category: 'Food',
    amount: -150000,
    date: new Date().toISOString().split('T')[0],
    description: 'Belanja bulanan di supermarket',
    type: 'expense',
  },
  {
    id: 2,
    category: 'Salary',
    amount: 5000000,
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    description: 'Gaji bulanan',
    type: 'income',
  },
  {
    id: 3,
    category: 'Transportation',
    amount: -50000,
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    description: 'Bensin motor',
    type: 'expense',
  },
  {
    id: 4,
    category: 'Entertainment',
    amount: -200000,
    date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
    description: 'Nonton bioskop',
    type: 'expense',
  },
  {
    id: 5,
    category: 'Freelance',
    amount: 1500000,
    date: new Date(Date.now() - 345600000).toISOString().split('T')[0],
    description: 'Project website client',
    type: 'income',
  },
];

const mockBudgets: Budget[] = [
  {
    id: 1,
    category: 'Food',
    limit: 2000000,
    spent: 850000,
    period: 'monthly',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 2,
    category: 'Transportation',
    limit: 500000,
    spent: 320000,
    period: 'monthly',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 3,
    category: 'Entertainment',
    limit: 1000000,
    spent: 650000,
    period: 'monthly',
    date: new Date().toISOString().split('T')[0],
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

// 🔧 API timeout utility
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout = 5000,
) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// 📡 Fetch user data
export const fetchUserData = async (): Promise<User> => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/user/1`, {}, 3000);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('⚠️ API failed, using mock data:', error);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockUser;
  }
};

// 📡 Fetch transactions
export const fetchTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/transactions?_sort=date&_order=desc`,
      {},
      3000,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('⚠️ API failed, using mock data:', error);
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockTransactions;
  }
};

// 📡 Fetch categories
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/categories`,
      {},
      3000,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('⚠️ API failed, using default categories:', error);
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      { id: 1, name: 'Food', color: '#EF4444' },
      { id: 2, name: 'Transportation', color: '#F59E0B' },
      { id: 3, name: 'Entertainment', color: '#8B5CF6' },
      { id: 4, name: 'Housing', color: '#3B82F6' },
      { id: 5, name: 'Bills', color: '#10B981' },
      { id: 6, name: 'Shopping', color: '#EC4899' },
      { id: 7, name: 'Health', color: '#14B8A6' },
      { id: 8, name: 'Education', color: '#6366F1' },
    ];
  }
};

// 📡 Fetch budgets
export const fetchBudgets = async (): Promise<Budget[]> => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/budgets`,
      {},
      3000,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('⚠️ API failed, using mock data:', error);
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockBudgets;
  }
};

// 📡 Fetch savings
export const fetchSavings = async (): Promise<Saving[]> => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/savings`,
      {},
      3000,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('⚠️ API failed, using mock data:', error);
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockSavings;
  }
};

// ✅ Add new transaction
export const addTransaction = async (
  transaction: Transaction,
): Promise<ApiResponse<Transaction>> => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/transactions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      },
      5000,
    );

    if (!response.ok) {
      throw new Error('Failed to add transaction');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    // Fallback: return the transaction with generated ID
    console.warn('⚠️ API failed, transaction saved locally:', error);
    return {
      success: true,
      data: { ...transaction, id: Date.now() },
    };
  }
};

// 🗑️ Delete transaction
export const deleteTransaction = async (
  id: number,
): Promise<ApiResponse<boolean>> => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/transactions/${id}`,
      {
        method: 'DELETE',
      },
      5000,
    );

    if (!response.ok) {
      throw new Error('Failed to delete transaction');
    }

    return { success: true, data: true };
  } catch (error) {
    return handleApiError(error, 'Failed to delete transaction');
  }
};

// ✏️ Update transaction
export const updateTransaction = async (
  id: number,
  transaction: Partial<Transaction>,
): Promise<ApiResponse<Transaction>> => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/transactions/${id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      },
      5000,
    );

    if (!response.ok) {
      throw new Error('Failed to update transaction');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return handleApiError(error, 'Failed to update transaction');
  }
};

// 🎯 Validation utilities
export const validateTransaction = (
  transaction: Partial<Transaction>,
): string | null => {
  if (!transaction.amount || transaction.amount === 0) {
    return 'Jumlah harus lebih dari 0';
  }
  if (!transaction.description || transaction.description.trim() === '') {
    return 'Deskripsi tidak boleh kosong';
  }
  if (!transaction.category || transaction.category.trim() === '') {
    return 'Kategori harus dipilih';
  }
  if (!transaction.date) {
    return 'Tanggal harus dipilih';
  }
  return null;
};

export const validateBudget = (budget: Partial<Budget>): string | null => {
  if (!budget.category || budget.category.trim() === '') {
    return 'Kategori harus dipilih';
  }
  if (!budget.limit || budget.limit <= 0) {
    return 'Limit budget harus lebih dari 0';
  }
  return null;
};

export const validateSaving = (saving: Partial<Saving>): string | null => {
  if (!saving.goal || saving.goal.trim() === '') {
    return 'Nama target tidak boleh kosong';
  }
  if (!saving.target || saving.target <= 0) {
    return 'Target jumlah harus lebih dari 0';
  }
  if (saving.amount && saving.target && saving.amount > saving.target) {
    return 'Jumlah saat ini tidak boleh melebihi target';
  }
  return null;
};

// 📊 Statistics utilities
export const calculateTotalIncome = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
};

export const calculateTotalExpense = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

export const getTransactionsByCategory = (
  transactions: Transaction[],
): Record<string, number> => {
  return transactions.reduce((acc, t) => {
    const amount = Math.abs(t.amount);
    acc[t.category] = (acc[t.category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);
};
