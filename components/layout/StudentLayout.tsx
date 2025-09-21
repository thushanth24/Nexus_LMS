

import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar, { NavItem } from './Sidebar';
import Header from './Header';
import { DashboardIcon, CalendarIcon, BookOpenIcon, ChartBarIcon, UserIcon } from '../ui/Icons';

const studentNavItems: NavItem[] = [
    { path: '/student/dashboard', name: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/student/schedule', name: 'Schedule', icon: <CalendarIcon /> },
    { path: '/student/classes', name: 'Classes', icon: <BookOpenIcon /> },
    { path: '/student/homework', name: 'Homework', icon: <BookOpenIcon /> },
    { path: '/student/progress', name: 'Progress', icon: <ChartBarIcon /> },
    { path: '/student/profile', name: 'Profile', icon: <UserIcon /> },
];

const StudentLayout: React.FC = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pageTitle = studentNavItems.find(item => location.pathname.startsWith(item.path))?.name || "Student";
    
    return (
        <div className="flex bg-base-200 min-h-screen">
            <Sidebar 
                navItems={studentNavItems}
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

export default StudentLayout;
