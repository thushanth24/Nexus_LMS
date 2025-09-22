import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import { AuthProvider } from './src/contexts/AuthContext';
import { useAuth } from './src/hooks/useAuth';
import { UserRole } from './src/types';
import AdminNavigator from './src/navigation/AdminNavigator';
import TeacherNavigator from './src/navigation/TeacherNavigator';
import StudentNavigator from './src/navigation/StudentNavigator';
import { COLORS } from './src/theme/colors';

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS['base-200'] }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user && <LoginScreen />}
      {user?.role === UserRole.ADMIN && <AdminNavigator />}
      {user?.role === UserRole.TEACHER && <TeacherNavigator />}
      {user?.role === UserRole.STUDENT && <StudentNavigator />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
