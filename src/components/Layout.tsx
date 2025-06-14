import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  DrawerLayoutAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const drawer = React.useRef<DrawerLayoutAndroid>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigation.navigate('Home');
  };

  const menuItems = [
    { path: 'Dashboard', icon: 'home', label: t('nav.home') },
    { path: 'MesPlats', icon: 'restaurant', label: t('nav.myPlates') },
    { path: 'Programmation', icon: 'calendar-today', label: t('nav.planning') },
    { path: 'ListeDeCourses', icon: 'shopping-cart', label: t('nav.shopping') },
    { path: 'Assistant', icon: 'assistant', label: t('nav.assistant') },
    { path: 'Marches', icon: 'location-on', label: t('nav.markets') },
  ];

  const renderDrawerContent = () => (
    <View style={styles.drawer}>
      <View style={styles.drawerHeader}>
        <View style={styles.logoContainer}>
          <Icon name="restaurant" size={20} color="#fff" />
        </View>
        <Text style={styles.appName}>SmartMeal</Text>
        <TouchableOpacity
          onPress={() => drawer.current?.closeDrawer()}
          style={styles.closeButton}
        >
          <Icon name="close" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.nav}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.path}
            style={styles.navItem}
            onPress={() => {
              navigation.navigate(item.path);
              drawer.current?.closeDrawer();
            }}
          >
            <Icon name={item.icon} size={20} color="#374151" />
            <Text style={styles.navText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.drawerFooter}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]?.toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#374151" />
          <Text style={styles.logoutText}>{t('nav.logout')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (user?.role === 'admin') {
    return (
      <SafeAreaView style={styles.adminContainer}>
        <View style={styles.adminHeader}>
          <View style={styles.logoContainer}>
            <Icon name="restaurant" size={20} color="#fff" />
          </View>
          <Text style={styles.adminTitle}>SmartMeal Admin</Text>
          <View style={styles.adminHeaderRight}>
            <LanguageSelector />
            <TouchableOpacity style={styles.logoutButtonSmall} onPress={handleLogout}>
              <Icon name="logout" size={20} color="#374151" />
              <Text style={styles.logoutText}>{t('nav.logout')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.adminContent}>
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <DrawerLayoutAndroid
        ref={drawer}
        drawerWidth={280}
        drawerPosition="left"
        renderNavigationView={renderDrawerContent}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => drawer.current?.openDrawer()}
            style={styles.menuButton}
          >
            <Icon name="menu" size={24} color="#374151" />
          </TouchableOpacity>
          <LanguageSelector />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {children}
        </ScrollView>
      </DrawerLayoutAndroid>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  adminContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  adminTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  adminHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  adminContent: {
    padding: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  drawer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  logoContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#16a34a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 12,
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  nav: {
    padding: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  navText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4b5563',
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  userEmail: {
    fontSize: 12,
    color: '#6b7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  logoutButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  logoutText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
});

export default Layout;