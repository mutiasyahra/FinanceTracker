import React, { useState } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

const PRIMARY_COLOR = '#6A0DAD';
const SECONDARY_COLOR = '#9370DB';
const INCOME_COLOR = '#10B981';
const EXPENSE_COLOR = '#DC143C';
const BACKGROUND_COLOR = '#F5F3FF';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type TransactionType = 'income' | 'expense';

interface CategoryItem {
  name: string;
  emoji: string;
  color: string;
}

interface Transaction {
  id?: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
  type?: 'income' | 'expense';
}

interface AddTransactionScreenProps {
  visible: boolean;
  onClose: () => void;
  onSave: (
    transaction: Omit<Transaction, 'id' | 'date'> & { date: Date },
  ) => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const expenseCategories: CategoryItem[] = [
  { name: 'Food & Drink', emoji: '🍕', color: '#EF4444' },
  { name: 'Transportation', emoji: '🚗', color: '#F59E0B' },
  { name: 'Shopping', emoji: '🛒', color: '#EC4899' },
  { name: 'Utilities', emoji: '🏠', color: '#3B82F6' },
  { name: 'Entertainment', emoji: '🎬', color: '#8B5CF6' },
  { name: 'Health', emoji: '⚕️', color: '#059669' },
  { name: 'Investment', emoji: '📈', color: '#4B5563' },
  { name: 'Others', emoji: '📌', color: '#6B7280' },
];

const incomeCategories: CategoryItem[] = [
  { name: 'Salary', emoji: '💼', color: INCOME_COLOR },
  { name: 'Freelance', emoji: '💻', color: SECONDARY_COLOR },
  { name: 'Investment', emoji: '📊', color: '#F59E0B' },
  { name: 'Gift', emoji: '🎁', color: '#EC4899' },
  { name: 'Others', emoji: '💰', color: '#6B7280' },
];

const AddTransactionScreen: React.FC<AddTransactionScreenProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ✅ Animation States
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      // ✅ Slide Up + Fade In
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // ✅ Slide Down + Fade Out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const currentCategories =
    type === 'income' ? incomeCategories : expenseCategories;
  const selectedCategoryInfo = currentCategories.find(c => c.name === category);

  const handleSave = () => {
    const amountNumber = parseFloat(
      amount.replace(/\./g, '').replace(/,/g, '.'),
    );

    if (!category || amountNumber <= 0) {
      Alert.alert(
        'Validasi Gagal',
        'Pilih kategori dan masukkan jumlah yang valid (> 0).',
      );
      return;
    }

    const newTransaction = {
      category,
      amount: amountNumber,
      description,
      type,
      date,
    };

    onSave(newTransaction);
    setType('expense');
    setAmount('');
    setDescription('');
    setCategory('');
    setDate(new Date());
    onClose();
  };

