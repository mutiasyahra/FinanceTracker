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
} from 'react-native';
import { formatCurrency } from '../utils/formatCurrency';
import { Saving } from '../api/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AddSavingScreen from './AddSavingScreen';

type SavingsScreenProps = {
  savings: Saving[];
  onAddSaving?: (saving: Saving) => void;
  onUpdateSaving?: (saving: Saving) => void;
  onDeleteSaving?: (savingId: string | number) => void;
};

const SavingsScreen: React.FC<SavingsScreenProps> = ({
  savings,
  onAddSaving,
  onUpdateSaving,
  onDeleteSaving,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedSaving, setSelectedSaving] = useState<Saving | null>(null);
  const [updateAmount, setUpdateAmount] = useState('');

  const getIconForGoal = (icon: string): string => {
    // Return the icon directly since it's already an Ionicons name
    return icon || 'flag';
  };

  const getColorForGoal = (goal: string): string => {
    const goalLower = goal.toLowerCase();
    if (goalLower.includes('darurat')) return '#EF4444';
    if (goalLower.includes('rumah')) return '#3B82F6';
    if (goalLower.includes('liburan')) return '#14B8A6';
    if (goalLower.includes('laptop') || goalLower.includes('gadget'))
      return '#6366F1';
    if (goalLower.includes('mobil') || goalLower.includes('kendaraan'))
      return '#F59E0B';
    if (goalLower.includes('nikah') || goalLower.includes('pernikahan'))
      return '#EC4899';
    if (goalLower.includes('pendidikan')) return '#8B5CF6';
    if (goalLower.includes('hobi')) return '#F59E0B';
    return '#10B981';
  };

  const calculateProgress = (amount: number, target: number): number => {
    return target > 0 ? (amount / target) * 100 : 0;
  };

  const handleAddSaving = (saving: Saving) => {
    if (onAddSaving) {
      onAddSaving(saving);
    }
    setShowAddModal(false);
  };

  const handleOpenUpdate = (saving: Saving) => {
    setSelectedSaving(saving);
    setUpdateAmount('');
    setShowUpdateModal(true);
  };

  const handleUpdateAmount = () => {
    if (!selectedSaving || !updateAmount) {
      Alert.alert('Error', 'Mohon masukkan jumlah tabungan');
      return;
    }

    const amount = parseFloat(updateAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Jumlah tidak valid');
      return;
    }

    const updatedSaving = {
      ...selectedSaving,
      amount: selectedSaving.amount + amount,
    };

    if (onUpdateSaving) {
      onUpdateSaving(updatedSaving);
    }

    setShowUpdateModal(false);
    setSelectedSaving(null);
    setUpdateAmount('');
  };

  const handleDeleteSaving = (saving: Saving) => {
    Alert.alert(
      'Hapus Target Tabungan',
      `Apakah Anda yakin ingin menghapus target "${saving.goal}"?`,
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            if (onDeleteSaving) {
              onDeleteSaving(saving.id);
            }
          },
        },
      ],
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Belum ditentukan';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Target Tabungan</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Tambah Target</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {savings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="piggy-bank-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>Belum ada tabungan</Text>
            <Text style={styles.emptySubtext}>
              Mulai menabung untuk masa depan Anda
            </Text>
          </View>
        ) : (
          savings.map(saving => {
            const target = saving.target || saving.amount * 3.33;
            const progress = calculateProgress(saving.amount, target);
            const remaining = target - saving.amount;
            const iconName = getIconForGoal(saving.icon);
            const iconColor = getColorForGoal(saving.goal);

            return (
              <View key={saving.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: iconColor + '20' },
                    ]}
                  >
                    <Ionicons name={iconName} size={40} color={iconColor} />
                  </View>
                  <View style={styles.headerContent}>
                    <Text style={styles.goal}>{saving.goal}</Text>
                    <Text style={styles.targetDate}>
                      Target: {formatDate(saving.targetDate)}
                    </Text>
                  </View>
                  <View style={styles.actionsContainer}>
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={() => handleOpenUpdate(saving)}
                    >
                      <Ionicons name="add-circle" size={28} color={iconColor} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={() => handleDeleteSaving(saving)}
                    >
                      <Ionicons name="trash" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text
                      style={[styles.progressPercentage, { color: iconColor }]}
                    >
                      {progress.toFixed(0)}%
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${Math.min(progress, 100)}%`,
                          backgroundColor: iconColor,
                        },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.amountSection}>
                  <View style={styles.amountBox}>
                    <Text style={styles.amountLabel}>Terkumpul</Text>
                    <Text
                      style={[styles.collectedAmount, { color: iconColor }]}
                    >
                      {formatCurrency(saving.amount)}
                    </Text>
                  </View>
                  <View style={styles.amountBox}>
                    <Text style={styles.amountLabel}>Target</Text>
                    <Text style={styles.targetAmount}>
                      {formatCurrency(target)}
                    </Text>
                  </View>
                </View>

                <View style={styles.remainingSection}>
                  <Text style={styles.remainingLabel}>Sisa</Text>
                  <Text style={styles.remainingAmount}>
                    {formatCurrency(Math.max(remaining, 0))}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Saving Modal */}
      <AddSavingScreen
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddSaving}
      />

      {/* Update Amount Modal */}
      <Modal visible={showUpdateModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Tabungan</Text>
              <TouchableOpacity onPress={() => setShowUpdateModal(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            {selectedSaving && (
              <>
                <View style={styles.modalGoalHeader}>
                  <View
                    style={[
                      styles.modalIconCircle,
                      {
                        backgroundColor:
                          getColorForGoal(selectedSaving.goal) + '20',
                      },
                    ]}
                  >
                    <Ionicons
                      name={getIconForGoal(selectedSaving.icon)}
                      size={32}
                      color={getColorForGoal(selectedSaving.goal)}
                    />
                  </View>
                  <Text style={styles.modalGoal}>{selectedSaving.goal}</Text>
                </View>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Jumlah Menabung</Text>
                  <View style={styles.modalAmountInput}>
                    <Text style={styles.modalCurrency}>Rp</Text>
                    <TextInput
                      style={styles.modalAmountTextInput}
                      placeholder="0"
                      keyboardType="numeric"
                      value={updateAmount}
                      onChangeText={setUpdateAmount}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <View style={styles.modalSummary}>
                  <View style={styles.modalSummaryRow}>
                    <Text style={styles.modalSummaryLabel}>
                      Tabungan Saat Ini:
                    </Text>
                    <Text style={styles.modalSummaryValue}>
                      {formatCurrency(selectedSaving.amount)}
                    </Text>
                  </View>
                  <View style={styles.modalSummaryRow}>
                    <Text style={styles.modalSummaryLabel}>
                      Setelah Ditambah:
                    </Text>
                    <Text
                      style={[
                        styles.modalSummaryValue,
                        { color: getColorForGoal(selectedSaving.goal) },
                      ]}
                    >
                      {formatCurrency(
                        selectedSaving.amount + (parseFloat(updateAmount) || 0),
                      )}
                    </Text>
                  </View>
                  <View style={styles.modalSummaryDivider} />
                  <View style={styles.modalSummaryRow}>
                    <Text style={styles.modalSummaryLabel}>Target:</Text>
                    <Text style={styles.modalSummaryValue}>
                      {formatCurrency(
                        selectedSaving.target || selectedSaving.amount * 3.33,
                      )}
                    </Text>
                  </View>
                  <View style={styles.modalSummaryRow}>
                    <Text style={styles.modalSummaryLabel}>Sisa:</Text>
                    <Text style={styles.modalSummaryValue}>
                      {formatCurrency(
                        Math.max(
                          (selectedSaving.target ||
                            selectedSaving.amount * 3.33) -
                            (selectedSaving.amount +
                              (parseFloat(updateAmount) || 0)),
                          0,
                        ),
                      )}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.modalSaveButton,
                    {
                      backgroundColor: getColorForGoal(selectedSaving.goal),
                    },
                  ]}
                  onPress={handleUpdateAmount}
                >
                  <Text style={styles.modalSaveButtonText}>
                    Simpan Tabungan
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#E8F5E9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  goal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  targetDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    padding: 4,
  },
  progressSection: {
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
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  amountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amountBox: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  collectedAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  targetAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  remainingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  modalIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalGoal: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
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
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    color: '#111827',
    paddingVertical: 16,
  },
  modalSummary: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  modalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalSummaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  modalSummaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalSummaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalSaveButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default SavingsScreen;
