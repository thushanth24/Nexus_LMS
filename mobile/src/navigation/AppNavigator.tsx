
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

import LoginScreen from '../screens/LoginScreen';
import AdminNavigator from './AdminNavigator';
import TeacherNavigator from './TeacherNavigator';
import StudentNavigator from './StudentNavigator';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const getRoleBasedNavigator = () => {
    switch (user?.role) {
      case UserRole.ADMIN:
        return <AdminNavigator />;
      case UserRole.TEACHER:
        return <TeacherNavigator />;
      case UserRole.STUDENT:
        return <StudentNavigator />;
      default:
        // This case should ideally not be reached if user is logged in
        return <LoginScreen />;
    }
  };

  return (
    <NavigationContainer>
        {user ? getRoleBasedNavigator() : <LoginScreen />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS['base-200']
    }
});


export default AppNavigator;
