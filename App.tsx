import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from './src/screens/DashboardScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import SavingsScreen from './src/screens/SavingsScreen';
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
  Transactions: undefined;
  Budget: undefined;
  Savings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savings, setSavings] = useState<Saving[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, transData, budgetData, savingData] = await Promise.all(
          [
            fetchUserData(),
            fetchTransactions(),
            fetchBudgets(),
            fetchSavings(),
          ],
        );
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
    loadData();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName = 'help-outline';
            switch (route.name) {
              case 'Dashboard':
                iconName = 'home-outline';
                break;
              case 'Transactions':
                iconName = 'swap-horizontal-outline';
                break;
              case 'Budget':
                iconName = 'wallet-outline';
                break;
              case 'Savings':
                iconName = 'cash-outline';
                break;
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#10B981',
          tabBarInactiveTintColor: '#6B7280',
        })}
      >
        <Tab.Screen name="Dashboard" options={{ title: 'Dashboard' }}>
          {() => <DashboardScreen user={user} />}
        </Tab.Screen>

        <Tab.Screen name="Transactions" options={{ title: 'Transaksi' }}>
          {() => <TransactionsScreen transactions={transactions} />}
        </Tab.Screen>

        <Tab.Screen name="Budget" options={{ title: 'Budget' }}>
          {() => <BudgetScreen budgets={budgets} />}
        </Tab.Screen>

        <Tab.Screen name="Savings" options={{ title: 'Tabungan' }}>
          {() => <SavingsScreen savings={savings} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
