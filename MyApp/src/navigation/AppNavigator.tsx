
import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '@/hooks';
import { UserRole } from '@/types';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { COLORS } from '@/theme';

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack>
      {!user ? (
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false,
            animation: 'fade',
          }}
        />
      ) : (
        <>
          {user.role === UserRole.ADMIN && (
            <Stack.Screen 
              name="(admin)" 
              options={{ 
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
          )}
          {user.role === UserRole.TEACHER && (
            <Stack.Screen 
              name="(teacher)" 
              options={{ 
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
          )}
          {user.role === UserRole.STUDENT && (
            <Stack.Screen 
              name="(student)" 
              options={{ 
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
          )}
        </>
      )}
    </Stack>
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
