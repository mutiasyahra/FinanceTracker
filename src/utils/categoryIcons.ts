// File ini menyimpan mapping kategori ke icon dan emoji agar konsisten di seluruh aplikasi

export interface CategoryIcon {
  name: string;
  emoji: string;
  icon: string; // ionicons name
  color: string;
}

// ✅ EXPENSE CATEGORIES dengan icon Ionicons dan Emoji
export const expenseCategories: CategoryIcon[] = [
  { name: 'Food', emoji: '🍕', icon: 'fast-food', color: '#EF4444' },
  { name: 'Food & Drink', emoji: '🍕', icon: 'fast-food', color: '#EF4444' },
  { name: 'Transportation', emoji: '🚗', icon: 'car', color: '#F59E0B' },
  {
    name: 'Entertainment',
    emoji: '🎬',
    icon: 'game-controller',
    color: '#8B5CF6',
  },
  { name: 'Shopping', emoji: '🛒', icon: 'bag', color: '#EC4899' },
  { name: 'Utilities', emoji: '💡', icon: 'home', color: '#3B82F6' },
  { name: 'Health', emoji: '⚕️', icon: 'medkit', color: '#059669' },
  { name: 'Education', emoji: '📚', icon: 'book', color: '#6366F1' },
  { name: 'Investment', emoji: '📈', icon: 'trending-down', color: '#4B5563' },
  {
    name: 'Others',
    emoji: '📌',
    icon: 'ellipsis-horizontal',
    color: '#6B7280',
  },
];

// ✅ INCOME CATEGORIES dengan icon Ionicons dan Emoji
export const incomeCategories: CategoryIcon[] = [
  { name: 'Salary', emoji: '💼', icon: 'briefcase', color: '#10B981' },
  { name: 'Freelance', emoji: '💻', icon: 'laptop', color: '#9370DB' },
  { name: 'Investment', emoji: '📊', icon: 'trending-up', color: '#F59E0B' },
  { name: 'Gift', emoji: '🎁', icon: 'gift', color: '#EC4899' },
  { name: 'Others', emoji: '💰', icon: 'cash', color: '#6B7280' },
];

// ✅ SAVINGS GOALS dengan icon Ionicons dan Emoji
export const savingsGoals: CategoryIcon[] = [
  { name: 'Dana Darurat', emoji: '🛡️', icon: 'shield', color: '#EF4444' },
  { name: 'Rumah', emoji: '🏠', icon: 'home', color: '#F59E0B' },
  { name: 'Liburan', emoji: '✈️', icon: 'airplane', color: '#3B82F6' },
  { name: 'Kendaraan', emoji: '🚗', icon: 'car', color: '#8B5CF6' },
  { name: 'Pendidikan', emoji: '🎓', icon: 'briefcase', color: '#059669' },
  { name: 'Lain-lain', emoji: '🎁', icon: 'gift', color: '#EC4899' },
];

// ✅ Helper function untuk mendapatkan info kategori
export const getCategoryInfo = (
  categoryName: string,
  type: 'income' | 'expense' | 'saving' = 'expense',
): CategoryIcon => {
  let categories: CategoryIcon[] = [];

  switch (type) {
    case 'income':
      categories = incomeCategories;
      break;
    case 'saving':
      categories = savingsGoals;
      break;
    case 'expense':
    default:
      categories = expenseCategories;
      break;
  }

  const found = categories.find(
    c => c.name.toLowerCase() === categoryName.toLowerCase(),
  );

  // Default fallback
  if (!found) {
    return {
      name: categoryName,
      emoji: type === 'income' ? '💵' : type === 'saving' ? '🎯' : '📦',
      icon:
        type === 'income'
          ? 'arrow-down-circle'
          : type === 'saving'
          ? 'flag'
          : 'pricetags',
      color: '#6B7280',
    };
  }

  return found;
};

// ✅ Helper untuk mendapatkan info saving berdasarkan icon name
export const getSavingIconInfo = (iconName: string): CategoryIcon => {
  const found = savingsGoals.find(s => s.icon === iconName);
  if (!found) {
    return {
      name: 'Lain-lain',
      emoji: '🎯',
      icon: 'flag',
      color: '#6B7280',
    };
  }
  return found;
};
