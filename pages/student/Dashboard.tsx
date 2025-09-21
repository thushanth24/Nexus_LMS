
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import * as api from '../../services/api';
import { Session, Homework } from '../../types';
import { ClockIcon } from '../../components/ui/Icons';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
    const [homework, setHomework] = useState({ pending: 0, overdue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const [sessionsData, homeworkData] = await Promise.all([
                    api.getMySessions(),
                    api.getMyHomework()
                ]);

                setUpcomingSessions(sessionsData);
                const pendingCount = (homeworkData as (Homework & { submissions: any[] })[])
                    .filter(hw => !hw.submissions || hw.submissions.length === 0 || hw.submissions[0].status === 'PENDING').length;
                setHomework({ pending: pendingCount, overdue: 0 });

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (!user) return null;

    const progress = {
        trend: [
            { name: 'W1', score: 0.55 }, { name: 'W2', score: 0.58 }, { name: 'W3', score: 0.63 },
            { name: 'W4', score: 0.66 }, { name: 'W5', score: 0.72 }, { name: 'W6', score: 0.71 },
        ],
        radar: [
            { subject: 'Comprehension', A: 60, fullMark: 100 },
            { subject: 'Accuracy', A: 80, fullMark: 100 },
            { subject: 'Fluency', A: 60, fullMark: 100 },
            { subject: 'Content', A: 75, fullMark: 100 },
            { subject: 'Vocabulary', A: 85, fullMark: 100 },
        ],
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card title="Next Session">
                    {loading ? <p className="text-text-secondary text-center py-4">Loading session...</p>
                    : upcomingSessions.length > 0 ? (
                        <div className="p-4 bg-primary/10 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="font-bold text-xl text-primary">{upcomingSessions[0].title}</p>
                                <p className="text-md text-text-secondary flex items-center mt-1">
                                    <ClockIcon className="w-5 h-5 mr-2" />
                                    {formatDate(upcomingSessions[0].startsAt)}
                                </p>
                            </div>
                            <Link to={`/student/session/${upcomingSessions[0].id}`} className="px-6 py-3 bg-gradient-to-r from-primary to-blue-400 text-white font-bold rounded-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg">
                                Join Now
                            </Link>
                        </div>
                    ) : (
                        <p className="text-text-secondary text-center py-4">No upcoming sessions. Great job staying on top of your work!</p>
                    )}
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card title="Progress Trend">
                         <div style={{ width: '100%', height: 200 }}>
                            <ResponsiveContainer>
                                <LineChart data={progress.trend} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                    <XAxis dataKey="name" tick={{ fill: '#718096' }}/>
                                    <YAxis domain={[0.5, 1]} tick={{ fill: '#718096' }}/>
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '10px' }} />
                                    <Line type="monotone" dataKey="score" stroke="#2F80ED" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }}/>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                     <Card title="Skill Radar">
                         <div style={{ width: '100%', height: 200 }}>
                            <ResponsiveContainer>
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={progress.radar}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#2D3748', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#718096', fontSize: 10 }} />
                                    <Radar name="Skills" dataKey="A" stroke="#27AE60" fill="#27AE60" fillOpacity={0.6} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            </div>
            <div className="space-y-8">
                 <Card title="Homework Status">
                    <div className="space-y-4">
                        <div className="p-4 bg-warning/10 rounded-xl text-center">
                            <p className="text-sm text-yellow-700 font-semibold">Pending</p>
                            <p className="text-5xl font-extrabold text-warning">{loading ? '...' : homework.pending}</p>
                        </div>
                         <div className="p-4 bg-error/10 rounded-xl text-center">
                            <p className="text-sm text-red-700 font-semibold">Overdue</p>
                            <p className="text-5xl font-extrabold text-error">{loading ? '...' : homework.overdue}</p>
                        </div>
                        <Link to="/student/homework" className="mt-4 w-full block text-center px-6 py-3 bg-gradient-to-r from-secondary to-green-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-px transition-all duration-200">
                            View Homework
                        </Link>
                    </div>
                </Card>
                 <Card title="Upcoming Sessions">
                    {loading ? <p className="text-text-secondary p-4">Loading...</p> : (
                        <div className="space-y-3">
                            {upcomingSessions.map(session => (
                                <div key={session.id} className="p-3 bg-base-200/60 rounded-lg">
                                    <p className="font-semibold text-neutral">{session.title}</p>
                                    <p className="text-sm text-text-secondary">{formatDate(session.startsAt)}</p>
                                </div>
                            ))}
                            <Link to="/student/schedule" className="mt-2 text-sm text-primary hover:underline font-medium block text-center">
                                View full schedule
                            </Link>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default StudentDashboard;