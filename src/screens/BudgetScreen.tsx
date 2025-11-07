import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { formatCurrency } from '../utils/formatCurrency';
import { Budget } from '../api/api';

type BudgetScreenProps = {
  budgets: Budget[];
};

const BudgetScreen: React.FC<BudgetScreenProps> = ({ budgets }) => {
  const calculatePercentage = (spent: number, limit: number): number => {
    return limit > 0 ? (spent / limit) * 100 : 0;
  };

  const getStatusColor = (percentage: number): string => {
    if (percentage >= 90) return '#EF4444';
    if (percentage >= 70) return '#F59E0B';
    return '#10B981';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget</Text>
        <Text style={styles.subtitle}>Kelola budget Anda dengan bijak</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {budgets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={styles.emptyText}>Belum ada budget</Text>
            <Text style={styles.emptySubtext}>
              Budget Anda akan muncul di sini
            </Text>
          </View>
        ) : (
          budgets.map(budget => {
            const percentage = calculatePercentage(budget.spent, budget.limit);
            const statusColor = getStatusColor(percentage);
            const remaining = budget.limit - budget.spent;

            return (
              <View key={budget.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.category}>{budget.category}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusColor + '20' },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {percentage.toFixed(0)}%
                    </Text>
                  </View>
                </View>

                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: statusColor,
                      },
                    ]}
                  />
                </View>

                <View style={styles.amountContainer}>
                  <View>
                    <Text style={styles.label}>Terpakai</Text>
                    <Text style={styles.spent}>
                      {formatCurrency(budget.spent)}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <View>
                    <Text style={styles.label}>Limit</Text>
                    <Text style={styles.limit}>
                      {formatCurrency(budget.limit)}
                    </Text>
                  </View>
                </View>

                <View style={styles.remainingContainer}>
                  <Text style={styles.remainingLabel}>
                    {remaining >= 0 ? 'Sisa Budget' : 'Melebihi Budget'}
                  </Text>
                  <Text
                    style={[
                      styles.remainingAmount,
                      { color: remaining >= 0 ? '#10B981' : '#EF4444' },
                    ]}
                  >
                    {formatCurrency(Math.abs(remaining))}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  category: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  spent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
    textAlign: 'center',
  },
  limit: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
    textAlign: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  remainingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  remainingLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  remainingAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default BudgetScreen;
