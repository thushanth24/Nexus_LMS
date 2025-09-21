import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        return <Card>Loading user profile...</Card>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                    <img
                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=2F80ED&color=fff&size=128`}
                        alt="Profile Avatar"
                        className="w-32 h-32 rounded-full object-cover shadow-lg"
                    />
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-neutral">{user.name}</h2>
                        <p className="text-lg text-primary capitalize">{user.role.toLowerCase()}</p>
                        <p className="text-md text-text-secondary mt-2">{user.email}</p>
                    </div>
                </div>

                <div className="mt-8 border-t pt-6">
                    <h3 className="text-xl font-semibold mb-4 text-neutral">Profile Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-base-200/50 p-4 rounded-lg">
                            <label className="text-sm font-medium text-text-secondary">Full Name</label>
                            <p className="text-lg font-semibold text-neutral">{user.name}</p>
                        </div>
                        <div className="bg-base-200/50 p-4 rounded-lg">
                            <label className="text-sm font-medium text-text-secondary">Email Address</label>
                            <p className="text-lg font-semibold text-neutral">{user.email}</p>
                        </div>
                        <div className="bg-base-200/50 p-4 rounded-lg">
                            <label className="text-sm font-medium text-text-secondary">Timezone</label>
                            <p className="text-lg font-semibold text-neutral">{user.timezone}</p>
                        </div>
                        {user.subjects && (
                             <div className="bg-base-200/50 p-4 rounded-lg">
                                <label className="text-sm font-medium text-text-secondary">Subjects</label>
                                <p className="text-lg font-semibold text-neutral">{user.subjects.join(', ')}</p>
                            </div>
                        )}
                         {user.level && (
                             <div className="bg-base-200/50 p-4 rounded-lg">
                                <label className="text-sm font-medium text-text-secondary">Level</label>
                                <p className="text-lg font-semibold text-neutral">{user.level}</p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ProfilePage;