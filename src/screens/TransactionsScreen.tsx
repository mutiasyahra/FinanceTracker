import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Transaction } from '../api/api';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AddTransactionScreen from './AddTransactionScreen';

type TransactionsScreenProps = {
  transactions: Transaction[];
  onAddTransaction?: (transaction: Transaction) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
};

const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  transactions,
  onAddTransaction,
  onRefresh,
  refreshing = false,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  const getIconForCategory = (category: string, isIncome: boolean) => {
    if (isIncome) {
      if (category === 'Salary') return 'briefcase';
      if (category === 'Freelance') return 'laptop';
      if (category === 'Investment') return 'trending-up';
      if (category === 'Business') return 'briefcase';
      return 'cash';
    }

    if (category === 'Food') return 'cart';
    if (category === 'Housing') return 'home';
    if (category === 'Bills') return 'phone-portrait';
    if (category === 'Entertainment') return 'film';
    if (category === 'Transportation') return 'car';
    if (category === 'Shopping') return 'bag-handle';
    if (category === 'Health') return 'medkit';
    if (category === 'Education') return 'book';
    return 'cash';
  };

  const getIconColor = (category: string, isIncome: boolean) => {
    if (isIncome) return '#10B981';

    if (category === 'Food') return '#EF4444';
    if (category === 'Housing') return '#3B82F6';
    if (category === 'Bills') return '#10B981';
    if (category === 'Entertainment') return '#8B5CF6';
    if (category === 'Transportation') return '#F59E0B';
    if (category === 'Shopping') return '#EC4899';
    if (category === 'Health') return '#14B8A6';
    if (category === 'Education') return '#6366F1';
    return '#6B7280';
  };

  const handleAddTransaction = (transaction: Transaction) => {
    if (onAddTransaction) {
      onAddTransaction(transaction);
    }
    setShowAddModal(false);
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isIncome = item.amount > 0;
    const iconName = getIconForCategory(item.category, isIncome);
    const iconColor = getIconColor(item.category, isIncome);

    return (
      <View style={styles.card}>
        <View
          style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}
        >
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.title}>{item.description || 'Transaksi'}</Text>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
        </View>
        <Text
          style={[styles.amount, isIncome ? styles.income : styles.expense]}
        >
          {isIncome ? '+' : '-'} {formatCurrency(Math.abs(item.amount))}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titleText}>Semua Transaksi</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#10B981']}
            tintColor="#10B981"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>Belum ada transaksi</Text>
            <Text style={styles.emptySubtext}>
              Transaksi Anda akan muncul di sini
            </Text>
          </View>
        }
      />

      <AddTransactionScreen
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddTransaction}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#E8F5E9',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 9,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  category: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  income: {
    color: '#10B981',
  },
  expense: {
    color: '#EF4444',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default TransactionsScreen;
