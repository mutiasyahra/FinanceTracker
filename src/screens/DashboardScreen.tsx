import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { formatCurrency } from '../utils/formatCurrency';
import { User } from '../api/api';

type DashboardScreenProps = {
  user: User | null;
};

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user }) => {
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Data pengguna tidak tersedia</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Halo, {user.name}! 👋</Text>
        <Text style={styles.subtitle}>Selamat datang kembali</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo Total</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(user.balance)}</Text>
        <Text style={styles.balanceEmail}>{user.email}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statLabel}>Total Saldo</Text>
          <Text style={styles.statValue}>{formatCurrency(user.balance)}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>👤</Text>
          <Text style={styles.statLabel}>User ID</Text>
          <Text style={styles.statValue}>#{user.id}</Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ Informasi</Text>
        <Text style={styles.infoText}>
          Gunakan menu di bawah untuk melihat transaksi, budget, dan tabungan
          Anda.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#10B981',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#D1FAE5',
  },
  balanceCard: {
    margin: 20,
    marginTop: -30,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  balanceEmail: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  infoBox: {
    margin: 20,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 20,
  },
  errorText: {
    textAlign: 'center',
    color: '#EF4444',
    fontSize: 16,
    marginTop: 100,
  },
});

export default DashboardScreen;
