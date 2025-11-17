export const formatCurrency = (amount: number): string => {
  // Gunakan Math.abs untuk memastikan jumlah selalu positif saat diformat
  const absoluteAmount = Math.abs(amount);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absoluteAmount);
};

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('id-ID').format(number);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};
