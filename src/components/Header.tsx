import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { User } from '../api/api';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const PRIMARY_COLOR = '#6A0DAD';
const CARD_BACKGROUND = '#FFFFFF';

type RootStackParamList = {
  MainTabs: undefined;
  Profile: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface HeaderProps {
  user?: User | null;
  primaryColor?: string;
}

const Header: React.FC<HeaderProps> = ({
  user,
  primaryColor = PRIMARY_COLOR,
}) => {
  const navigation = useNavigation<NavigationProp>();

  if (!user) return null;

  return (
    <View style={styles.container}>
      {/* 📸 Kiri: logo image + judul */}
      <View style={styles.leftSection}>
        <Image
          source={require('../../assets/financeTracker-logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />

        <Text style={styles.title}>Finance Tracker</Text>
      </View>

      {/* 📸 Kanan: info pengguna */}
      <TouchableOpacity
        style={styles.rightSection}
        onPress={() => navigation.navigate('Profile')}
        activeOpacity={0.7}
      >
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CARD_BACKGROUND,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 36,
    height: 36,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
  },
});

export default Header;
