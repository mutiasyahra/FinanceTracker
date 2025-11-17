import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native';
import { Transaction } from '../api/api';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TransactionCard from '../components/TransactionCard';
import AddTransactionScreen from './AddTransactionScreen';

const PRIMARY_COLOR = '#6A0DAD';
const INCOME_COLOR = '#10B981';
const EXPENSE_COLOR = '#DC143C';
const BACKGROUND_COLOR = '#F9FAFB';

type TransactionTypeFilter = 'all' | 'income' | 'expense';

type NewTransactionData = Omit<Transaction, 'id' | 'date'> & { date: Date };

interface TransactionsScreenProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: NewTransactionData) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  transactions,
  onAddTransaction,
  onRefresh,
  refreshing = false,
}) => {
  const [filter, setFilter] = useState<TransactionTypeFilter>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // 🔥 Animated button state (DIPINDAHKAN KE DALAM)
  const buttonScale = new Animated.Value(1);

  const handleAddButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowAddModal(true);
    });
  };

  const filteredTransactions = transactions.filter(t => {
    const type = t.amount > 0 ? 'income' : 'expense';
    if (filter === 'all') return true;
    return filter === type;
  });

  const totalAmount = filteredTransactions.reduce(
    (sum, t) => sum + t.amount,
    0,
  );

  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const getCategoryInfo = (
    categoryName: string,
    type: 'income' | 'expense',
  ) => {
    if (type === 'income') {
      const incomeCategories = [
        { name: 'Salary', emoji: '💼', color: INCOME_COLOR },
        { name: 'Freelance', emoji: '💻', color: PRIMARY_COLOR },
        { name: 'Investment', emoji: '📊', color: '#F59E0B' },
        { name: 'Gift', emoji: '🎁', color: '#EC4899' },
        { name: 'Others', emoji: '💰', color: '#6B7280' },
      ];
      return (
        incomeCategories.find(c => c.name === categoryName) || {
          emoji: '💵',
          color: INCOME_COLOR,
        }
      );
    } else {
      const expenseCategories = [
        { name: 'Food & Drink', emoji: '🍕', color: '#EF4444' },
        { name: 'Transportation', emoji: '🚗', color: '#F59E0B' },
        { name: 'Shopping', emoji: '🛒', color: '#EC4899' },
        { name: 'Utilities', emoji: '🏠', color: '#3B82F6' },
        { name: 'Entertainment', emoji: '🎬', color: '#8B5CF6' },
        { name: 'Health', emoji: '⚕️', color: '#059669' },
        { name: 'Investment', emoji: '📈', color: '#4B5563' },
        { name: 'Others', emoji: '📌', color: '#6B7280' },
      ];
      return (
        expenseCategories.find(c => c.name === categoryName) || {
          emoji: '📦',
          color: EXPENSE_COLOR,
        }
      );
    }
  };

  const renderFilterButton = (
    type: TransactionTypeFilter,
    label: string,
    color: string,
  ) => {
    const isSelected = filter === type;

    const selectedStyle =
      type === 'income'
        ? styles.selectedFilterIncome
        : type === 'expense'
        ? styles.selectedFilterExpense
        : styles.selectedFilterAll;

    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          isSelected
            ? selectedStyle
            : {
                backgroundColor: BACKGROUND_COLOR,
                borderColor: '#E5E7EB',
                borderWidth: 1,
              },
        ]}
        onPress={() => setFilter(type)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.filterText,
            { color: isSelected ? '#FFFFFF' : '#6B7280' },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const type = item.amount > 0 ? 'income' : 'expense';
    const categoryInfo = getCategoryInfo(item.category, type);

    return (
      <TransactionCard
        transaction={item}
        icon={categoryInfo.emoji}
        iconColor={categoryInfo.color}
        onPress={() => {
          Alert.alert(
            'Detail Transaksi',
            `Kategori: ${item.category}\nDeskripsi: ${
              item.description || '-'
            }\nTanggal: ${formatDate(item.date)}\nJumlah: ${
              item.amount > 0 ? '+' : ''
            }${formatCurrency(item.amount)}`,
          );
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Ringkasan Transaksi</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={[styles.summaryAmount, { color: INCOME_COLOR }]}>
              {formatCurrency(totalIncome)}
            </Text>
          </View>

          <View style={styles.summarySeparator} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Expense</Text>
            <Text style={[styles.summaryAmount, { color: EXPENSE_COLOR }]}>
              {formatCurrency(totalExpense)}
            </Text>
          </View>
        </View>

        <Text style={styles.netFlowText}>
          Net Flow:{' '}
          <Text
            style={{
              fontWeight: 'bold',
              color: totalAmount >= 0 ? PRIMARY_COLOR : EXPENSE_COLOR,
            }}
          >
            {formatCurrency(totalAmount)}
          </Text>
        </Text>
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'Semua', PRIMARY_COLOR)}
        {renderFilterButton('income', 'Pemasukan', INCOME_COLOR)}
        {renderFilterButton('expense', 'Pengeluaran', EXPENSE_COLOR)}
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={item =>
          item.id?.toString() || new Date().toISOString() + Math.random()
        }
        renderItem={renderTransactionItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={PRIMARY_COLOR}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons
              name="swap-horizontal-outline"
              size={50}
              color="#9CA3AF"
            />
            <Text style={styles.emptyText}>Tidak ada transaksi.</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddButtonPress}
            activeOpacity={0.9}
          >
            <Ionicons name="add-circle-sharp" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Tambah Transaksi</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <AddTransactionScreen
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={onAddTransaction}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND_COLOR },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 16,
    padding: 20,
    elevation: 4,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },

  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },

  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },

  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  summarySeparator: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 10,
  },

  netFlowText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#EEE',
  },

  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },

  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },

  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },

  selectedFilterAll: { backgroundColor: PRIMARY_COLOR },
  selectedFilterIncome: { backgroundColor: INCOME_COLOR },
  selectedFilterExpense: { backgroundColor: EXPENSE_COLOR },

  listContent: {
    padding: 16,
    paddingBottom: 120,
  },

  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },

  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#9CA3AF',
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },

  addButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TransactionsScreen;
