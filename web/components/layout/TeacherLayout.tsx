

import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar, { NavItem } from './Sidebar';
import Header from './Header';
import { DashboardIcon, CalendarIcon, BookOpenIcon, UsersIcon, ChessIcon, UserIcon } from '../ui/Icons';

const teacherNavItems: NavItem[] = [
    { path: '/teacher/dashboard', name: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/teacher/schedule', name: 'Schedule', icon: <CalendarIcon /> },
    { path: '/teacher/classes', name: 'Classes', icon: <BookOpenIcon /> },
    { path: '/teacher/homework', name: 'Homework', icon: <BookOpenIcon /> },
    { path: '/teacher/students', name: 'Students', icon: <UsersIcon /> },
    { path: '/teacher/chess-library', name: 'Chess Library', icon: <ChessIcon /> },
    { path: '/teacher/profile', name: 'Profile', icon: <UserIcon /> },
];

const TeacherLayout: React.FC = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pageTitle = teacherNavItems.find(item => location.pathname.startsWith(item.path))?.name || "Teacher";

    return (
        <div className="flex bg-base-200 min-h-screen">
            <Sidebar 
                navItems={teacherNavItems}
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

export default TeacherLayout;
