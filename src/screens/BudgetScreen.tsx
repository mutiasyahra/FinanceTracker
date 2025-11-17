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
import { formatCurrency } from '../utils/formatCurrency';
import { Budget } from '../api/api';
import { Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AddBudgetScreen from './AddBudgetScreen';

const PRIMARY_COLOR = '#6A0DAD';
const SECONDARY_COLOR = '#9370DB';
const EXPENSE_COLOR = '#DC143C';
const BACKGROUND_COLOR = '#F5F3FF';
const CARD_BACKGROUND = '#FFFFFF';

export type BudgetWithIdString = Omit<Budget, 'id'> & { id: string };

type BudgetScreenProps = {
  budgets: Budget[];
  onAddBudget?: (budget: BudgetWithIdString) => void;
  onUpdateBudget?: (budget: BudgetWithIdString) => void;
  onDeleteBudget?: (budgetId: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
};

const BudgetScreen: React.FC<BudgetScreenProps> = ({
  budgets,
  onAddBudget,
  onUpdateBudget,
  onDeleteBudget,
  refreshing = false,
  onRefresh,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [updateAmount, setUpdateAmount] = useState('');

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

  const getIconForCategory = (
    category: string,
  ): { emoji: string; color: string } => {
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
    const item = categories.find(c => c.name === category);
    return item || { emoji: '📦', color: PRIMARY_COLOR };
  };

  const calculatePercentage = (spent: number, limit: number): number => {
    return limit > 0 ? (spent / limit) * 100 : 0;
  };

  const handleOpenUpdateModal = (budget: Budget) => {
    setSelectedBudget(budget);
    setUpdateAmount(budget.limit.toString());
    setShowUpdateModal(true);
  };

  const handleUpdateLimit = () => {
    if (!selectedBudget || !onUpdateBudget) return;

    const rawNumber = updateAmount.replace(/\D/g, '');
    const newLimit = Number(rawNumber);

    if (newLimit <= 0 || isNaN(newLimit)) {
      Alert.alert('Gagal', 'Limit harus lebih dari 0.');
      return;
    }

    onUpdateBudget({
      ...selectedBudget,
      limit: newLimit,
    } as BudgetWithIdString);
    setShowUpdateModal(false);
    setSelectedBudget(null);
  };

  const handleAmountChange = (text: string) => {
    const rawNumber = text.replace(/\D/g, '');
    setUpdateAmount(rawNumber);
  };

  const BudgetCard: React.FC<{ budget: Budget }> = ({ budget }) => {
    const percentage = calculatePercentage(budget.spent, budget.limit);
    const remaining = budget.limit - budget.spent;
    let progressColor = PRIMARY_COLOR;
    if (percentage > 80) {
      progressColor = EXPENSE_COLOR;
    } else if (percentage > 50) {
      progressColor = '#F59E0B';
    }
    const { emoji, color: iconBaseColor } = getIconForCategory(budget.category);
    const isOverspent = percentage > 100;

    return (
      <View style={[styles.cardContainer, styles.shadowStyle]}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: iconBaseColor + '20' },
            ]}
          >
            <Text style={styles.iconEmoji}>{emoji}</Text>
          </View>
          <View style={styles.cardTitleGroup}>
            <Text style={styles.cardCategory} numberOfLines={1}>
              {budget.category}
            </Text>
            <Text style={styles.cardPeriod}>
              {budget.period === 'monthly' ? '📆 Bulanan' : '🗓️ Mingguan'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => handleOpenUpdateModal(budget)}
          >
            <Ionicons
              name="ellipsis-vertical-sharp"
              size={24}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(100, percentage)}%`,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>
          <Text style={[styles.percentageText, { color: progressColor }]}>
            {Math.round(percentage)}%
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Sisa</Text>
            <Text
              style={[
                styles.summaryAmount,
                { color: isOverspent ? EXPENSE_COLOR : PRIMARY_COLOR },
              ]}
            >
              {formatCurrency(Math.abs(remaining))}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Terpakai</Text>
            <Text style={styles.summaryAmount}>
              {formatCurrency(budget.spent)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Limit</Text>
            <Text style={styles.summaryAmount}>
              {formatCurrency(budget.limit)}
            </Text>
          </View>
        </View>
        {isOverspent && (
          <View style={styles.warningBox}>
            <Ionicons name="warning-sharp" size={16} color={EXPENSE_COLOR} />
            <Text style={styles.warningText}>
              Overspent: {formatCurrency(Math.abs(remaining))}
            </Text>
          </View>
        )}
      </View>
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
        <Text style={styles.sectionTitle}>Budget Aktif</Text>
        {budgets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={50} color="#9CA3AF" />
            <Text style={styles.emptyText}>Belum ada budget yang dibuat.</Text>
          </View>
        ) : (
          budgets.map(budget => <BudgetCard key={budget.id} budget={budget} />)
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
            <Text style={styles.addButtonText}>Tambah Budget</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {onAddBudget && (
        <AddBudgetScreen
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={onAddBudget as any}
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
                <Text style={styles.modalTitle}>Edit Budget</Text>
                <TouchableOpacity
                  onPress={() => setShowUpdateModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close-circle" size={28} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {selectedBudget && (
                  <>
                    {/* Category Info */}
                    <View style={styles.categoryInfoBox}>
                      <Text style={styles.categoryInfoEmoji}>
                        {getIconForCategory(selectedBudget.category).emoji}
                      </Text>
                      <View style={styles.categoryInfoText}>
                        <Text style={styles.modalCategory}>
                          {selectedBudget.category}
                        </Text>
                        <Text style={styles.modalPeriod}>
                          {selectedBudget.period === 'monthly'
                            ? '📆 Bulanan'
                            : '🗓️ Mingguan'}
                        </Text>
                      </View>
                    </View>

                    {/* Input Limit */}
                    <View style={styles.modalInputGroup}>
                      <Text style={styles.modalLabel}>Ubah Limit Budget</Text>
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
                          Limit Saat Ini
                        </Text>
                        <Text style={styles.summaryInfoValue}>
                          {formatCurrency(selectedBudget.limit)}
                        </Text>
                      </View>
                      <View style={styles.summaryInfoRow}>
                        <Text style={styles.summaryInfoLabel}>Terpakai</Text>
                        <Text
                          style={[
                            styles.summaryInfoValue,
                            { color: EXPENSE_COLOR },
                          ]}
                        >
                          {formatCurrency(selectedBudget.spent)}
                        </Text>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={[styles.modalActionButton, styles.saveButton]}
                        onPress={handleUpdateLimit}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#FFFFFF"
                        />
                        <Text style={styles.modalButtonText}>Simpan Limit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.modalActionButton, styles.deleteButton]}
                        onPress={() => {
                          Alert.alert(
                            'Hapus Budget',
                            `Anda yakin ingin menghapus budget ${selectedBudget.category}?`,
                            [
                              { text: 'Batal', style: 'cancel' },
                              {
                                text: 'Hapus',
                                onPress: () => {
                                  onDeleteBudget &&
                                    onDeleteBudget(selectedBudget.id as string);
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
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 28,
  },
  cardTitleGroup: {
    flex: 1,
  },
  cardCategory: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  cardPeriod: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
  },
  progressBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    marginTop: 8,
    paddingHorizontal: 8,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: EXPENSE_COLOR + '10',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    gap: 8,
  },
  warningText: {
    color: EXPENSE_COLOR,
    fontWeight: '600',
    fontSize: 14,
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
  categoryInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BACKGROUND_COLOR,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  categoryInfoEmoji: {
    fontSize: 32,
  },
  categoryInfoText: {
    flex: 1,
  },
  modalCategory: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  modalPeriod: {
    fontSize: 13,
    color: '#6B7280',
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

export default BudgetScreen;
