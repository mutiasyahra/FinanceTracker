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

interface AddSavingScreenProps {
  visible: boolean;
  onClose: () => void;
  onSave: (saving: any) => void;
}

const AddSavingScreen: React.FC<AddSavingScreenProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [goal, setGoal] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState(new Date());
  const [selectedIcon, setSelectedIcon] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const goalIcons = [
    { icon: 'shield-checkmark', name: 'Dana Darurat' },
    { icon: 'home', name: 'Rumah' },
    { icon: 'airplane', name: 'Liburan' },
    { icon: 'car', name: 'Kendaraan' },
    { icon: 'laptop', name: 'Gadget' },
    { icon: 'school', name: 'Pendidikan' },
    { icon: 'heart', name: 'Pernikahan' },
    { icon: 'game-controller', name: 'Hobi' },
  ];

  const handleSave = () => {
    if (!goal || !targetAmount || !selectedIcon) {
      Alert.alert('Mohon lengkapi semua field');
      return;
    }

    const newSaving = {
      id: Date.now().toString(),
      goal,
      amount: parseFloat(currentAmount) || 0,
      target: parseFloat(targetAmount),
      targetDate: targetDate.toISOString().split('T')[0],
      icon: selectedIcon,
    };

    onSave(newSaving);
    resetForm();
  };

  const resetForm = () => {
    setGoal('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate(new Date());
    setSelectedIcon('');
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setTargetDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const calculateProgress = () => {
    const current = parseFloat(currentAmount) || 0;
    const target = parseFloat(targetAmount) || 1;
    return Math.min((current / target) * 100, 100);
  };

  const calculateRemaining = () => {
    const current = parseFloat(currentAmount) || 0;
    const target = parseFloat(targetAmount) || 0;
    return Math.max(target - current, 0);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tambah Target Tabungan</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons
              name="bulb"
              size={24}
              color="#065F46"
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              Tetapkan target tabungan untuk mencapai tujuan finansial Anda
            </Text>
          </View>

          {/* Icon Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pilih Icon</Text>
            <View style={styles.iconGrid}>
              {goalIcons.map(item => (
                <TouchableOpacity
                  key={item.icon}
                  style={[
                    styles.iconItem,
                    selectedIcon === item.icon && styles.iconItemActive,
                  ]}
                  onPress={() => setSelectedIcon(item.icon)}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      selectedIcon === item.icon && styles.iconContainerActive,
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={28}
                      color={selectedIcon === item.icon ? '#10B981' : '#6B7280'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.iconName,
                      selectedIcon === item.icon && styles.iconNameActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Goal Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Target</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Laptop Baru"
              value={goal}
              onChangeText={setGoal}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Target Amount Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Target Jumlah</Text>
            <View style={styles.amountInput}>
              <Text style={styles.currency}>Rp</Text>
              <TextInput
                style={styles.amountTextInput}
                placeholder="0"
                keyboardType="numeric"
                value={targetAmount}
                onChangeText={setTargetAmount}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Current Amount Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Jumlah Saat Ini (Opsional)</Text>
            <View style={styles.amountInput}>
              <Text style={styles.currency}>Rp</Text>
              <TextInput
                style={styles.amountTextInput}
                placeholder="0"
                keyboardType="numeric"
                value={currentAmount}
                onChangeText={setCurrentAmount}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <Text style={styles.hint}>
              Masukkan jumlah yang sudah Anda tabung saat ini
            </Text>
          </View>

          {/* Target Date Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Target Tanggal</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <Text style={styles.dateText}>{formatDate(targetDate)}</Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={targetDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          {/* Preview Card */}
          {goal && targetAmount && selectedIcon && (
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>Preview Target</Text>
              <View style={styles.previewContent}>
                <View style={styles.previewIconCircle}>
                  <Ionicons name={selectedIcon} size={48} color="#10B981" />
                </View>
                <Text style={styles.previewGoal}>{goal}</Text>
                <Text style={styles.previewDate}>
                  Target: {formatDate(targetDate)}
                </Text>

                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressPercentage}>
                      {calculateProgress().toFixed(0)}%
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${calculateProgress()}%` },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.amountRow}>
                  <View style={styles.amountBox}>
                    <Text style={styles.amountBoxLabel}>Terkumpul</Text>
                    <Text style={styles.currentAmountText}>
                      Rp{' '}
                      {(parseFloat(currentAmount) || 0).toLocaleString('id-ID')}
                    </Text>
                  </View>
                  <View style={styles.amountBox}>
                    <Text style={styles.amountBoxLabel}>Target</Text>
                    <Text style={styles.targetAmountText}>
                      Rp {parseFloat(targetAmount).toLocaleString('id-ID')}
                    </Text>
                  </View>
                </View>

                <View style={styles.remainingBox}>
                  <Text style={styles.remainingLabel}>Sisa</Text>
                  <Text style={styles.remainingAmount}>
                    Rp {calculateRemaining().toLocaleString('id-ID')}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Simpan Target</Text>
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#065F46',
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
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconItem: {
    width: '22%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 8,
    alignItems: 'center',
  },
  iconItemActive: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainerActive: {
    backgroundColor: '#D1FAE5',
  },
  iconName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  iconNameActive: {
    color: '#10B981',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 8,
  },
  amountTextInput: {
    flex: 1,
    fontSize: 20,
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
    marginBottom: 16,
    textAlign: 'center',
  },
  previewContent: {
    alignItems: 'center',
  },
  previewIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewGoal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  previewDate: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 20,
  },
  progressSection: {
    width: '100%',
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  amountRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  amountBox: {
    alignItems: 'center',
  },
  amountBoxLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  currentAmountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  targetAmountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  remainingBox: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  remainingLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  remainingAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
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

export default AddSavingScreen;
