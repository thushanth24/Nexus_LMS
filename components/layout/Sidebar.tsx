
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogoutIcon } from '../ui/Icons';

export interface NavItem {
    path: string;
    name: string;
    icon: JSX.Element;
}

interface SidebarProps {
    navItems: NavItem[];
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, isOpen, onClose }) => {
    const { logout } = useAuth();
    
    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `flex items-center px-4 py-3 text-lg font-medium rounded-lg transition-all duration-200 group ${
            isActive
                ? 'bg-gradient-to-r from-primary to-blue-400 text-white shadow-lg'
                : 'text-text-secondary hover:bg-primary/10 hover:text-primary transform hover:translate-x-1'
        }`;

    return (
        <>
            {/* Backdrop for mobile */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <aside className={`w-64 bg-base-100 flex flex-col h-screen fixed shadow-2xl z-30 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-center h-20 border-b border-slate-200/75">
                    <h1 className="text-3xl font-extrabold text-primary">Nexus</h1>
                </div>
                <nav className="flex-grow p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={navLinkClasses}
                            onClick={onClose} // Close sidebar on navigation
                        >
                            {React.cloneElement(item.icon, { className: 'w-6 h-6 mr-4 transition-transform group-hover:scale-110' })}
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-200/75">
                     <button
                        onClick={() => {
                            logout();
                            onClose();
                        }}
                        className="flex items-center w-full px-4 py-3 text-lg font-medium text-text-secondary rounded-lg hover:bg-error/10 hover:text-error transition-all duration-200 group transform hover:translate-x-1"
                    >
                        <LogoutIcon className="w-6 h-6 mr-4 transition-transform group-hover:scale-110" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
