// src/api/api.ts

// 🚨 PENTING: Import klien Supabase dari file terpisah
import { supabase } from './supabaseClient';

// 📦 Type definitions
// Catatan: Tipe ID di Supabase adalah string (UUID), kita sesuaikan di sini.
export interface User {
  id: string; // Diubah dari number ke string (UUID)
  name: string;
  email: string;
  balance: number;
  avatar?: string;
}

export interface Transaction {
  id?: string; // Diubah dari number/string ke string (UUID)
  category: string;
  amount: number;
  date: string;
  description?: string;
  type?: 'income' | 'expense';
  user_id?: string; // Tambahkan untuk konsistensi data
}

export interface Category {
  id: number;
  name: string;
  color?: string;
}

export interface Budget {
  id: string; // Diubah dari number/string ke string (UUID)
  category: string;
  limit: number;
  spent: number;
  period?: 'monthly' | 'weekly';
  date?: string;
  user_id?: string;
}

export interface Saving {
  id: string; // Diubah dari number/string ke string (UUID)
  goal: string;
  amount: number;
  target?: number;
  targetDate?: string;
  icon?: string;
  user_id?: string;
}

// 📄 API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

// Helper untuk menangani error dari Supabase
const handleSupabaseError = (
  error: any,
  defaultMessage: string,
): ApiResponse<any> => {
  return {
    success: false,
    data: null,
    error: error.message || defaultMessage,
  };
};

// 🌐 API Calls (Implementasi menggunakan Supabase)

// Mengambil data pengguna yang sedang login
export const fetchUserData = async (): Promise<ApiResponse<User>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        data: null,
        error: 'Pengguna tidak terotentikasi.',
      };
    }

    // Mengambil data profil dari tabel 'users' berdasarkan ID Auth
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id) // Filter berdasarkan user.id (UUID)
      .single();

    if (error) throw error;

    return { success: true, data: data as User };
  } catch (error) {
    return handleSupabaseError(error, 'Gagal memuat data pengguna.');
  }
};

// Mengambil daftar transaksi
export const fetchTransactions = async (): Promise<
  ApiResponse<Transaction[]>
> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log('📝 Fetching transactions for user:', user?.id);

    // RLS Policies akan memastikan hanya transaksi milik user yang diambil
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('❌ Error fetching transactions:', error);
      throw error;
    }

    console.log('✅ Transactions fetched:', data?.length || 0);
    return { success: true, data: (data || []) as Transaction[] };
  } catch (error) {
    return handleSupabaseError(error, 'Gagal memuat transaksi.');
  }
};

// Mengambil daftar anggaran (budget)
export const fetchBudgets = async (): Promise<ApiResponse<Budget[]>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log('💰 Fetching budgets for user:', user?.id);

    const { data, error } = await supabase.from('budgets').select('*');

    if (error) {
      console.error('❌ Error fetching budgets:', error);
      throw error;
    }

    console.log('✅ Budgets fetched:', data?.length || 0);
    return { success: true, data: (data || []) as Budget[] };
  } catch (error) {
    return handleSupabaseError(error, 'Gagal memuat anggaran.');
  }
};

// Mengambil daftar tabungan (savings)
export const fetchSavings = async (): Promise<ApiResponse<Saving[]>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log('🎯 Fetching savings for user:', user?.id);

    const { data, error } = await supabase.from('savings').select('*');

    if (error) {
      console.error('❌ Error fetching savings:', error);
      throw error;
    }

    console.log('✅ Savings fetched:', data?.length || 0);
    return { success: true, data: (data || []) as Saving[] };
  } catch (error) {
    return handleSupabaseError(error, 'Gagal memuat target tabungan.');
  }
};

// --- FUNGSI TULIS DATA (Mutasi) ---

// Menambahkan transaksi baru
export const addTransaction = async (
  transaction: Omit<Transaction, 'id' | 'user_id' | 'type'>,
): Promise<ApiResponse<Transaction>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Pengguna belum login.');

    const newTransactionData = {
      ...transaction,
      user_id: user.id, // Tambahkan Kunci Asing user_id
      type: transaction.amount > 0 ? 'income' : 'expense', // Hitung tipe
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert(newTransactionData)
      .select('*')
      .single();

    if (error) throw error;

    // Update user balance
    const { error: updateError } = await supabase
      .from('users')
      .update({
        balance: supabase.rpc('increment_balance', {
          amount: transaction.amount,
        }),
      })
      .eq('id', user.id);

    return { success: true, data: data as Transaction };
  } catch (error) {
    return handleSupabaseError(error, 'Gagal menambahkan transaksi.');
  }
};

