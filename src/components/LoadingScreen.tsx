import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

// 💜 Definisi Warna
const PRIMARY_COLOR = '#6A0DAD'; // Dark Violet - Main Accent
const BACKGROUND_COLOR = '#F5F3FF'; // Very Light Lavender

interface LoadingScreenProps {
  message?: string;
  color?: string; // Menerima warna untuk indikator
}

// 🔹 Komponen fungsional dengan tipe eksplisit
const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message,
  color = PRIMARY_COLOR,
}) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={color} />
    <Text style={styles.text}>{message || 'Memuat FinPro...'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND_COLOR, // Warna background baru
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default LoadingScreen;