  const handleClose = () => {
    // ✅ Animate out before closing
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleAmountChange = (text: string) => {
    const rawNumber = text.replace(/\D/g, '');
    if (rawNumber) {
      setAmount(rawNumber);
    } else {
      setAmount('');
    }
  };

  const formattedAmount = formatCurrency(parseFloat(amount || '0'));
  const categoryColor = selectedCategoryInfo?.color || '#6B7280';
  const categoryEmoji = selectedCategoryInfo?.emoji || '📦';
  const amountColor = type === 'income' ? INCOME_COLOR : EXPENSE_COLOR;

  const renderCategoryPill = (item: CategoryItem) => {
    const isSelected = item.name === category;

    return (
      <TouchableOpacity
        key={item.name}
        style={[
          styles.categoryPill,
          {
            backgroundColor: isSelected ? item.color : '#FFFFFF',
            borderColor: isSelected ? item.color : '#E5E7EB',
          },
        ]}
        onPress={() => setCategory(item.name)}
        activeOpacity={0.7}
      >
        <Text style={styles.emojiIcon}>{item.emoji}</Text>
        <Text
          style={[
            styles.categoryText,
            { color: isSelected ? '#FFFFFF' : '#6B7280' },
          ]}
        >
          {item.name}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* ✅ Backdrop with Fade */}
      <Animated.View
        style={[styles.backdrop, { opacity: fadeAnim }]}
        onTouchEnd={handleClose}
      />

      {/* ✅ Modal Content with Slide + Scale */}
      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View
                style={[
                  styles.headerIconContainer,
                  {
                    backgroundColor:
                      type === 'income'
                        ? INCOME_COLOR + '20'
                        : EXPENSE_COLOR + '20',
                  },
                ]}
              >
                <Text style={styles.headerEmoji}>
                  {type === 'income' ? '💵' : '💸'}
                </Text>
              </View>
              <Text style={styles.headerTitle}>Tambah Transaksi</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close-circle" size={32} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Switch Tipe Transaksi */}
            <View style={styles.typeSwitchContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor:
                      type === 'expense' ? EXPENSE_COLOR : '#FFFFFF',
                    borderColor: EXPENSE_COLOR,
                  },
                ]}
                onPress={() => {
                  setType('expense');
                  setCategory('');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.typeEmoji}>💸</Text>
                <Text
                  style={[
                    styles.typeButtonText,
                    { color: type === 'expense' ? '#FFFFFF' : EXPENSE_COLOR },
                  ]}
                >
                  Pengeluaran
                </Text>
                {type === 'expense' && (
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor:
                      type === 'income' ? INCOME_COLOR : '#FFFFFF',
                    borderColor: INCOME_COLOR,
                  },
                ]}
                onPress={() => {
                  setType('income');
                  setCategory('');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.typeEmoji}>💵</Text>
                <Text
                  style={[
                    styles.typeButtonText,
                    { color: type === 'income' ? '#FFFFFF' : INCOME_COLOR },
                  ]}
                >
                  Pemasukan
                </Text>
                {type === 'income' && (
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>

            {/* Input Jumlah */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelEmoji}>💰 </Text>
                Jumlah Transaksi
              </Text>
              <View
                style={[
                  styles.amountInputContainer,
                  { borderColor: amountColor + '40' },
                ]}
              >
                <Text style={[styles.currencyLabel, { color: amountColor }]}>
                  Rp
                </Text>
                <TextInput
                  style={[styles.amountInput, { color: amountColor }]}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={handleAmountChange}
                />
              </View>
              <View style={styles.helperTextContainer}>
                <Ionicons
                  name="information-circle"
                  size={16}
                  color={amountColor}
                />
                <Text style={[styles.helperText, { color: amountColor }]}>
                  {formattedAmount}
                </Text>
              </View>
            </View>

            {/* Pilih Kategori */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelEmoji}>🏷️ </Text>
                Pilih Kategori
              </Text>
              <View style={styles.categoryContainer}>
                {currentCategories.map(renderCategoryPill)}
              </View>
            </View>

            {/* Deskripsi */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelEmoji}>📝 </Text>
                Deskripsi (Opsional)
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: Makan siang di warung Padang"
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                maxLength={50}
              />
            </View>

            {/* Tanggal */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelEmoji}>📅 </Text>
                Tanggal Transaksi
              </Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="calendar" size={24} color={SECONDARY_COLOR} />
                <Text style={styles.dateText}>
                  {formatDate(date.toISOString())}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  testID="datePicker"
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>

            {/* Preview Card */}
            <View style={[styles.previewCard]}>
              <View style={styles.previewHeader}>
                <Text style={[styles.previewBadge, { color: amountColor }]}>
                  PRATINJAU TRANSAKSI
                </Text>
              </View>
              <View style={styles.previewRow}>
                <View
                  style={[
                    styles.previewIconContainer,
                    { backgroundColor: categoryColor + '20' },
                  ]}
                >
                  <Text style={styles.previewEmoji}>{categoryEmoji}</Text>
                </View>
                <View style={styles.previewContent}>
                  <Text style={styles.previewDescription} numberOfLines={1}>
                    {description || category || 'Deskripsi/Kategori'}
                  </Text>
                  <Text style={styles.previewCategoryDate}>
                    {category || 'Pilih Kategori'} •{' '}
                    {formatDate(date.toISOString())}
                  </Text>
                </View>
                <Text style={[styles.previewAmount, { color: amountColor }]}>
                  {type === 'income' ? '+' : '-'} {formattedAmount}
                </Text>
              </View>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: amountColor }]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Simpan Transaksi</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '95%',
    backgroundColor: BACKGROUND_COLOR,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 28,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  labelEmoji: {
    fontSize: 18,
  },
  typeSwitchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  typeEmoji: {
    fontSize: 20,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currencyLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 12,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    paddingVertical: 16,
  },
  helperTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  helperText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    borderWidth: 2,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  emojiIcon: {
    fontSize: 18,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 15,
    color: '#111827',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    gap: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  footer: {
    padding: 20,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  saveButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR + '20',
  },
  previewHeader: {
    marginBottom: 16,
  },
  previewBadge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  previewIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewEmoji: {
    fontSize: 26,
  },
  previewContent: {
    flex: 1,
    justifyContent: 'center',
  },
  previewDescription: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  previewCategoryDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  previewAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default AddTransactionScreen;
