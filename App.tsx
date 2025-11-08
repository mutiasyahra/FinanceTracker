import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  Image,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
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

const AppHeader = ({
  user,
  onProfilePress,
}: {
  user: User | null;
  onProfilePress: () => void;
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Ionicons name="wallet" size={28} color="#10B981" />
        <Text style={styles.headerTitle}>Finance Tracker</Text>
      </View>
      <TouchableOpacity style={styles.avatarContainer} onPress={onProfilePress}>
        <Ionicons name="person-circle" size={40} color="#10B981" />
      </TouchableOpacity>
    </View>
  );
};

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
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
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = (newTransaction: Transaction) => {
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
  };

  const handleAddBudget = (newBudget: Budget) => {
    setBudgets([...budgets, newBudget]);
  };

  const handleAddSaving = (newSaving: Saving) => {
    setSavings([...savings, newSaving]);
  };

  const handleUpdateBudget = (updatedBudget: Budget) => {
    const updatedBudgets = budgets.map(budget =>
      budget.id === updatedBudget.id ? updatedBudget : budget,
    );
    setBudgets(updatedBudgets);
  };

  const handleUpdateSaving = (updatedSaving: Saving) => {
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
  };

  const handleDeleteBudget = (budgetId: string | number) => {
    setBudgets(budgets.filter(budget => budget.id !== budgetId));
  };

  const handleDeleteSaving = (savingId: string | number) => {
    setSavings(savings.filter(saving => saving.id !== savingId));
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
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
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Transaksi" options={{ title: 'Transaksi' }}>
          {() => (
            <TransactionsScreen
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
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
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>

      {/* Profile Modal */}
      <Modal
        visible={showProfile}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowProfile(false)}
      >
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
      </Modal>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
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
});

export default App;
