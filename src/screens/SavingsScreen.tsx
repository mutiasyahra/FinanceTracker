import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import { Saving } from '../api/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AddSavingScreen from './AddSavingScreen';

const PRIMARY_COLOR = '#6A0DAD';
const SECONDARY_COLOR = '#10B981';
const EXPENSE_COLOR = '#DC143C';
const BACKGROUND_COLOR = '#F5F3FF';
const CARD_BACKGROUND = '#FFFFFF';
const TEXT_COLOR = '#111827';
const LIGHT_GREY = '#6B7280';
const COMPLETE_COLOR = '#10B981';

type SavingsScreenProps = {
  savings: Saving[];
  onAddSaving?: (saving: Saving) => void;
  onUpdateSaving?: (savingId: string | number, amountToAdd: number) => void;
  onDeleteSaving?: (savingId: string | number) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
};

const SavingsScreen: React.FC<SavingsScreenProps> = ({
  savings,
  onAddSaving,
  onUpdateSaving,
  onDeleteSaving,
  onRefresh,
  refreshing = false,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedSaving, setSelectedSaving] = useState<Saving | null>(null);
  const [updateAmount, setUpdateAmount] = useState('');
  const [isDeposit, setIsDeposit] = useState(true);

  const buttonScale = new Animated.Value(1);

  const handleAddButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowAddModal(true);
    });
  };

  const getIconForGoal = (
    iconName: string,
  ): { emoji: string; color: string } => {
    const icons = [
      { icon: 'shield', emoji: '🛡️', name: 'Dana Darurat', color: '#EF4444' },
      { icon: 'home', emoji: '🏠', name: 'Rumah', color: '#F59E0B' },
      { icon: 'airplane', emoji: '✈️', name: 'Liburan', color: '#3B82F6' },
      { icon: 'car', emoji: '🚗', name: 'Kendaraan', color: '#8B5CF6' },
      { icon: 'briefcase', emoji: '🎓', name: 'Pendidikan', color: '#059669' },
      { icon: 'gift', emoji: '🎁', name: 'Lain-lain', color: '#EC4899' },
    ];
    const found = icons.find(i => i.icon === iconName);
    return found || { emoji: '🎯', color: PRIMARY_COLOR };
  };

  const calculateProgress = (current: number, target: number): number => {
    return target > 0 ? (current / target) * 100 : 0;
  };

  const handleOpenUpdateModal = (saving: Saving) => {
    setSelectedSaving(saving);
    setUpdateAmount('');
    setIsDeposit(true);
    setShowUpdateModal(true);
  };

  const handleUpdateSavingAmount = () => {
    if (!selectedSaving || !onUpdateSaving) return;

    const rawNumber = updateAmount.replace(/\D/g, '');
    const amountValue = Number(rawNumber);

    if (amountValue <= 0 || isNaN(amountValue)) {
      Alert.alert('Gagal', 'Jumlah harus lebih dari 0.');
      return;
    }

    const finalAmount = isDeposit ? amountValue : -amountValue;

    if (!isDeposit && selectedSaving.amount < amountValue) {
      Alert.alert('Gagal', 'Jumlah penarikan melebihi saldo tabungan.');
      return;
    }

    onUpdateSaving(selectedSaving.id, finalAmount);
    setShowUpdateModal(false);
    setSelectedSaving(null);
  };

  const handleAmountChange = (text: string) => {
    const rawNumber = text.replace(/\D/g, '');
    setUpdateAmount(rawNumber);
  };

  const SavingCard: React.FC<{ saving: Saving }> = ({ saving }) => {
    const progress = calculateProgress(saving.amount, saving.target || 0);
    const remaining = Math.max(0, (saving.target || 0) - saving.amount);
    const isCompleted = saving.amount >= (saving.target || 0);

    const progressColor = isCompleted ? COMPLETE_COLOR : PRIMARY_COLOR;
    const iconInfo = getIconForGoal(saving.icon || 'star');

    const targetText = saving.target
      ? formatCurrency(saving.target)
      : 'Target Tidak Ditentukan';

    return (
      <TouchableOpacity
        style={[styles.cardContainer, styles.shadowStyle]}
        onPress={() => handleOpenUpdateModal(saving)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: iconInfo.color + '20' },
            ]}
          >
            <Text style={styles.iconEmoji}>{iconInfo.emoji}</Text>
          </View>

          <View style={styles.cardTitleGroup}>
            <Text style={styles.cardGoal} numberOfLines={1}>
              {saving.goal}
            </Text>
            <Text style={styles.cardTarget}>Target: {targetText}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={LIGHT_GREY} />
        </View>

        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(100, progress)}%`,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>
          <Text style={[styles.percentageText, { color: progressColor }]}>
            {Math.round(progress)}%
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Terkumpul</Text>
            <Text style={[styles.summaryAmount, { color: PRIMARY_COLOR }]}>
              {formatCurrency(saving.amount)}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Sisa Target</Text>
            <Text
              style={[
                styles.summaryAmountRemaining,
                { color: isCompleted ? COMPLETE_COLOR : EXPENSE_COLOR },
              ]}
            >
              {isCompleted ? 'Selesai!' : formatCurrency(remaining)}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Batas Waktu</Text>
            <Text style={[styles.summaryAmount, { color: LIGHT_GREY }]}>
              {saving.targetDate ? formatDate(saving.targetDate) : 'N/A'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY_COLOR}
          />
        }
      >
        <Text style={styles.sectionTitle}>Target Tabungan Aktif</Text>
        {savings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cash-outline" size={50} color="#9CA3AF" />
            <Text style={styles.emptyText}>
              Belum ada target tabungan yang dibuat.
            </Text>
          </View>
        ) : (
          savings.map(saving => <SavingCard key={saving.id} saving={saving} />)
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddButtonPress}
            activeOpacity={0.9}
          >
            <Ionicons name="add-circle-sharp" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Tambah Target</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {onAddSaving && (
        <AddSavingScreen
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={onAddSaving}
        />
      )}

      {/* ✅ MODAL WITH KEYBOARD AVOIDING */}
      <Modal
        visible={showUpdateModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowUpdateModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalOverlayTouchable}
            onPress={() => setShowUpdateModal(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalContent}
              onPress={e => e.stopPropagation()}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Update Tabungan</Text>
                <TouchableOpacity
                  onPress={() => setShowUpdateModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close-circle" size={28} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {selectedSaving && (
                  <>
                    {/* Goal Info */}
                    <View style={styles.goalInfoBox}>
                      <Text style={styles.goalInfoEmoji}>
                        {getIconForGoal(selectedSaving.icon || 'star').emoji}
                      </Text>
                      <View style={styles.goalInfoText}>
                        <Text style={styles.modalGoal} numberOfLines={1}>
                          {selectedSaving.goal}
                        </Text>
                        <Text style={styles.modalTarget}>
                          Target: {formatCurrency(selectedSaving.target || 0)}
                        </Text>
                      </View>
                    </View>

                    {/* Type Switch */}
                    <View style={styles.modalTypeSwitchContainer}>
                      <TouchableOpacity
                        style={[
                          styles.modalTypeButton,
                          isDeposit && styles.modalTypeSelected,
                          {
                            backgroundColor: isDeposit
                              ? SECONDARY_COLOR
                              : '#F3F4F6',
                          },
                        ]}
                        onPress={() => setIsDeposit(true)}
                      >
                        <Ionicons
                          name="arrow-down-circle"
                          size={20}
                          color={isDeposit ? '#FFFFFF' : SECONDARY_COLOR}
                        />
                        <Text
                          style={[
                            styles.modalTypeButtonText,
                            { color: isDeposit ? '#FFFFFF' : '#374151' },
                          ]}
                        >
                          Deposit
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.modalTypeButton,
                          !isDeposit && styles.modalTypeSelected,
                          {
                            backgroundColor: !isDeposit
                              ? EXPENSE_COLOR
                              : '#F3F4F6',
                          },
                        ]}
                        onPress={() => setIsDeposit(false)}
                      >
                        <Ionicons
                          name="arrow-up-circle"
                          size={20}
                          color={!isDeposit ? '#FFFFFF' : EXPENSE_COLOR}
                        />
                        <Text
                          style={[
                            styles.modalTypeButtonText,
                            { color: !isDeposit ? '#FFFFFF' : '#374151' },
                          ]}
                        >
                          Tarik Dana
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Input Amount */}
                    <View style={styles.modalInputGroup}>
                      <Text style={styles.modalLabel}>
                        Jumlah ({isDeposit ? 'Deposit' : 'Tarik'})
                      </Text>
                      <View style={styles.modalAmountInput}>
                        <Text style={styles.modalCurrency}>Rp</Text>
                        <TextInput
                          style={styles.modalAmountTextInput}
                          placeholder="0"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="numeric"
                          value={updateAmount}
                          onChangeText={handleAmountChange}
                        />
                      </View>
                    </View>

                    {/* Summary Info */}
                    <View style={styles.modalSummary}>
                      <View style={styles.summaryInfoRow}>
                        <Text style={styles.summaryInfoLabel}>
                          Terkumpul Saat Ini
                        </Text>
                        <Text
                          style={[
                            styles.summaryInfoValue,
                            { color: PRIMARY_COLOR },
                          ]}
                        >
                          {formatCurrency(selectedSaving.amount)}
                        </Text>
                      </View>
                      <View style={styles.summaryInfoRow}>
                        <Text style={styles.summaryInfoLabel}>Sisa Target</Text>
                        <Text
                          style={[
                            styles.summaryInfoValue,
                            { color: EXPENSE_COLOR },
                          ]}
                        >
                          {formatCurrency(
                            Math.max(
                              0,
                              (selectedSaving.target || 0) -
                                selectedSaving.amount,
                            ),
                          )}
                        </Text>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={[styles.modalActionButton, styles.saveButton]}
                        onPress={handleUpdateSavingAmount}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#FFFFFF"
                        />
                        <Text style={styles.modalButtonText}>
                          Simpan {isDeposit ? 'Deposit' : 'Tarik'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.modalActionButton, styles.deleteButton]}
                        onPress={() => {
                          Alert.alert(
                            'Hapus Target',
                            `Anda yakin ingin menghapus target ${selectedSaving.goal}?`,
                            [
                              { text: 'Batal', style: 'cancel' },
                              {
                                text: 'Hapus',
                                onPress: () => {
                                  onDeleteSaving &&
                                    onDeleteSaving(selectedSaving.id);
                                  setShowUpdateModal(false);
                                },
                                style: 'destructive',
                              },
                            ],
                          );
                        }}
                      >
                        <Ionicons
                          name="trash-sharp"
                          size={20}
                          color="#FFFFFF"
                        />
                        <Text style={styles.modalButtonText}>Hapus</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  cardContainer: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderLeftWidth: 0,
  },
  shadowStyle: {
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconEmoji: {
    fontSize: 28,
  },
  cardTitleGroup: {
    flex: 1,
  },
  cardGoal: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_COLOR,
  },
  cardTarget: {
    fontSize: 13,
    color: LIGHT_GREY,
    marginTop: 2,
  },
  progressBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    borderTopWidth: 1,
    borderTopColor: BACKGROUND_COLOR,
    paddingTop: 16,
  },
  summaryItem: {
    width: '33%',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: LIGHT_GREY,
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    textAlign: 'center',
  },
  summaryAmountRemaining: {
    fontSize: 14,
    fontWeight: '700',
    color: EXPENSE_COLOR,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 16,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#9CA3AF',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: CARD_BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  addButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // ✅ MODAL STYLES - KEYBOARD RESPONSIVE
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
  },
  modalOverlayTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContent: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  goalInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BACKGROUND_COLOR,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  goalInfoEmoji: {
    fontSize: 32,
  },
  goalInfoText: {
    flex: 1,
  },
  modalGoal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  modalTarget: {
    fontSize: 13,
    color: '#6B7280',
  },
  modalTypeSwitchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  modalTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  modalTypeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalTypeSelected: {},
  modalInputGroup: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modalAmountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BACKGROUND_COLOR,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR + '40',
    paddingHorizontal: 16,
  },
  modalCurrency: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 8,
  },
  modalAmountTextInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    paddingVertical: 16,
  },
  modalSummary: {
    backgroundColor: BACKGROUND_COLOR,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 8,
  },
  summaryInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  saveButton: {
    backgroundColor: PRIMARY_COLOR,
    flex: 2,
  },
  deleteButton: {
    backgroundColor: EXPENSE_COLOR,
    flex: 1,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SavingsScreen;
