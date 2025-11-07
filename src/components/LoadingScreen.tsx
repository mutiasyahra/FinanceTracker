import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface LoadingScreenProps {
  message?: string;
}

// 🔹 Komponen fungsional dengan tipe eksplisit
const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#10B981" />
    <Text style={styles.text}>{message || 'Loading Finance Tracker...'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default LoadingScreen;
