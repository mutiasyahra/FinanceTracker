import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import { Transaction } from '../api/api';

const INCOME_COLOR = '#10B981';
const EXPENSE_COLOR = '#DC143C';
const CARD_BACKGROUND = '#FFFFFF';

interface TransactionCardProps {
  transaction: Transaction;
  icon: string; // This is now an emoji string
  iconColor: string;
  onPress?: () => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  icon,
  iconColor,
  onPress,
}) => {
  const isIncome = transaction.type === 'income' || transaction.amount > 0;
  const displayAmount = Math.abs(transaction.amount);

  const title =
    transaction.description && transaction.description.length > 0
      ? transaction.description
      : transaction.category;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* ✅ UPDATED: Icon menggunakan emoji */}
      <View
        style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}
      >
        <Text style={styles.iconEmoji}>{icon}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.categoryAndDate}>
          {transaction.category} - {formatDate(transaction.date)}
        </Text>
      </View>

      <View style={styles.amountContainer}>
        <Text
          style={[styles.amount, isIncome ? styles.income : styles.expense]}
        >
          {isIncome ? '+' : '-'} {formatCurrency(displayAmount)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconEmoji: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  categoryAndDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  amountContainer: {
    marginLeft: 10,
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  income: {
    color: INCOME_COLOR,
  },
  expense: {
    color: EXPENSE_COLOR,
  },
});

export default TransactionCard;
