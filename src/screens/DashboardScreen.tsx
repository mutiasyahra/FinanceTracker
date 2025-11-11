import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import { User, Transaction, Budget, Saving } from '../api/api';
import Ionicons from 'react-native-vector-icons/Ionicons';

type DashboardScreenProps = {
  user: User | null;
  transactions: Transaction[];
  budgets: Budget[];
  savings: Saving[];
  onRefresh?: () => void;
  refreshing?: boolean;
};

const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  transactions,
  budgets,
  savings,
  onRefresh,
  refreshing = false,
}) => {
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Data pengguna tidak tersedia</Text>
      </View>
    );
  }

  // 📊 Calculate statistics
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const recentTransactions = transactions.slice(0, 5); // Show 5 recent transactions
  const activeBudgets = budgets.length;
  const savingsTargets = savings.length;

  // 🎨 Get icon for transaction category
  const getIconForTransaction = (transaction: Transaction) => {
    const isIncome = transaction.amount > 0;

    if (isIncome) {
      if (transaction.category === 'Salary') return 'briefcase';
      if (transaction.category === 'Freelance') return 'laptop';
      if (transaction.category === 'Investment') return 'trending-up';
      return 'cash';
    }

    if (transaction.category === 'Food') return 'cart';
    if (transaction.category === 'Housing') return 'home';
    if (transaction.category === 'Bills') return 'phone-portrait';
    if (transaction.category === 'Entertainment') return 'film';
    if (transaction.category === 'Transportation') return 'car';
    if (transaction.category === 'Shopping') return 'bag-handle';
    if (transaction.category === 'Health') return 'medkit';
    if (transaction.category === 'Education') return 'book';
    return 'cash';
  };

  // 🎨 Get icon color
  const getIconColor = (transaction: Transaction) => {
    const isIncome = transaction.amount > 0;

    if (isIncome) return '#10B981';

    if (transaction.category === 'Food') return '#EF4444';
    if (transaction.category === 'Housing') return '#3B82F6';
    if (transaction.category === 'Bills') return '#10B981';
    if (transaction.category === 'Entertainment') return '#8B5CF6';
    if (transaction.category === 'Transportation') return '#F59E0B';
    return '#6B7280';
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#10B981']}
          tintColor="#10B981"
        />
      }
    >
      {/* 💳 Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Saldo Total</Text>
          <Ionicons
            name="wallet"
            size={48}
            color="#FFFFFF"
            style={styles.walletIcon}
          />
        </View>
        <Text style={styles.balanceAmount}>{formatCurrency(user.balance)}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="trending-up" size={24} color="#FFFFFF" />
            <Text style={styles.statLabel}>Pemasukan</Text>
            <Text style={styles.incomeAmount}>
              {formatCurrency(totalIncome)}
            </Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="trending-down" size={24} color="#FFFFFF" />
            <Text style={styles.statLabel}>Pengeluaran</Text>
            <Text style={styles.expenseAmount}>
              {formatCurrency(totalExpense)}
            </Text>
          </View>
        </View>
      </View>

      {/* 📊 Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, styles.transactionCard]}>
          <View>
            <Text style={styles.summaryLabel}>Total Transaksi</Text>
            <Text style={styles.summaryValue}>{transactions.length}</Text>
          </View>
          <Ionicons
            name="list"
            size={48}
            color="#10B981"
            style={styles.summaryIconStyle}
          />
        </View>

        <View style={[styles.summaryCard, styles.budgetCard]}>
          <View>
            <Text style={styles.summaryLabel}>Budget Aktif</Text>
            <Text style={styles.summaryValue}>{activeBudgets}</Text>
          </View>
          <Ionicons
            name="wallet"
            size={48}
            color="#3B82F6"
            style={styles.summaryIconStyle}
          />
        </View>

        <View style={[styles.summaryCard, styles.savingsCard]}>
          <View>
            <Text style={styles.summaryLabel}>Target Tabungan</Text>
            <Text style={styles.summaryValue}>{savingsTargets}</Text>
          </View>
          <Ionicons
            name="target"
            size={48}
            color="#8B5CF6"
            style={styles.summaryIconStyle}
          />
        </View>
      </View>

      {/* 📝 Recent Transactions */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaksi Terbaru</Text>
          <Text style={styles.sectionSubtitle}>5 transaksi terakhir</Text>
        </View>

        {recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>Belum ada transaksi</Text>
            <Text style={styles.emptySubtext}>
              Transaksi Anda akan muncul di sini
            </Text>
          </View>
        ) : (
          recentTransactions.map((transaction, index) => {
            const isIncome = transaction.amount > 0;
            const iconName = getIconForTransaction(transaction);
            const iconColor = getIconColor(transaction);

            return (
              <View
                key={transaction.id || index}
                style={styles.transactionItem}
              >
                <View
                  style={[
                    styles.transactionIcon,
                    { backgroundColor: iconColor + '20' },
                  ]}
                >
                  <Ionicons name={iconName} size={24} color={iconColor} />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionTitle}>
                    {transaction.description || 'Transaksi'}
                  </Text>
                  <Text style={styles.transactionCategory}>
                    {transaction.category} • {formatDate(transaction.date)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    isIncome ? styles.positiveAmount : styles.negativeAmount,
                  ]}
                >
                  {isIncome ? '+' : '-'}{' '}
                  {formatCurrency(Math.abs(transaction.amount))}
                </Text>
              </View>
            );
          })
        )}
      </View>

      {/* 💡 Quick Tips */}
      <View style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <Ionicons name="bulb" size={24} color="#F59E0B" />
          <Text style={styles.tipsTitle}>Tips Keuangan</Text>
        </View>
        <Text style={styles.tipsText}>
          • Sisihkan minimal 20% dari pendapatan untuk tabungan{'\n'}• Review
          budget Anda setiap bulan{'\n'}• Hindari utang konsumtif yang tidak
          perlu
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  balanceCard: {
    margin: 20,
    marginTop: 20,
    padding: 24,
    backgroundColor: '#10B981',
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  walletIcon: {
    opacity: 0.3,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
    marginTop: 8,
  },
  incomeAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  summaryContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
  },
  transactionCard: {
    borderLeftColor: '#10B981',
  },
  budgetCard: {
    borderLeftColor: '#3B82F6',
  },
  savingsCard: {
    borderLeftColor: '#8B5CF6',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  summaryIconStyle: {
    opacity: 0.3,
  },
  recentSection: {
    margin: 20,
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positiveAmount: {
    color: '#10B981',
  },
  negativeAmount: {
    color: '#EF4444',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  tipsCard: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
  },
  tipsText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 22,
  },
  errorText: {
    textAlign: 'center',
    color: '#EF4444',
    fontSize: 16,
    marginTop: 100,
  },
});

export default DashboardScreen;
