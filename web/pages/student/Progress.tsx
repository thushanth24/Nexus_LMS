import React from 'react';
import Card from '../../components/ui/Card';
// FIX: Imported CartesianGrid to be used in the LineChart component.
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const StudentProgress: React.FC = () => {
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
    return (
        <div className="space-y-8">
            <Card title="Overall Progress Trend">
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart data={progress.trend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="name" tick={{ fill: '#718096' }}/>
                            <YAxis domain={[0.5, 1]} tick={{ fill: '#718096' }}/>
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '10px' }} />
                            <Line type="monotone" dataKey="score" stroke="#2F80ED" strokeWidth={3} dot={{ r: 5, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8, stroke: '#2F80ED', fill: '#fff' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Skills Radar">
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={progress.radar}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#2D3748', fontSize: 14 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#718096', fontSize: 10 }}/>
                                <Radar name="Skills" dataKey="A" stroke="#27AE60" fill="#27AE60" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card title="Recent Feedback">
                    <div className="p-4 bg-base-200/60 rounded-xl">
                        <p className="font-semibold text-neutral">From Ms. Karina</p>
                        <p className="mt-1 text-text-secondary">"Good improvements this week on your essay structure. Keep focusing on using varied vocabulary."</p>
                    </div>
                     <div className="p-4 bg-base-200/60 rounded-xl mt-4">
                        <p className="font-semibold text-neutral">From Mr. Deen</p>
                        <p className="mt-1 text-text-secondary">"Excellent tactical awareness in the last game. Your understanding of pawn structures is getting better."</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default StudentProgress;