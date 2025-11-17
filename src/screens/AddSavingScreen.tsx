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
const INCOME_COLOR = '#10B981';
const EXPENSE_COLOR = '#DC143C';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface Saving {
  id: string;
  goal: string;
  target: number;
  amount: number;
  targetDate: string;
  icon: string;
}

interface AddSavingScreenProps {
  visible: boolean;
  onClose: () => void;
  onSave: (saving: Saving) => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
};

const goalIcons = [
  { icon: 'shield', emoji: '🛡️', name: 'Dana Darurat', color: '#EF4444' },
  { icon: 'home', emoji: '🏠', name: 'Rumah', color: '#F59E0B' },
  { icon: 'airplane', emoji: '✈️', name: 'Liburan', color: '#3B82F6' },
  { icon: 'car', emoji: '🚗', name: 'Kendaraan', color: '#8B5CF6' },
  { icon: 'briefcase', emoji: '🎓', name: 'Pendidikan', color: '#059669' },
  { icon: 'gift', emoji: '🎁', name: 'Lain-lain', color: '#EC4899' },
];

const AddSavingScreen: React.FC<AddSavingScreenProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [goal, setGoal] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState(new Date());
  const [selectedIcon, setSelectedIcon] = useState('shield');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Animations (slide + fade)
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
    if (selectedDate) setTargetDate(selectedDate);
  };

  const handleAmountChange = (text: string, setter: (v: string) => void) => {
    const raw = text.replace(/\D/g, '');
    setter(raw);
  };

  const handleSave = () => {
    const target = parseFloat(targetAmount || '0');
    const current = parseFloat(currentAmount || '0');

    if (!goal.trim() || target <= 0 || current < 0 || current > target) {
      Alert.alert(
        'Validasi Gagal',
        'Pastikan nama target, jumlah target valid (> 0), dan jumlah saat ini tidak melebihi target.',
      );
      return;
    }

    const newSaving: Saving = {
      id: String(Date.now()),
      goal: goal.trim(),
      target,
      amount: current,
      targetDate: targetDate.toISOString(),
      icon: selectedIcon,
    };

    onSave(newSaving);
    // reset
    setGoal('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate(new Date());
    setSelectedIcon('shield');
    // close with slide down animation
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

  const target = parseFloat(targetAmount || '0');
  const current = parseFloat(currentAmount || '0');
  const progress = target > 0 ? (current / target) * 100 : 0;
  const remaining = Math.max(0, target - current);
  const selectedIconData = goalIcons.find(i => i.icon === selectedIcon);

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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { opacity: fadeAnim }]}
        onTouchEnd={handleClose}
      />

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
                  { backgroundColor: PRIMARY_COLOR + '15' },
                ]}
              >
                <Text style={styles.headerEmoji}>🎯</Text>
              </View>
              <Text style={styles.headerTitle}>Tambah Target Tabungan</Text>
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
            {/* Preview */}
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Text style={[styles.previewBadge, { color: PRIMARY_COLOR }]}>
                  PRATINJAU TARGET
                </Text>
              </View>

              <View style={styles.previewTop}>
                <View
                  style={[
                    styles.previewIconContainer,
                    {
                      backgroundColor:
                        (selectedIconData?.color || PRIMARY_COLOR) + '20',
                    },
                  ]}
                >
                  <Text style={styles.previewEmoji}>
                    {selectedIconData?.emoji || '🎯'}
                  </Text>
                </View>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewGoal}>
                    {goal || 'Nama Target Tabungan'}
                  </Text>
                  <Text style={styles.previewTargetDate}>
                    📅 Target: {formatDate(targetDate.toISOString())}
                  </Text>
                </View>
              </View>

              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(100, progress)}%`,
                      backgroundColor: SECONDARY_COLOR,
                    },
                  ]}
                />
              </View>

              <View style={styles.amountRow}>
                <View style={styles.amountBox}>
                  <Text style={styles.amountBoxLabel}>Terkumpul</Text>
                  <Text
                    style={[styles.currentAmountText, { color: PRIMARY_COLOR }]}
                  >
                    {formatCurrency(current)}
                  </Text>
                </View>
                <View style={styles.amountBox}>
                  <Text style={styles.amountBoxLabel}>Sisa</Text>
                  <Text style={styles.remainingAmountText}>
                    {formatCurrency(remaining)}
                  </Text>
                </View>
                <View style={styles.amountBox}>
                  <Text style={styles.amountBoxLabel}>Target</Text>
                  <Text style={styles.targetAmountText}>
                    {formatCurrency(target)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Inputs */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelEmoji}>📝 </Text>Nama Target
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: Dana Darurat, DP Rumah"
                placeholderTextColor="#9CA3AF"
                value={goal}
                onChangeText={setGoal}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelEmoji}>🎨 </Text>Pilih Ikon
              </Text>
              <View style={styles.iconContainer}>
                {goalIcons.map(item => (
                  <TouchableOpacity
                    key={item.icon}
                    style={[
                      styles.iconPill,
                      {
                        backgroundColor:
                          item.icon === selectedIcon ? item.color : '#FFFFFF',
                        borderColor:
                          item.icon === selectedIcon ? item.color : '#E5E7EB',
                        borderWidth: 2,
                      },
                    ]}
                    onPress={() => setSelectedIcon(item.icon)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.iconEmoji}>{item.emoji}</Text>
                    <Text
                      style={[
                        styles.iconText,
                        {
                          color:
                            item.icon === selectedIcon ? '#FFFFFF' : '#6B7280',
                        },
                      ]}
                    >
                      {item.name}
                    </Text>
                    {item.icon === selectedIcon && (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#FFFFFF"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelEmoji}>🎯 </Text>Jumlah Target
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
                  value={targetAmount}
                  onChangeText={t => handleAmountChange(t, setTargetAmount)}
                />
              </View>
              <View style={styles.helperTextContainer}>
                <Ionicons
                  name="information-circle"
                  size={16}
                  color={SECONDARY_COLOR}
                />
                <Text style={styles.helperText}>{formatCurrency(target)}</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelEmoji}>💰 </Text>Jumlah Saat Ini
                (Opsional)
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
                  value={currentAmount}
                  onChangeText={t => handleAmountChange(t, setCurrentAmount)}
                />
              </View>
              <View style={styles.helperTextContainer}>
                <Ionicons
                  name="information-circle"
                  size={16}
                  color={SECONDARY_COLOR}
                />
                <Text style={styles.helperText}>{formatCurrency(current)}</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelEmoji}>📅 </Text>Tanggal Target Selesai
              </Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="calendar" size={24} color={SECONDARY_COLOR} />
                <Text style={styles.dateText}>
                  {formatDate(targetDate.toISOString())}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  testID="datePicker"
                  value={targetDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                />
              )}
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoEmoji}>💡</Text>
              <Text style={styles.infoText}>
                Tetapkan target yang realistis dan konsisten menabung setiap
                bulan untuk mencapai tujuan Anda!
              </Text>
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
              <Text style={styles.saveButtonText}>Simpan Target</Text>
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
  previewGoal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  previewTargetDate: { fontSize: 13, color: '#6B7280' },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: { height: '100%', borderRadius: 6 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between' },
  amountBox: { alignItems: 'center', width: '30%' },
  amountBoxLabel: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  currentAmountText: { fontSize: 16, fontWeight: 'bold' },
  remainingAmountText: { fontSize: 16, fontWeight: 'bold', color: '#F59E0B' },
  targetAmountText: { fontSize: 16, fontWeight: 'bold' },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  labelEmoji: { fontSize: 18 },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 15,
    color: '#111827',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  iconContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  iconPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: '47%',
    gap: 8,
  },
  iconEmoji: { fontSize: 22 },
  iconText: { flex: 1, fontSize: 13, fontWeight: '600' },
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: SECONDARY_COLOR + '10',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: SECONDARY_COLOR,
  },
  infoEmoji: { fontSize: 20 },
  infoText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 20 },
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

export default AddSavingScreen;
