

import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import * as api from '../../services/api';
import { UserRole, Group, OneToOne, Session } from '../../types';

type EnrolledClass = (Group | OneToOne) & { teacherName: string };

const StudentClasses: React.FC = () => {
    const { user } = useAuth();
    const [enrolledClasses, setEnrolledClasses] = useState<EnrolledClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClasses = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const [mySessions, allGroups, allTeachers] = await Promise.all([
                    api.getMySessions(),
                    api.getGroups(),
                    api.getTeachers(),
                ]);

                const enrolledClassIds = new Set<string>();
                mySessions.forEach((s: Session) => enrolledClassIds.add(s.classId));

                const teacherMap = new Map(allTeachers.map((t: any) => [t.id, t.name]));
                
                const myEnrolledClasses = allGroups
                    .filter((c: Group) => enrolledClassIds.has(c.id))
                    .map((c: Group) => ({
                        ...c,
                        teacherName: teacherMap.get(c.teacherId) || 'N/A'
                    }));

                setEnrolledClasses(myEnrolledClasses);
                setError(null);
            } catch (err: any) {
                setError(err.message || "Failed to fetch classes");
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, [user]);

    return (
        <Card title="My Classes">
            {loading && <p className="text-center py-12">Loading your classes...</p>}
            {error && <p className="text-center text-error py-12">Error: {error}</p>}
            {!loading && !error && (
                enrolledClasses.length === 0 ? (
                    <p className="text-center text-gray-500 py-12">You are not currently enrolled in any classes.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrolledClasses.map(c => (
                            <Card key={c.id} className="flex flex-col shadow-lg border border-base-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                                <h4 className="font-bold text-lg text-primary">{c.title}</h4>
                                <p className="text-sm text-gray-500 mb-2">{c.subject}</p>
                                
                                <div className="my-4 text-sm bg-base-200/30 p-3 rounded-md">
                                    <p><strong>Teacher:</strong> {c.teacherName}</p>
                                </div>
                                
                                <div className="flex-grow"></div>
                                <div className="mt-auto pt-2 border-t text-right">
                                    <Link to={`/student/classes/${c.id}`} className="text-primary hover:underline font-semibold">
                                        View Class &rarr;
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                )
            )}
        </Card>
    );
};

export default StudentClasses;