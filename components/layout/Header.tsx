
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { MenuIcon } from '../ui/Icons';

interface HeaderProps {
    title: string;
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <header className="bg-base-100 shadow-md sticky top-0 z-10 border-b border-slate-200/75">
            <div className="px-4 sm:px-8 h-20 flex items-center justify-between">
                <div className="flex items-center">
                    <button 
                        onClick={onMenuClick} 
                        className="md:hidden mr-4 text-neutral hover:text-primary transition-colors"
                        aria-label="Open navigation menu"
                    >
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral tracking-tight">{title}</h2>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="font-semibold text-neutral">{user.name}</p>
                        <p className="text-sm text-text-secondary capitalize">{user.role.toLowerCase()}</p>
                    </div>
                    <Link to={`/${user.role.toLowerCase()}/profile`} className="group">
                        <img 
                          src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=2F80ED&color=fff`} 
                          alt="User Avatar" 
                          className="w-12 h-12 rounded-full object-cover transition-all duration-200 group-hover:ring-4 group-hover:ring-primary/40 group-hover:scale-110"
                        />
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
