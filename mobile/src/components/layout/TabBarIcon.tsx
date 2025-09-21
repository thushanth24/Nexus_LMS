
import React from 'react';
import Icon from 'react-native-vector-icons/Feather';

interface TabBarIconProps {
  name: string;
  color: string;
  size: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ name, color, size }) => {
  return <Icon name={name} size={size} color={color} />;
};

export default TabBarIcon;
