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
const BACKGROUND_COLOR = '#F5F3FF';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface Budget {
  id: number | string;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'weekly';
  date: string;
}

interface AddBudgetScreenProps {
  visible: boolean;
  onClose: () => void;
  onSave: (budget: Budget) => void;
}

const formatCurrency = (amount: number | string): string => {
  const num =
    typeof amount === 'string' ? parseFloat(amount) || 0 : amount || 0;
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
};

const categories = [
  { name: 'Food', emoji: '🍕', color: '#EF4444' },
  { name: 'Transportation', emoji: '🚗', color: '#F59E0B' },
  { name: 'Entertainment', emoji: '🎬', color: '#8B5CF6' },
  { name: 'Shopping', emoji: '🛒', color: '#EC4899' },
  { name: 'Utilities', emoji: '💡', color: '#3B82F6' },
  { name: 'Health', emoji: '⚕️', color: '#059669' },
  { name: 'Education', emoji: '📚', color: '#6366F1' },
  { name: 'Others', emoji: '📌', color: '#6B7280' },
];

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

  // animations
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  const handleLimitChange = (text: string) => {
    const raw = text.replace(/\D/g, '');
    setLimit(raw);
  };

  const handleSave = () => {
    const limitNum = parseFloat(limit || '0');
    if (!category || limitNum <= 0 || isNaN(limitNum)) {
      Alert.alert(
        'Validasi Gagal',
        'Pilih kategori dan masukkan limit yang valid (> 0).',
      );
      return;
    }

    const newBudget: Budget = {
      id: Date.now(),
      category,
      limit: limitNum,
      spent: 0,
      period,
      date: date.toISOString(),
    };

    onSave(newBudget);
    setCategory('');
    setLimit('');
    setPeriod('monthly');
    setDate(new Date());

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const selectedCategory = categories.find(c => c.name === category);
  const formattedLimit = limit ? formatCurrency(limit) : '0';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={[styles.backdrop, { opacity: fadeAnim }]}
        onTouchEnd={handleClose}
      />

      <Animated.View
        style={[
          styles.modalContainer,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View
                style={[
                  styles.headerIconContainer,
                  { backgroundColor: PRIMARY_COLOR + '15' },
                ]}
              >
                <Text style={styles.headerEmoji}>💰</Text>
              </View>
              <Text style={styles.headerTitle}>Tambah Budget Baru</Text>
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
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Text style={[styles.previewBadge, { color: PRIMARY_COLOR }]}>
                  PRATINJAU BUDGET
                </Text>
              </View>

              <View style={styles.previewTop}>
                <View
                  style={[
                    styles.previewIconContainer,
                    {
                      backgroundColor: selectedCategory
                        ? selectedCategory.color + '15'
                        : '#F3F4F6',
                    },
                  ]}
                >
                  <Text style={styles.previewEmoji}>
                    {selectedCategory?.emoji || '📦'}
                  </Text>
                </View>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewCategory}>
                    {category || 'Pilih Kategori'}
                  </Text>
                  <Text style={styles.previewPeriod}>
                    {period === 'monthly' ? '📆 Bulanan' : '🗓️ Mingguan'}
                  </Text>
                </View>
              </View>

              <View style={styles.previewBottom}>
                <Text style={styles.previewLimitLabel}>Target Limit</Text>
                <Text style={styles.previewLimitAmount}>
                  Rp {formattedLimit}
                </Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelEmoji}>🏷️ </Text>Pilih Kategori Budget
              </Text>
              <View style={styles.categoryContainer}>
                {categories.map(item => {
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
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#FFFFFF"
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelEmoji}>💵 </Text>Atur Limit Budget
              </Text>
              <View
                style={[
                  styles.amountInputContainer,
                  { borderColor: PRIMARY_COLOR + '40' },
                ]}
              >
                <Text style={styles.currencyLabel}>Rp</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={limit ? formatCurrency(limit) : ''}
                  onChangeText={handleLimitChange}
                />
              </View>
              <View style={styles.helperTextContainer}>
                <Ionicons
                  name="information-circle"
                  size={16}
                  color={SECONDARY_COLOR}
                />
                <Text style={styles.helperText}>
                  Jumlah: Rp {formattedLimit}
                </Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelEmoji}>📅 </Text>Mulai Dari
              </Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
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
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                />
              )}
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Buat Budget</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  safeArea: { flex: 1, backgroundColor: BACKGROUND_COLOR },
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
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerEmoji: { fontSize: 24 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  closeButton: { padding: 4 },
  content: { flex: 1, padding: 20 },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 6,
  },
  previewHeader: { marginBottom: 8 },
  previewBadge: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  previewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  previewIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewEmoji: { fontSize: 28 },
  previewInfo: { flex: 1 },
  previewCategory: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  previewPeriod: { fontSize: 13, color: '#6B7280' },
  previewBottom: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  previewLimitLabel: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  previewLimitAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  labelEmoji: { fontSize: 18 },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
    borderWidth: 2,
  },
  emojiIcon: { fontSize: 20 },
  categoryText: { fontSize: 14, fontWeight: '600' },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 20,
  },
  currencyLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginRight: 12,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    paddingVertical: 12,
  },
  helperTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  helperText: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    gap: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  dateText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#111827' },
  footer: {
    padding: 20,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    elevation: 8,
  },
  saveButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});

export default AddBudgetScreen;
