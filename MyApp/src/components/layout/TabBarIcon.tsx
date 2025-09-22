import React from 'react';
import { Feather } from '@expo/vector-icons';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface TabBarIconProps {
  name: FeatherIconName;
  color: string;
  size: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ name, color, size }) => {
  return <Feather name={name} size={size} color={color} />;
};

export default TabBarIcon;
