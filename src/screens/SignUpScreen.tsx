// File: src/screens/SignUpScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PRIMARY_COLOR = '#6A0DAD'; // Dark Violet
const BACKGROUND_COLOR = '#F5F3FF'; // Very Light Lavender

interface SignUpScreenProps {
  onSignUp: (name: string, email: string, pass: string) => Promise<void>;
  onNavigateBack: () => void;
  isLoading: boolean;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onSignUp,
  onNavigateBack,
  isLoading,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Semua kolom harus diisi.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter.');
      return;
    }

    // Panggil fungsi onSignUp yang diterima dari App.tsx
    await onSignUp(name, email, password);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-add-sharp" size={60} color={PRIMARY_COLOR} />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Start tracking your money effortlessly
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="John Doe"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.textInput}
            placeholder="your.email@example.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Minimal 6 karakter"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.disabledButton]}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onNavigateBack}
          disabled={isLoading}
        >
          <Text style={styles.secondaryButtonText}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 5,
  },
  form: {
    width: '100%',
    maxWidth: 350,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  primaryButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: PRIMARY_COLOR,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default SignUpScreen;
