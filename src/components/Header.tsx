import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

// 🔹 Definisikan tipe props untuk komponen Header
interface User {
  name: string;
  email: string;
  avatar: string;
}

interface HeaderProps {
  user?: User | null; // opsional karena ada kondisi `if (!user)`
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.emoji}>💰</Text>
        <Text style={styles.title}>Finance Tracker</Text>
      </View>
      <View style={styles.rightSection}>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {user.name}
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'flex-end',
    marginRight: 12,
    maxWidth: 150,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  userEmail: {
    fontSize: 11,
    color: '#6B7280',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#10B981',
  },
});

export default Header;
