
import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import * as api from '../../services/api';
import { User, UserRole } from '../../types';

// A simple component to visualize progress trend
const ProgressTrend: React.FC<{ trend: number[] }> = ({ trend }) => (
    <div className="flex items-end space-x-1 h-8">
        {trend.map((value, index) => (
            <div key={index} className="w-3 rounded-sm bg-primary" style={{ height: `${Math.max(10, value * 100)}%` }} title={`Week ${index+1}: ${Math.round(value*100)}%`}></div>
        ))}
    </div>
);

const TeacherStudents: React.FC = () => {
    const { user } = useAuth();
    const [assignedStudents, setAssignedStudents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStudents = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const [allStudents, mySessions, myGroups] = await Promise.all([
                    api.getStudents(),
                    api.getMySessions(),
                    api.getGroups(),
                ]);

                const myClassIds = new Set(myGroups.filter((g: any) => g.teacherId === user.id).map((g: any) => g.id));
                const studentIds = new Set<string>();

                mySessions.forEach((session: any) => {
                    if (myClassIds.has(session.classId)) {
                        session.attendees.forEach((id: string) => studentIds.add(id));
                    }
                });

                setAssignedStudents(allStudents.filter((s: User) => studentIds.has(s.id)));
                setError(null);
            } catch (err: any) {
                setError(err.message || "Failed to fetch students");
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [user]);

    // Dummy progress data
    const studentProgress: { [key: string]: number[] } = {
        's_10': [0.6, 0.7, 0.72, 0.8, 0.78],
        's_11': [0.5, 0.55, 0.52, 0.6, 0.65],
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold tracking-tight text-neutral">My Students</h2>
            </div>
            <div className="overflow-x-auto">
                {loading && <p>Loading students...</p>}
                {error && <p className="text-error">Error: {error}</p>}
                {!loading && !error && (
                    <table className="w-full text-left min-w-[720px]">
                        <thead>
                            <tr className="border-b-2 border-slate-200">
                                <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-left">Name</th>
                                <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-left">Level</th>
                                <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-left">Progress</th>
                                <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignedStudents.map(student => (
                                <tr key={student.id} className="border-b border-slate-200/75 hover:bg-base-200/60">
                                    <td className="p-4 flex items-center">
                                        <img src={student.avatarUrl || `https://ui-avatars.com/api/?name=${student.name.replace(' ', '+')}`} alt={student.name} className="w-10 h-10 rounded-full mr-4 object-cover" />
                                        <div>
                                            <p className="font-bold text-neutral">{student.name}</p>
                                            <p className="text-sm text-text-secondary">{student.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">{student.level}</td>
                                    <td className="p-4">
                                        <ProgressTrend trend={studentProgress[student.id] || [0.5, 0.5, 0.5, 0.5, 0.5]} />
                                    </td>
                                    <td className="p-4">
                                        <button className="text-primary hover:underline font-semibold">View Progress</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </Card>
    );
};

export default TeacherStudents;