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
import { Budget } from '../api/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AddBudgetScreen from './AddBudgetScreen';

type BudgetScreenProps = {
  budgets: Budget[];
  onAddBudget?: (budget: Budget) => void;
  onUpdateBudget?: (budget: Budget) => void;
  onDeleteBudget?: (budgetId: string | number) => void;
};

const BudgetScreen: React.FC<BudgetScreenProps> = ({
  budgets,
  onAddBudget,
  onUpdateBudget,
  onDeleteBudget,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [updateAmount, setUpdateAmount] = useState('');

  const calculatePercentage = (spent: number, limit: number): number => {
    return limit > 0 ? (spent / limit) * 100 : 0;
  };

  const getStatusColor = (percentage: number): string => {
    if (percentage >= 90) return '#EF4444';
    if (percentage >= 70) return '#F59E0B';
    return '#10B981';
  };

  const getIconForCategory = (category: string): string => {
    if (category === 'Food') return 'restaurant';
    if (category === 'Transportation') return 'car';
    if (category === 'Entertainment') return 'film';
    if (category === 'Housing') return 'home';
    if (category === 'Bills') return 'phone-portrait';
    if (category === 'Shopping') return 'bag-handle';
    if (category === 'Health') return 'medkit';
    if (category === 'Education') return 'book';
    return 'wallet';
  };

  const getColorForCategory = (category: string): string => {
    if (category === 'Food') return '#EF4444';
    if (category === 'Transportation') return '#F59E0B';
    if (category === 'Entertainment') return '#8B5CF6';
    if (category === 'Housing') return '#3B82F6';
    if (category === 'Bills') return '#10B981';
    if (category === 'Shopping') return '#EC4899';
    if (category === 'Health') return '#14B8A6';
    if (category === 'Education') return '#6366F1';
    return '#10B981';
  };

  const handleAddBudget = (budget: Budget) => {
    if (onAddBudget) {
      onAddBudget(budget);
    }
    setShowAddModal(false);
  };

  const handleOpenUpdate = (budget: Budget) => {
    setSelectedBudget(budget);
    setUpdateAmount('');
    setShowUpdateModal(true);
  };

  const handleUpdateSpent = () => {
    if (!selectedBudget || !updateAmount) {
      Alert.alert('Error', 'Mohon masukkan jumlah pengeluaran');
      return;
    }

    const amount = parseFloat(updateAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Jumlah tidak valid');
      return;
    }

    const updatedBudget = {
      ...selectedBudget,
      spent: selectedBudget.spent + amount,
    };

    if (onUpdateBudget) {
      onUpdateBudget(updatedBudget);
    }

    setShowUpdateModal(false);
    setSelectedBudget(null);
    setUpdateAmount('');
  };

  const handleDeleteBudget = (budget: Budget) => {
    Alert.alert(
      'Hapus Budget',
      `Apakah Anda yakin ingin menghapus budget ${budget.category}?`,
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            if (onDeleteBudget) {
              onDeleteBudget(budget.id);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Tracking</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Tambah Budget</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {budgets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>Belum ada budget</Text>
            <Text style={styles.emptySubtext}>
              Budget Anda akan muncul di sini
            </Text>
          </View>
        ) : (
          budgets.map(budget => {
            const percentage = calculatePercentage(budget.spent, budget.limit);
            const statusColor = getStatusColor(percentage);
            const iconName = getIconForCategory(budget.category);
            const categoryColor = getColorForCategory(budget.category);

            return (
              <View key={budget.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.categoryContainer}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: categoryColor + '20' },
                      ]}
                    >
                      <Ionicons
                        name={iconName}
                        size={28}
                        color={categoryColor}
                      />
                    </View>
                    <View>
                      <Text style={styles.category}>{budget.category}</Text>
                      <Text style={styles.subtitle}>Budget Bulanan</Text>
                    </View>
                  </View>
                  <View style={styles.actionsContainer}>
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={() => handleOpenUpdate(budget)}
                    >
                      <Ionicons name="add-circle" size={28} color="#10B981" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={() => handleDeleteBudget(budget)}
                    >
                      <Ionicons name="trash" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Terpakai</Text>
                    <Text style={[styles.percentage, { color: statusColor }]}>
                      {percentage.toFixed(0)}%
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: statusColor,
                        },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.amountRow}>
                  <View style={styles.amountItem}>
                    <Text style={styles.amountLabel}>Terpakai</Text>
                    <Text style={styles.spentAmount}>
                      {formatCurrency(budget.spent)}
                    </Text>
                  </View>
                  <View style={styles.amountItem}>
                    <Text style={styles.amountLabel}>Budget</Text>
                    <Text style={styles.limitAmount}>
                      {formatCurrency(budget.limit)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Budget Modal */}
      <AddBudgetScreen
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddBudget}
      />

      {/* Update Spent Modal */}
      <Modal visible={showUpdateModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Pengeluaran</Text>
              <TouchableOpacity onPress={() => setShowUpdateModal(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            {selectedBudget && (
              <>
                <Text style={styles.modalCategory}>
                  {selectedBudget.category}
                </Text>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Jumlah Pengeluaran</Text>
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
                      Terpakai Saat Ini:
                    </Text>
                    <Text style={styles.modalSummaryValue}>
                      {formatCurrency(selectedBudget.spent)}
                    </Text>
                  </View>
                  <View style={styles.modalSummaryRow}>
                    <Text style={styles.modalSummaryLabel}>
                      Setelah Ditambah:
                    </Text>
                    <Text
                      style={[styles.modalSummaryValue, { color: '#10B981' }]}
                    >
                      {formatCurrency(
                        selectedBudget.spent + (parseFloat(updateAmount) || 0),
                      )}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={handleUpdateSpent}
                >
                  <Text style={styles.modalSaveButtonText}>
                    Simpan Pengeluaran
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  category: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
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
  percentage: {
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
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountItem: {
    alignItems: 'flex-start',
  },
  amountLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  spentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  limitAmount: {
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
  modalCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 20,
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
    backgroundColor: '#10B981',
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

export default BudgetScreen;
