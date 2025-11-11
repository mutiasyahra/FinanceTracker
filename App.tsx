import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  Alert,
  ToastAndroid,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from './src/screens/DashboardScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import SavingsScreen from './src/screens/SavingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoadingScreen from './src/components/LoadingScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  fetchUserData,
  fetchTransactions,
  fetchBudgets,
  fetchSavings,
  addTransaction,
  validateTransaction,
  validateBudget,
  validateSaving,
  User,
  Transaction,
  Budget,
  Saving,
} from './src/api/api';

export type RootTabParamList = {
  Dashboard: undefined;
  Transaksi: undefined;
  Budget: undefined;
  Tabungan: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

// 🎯 Toast notification utility
const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('Info', message);
  }
};

// 📱 App Header Component
const AppHeader = ({
  user,
  onProfilePress,
}: {
  user: User | null;
  onProfilePress: () => void;
}) => {
  return (
    <SafeAreaView style={styles.headerSafeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="wallet" size={28} color="#10B981" />
          <Text style={styles.headerTitle}>Finance Tracker</Text>
        </View>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={onProfilePress}
        >
          <Ionicons name="person-circle" size={40} color="#10B981" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

function App() {
  // 📄 State Management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [showProfile, setShowProfile] = useState(false);

  // 📡 Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // 📄 Load data from API
  const loadData = async (showRefreshToast = false) => {
    try {
      setError(null);
      if (!showRefreshToast) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      // Fetch all data in parallel for better performance
      const [userData, transData, budgetData, savingData] = await Promise.all([
        fetchUserData(),
        fetchTransactions(),
        fetchBudgets(),
        fetchSavings(),
      ]);

      setUser(userData);
      setTransactions(transData);
      setBudgets(budgetData);
      setSavings(savingData);

      if (showRefreshToast) {
        showToast('✅ Data berhasil diperbarui!');
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setError('Gagal memuat data. Silakan coba lagi.');
      showToast('❌ Gagal memuat data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ➕ Add new transaction
  const handleAddTransaction = async (newTransaction: Transaction) => {
    try {
      // Validate transaction
      const validationError = validateTransaction(newTransaction);
      if (validationError) {
        Alert.alert('Validasi Gagal', validationError);
        return;
      }

      // Optimistic update - update UI immediately
      const transactionWithId = {
        ...newTransaction,
        id: Date.now(),
      };

      setTransactions([transactionWithId, ...transactions]);

      // Update user balance
      if (user) {
        setUser({
          ...user,
          balance: user.balance + newTransaction.amount,
        });
      }

      // Update budget if it's an expense
      if (newTransaction.amount < 0) {
        const updatedBudgets = budgets.map(budget => {
          if (budget.category === newTransaction.category) {
            return {
              ...budget,
              spent: budget.spent + Math.abs(newTransaction.amount),
            };
          }
          return budget;
        });
        setBudgets(updatedBudgets);
      }

      // Try to save to API
      const result = await addTransaction(newTransaction);
      if (result.success) {
        showToast('✅ Transaksi berhasil ditambahkan!');
      } else {
        showToast('⚠️ Transaksi disimpan secara lokal');
      }
    } catch (error) {
      console.error('❌ Error adding transaction:', error);
      showToast('❌ Gagal menambahkan transaksi');
    }
  };

  // ➕ Add new budget
  const handleAddBudget = (newBudget: Budget) => {
    try {
      // Validate budget
      const validationError = validateBudget(newBudget);
      if (validationError) {
        Alert.alert('Validasi Gagal', validationError);
        return;
      }

      setBudgets([...budgets, newBudget]);
      showToast('✅ Budget berhasil ditambahkan!');
    } catch (error) {
      console.error('❌ Error adding budget:', error);
      showToast('❌ Gagal menambahkan budget');
    }
  };

  // ➕ Add new saving
  const handleAddSaving = (newSaving: Saving) => {
    try {
      // Validate saving
      const validationError = validateSaving(newSaving);
      if (validationError) {
        Alert.alert('Validasi Gagal', validationError);
        return;
      }

      setSavings([...savings, newSaving]);
      showToast('✅ Target tabungan berhasil ditambahkan!');
    } catch (error) {
      console.error('❌ Error adding saving:', error);
      showToast('❌ Gagal menambahkan target tabungan');
    }
  };

  // ✏️ Update budget
  const handleUpdateBudget = (updatedBudget: Budget) => {
    try {
      const updatedBudgets = budgets.map(budget =>
        budget.id === updatedBudget.id ? updatedBudget : budget,
      );
      setBudgets(updatedBudgets);
      showToast('✅ Budget berhasil diperbarui!');
    } catch (error) {
      console.error('❌ Error updating budget:', error);
      showToast('❌ Gagal memperbarui budget');
    }
  };

  // ✏️ Update saving
  const handleUpdateSaving = (updatedSaving: Saving) => {
    try {
      const updatedSavings = savings.map(saving =>
        saving.id === updatedSaving.id ? updatedSaving : saving,
      );
      setSavings(updatedSavings);

      // Update user balance
      if (user) {
        const oldSaving = savings.find(s => s.id === updatedSaving.id);
        if (oldSaving) {
          const difference = updatedSaving.amount - oldSaving.amount;
          setUser({
            ...user,
            balance: user.balance - difference,
          });
        }
      }

      showToast('✅ Tabungan berhasil diperbarui!');
    } catch (error) {
      console.error('❌ Error updating saving:', error);
      showToast('❌ Gagal memperbarui tabungan');
    }
  };

  // 🗑️ Delete budget
  const handleDeleteBudget = (budgetId: string | number) => {
    try {
      setBudgets(budgets.filter(budget => budget.id !== budgetId));
      showToast('✅ Budget berhasil dihapus!');
    } catch (error) {
      console.error('❌ Error deleting budget:', error);
      showToast('❌ Gagal menghapus budget');
    }
  };

  // 🗑️ Delete saving
  const handleDeleteSaving = (savingId: string | number) => {
    try {
      setSavings(savings.filter(saving => saving.id !== savingId));
      showToast('✅ Target tabungan berhasil dihapus!');
    } catch (error) {
      console.error('❌ Error deleting saving:', error);
      showToast('❌ Gagal menghapus target tabungan');
    }
  };

  // 🔄 Retry loading data
  const handleRetry = () => {
    loadData();
  };

  // 🔄 Pull to refresh
  const handleRefresh = () => {
    loadData(true);
  };

  // 📱 Loading screen
  if (loading) {
    return <LoadingScreen message="Memuat data keuangan Anda..." />;
  }

  // ❌ Error screen
  if (error && !user) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Terjadi Kesalahan</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.appContainer}>
      <NavigationContainer>
        <AppHeader user={user} onProfilePress={() => setShowProfile(true)} />
        {/* @ts-ignore */}
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName = 'help-outline';
              switch (route.name) {
                case 'Dashboard':
                  iconName = focused ? 'home' : 'home-outline';
                  break;
                case 'Transaksi':
                  iconName = focused
                    ? 'swap-horizontal'
                    : 'swap-horizontal-outline';
                  break;
                case 'Budget':
                  iconName = focused ? 'wallet' : 'wallet-outline';
                  break;
                case 'Tabungan':
                  iconName = focused ? 'cash' : 'cash-outline';
                  break;
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#10B981',
            tabBarInactiveTintColor: '#9CA3AF',
            tabBarStyle: {
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: '#E5E7EB',
              backgroundColor: '#FFFFFF',
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
          })}
        >
          <Tab.Screen name="Dashboard" options={{ title: 'Dashboard' }}>
            {() => (
              <DashboardScreen
                user={user}
                transactions={transactions}
                budgets={budgets}
                savings={savings}
                onRefresh={handleRefresh}
                refreshing={refreshing}
              />
            )}
          </Tab.Screen>

          <Tab.Screen name="Transaksi" options={{ title: 'Transaksi' }}>
            {() => (
              <TransactionsScreen
                transactions={transactions}
                onAddTransaction={handleAddTransaction}
                onRefresh={handleRefresh}
                refreshing={refreshing}
              />
            )}
          </Tab.Screen>

          <Tab.Screen name="Budget" options={{ title: 'Budget' }}>
            {() => (
              <BudgetScreen
                budgets={budgets}
                onAddBudget={handleAddBudget}
                onUpdateBudget={handleUpdateBudget}
                onDeleteBudget={handleDeleteBudget}
                onRefresh={handleRefresh}
                refreshing={refreshing}
              />
            )}
          </Tab.Screen>

          <Tab.Screen name="Tabungan" options={{ title: 'Tabungan' }}>
            {() => (
              <SavingsScreen
                savings={savings}
                onAddSaving={handleAddSaving}
                onUpdateSaving={handleUpdateSaving}
                onDeleteSaving={handleDeleteSaving}
                onRefresh={handleRefresh}
                refreshing={refreshing}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>

        {/* 📱 Profile Modal */}
        <Modal
          visible={showProfile}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowProfile(false)}
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Profile</Text>
                <TouchableOpacity
                  onPress={() => setShowProfile(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={28} color="#111827" />
                </TouchableOpacity>
              </View>
              <ProfileScreen user={user} transactions={transactions} />
            </View>
          </SafeAreaView>
        </Modal>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerSafeArea: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default App;
