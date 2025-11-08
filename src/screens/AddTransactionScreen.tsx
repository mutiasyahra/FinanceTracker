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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

type TransactionType = 'income' | 'expense';

interface AddTransactionScreenProps {
  visible: boolean;
  onClose: () => void;
  onSave: (transaction: any) => void;
}

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

  const incomeCategories = [
    { name: 'Salary', icon: 'briefcase', color: '#10B981' },
    { name: 'Freelance', icon: 'laptop', color: '#3B82F6' },
    { name: 'Investment', icon: 'trending-up', color: '#8B5CF6' },
    { name: 'Business', icon: 'business', color: '#F59E0B' },
    { name: 'Other', icon: 'cash', color: '#6B7280' },
  ];

  const expenseCategories = [
    { name: 'Food', icon: 'restaurant', color: '#EF4444' },
    { name: 'Transportation', icon: 'car', color: '#F59E0B' },
    { name: 'Housing', icon: 'home', color: '#3B82F6' },
    { name: 'Bills', icon: 'phone-portrait', color: '#10B981' },
    { name: 'Entertainment', icon: 'film', color: '#8B5CF6' },
    { name: 'Shopping', icon: 'bag-handle', color: '#EC4899' },
    { name: 'Health', icon: 'medkit', color: '#14B8A6' },
    { name: 'Education', icon: 'book', color: '#6366F1' },
  ];

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  const handleSave = () => {
    if (!amount || !description || !category) {
      Alert.alert('Error', 'Mohon lengkapi semua field');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Jumlah tidak valid');
      return;
    }

    const newTransaction = {
      id: Date.now(),
      type,
      amount: type === 'income' ? parsedAmount : -parsedAmount,
      description,
      category,
      date: date.toISOString().split('T')[0],
    };

    onSave(newTransaction);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategory('');
    setDate(new Date());
    setType('expense');
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tambah Transaksi</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          {/* Type Toggle */}
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'income' && styles.typeButtonActive,
                type === 'income' && styles.incomeActive,
              ]}
              onPress={() => {
                setType('income');
                setCategory('');
              }}
            >
              <Ionicons
                name="trending-up"
                size={20}
                color={type === 'income' ? '#10B981' : '#6B7280'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'income' && styles.typeButtonTextActive,
                ]}
              >
                Pemasukan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'expense' && styles.typeButtonActive,
                type === 'expense' && styles.expenseActive,
              ]}
              onPress={() => {
                setType('expense');
                setCategory('');
              }}
            >
              <Ionicons
                name="trending-down"
                size={20}
                color={type === 'expense' ? '#EF4444' : '#6B7280'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'expense' && styles.typeButtonTextActive,
                ]}
              >
                Pengeluaran
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Jumlah</Text>
            <View style={styles.amountInput}>
              <Text style={styles.currency}>Rp</Text>
              <TextInput
                style={styles.amountTextInput}
                placeholder="0"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Deskripsi</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Belanja bulanan"
              value={description}
              onChangeText={setDescription}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Category Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kategori</Text>
            <View style={styles.categoryGrid}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryItem,
                    category === cat.name && styles.categoryItemActive,
                    category === cat.name && {
                      borderColor: cat.color,
                      backgroundColor: cat.color + '20',
                    },
                  ]}
                  onPress={() => setCategory(cat.name)}
                >
                  <View
                    style={[
                      styles.categoryIconContainer,
                      category === cat.name && {
                        backgroundColor: cat.color + '30',
                      },
                    ]}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={24}
                      color={category === cat.name ? cat.color : '#6B7280'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryName,
                      category === cat.name && { color: cat.color },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tanggal</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <Text style={styles.dateText}>{formatDate(date)}</Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}

          {/* Preview */}
          {amount && description && category && (
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>Preview</Text>
              <View style={styles.previewContent}>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Tipe:</Text>
                  <View
                    style={[
                      styles.previewBadge,
                      {
                        backgroundColor:
                          type === 'income' ? '#D1FAE5' : '#FEE2E2',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.previewBadgeText,
                        {
                          color: type === 'income' ? '#10B981' : '#EF4444',
                        },
                      ]}
                    >
                      {type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                    </Text>
                  </View>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Kategori:</Text>
                  <Text style={styles.previewValue}>{category}</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Deskripsi:</Text>
                  <Text style={styles.previewValue}>{description}</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Jumlah:</Text>
                  <Text
                    style={[
                      styles.previewAmount,
                      { color: type === 'income' ? '#10B981' : '#EF4444' },
                    ]}
                  >
                    {type === 'income' ? '+' : '-'} Rp{' '}
                    {parseFloat(amount).toLocaleString('id-ID')}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Simpan Transaksi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
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
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  typeButtonActive: {
    borderWidth: 2,
  },
  incomeActive: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  expenseActive: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#111827',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  currency: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 8,
  },
  amountTextInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    paddingVertical: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 12,
    alignItems: 'center',
  },
  categoryItemActive: {
    borderWidth: 2,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#10B981',
    marginTop: 8,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 12,
  },
  previewContent: {
    gap: 12,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  previewBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  previewBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  previewAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default AddTransactionScreen;
