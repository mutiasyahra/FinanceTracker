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
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface AddBudgetScreenProps {
  visible: boolean;
  onClose: () => void;
  onSave: (budget: any) => void;
}

const AddBudgetScreen: React.FC<AddBudgetScreenProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const categories = [
    { name: 'Food', icon: 'restaurant', color: '#EF4444' },
    { name: 'Transportation', icon: 'car', color: '#F59E0B' },
    { name: 'Entertainment', icon: 'film', color: '#8B5CF6' },
    { name: 'Housing', icon: 'home', color: '#3B82F6' },
    { name: 'Bills', icon: 'phone-portrait', color: '#10B981' },
    { name: 'Shopping', icon: 'bag-handle', color: '#EC4899' },
    { name: 'Health', icon: 'medkit', color: '#14B8A6' },
    { name: 'Education', icon: 'book', color: '#6366F1' },
  ];

  const handleSave = () => {
    if (!category || !limit) {
      Alert.alert('Mohon lengkapi semua field');
      return;
    }

    const newBudget = {
      id: Date.now().toString(),
      category,
      limit: parseFloat(limit),
      spent: 0,
      period,
      date: date.toISOString().split('T')[0],
    };

    onSave(newBudget);
    resetForm();
  };

  const resetForm = () => {
    setCategory('');
    setLimit('');
    setPeriod('monthly');
    setDate(new Date());
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Tambah Budget</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.content}>
            {/* Info Card */}
            <View style={styles.infoCard}>
              <Ionicons
                name="bulb"
                size={24}
                color="#1E40AF"
                style={styles.infoIcon}
              />
              <Text style={styles.infoText}>
                Atur budget untuk mengontrol pengeluaran Anda per kategori
              </Text>
            </View>

            {/* Period Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Periode Budget</Text>
              <View style={styles.periodToggle}>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    period === 'monthly' && styles.periodButtonActive,
                  ]}
                  onPress={() => setPeriod('monthly')}
                >
                  <Ionicons
                    name="calendar"
                    size={20}
                    color={period === 'monthly' ? '#FFFFFF' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.periodButtonText,
                      period === 'monthly' && styles.periodButtonTextActive,
                    ]}
                  >
                    Bulanan
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    period === 'weekly' && styles.periodButtonActive,
                  ]}
                  onPress={() => setPeriod('weekly')}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={period === 'weekly' ? '#FFFFFF' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.periodButtonText,
                      period === 'weekly' && styles.periodButtonTextActive,
                    ]}
                  >
                    Mingguan
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Category Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pilih Kategori</Text>
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

            {/* Budget Limit Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Limit Budget</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currency}>Rp</Text>
                <TextInput
                  style={styles.amountTextInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={limit}
                  onChangeText={setLimit}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <Text style={styles.hint}>
                Budget maksimal untuk kategori {category || 'yang dipilih'} per{' '}
                {period === 'monthly' ? 'bulan' : 'minggu'}
              </Text>
            </View>

            {/* Date Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tanggal Mulai</Text>
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
              />
            )}

            {/* Preview Card */}
            {category && limit && (
              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>Preview Budget</Text>
                <View style={styles.previewContent}>
                  <View style={styles.previewHeader}>
                    <View
                      style={[
                        styles.previewIconContainer,
                        {
                          backgroundColor:
                            categories.find(c => c.name === category)?.color +
                            '20',
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          categories.find(c => c.name === category)?.icon ||
                          'wallet'
                        }
                        size={32}
                        color={categories.find(c => c.name === category)?.color}
                      />
                    </View>
                    <View>
                      <Text style={styles.previewCategory}>{category}</Text>
                      <Text style={styles.previewPeriod}>
                        Budget {period === 'monthly' ? 'Bulanan' : 'Mingguan'}
                      </Text>
                      <Text style={styles.previewDate}>{formatDate(date)}</Text>
                    </View>
                  </View>
                  <Text style={styles.previewAmount}>
                    Rp {parseFloat(limit).toLocaleString('id-ID')}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Simpan Budget</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
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
  periodToggle: {
    flexDirection: 'row',
    gap: 12,
  },
  periodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  periodButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: '22%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 8,
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
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
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
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
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
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCategory: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  previewPeriod: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  previewDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  previewAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
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

export default AddBudgetScreen;
