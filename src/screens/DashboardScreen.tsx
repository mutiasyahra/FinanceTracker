import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import { User, Transaction, Budget, Saving } from '../api/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';

const PRIMARY_COLOR = '#6A0DAD';
const SECONDARY_COLOR = '#9370DB';
const INCOME_COLOR = '#10B981';
const EXPENSE_COLOR = '#DC143C';
const BACKGROUND_COLOR = '#F5F3FF';
const CARD_BACKGROUND = '#FFFFFF';

type RootTabParamList = {
  Dashboard: undefined;
  Transaksi: undefined;
  Budget: undefined;
  Tabungan: undefined;
};

type NavigationProp = BottomTabNavigationProp<RootTabParamList>;

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
  const navigation = useNavigation<NavigationProp>();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Data pengguna tidak tersedia</Text>
      </View>
    );
  }

  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netBalance = totalIncome - totalExpense;
  const recentTransactions = transactions.slice(0, 5);

  const firstSavingGoal = savings.length > 0 ? savings[0] : null;

  const getTransactionCategoryInfo = (category: string, isIncome: boolean) => {
    if (isIncome) {
      const incomeCategories = [
        { name: 'Salary', emoji: '💼', color: INCOME_COLOR },
        { name: 'Freelance', emoji: '💻', color: SECONDARY_COLOR },
        { name: 'Investment', emoji: '📊', color: '#F59E0B' },
        { name: 'Gift', emoji: '🎁', color: '#EC4899' },
        { name: 'Others', emoji: '💰', color: '#6B7280' },
      ];
      const found = incomeCategories.find(c => c.name === category);
      return found || { emoji: '💵', color: INCOME_COLOR };
    } else {
      const expenseCategories = [
        { name: 'Food & Drink', emoji: '🍕', color: '#EF4444' },
        { name: 'Transportation', emoji: '🚗', color: '#F59E0B' },
        { name: 'Shopping', emoji: '🛒', color: '#EC4899' },
        { name: 'Utilities', emoji: '💡', color: '#3B82F6' },
        { name: 'Entertainment', emoji: '🎬', color: '#8B5CF6' },
        { name: 'Health', emoji: '⚕️', color: '#059669' },
        { name: 'Investment', emoji: '📈', color: '#4B5563' },
        { name: 'Others', emoji: '📌', color: '#6B7280' },
      ];
      const found = expenseCategories.find(c => c.name === category);
      return found || { emoji: '📦', color: EXPENSE_COLOR };
    }
  };

  const getBudgetCategoryInfo = (category: string) => {
    const categories = [
      { name: 'Food', emoji: '🍕', color: '#EF4444' },
      { name: 'Transportation', emoji: '🚗', color: '#F59E0B' },
      { name: 'Entertainment', emoji: '🎬', color: '#8B5CF6' },
      { name: 'Shopping', emoji: '🛒', color: '#EC4899' },
      { name: 'Utilities', emoji: '💡', color: '#3B82F6' },
      { name: 'Health', emoji: '⚕️', color: '#059669' },
      { name: 'Education', emoji: '📚', color: '#6366F1' },
      { name: 'Others', emoji: '📌', color: '#6B7280' },
    ];
    const found = categories.find(c => c.name === category);
    return found || { emoji: '📦', color: PRIMARY_COLOR };
  };

  const getSavingIconInfo = (iconName: string) => {
    const icons = [
      { icon: 'shield', emoji: '🛡️', color: '#EF4444' },
      { icon: 'home', emoji: '🏠', color: '#F59E0B' },
      { icon: 'airplane', emoji: '✈️', color: '#3B82F6' },
      { icon: 'car', emoji: '🚗', color: '#8B5CF6' },
      { icon: 'briefcase', emoji: '🎓', color: '#059669' },
      { icon: 'gift', emoji: '🎁', color: '#EC4899' },
    ];
    const found = icons.find(i => i.icon === iconName);
    return found || { emoji: '🎯', color: PRIMARY_COLOR };
  };

  const getTransactionInfo = (transaction: Transaction) => {
    const isIncome = transaction.type === 'income' || transaction.amount > 0;
    const amount = formatCurrency(Math.abs(transaction.amount));
    const amountStyle = isIncome ? styles.incomeAmount : styles.expenseAmount;
    const categoryInfo = getTransactionCategoryInfo(
      transaction.category,
      isIncome,
    );

    return {
      title: transaction.description || transaction.category,
      amount,
      amountStyle,
      emoji: categoryInfo.emoji,
      iconColor: categoryInfo.color,
      isIncome,
    };
  };

  const savingProgressPercentage = firstSavingGoal
    ? Math.min(
        100,
        (firstSavingGoal.amount / (firstSavingGoal.target || 1)) * 100,
      )
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY_COLOR}
          />
        }
      >
        {/* ✅ 1. Card Balance Utama dengan GRADIENT - Soft & Eye-Friendly */}
        <LinearGradient
          colors={['#8B5CF6', '#A78BFA', '#C4B5FD']} // paling terang di bawah
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>Total Saldo Bersih</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(netBalance)}</Text>

          <View style={styles.balanceSummaryRow}>
            {/* PEMASUKAN */}
            <View style={styles.balanceSummaryItem}>
              <Ionicons
                name="arrow-up-circle-sharp"
                size={20}
                color="#1ce571ff"
              />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.summaryLabel}>Pemasukan</Text>
                <Text
                  style={[styles.summaryAmountIncome, { color: '#3ce571ff' }]}
                >
                  {formatCurrency(totalIncome)}
                </Text>
              </View>
            </View>

            {/* PENGELUARAN */}
            <View style={styles.balanceSummaryItem}>
              <Ionicons
                name="arrow-down-circle-sharp"
                size={20}
                color="#DC143C"
              />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.summaryLabel}>Pengeluaran</Text>
                <Text
                  style={[styles.summaryAmountExpense, { color: '#DC143C' }]}
                >
                  {formatCurrency(totalExpense)}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* 2. Budget Overview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Budget & Peringatan</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Budget')}>
            <Text style={styles.seeAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.budgetScroll}
          contentContainerStyle={{
            paddingRight: 23,
          }}
        >
          {budgets.length === 0 ? (
            <View style={[styles.emptyCard, { width: 300 }]}>
              <Ionicons name="pricetags-outline" size={30} color="#9CA3AF" />
              <Text style={{ color: '#6B7280', marginTop: 8 }}>
                Belum ada budget aktif.
              </Text>
            </View>
          ) : (
            budgets.slice(0, 3).map((budget, index) => {
              const percentage = (budget.spent / budget.limit) * 100;
              const remaining = budget.limit - budget.spent;
              const isWarning = percentage >= 80 && percentage <= 100;
              const isOverspent = percentage > 100;

              const progressColor = isOverspent
                ? EXPENSE_COLOR
                : isWarning
                ? '#F59E0B'
                : SECONDARY_COLOR;

              const categoryInfo = getBudgetCategoryInfo(budget.category);

              return (
                <View
                  key={budget.id}
                  style={[
                    styles.budgetCard,
                    { borderLeftColor: progressColor },
                  ]}
                >
                  <View style={styles.budgetCardHeader}>
                    <Text style={styles.budgetEmoji}>{categoryInfo.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.budgetCategory}>
                        {budget.category}
                      </Text>
                      <Text style={styles.budgetPeriod}>
                        {budget.period === 'monthly'
                          ? '📆 Bulanan'
                          : '🗓️ Mingguan'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.budgetRemaining}>
                    {isOverspent ? 'Overspent' : 'Sisa'}:{' '}
                    {formatCurrency(Math.abs(remaining))}
                  </Text>
                  <Text style={styles.budgetLimit}>
                    Limit: {formatCurrency(budget.limit)}
                  </Text>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: (Math.min(100, percentage) + '%') as any,
                          backgroundColor: progressColor,
                        },
                      ]}
                    />
                  </View>
                  {(isWarning || isOverspent) && (
                    <Text style={[styles.alertText, { color: progressColor }]}>
                      <Ionicons
                        name={
                          isOverspent ? 'alert-circle-sharp' : 'warning-sharp'
                        }
                        size={14}
                      />{' '}
                      {Math.round(percentage)}% Terpakai
                    </Text>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>

        {/* 3. Savings Goal */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Target Tabungan</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Tabungan')}>
            <Text style={styles.seeAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>
        {firstSavingGoal ? (
          <View style={styles.savingCard}>
            <View style={styles.savingIconContainer}>
              <Text style={styles.savingEmoji}>
                {getSavingIconInfo(firstSavingGoal.icon || 'star').emoji}
              </Text>
            </View>
            <View style={styles.savingContent}>
              <Text style={styles.savingTitle}>{firstSavingGoal.goal}</Text>
              <Text style={styles.savingLimit}>
                Target: {formatCurrency(firstSavingGoal.target || 0)}
              </Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: (savingProgressPercentage + '%') as any,
                      backgroundColor: SECONDARY_COLOR,
                    },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.savingRemaining}>
              {formatCurrency(firstSavingGoal.amount)}
            </Text>
          </View>
        ) : (
          <View style={[styles.emptyCard, { marginHorizontal: 20 }]}>
            <Ionicons name="cash-outline" size={30} color="#9CA3AF" />
            <Text style={{ color: '#6B7280', marginTop: 8 }}>
              Tambahkan target tabungan pertama Anda.
            </Text>
          </View>
        )}

        {/* ✅ 4. Transaksi Terbaru - FIXED MINUS SIGN */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaksi Terbaru</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transaksi')}>
            <Text style={styles.seeAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.transactionsList}>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((t, index) => {
              const info = getTransactionInfo(t);
              return (
                <View
                  key={t.id}
                  style={[
                    styles.transactionItem,
                    index === recentTransactions.length - 1 && {
                      borderBottomWidth: 0,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.transactionIconContainer,
                      { backgroundColor: info.iconColor + '20' },
                    ]}
                  >
                    <Text style={styles.transactionEmoji}>{info.emoji}</Text>
                  </View>
                  <View style={styles.transactionContent}>
                    <Text style={styles.transactionTitle} numberOfLines={1}>
                      {info.title}
                    </Text>
                    <Text style={styles.transactionCategoryDate}>
                      {t.category} • {formatDate(t.date)}
                    </Text>
                  </View>
                  {/* ✅ FIXED: Tampilkan tanda minus untuk pengeluaran */}
                  <Text style={info.amountStyle}>
                    {info.isIncome ? '+' : '-'}
                    {info.amount}
                  </Text>
                </View>
              );
            })
          ) : (
            <View style={[styles.emptyCard, { marginHorizontal: 0 }]}>
              <Ionicons
                name="swap-horizontal-outline"
                size={30}
                color="#9CA3AF"
              />
              <Text style={{ color: '#6B7280', marginTop: 8 }}>
                Belum ada transaksi.
              </Text>
            </View>
          )}
        </View>

        {/* 5. Financial Tips Card */}
        <View style={styles.financialTipsCard}>
          <Ionicons
            name="lightbulb-sharp"
            size={24}
            color={PRIMARY_COLOR}
            style={{ marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Tips Keuangan Hari Ini</Text>
            <Text style={styles.tipText}>
              Selalu alokasikan 10-20% dari penghasilan Anda untuk tabungan atau
              investasi di awal bulan (Pay Yourself First).
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  errorText: {
    color: EXPENSE_COLOR,
    fontSize: 16,
  },
  balanceCard: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  balanceSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    paddingTop: 16,
  },
  balanceSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  summaryAmountIncome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  summaryAmountExpense: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  budgetScroll: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  budgetCard: {
    width: 280,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 16,
    padding: 16,
    marginRight: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderLeftWidth: 6,
  },
  budgetCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  budgetEmoji: {
    fontSize: 28,
  },
  budgetCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  budgetPeriod: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  budgetRemaining: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  budgetLimit: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  alertText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  savingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom: 20,
  },
  savingIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: PRIMARY_COLOR + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  savingEmoji: {
    fontSize: 26,
  },
  savingContent: {
    flex: 1,
  },
  savingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  savingRemaining: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
  },
  savingLimit: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  transactionsList: {
    marginHorizontal: 20,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionEmoji: {
    fontSize: 22,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  transactionCategoryDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  incomeAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: INCOME_COLOR,
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: EXPENSE_COLOR,
  },
  financialTipsCard: {
    margin: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: PRIMARY_COLOR + '20',
    backgroundColor: PRIMARY_COLOR + '10',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 30,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 5,
  },
  tipText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  emptyCard: {
    width: '100%',
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default DashboardScreen;
