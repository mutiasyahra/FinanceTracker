import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ToastAndroid,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardScreen from './src/screens/DashboardScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import SavingsScreen from './src/screens/SavingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import LoadingScreen from './src/components/LoadingScreen';
import Header from './src/components/Header';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { supabase } from './src/api/supabaseClient';

import {
  fetchUserData,
  fetchTransactions,
  fetchBudgets,
  fetchSavings,
  addTransaction,
  addBudget,
  addSaving,
  validateTransaction,
  validateBudget,
  validateSaving,
  deleteBudget,
  deleteSaving,
  updateBudgetLimit,
  updateSavingAmount,
  updatePassword,
  User,
  Transaction,
  Budget,
  Saving,
} from './src/api/api';

const PRIMARY_COLOR = '#6A0DAD';
const SECONDARY_COLOR = '#9370DB';

export type RootTabParamList = {
  Dashboard: undefined;
  Transaksi: undefined;
  Budget: undefined;
  Tabungan: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('Info', message);
  }
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [authScreen, setAuthScreen] = useState<'login' | 'signup'>('login');

  const fetchData = async () => {
    setIsLoading(true);
    setHasError(false);

    console.log('🔄 Fetching data...');

    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      console.log('👤 Auth User:', authUser?.id);

      if (!authUser) {
        throw new Error('User tidak terautentikasi');
      }

      const [
        userDataResponse,
        transactionsResponse,
        budgetsResponse,
        savingsResponse,
      ] = await Promise.all([
        fetchUserData(),
        fetchTransactions(),
        fetchBudgets(),
        fetchSavings(),
      ]);

      const userPayload = (userDataResponse as any).data || userDataResponse;
      const transactionsPayload =
        (transactionsResponse as any).data || transactionsResponse || [];
      const budgetsPayload =
        (budgetsResponse as any).data || budgetsResponse || [];
      const savingsPayload =
        (savingsResponse as any).data || savingsResponse || [];

      if (!userPayload) {
        throw new Error('Gagal memuat data pengguna');
      }

      setUser(userPayload as User);
      setTransactions(
        Array.isArray(transactionsPayload) ? transactionsPayload : [],
      );
      setBudgets(Array.isArray(budgetsPayload) ? budgetsPayload : []);
      setSavings(Array.isArray(savingsPayload) ? savingsPayload : []);

      console.log('✅ Data loaded successfully');
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setHasError(true);
      showToast('❌ Gagal memuat data: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setHasError(false);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

      if (authError) throw authError;

      await fetchData();
      showToast('✅ Login Berhasil!');
    } catch (error) {
      setHasError(true);
      setUser(null);

      const errorMessage = (error as any).message || 'Login gagal';
      showToast('❌ ' + errorMessage);

      if (
        errorMessage.includes('Invalid login') ||
        errorMessage.includes('Invalid')
      ) {
        Alert.alert(
          'Login Gagal',
          'Email atau password salah. Apakah Anda ingin mendaftar akun baru?',
          [
            { text: 'Batal', style: 'cancel' },
            {
              text: 'Daftar',
              onPress: () => setAuthScreen('signup'),
            },
          ],
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (
    name: string,
    email: string,
    password: string,
  ) => {
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: insertError } = await supabase.from('users').insert({
          id: authData.user.id,
          name: name,
          email: email,
          balance: 0,
          avatar:
            'https://ui-avatars.com/api/?name=' + encodeURIComponent(name),
        });

        if (insertError) throw insertError;
      }

      Alert.alert(
        'Registrasi Berhasil!',
        'Akun Anda telah dibuat. Silakan login dengan email dan password Anda.',
        [
          {
            text: 'OK',
            onPress: () => setAuthScreen('login'),
          },
        ],
      );
    } catch (error) {
      Alert.alert('Error', 'Registrasi gagal: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setTransactions([]);
      setBudgets([]);
      setSavings([]);
      setAuthScreen('login');
      showToast('👋 Berhasil Logout');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const handleChangePassword = async (newPassword: string) => {
    setIsLoadingPassword(true);

    try {
      const response = await updatePassword(newPassword);

      if (response.success) {
        Alert.alert('Berhasil', 'Password Anda telah berhasil diubah.', [
          { text: 'OK' },
        ]);
      } else {
        throw new Error(response.error || 'Gagal mengubah password');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Gagal mengubah password: ' + (error as Error).message,
      );
    } finally {
      setIsLoadingPassword(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await fetchData();
      }
    };

    checkSession();
  }, []);

  const handleAddTransaction = async (
    newTransaction: Omit<Transaction, 'id' | 'date'> & { date: Date },
  ) => {
    const transactionWithDateString = {
      ...newTransaction,
      date: newTransaction.date.toISOString(),
      amount: parseFloat(String(newTransaction.amount)),
    };

    const error = validateTransaction(transactionWithDateString);
    if (error) {
      showToast(`❌ Gagal: ${error}`);
      return;
    }

    try {
      const response = await addTransaction(transactionWithDateString);

      if (response.success && response.data) {
        setTransactions([response.data, ...transactions]);

        if (user) {
          setUser({ ...user, balance: user.balance + response.data.amount });
        }

        if (response.data.amount < 0) {
          const budgetIndex = budgets.findIndex(
            b => b.category === response.data!.category,
          );
          if (budgetIndex !== -1) {
            const updatedBudgets = [...budgets];
            updatedBudgets[budgetIndex] = {
              ...updatedBudgets[budgetIndex],
              spent:
                updatedBudgets[budgetIndex].spent +
                Math.abs(response.data.amount),
            };
            setBudgets(updatedBudgets);
          }
        }

        showToast('✅ Transaksi berhasil ditambahkan!');
      } else {
        throw new Error(response.error || 'Gagal menambahkan transaksi');
      }
    } catch (error) {
      showToast('❌ Gagal menambahkan transaksi');
    }
  };

  const handleAddBudget = async (newBudget: Budget) => {
    const error = validateBudget(newBudget);
    if (error) {
      showToast(`❌ Gagal: ${error}`);
      return;
    }

    try {
      const response = await addBudget(newBudget);

      if (response.success && response.data) {
        setBudgets([response.data, ...budgets]);
        showToast('✅ Budget berhasil ditambahkan!');
      } else {
        throw new Error(response.error || 'Gagal menambahkan budget');
      }
    } catch (error) {
      showToast('❌ Gagal menambahkan budget');
    }
  };

  const handleAddSaving = async (newSaving: Saving) => {
    const error = validateSaving(newSaving);
    if (error) {
      showToast(`❌ Gagal: ${error}`);
      return;
    }

    try {
      const response = await addSaving(newSaving);

      if (response.success && response.data) {
        setSavings([response.data, ...savings]);
        showToast('✅ Target Tabungan berhasil ditambahkan!');
      } else {
        throw new Error(response.error || 'Gagal menambahkan target tabungan');
      }
    } catch (error) {
      showToast('❌ Gagal menambahkan target tabungan');
    }
  };

  const handleUpdateBudget = async (updatedBudget: Budget) => {
    try {
      setBudgets(
        budgets.map(b => (b.id === updatedBudget.id ? updatedBudget : b)),
      );
      await updateBudgetLimit(updatedBudget.id, updatedBudget.limit);
      showToast('✅ Budget berhasil diupdate!');
    } catch (error) {
      showToast('❌ Gagal mengupdate budget');
    }
  };

  const handleUpdateSaving = async (
    savingId: string | number,
    amountToAdd: number,
  ) => {
    try {
      const updatedSavings = savings.map(s => {
        if (s.id == savingId) {
          return { ...s, amount: s.amount + amountToAdd };
        }
        return s;
      });
      setSavings(updatedSavings);

      if (user) {
        setUser({ ...user, balance: user.balance - amountToAdd });
      }

      await updateSavingAmount(savingId.toString(), amountToAdd);
      showToast('✅ Tabungan berhasil diupdate!');
    } catch (error) {
      showToast('❌ Gagal mengupdate tabungan');
    }
  };

  const handleDeleteBudget = async (budgetId: string | number) => {
    try {
      setBudgets(budgets.filter(budget => budget.id != budgetId));
      await deleteBudget(budgetId.toString());
      showToast('✅ Budget berhasil dihapus!');
    } catch (error) {
      showToast('❌ Gagal menghapus budget');
    }
  };

  const handleDeleteSaving = async (savingId: string | number) => {
    try {
      setSavings(savings.filter(saving => saving.id != savingId));
      await deleteSaving(savingId.toString());
      showToast('✅ Target Tabungan berhasil dihapus!');
    } catch (error) {
      showToast('❌ Gagal menghapus target tabungan');
    }
  };

  if (isLoading && !user) {
    return <LoadingScreen message="Memuat data pengguna..." />;
  }

  if (!user) {
    if (authScreen === 'signup') {
      return (
        <SignUpScreen
          onSignUp={handleSignUp}
          onNavigateBack={() => setAuthScreen('login')}
          isLoading={isLoading}
        />
      );
    }

    return (
      <LoginScreen
        onLogin={handleLogin}
        onNavigateToSignUp={() => setAuthScreen('signup')}
        isLoading={isLoading}
      />
    );
  }

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Terjadi Kesalahan</Text>
        <Text style={styles.errorText}>
          Gagal memuat data dari server. Silakan cek koneksi internet Anda atau
          coba refresh.
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchData}>
          <Text style={styles.refreshButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ✅ Main Tab Navigator
  const MainTabs = () => (
    <Tab.Navigator
      // @ts-expect-error -- React Navigation v7 type bug, safe to ignore
      id="MainTabs"
      screenOptions={({ route }) => ({
        header: () => (
          <Header user={user as any} primaryColor={PRIMARY_COLOR} />
        ),
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: string = '';

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
            default:
              iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: PRIMARY_COLOR,
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: { fontWeight: '600', fontSize: 12 },
        tabBarStyle: {
          paddingTop: 10,
          paddingBottom: 10,
          height: 70,
          borderTopWidth: 0,
          elevation: 10,
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        options={{ title: 'Beranda' }}
        component={props => (
          <DashboardScreen
            {...props}
            user={user}
            transactions={transactions}
            budgets={budgets}
            savings={savings}
            onRefresh={fetchData}
            refreshing={isLoading}
          />
        )}
      />
      <Tab.Screen
        name="Transaksi"
        options={{ title: 'Transaksi' }}
        component={props => (
          <TransactionsScreen
            {...props}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onRefresh={fetchData}
            refreshing={isLoading}
          />
        )}
      />
      <Tab.Screen
        name="Budget"
        options={{ title: 'Budget' }}
        component={props => (
          <BudgetScreen
            {...props}
            budgets={budgets}
            onAddBudget={handleAddBudget as any}
            onUpdateBudget={handleUpdateBudget as any}
            onDeleteBudget={handleDeleteBudget}
            onRefresh={fetchData}
            refreshing={isLoading}
          />
        )}
      />
      <Tab.Screen
        name="Tabungan"
        options={{ title: 'Tabungan' }}
        component={props => (
          <SavingsScreen
            {...props}
            savings={savings}
            onAddSaving={handleAddSaving as any}
            onUpdateSaving={handleUpdateSaving}
            onDeleteSaving={handleDeleteSaving}
            onRefresh={fetchData}
            refreshing={isLoading}
          />
        )}
      />
    </Tab.Navigator>
  );

  // ✅ Stack Navigator dengan Profile Screen
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <NavigationContainer>
        <Stack.Navigator
          // @ts-expect-error -- React Navigation v7 type bug, safe to ignore
          id="RootStack"
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="Profile"
            options={{
              headerShown: true,
              headerTitle: 'Profil Pengguna',
              headerTintColor: PRIMARY_COLOR,
              headerStyle: {
                backgroundColor: '#FFFFFF',
              },
            }}
          >
            {props => (
              <ProfileScreen
                {...props}
                user={user}
                transactions={transactions}
                onLogout={handleLogout}
                onChangePassword={handleChangePassword}
                isLoadingPassword={isLoadingPassword}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  refreshButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
