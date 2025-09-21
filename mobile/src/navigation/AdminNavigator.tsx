
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import AdminDashboardScreen from '../screens/admin/DashboardScreen';
import AdminTeachersScreen from '../screens/admin/TeachersScreen';
import AdminStudentsScreen from '../screens/admin/StudentsScreen';
import AdminGroupsScreen from '../screens/admin/GroupsScreen';
import AdminGroupDetailScreen from '../screens/admin/GroupDetailScreen';
import AdminScheduleScreen from '../screens/admin/ScheduleScreen';
import AdminFinanceScreen from '../screens/admin/FinanceScreen';
import ProfileScreen from '../screens/ProfileScreen';

import { COLORS } from '../theme/colors';
import TabBarIcon from '../components/layout/TabBarIcon';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const defaultScreenOptions = {
    headerStyle: { backgroundColor: COLORS['base-100'], shadowColor: COLORS.black, elevation: 5 },
    // FIX: Add 'as const' to fontWeight to ensure it's typed as a literal 'bold' instead of a generic string.
    headerTitleStyle: { color: COLORS.neutral, fontWeight: 'bold' as const }
};

const DashboardStack = () => (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
        <Stack.Screen name="Dashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
);

const GroupsStack = () => (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
        <Stack.Screen name="GroupsList" component={AdminGroupsScreen} options={{ title: 'Groups' }} />
        <Stack.Screen name="GroupDetail" component={AdminGroupDetailScreen} options={{ title: 'Group Details' }} />
    </Stack.Navigator>
);

const AdminNavigator = () => {
  return (
    <Tab.Navigator
        screenOptions={{
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS['text-secondary'],
            tabBarStyle: { backgroundColor: COLORS['base-100'], borderTopColor: COLORS['base-200'] },
            ...defaultScreenOptions,
        }}
    >
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardStack} 
        options={{ 
            title: 'Dashboard',
            headerShown: false,
            tabBarIcon: ({ color, size }) => <TabBarIcon name="layout" color={color} size={size} />,
        }} 
      />
      <Tab.Screen 
        name="Teachers" 
        component={AdminTeachersScreen} 
        options={{ 
            tabBarIcon: ({ color, size }) => <TabBarIcon name="users" color={color} size={size} />,
        }} 
      />
      <Tab.Screen 
        name="Students" 
        component={AdminStudentsScreen} 
        options={{ 
            tabBarIcon: ({ color, size }) => <TabBarIcon name="users" color={color} size={size} />,
        }} 
      />
      <Tab.Screen 
        name="Groups" 
        component={GroupsStack} 
        options={{ 
            headerShown: false,
            tabBarIcon: ({ color, size }) => <TabBarIcon name="book-open" color={color} size={size} />,
        }} 
      />
       <Tab.Screen 
        name="Schedule" 
        component={AdminScheduleScreen} 
        options={{ 
            tabBarIcon: ({ color, size }) => <TabBarIcon name="calendar" color={color} size={size} />,
        }} 
      />
       <Tab.Screen 
        name="Finance" 
        component={AdminFinanceScreen} 
        options={{ 
            tabBarIcon: ({ color, size }) => <TabBarIcon name="dollar-sign" color={color} size={size} />,
        }} 
      />
    </Tab.Navigator>
  );
};

export default AdminNavigator;