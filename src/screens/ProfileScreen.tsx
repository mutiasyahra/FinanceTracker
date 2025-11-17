import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { User, Transaction } from '../api/api';
import { formatCurrency } from '../utils/formatCurrency';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ChangePasswordScreen from './ChangePasswordScreen';

const PRIMARY_COLOR = '#6A0DAD'; // Dark Violet - Main Accent
const SECONDARY_COLOR = '#9370DB'; // Medium Purple - Lighter Accent
const EXPENSE_COLOR = '#DC143C'; // Crimson Red
const INCOME_COLOR = '#10B981'; // Green
const BACKGROUND_COLOR = '#F5F3FF'; // Very Light Lavender
const CARD_BACKGROUND = '#FFFFFF';
const TEXT_COLOR = '#111827';
const LIGHT_GREY = '#6B7280';
const SHADOW_COLOR = PRIMARY_COLOR + '40';

type ProfileScreenProps = {
  user: User | null;
  transactions: Transaction[];
  onLogout: () => void;
  onChangePassword?: (newPassword: string) => Promise<void>;
  isLoadingPassword?: boolean;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  transactions,
  onLogout,
  onChangePassword,
  isLoadingPassword = false,
}) => {
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Data pengguna tidak tersedia</Text>
      </View>
    );
  }

  // Calculate statistics
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netBalance = user.balance;
  const totalTransactions = transactions.length;

  const menuItems = [
    {
      section: 'Pengaturan Akun',
      items: [
        {
          icon: 'lock-closed',
          title: 'Ubah Password',
          subtitle: 'Ganti password akun Anda',
          color: PRIMARY_COLOR,
          action: () => {
            if (onChangePassword) {
              setShowChangePasswordModal(true);
            } else {
              Alert.alert('Info', 'Fitur ubah password belum tersedia.');
            }
          },
        },
        {
          icon: 'notifications',
          title: 'Notifikasi',
          subtitle: 'Atur pengingat keuangan',
          color: SECONDARY_COLOR,
          action: () =>
            Alert.alert('Fitur', 'Notifikasi sedang dalam pengembangan.'),
        },
        {
          icon: 'language',
          title: 'Bahasa',
          subtitle: 'Indonesia',
          color: '#F59E0B',
          action: () =>
            Alert.alert(
              'Fitur',
              'Pengaturan Bahasa sedang dalam pengembangan.',
            ),
        },
      ],
    },
    {
      section: 'Dukungan',
      items: [
        {
          icon: 'help-circle',
          title: 'Bantuan & FAQ',
          subtitle: 'Temukan jawaban atas pertanyaan Anda',
          color: '#3B82F6',
          action: () =>
            Alert.alert('Fitur', 'Bantuan sedang dalam pengembangan.'),
        },
        {
          icon: 'star',
          title: 'Beri Penilaian',
          subtitle: 'Dukung kami dengan rating terbaik!',
          color: INCOME_COLOR,
          action: () =>
            Alert.alert('Fitur', 'Penilaian sedang dalam pengembangan.'),
        },
      ],
    },
  ];

  const renderMenuItem = (
    item: (typeof menuItems)[0]['items'][0],
    isLast: boolean,
  ) => (
    <TouchableOpacity
      key={item.title}
      style={[styles.menuItem, isLast && { borderBottomWidth: 0 }]}
      onPress={item.action}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.menuIconContainer,
          { backgroundColor: item.color + '20', borderRadius: 12 },
        ]}
      >
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <>
      <ScrollView style={styles.container}>
        {/* 1. Header Profile */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        {/* 2. Card Saldo Bersih Utama */}
        <View style={[styles.mainBalanceCard, styles.summaryShadow]}>
          <Text style={styles.mainBalanceLabel}>Saldo Akun Saat Ini</Text>
          <Text style={styles.mainBalanceValue}>
            {formatCurrency(netBalance)}
          </Text>
        </View>

        {/* 3. Card Ringkasan Pemasukan & Pengeluaran */}
        <View style={styles.financialSummaryContainer}>
          {/* Total Income */}
          <View style={[styles.smallSummaryCard, styles.summaryShadow]}>
            <View
              style={[
                styles.summaryIconBox,
                { backgroundColor: INCOME_COLOR + '20' },
              ]}
            >
              <Ionicons name="arrow-up-circle" size={24} color={INCOME_COLOR} />
            </View>
            <Text style={styles.summaryLabelSmall}>Pemasukan</Text>
            <Text style={[styles.summaryValueSmall, { color: INCOME_COLOR }]}>
              {formatCurrency(totalIncome)}
            </Text>
          </View>

          {/* Total Expense */}
          <View style={[styles.smallSummaryCard, styles.summaryShadow]}>
            <View
              style={[
                styles.summaryIconBox,
                { backgroundColor: EXPENSE_COLOR + '20' },
              ]}
            >
              <Ionicons
                name="arrow-down-circle"
                size={24}
                color={EXPENSE_COLOR}
              />
            </View>
            <Text style={styles.summaryLabelSmall}>Pengeluaran</Text>
            <Text style={[styles.summaryValueSmall, { color: EXPENSE_COLOR }]}>
              {formatCurrency(totalExpense)}
            </Text>
          </View>
        </View>

        {/* Ringkasan Jumlah Transaksi */}
        <View style={styles.transactionCount}>
          <Ionicons name="stats-chart" size={16} color={PRIMARY_COLOR} />
          <Text style={styles.transactionCountText}>
            Anda memiliki total {totalTransactions} transaksi tercatat.
          </Text>
        </View>

        {/* 4. Menu Settings */}
        {menuItems.map(section => (
          <View key={section.section} style={styles.sectionWrapper}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.menuGroup}>
              {section.items.map((item, index) =>
                renderMenuItem(item, index === section.items.length - 1),
              )}
            </View>
          </View>
        ))}

        {/* 5. Tombol Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() =>
            Alert.alert(
              'Konfirmasi Logout',
              'Apakah Anda yakin ingin keluar dari akun ini?',
              [
                {
                  text: 'Batal',
                  style: 'cancel',
                },
                {
                  text: 'Logout',
                  onPress: onLogout,
                  style: 'destructive',
                },
              ],
            )
          }
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-sharp" size={20} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Modal Change Password */}
      {onChangePassword && (
        <ChangePasswordScreen
          visible={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          onChangePassword={onChangePassword}
          isLoading={isLoadingPassword}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    color: EXPENSE_COLOR,
  },

  // --- A. Header Styling ---
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: CARD_BACKGROUND,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: PRIMARY_COLOR,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_COLOR,
  },
  userEmail: {
    fontSize: 14,
    color: LIGHT_GREY,
    marginTop: 4,
  },

  // --- B. Summary Card Styling ---
  summaryShadow: {
    elevation: 4,
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  mainBalanceCard: {
    backgroundColor: PRIMARY_COLOR,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  mainBalanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: BACKGROUND_COLOR,
    opacity: 0.8,
    marginBottom: 4,
  },
  mainBalanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: CARD_BACKGROUND,
  },

  financialSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  smallSummaryCard: {
    width: '48%',
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 16,
    padding: 16,
  },
  summaryIconBox: {
    marginBottom: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryLabelSmall: {
    fontSize: 12,
    color: LIGHT_GREY,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValueSmall: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_COLOR,
  },

  transactionCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: PRIMARY_COLOR + '10',
    borderRadius: 8,
    gap: 8,
  },
  transactionCountText: {
    fontSize: 14,
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },

  // --- C. Menu Styling ---
  sectionWrapper: {
    marginBottom: 16,
  },
  menuGroup: {
    backgroundColor: CARD_BACKGROUND,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_COLOR,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_COLOR,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: LIGHT_GREY,
  },

  // --- D. Logout Button Styling ---
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: EXPENSE_COLOR,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 30,
    gap: 12,
    elevation: 4,
    shadowColor: EXPENSE_COLOR,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
