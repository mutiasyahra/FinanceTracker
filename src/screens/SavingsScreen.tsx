import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { formatCurrency } from '../utils/formatCurrency';
import { Saving } from '../api/api';

type SavingsScreenProps = {
  savings: Saving[];
};

const SavingsScreen: React.FC<SavingsScreenProps> = ({ savings }) => {
  const totalSavings = savings.reduce((sum, saving) => sum + saving.amount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tabungan</Text>
        <Text style={styles.subtitle}>
          Total Tabungan: {formatCurrency(totalSavings)}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {savings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏦</Text>
            <Text style={styles.emptyText}>Belum ada tabungan</Text>
            <Text style={styles.emptySubtext}>
              Mulai menabung untuk masa depan Anda
            </Text>
          </View>
        ) : (
          savings.map((saving, index) => (
            <View key={saving.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>
                    {['🎯', '🏠', '✈️', '🎓', '🚗', '💍'][index % 6]}
                  </Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.goal}>{saving.goal}</Text>
                  <Text style={styles.savingId}>ID: {saving.id}</Text>
                </View>
              </View>

              <View style={styles.amountContainer}>
                <View style={styles.amountBox}>
                  <Text style={styles.amountLabel}>Jumlah Tabungan</Text>
                  <Text style={styles.amount}>
                    {formatCurrency(saving.amount)}
                  </Text>
                </View>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  💡 Terus menabung untuk mencapai tujuan Anda!
                </Text>
              </View>
            </View>
          ))
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
    color: '#10B981',
    fontWeight: '600',
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
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
  },
  goal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  savingId: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  amountContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  amountBox: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    color: '#059669',
    marginBottom: 8,
    fontWeight: '500',
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
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

export default SavingsScreen;
