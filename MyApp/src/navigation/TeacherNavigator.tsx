

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import TeacherDashboardScreen from '../screens/teacher/DashboardScreen';
import TeacherScheduleScreen from '../screens/teacher/ScheduleScreen';
import TeacherClassesScreen from '../screens/teacher/ClassesScreen';
import TeacherClassDetailScreen from '../screens/teacher/ClassDetailScreen';
import TeacherHomeworkScreen from '../screens/teacher/HomeworkScreen';
import TeacherStudentsScreen from '../screens/teacher/StudentsScreen';
import TeacherChessLibraryScreen from '../screens/teacher/ChessLibraryScreen';
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
        <Stack.Screen name="Dashboard" component={TeacherDashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
);

const ClassesStack = () => (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
        <Stack.Screen name="ClassesList" component={TeacherClassesScreen} options={{ title: "My Classes" }}/>
        <Stack.Screen name="ClassDetail" component={TeacherClassDetailScreen} options={{ title: "Class Details" }}/>
    </Stack.Navigator>
);

const TeacherNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS['text-secondary'],
        tabBarStyle: { backgroundColor: COLORS['base-100'], borderTopColor: COLORS['base-200'] },
        ...defaultScreenOptions
      }}>
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
        name="ScheduleTab" 
        component={TeacherScheduleScreen}
        options={{ 
            title: 'Schedule',
            tabBarIcon: ({ color, size }) => <TabBarIcon name="calendar" color={color} size={size} />,
        }} 
      />
      <Tab.Screen 
        name="ClassesTab" 
        component={ClassesStack}
        options={{ 
            title: 'Classes',
            headerShown: false,
            tabBarIcon: ({ color, size }) => <TabBarIcon name="book-open" color={color} size={size} />,
        }} 
      />
       <Tab.Screen 
        name="HomeworkTab" 
        component={TeacherHomeworkScreen}
        options={{ 
            title: 'Homework',
            tabBarIcon: ({ color, size }) => <TabBarIcon name="edit-3" color={color} size={size} />,
        }} 
      />
       <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{ 
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <TabBarIcon name="user" color={color} size={size} />,
        }} 
      />
    </Tab.Navigator>
  );
};

export default TeacherNavigator;