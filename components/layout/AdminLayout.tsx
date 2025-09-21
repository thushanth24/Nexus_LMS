

import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar, { NavItem } from './Sidebar';
import Header from './Header';
import { DashboardIcon, UsersIcon, CalendarIcon, BookOpenIcon, DollarSignIcon, ChartBarIcon, UserIcon } from '../ui/Icons';

const adminNavItems: NavItem[] = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/admin/teachers', name: 'Teachers', icon: <UsersIcon /> },
    { path: '/admin/students', name: 'Students', icon: <UsersIcon /> },
    { path: '/admin/groups', name: 'Groups', icon: <BookOpenIcon /> },
    { path: '/admin/schedule', name: 'Schedule', icon: <CalendarIcon /> },
    { path: '/admin/finance', name: 'Finance', icon: <DollarSignIcon /> },
    { path: '/admin/reports', name: 'Reports', icon: <ChartBarIcon /> },
    { path: '/admin/profile', name: 'Profile', icon: <UserIcon /> },
];

const AdminLayout: React.FC = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const currentNavItem = adminNavItems.find(item => location.pathname.startsWith(item.path));
    const pageTitle = currentNavItem ? currentNavItem.name : "Admin";

    return (
        <div className="flex bg-base-200 min-h-screen">
            <Sidebar 
                navItems={adminNavItems}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <main className="flex-1 md:ml-64">
                <Header title={pageTitle} onMenuClick={() => setIsSidebarOpen(true)} />
                <div className="p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