// ✅ BARU: Menambahkan budget baru
export const addBudget = async (
  budget: Omit<Budget, 'id' | 'user_id' | 'spent'>,
): Promise<ApiResponse<Budget>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Pengguna belum login.');

    const newBudgetData = {
      ...budget,
      user_id: user.id,
      spent: 0, // Inisialisasi spent ke 0
    };

    const { data, error } = await supabase
      .from('budgets')
      .insert(newBudgetData)
      .select('*')
      .single();

    if (error) throw error;

    return { success: true, data: data as Budget };
  } catch (error) {
    return handleSupabaseError(error, 'Gagal menambahkan budget.');
  }
};

// ✅ BARU: Menambahkan saving baru
export const addSaving = async (
  saving: Omit<Saving, 'id' | 'user_id'>,
): Promise<ApiResponse<Saving>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Pengguna belum login.');

    const newSavingData = {
      ...saving,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('savings')
      .insert(newSavingData)
      .select('*')
      .single();

    if (error) throw error;

    return { success: true, data: data as Saving };
  } catch (error) {
    return handleSupabaseError(error, 'Gagal menambahkan target tabungan.');
  }
};

// Memperbarui limit anggaran (Budget)
export const updateBudgetLimit = async (
  budgetId: string,
  newLimit: number,
): Promise<ApiResponse<Budget>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Pengguna belum login.');

    const { data, error } = await supabase
      .from('budgets')
      .update({ limit: newLimit })
      .eq('id', budgetId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as Budget };
  } catch (error) {
    return handleSupabaseError(error, 'Gagal memperbarui limit anggaran.');
  }
};

// Menghapus anggaran (Budget)
export const deleteBudget = async (
  budgetId: string,
): Promise<ApiResponse<null>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Pengguna belum login.');

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId)
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true, data: null };
  } catch (error) {
    return handleSupabaseError(error, 'Gagal menghapus anggaran.');
  }
};

// Memperbarui jumlah tabungan (Saving)
export const updateSavingAmount = async (
  savingId: string,
  amountToAdd: number,
): Promise<ApiResponse<Saving>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Pengguna belum login.');

    const { data: currentSaving, error: fetchError } = await supabase
      .from('savings')
      .select('amount')
      .eq('id', savingId)
      .single();

    if (fetchError) throw fetchError;

    const newAmount = currentSaving.amount + amountToAdd;

    const { data, error } = await supabase
      .from('savings')
      .update({ amount: newAmount })
      .eq('id', savingId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as Saving };
  } catch (error) {
    return handleSupabaseError(error, 'Gagal memperbarui jumlah tabungan.');
  }
};

// Menghapus target tabungan (Saving)
export const deleteSaving = async (
  savingId: string,
): Promise<ApiResponse<null>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Pengguna belum login.');

    const { error } = await supabase
      .from('savings')
      .delete()
      .eq('id', savingId)
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true, data: null };
  } catch (error) {
    return handleSupabaseError(error, 'Gagal menghapus target tabungan.');
  }
};

// ✅ BARU: Update Password
export const updatePassword = async (
  newPassword: string,
): Promise<ApiResponse<null>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Pengguna belum login.');

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { success: true, data: null };
  } catch (error) {
    return handleSupabaseError(error, 'Gagal mengubah password.');
  }
};

// ✅ BARU: Update User Profile (name, avatar)
export const updateUserProfile = async (
  updates: Partial<Pick<User, 'name' | 'avatar'>>,
): Promise<ApiResponse<User>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Pengguna belum login.');

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as User };
  } catch (error) {
    return handleSupabaseError(error, 'Gagal mengubah profil.');
  }
};

// --- VALIDATORS ---

type PartialTransaction = Partial<Transaction> & { date: Date | string };
type PartialBudget = Partial<Budget>;
type PartialSaving = Partial<Saving>;

export const validateTransaction = (
  transaction: PartialTransaction,
): string | null => {
  if (!transaction.amount || transaction.amount === 0) {
    return 'Jumlah tidak boleh kosong atau nol';
  }
  if (!transaction.category || transaction.category.trim() === '') {
    return 'Kategori harus dipilih';
  }
  return null;
};

export const validateBudget = (budget: PartialBudget): string | null => {
  if (!budget.category || budget.category.trim() === '') {
    return 'Kategori harus dipilih';
  }
  if (!budget.limit || budget.limit <= 0) {
    return 'Limit budget harus lebih dari 0';
  }
  return null;
};

export const validateSaving = (saving: PartialSaving): string | null => {
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
