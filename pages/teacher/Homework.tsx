import React from 'react';
import Card from '../../components/ui/Card';
import homework from '../../data/homework.js';
import submissions from '../../data/submissions.js';

const TeacherHomework: React.FC = () => {
    const pendingSubmissions = submissions.filter(s => s.status === 'SUBMITTED');
    return (
        <Card title="Homework Management">
            <h3 className="text-xl font-bold mb-2">Assigned Homework</h3>
            {homework.map(hw => <div key={hw.id} className="p-3 bg-base-200/50 rounded my-2">{hw.title}</div>)}
            <h3 className="text-xl font-bold mb-2 mt-6">Pending Reviews ({pendingSubmissions.length})</h3>
            {pendingSubmissions.map(sub => <div key={sub.submissionId} className="p-3 bg-warning/10 rounded my-2 flex justify-between items-center"><span>Submission for homework: <strong>{homework.find(h=>h.id === sub.homeworkId)?.title}</strong></span> <button className="text-primary font-semibold">Grade</button></div>)}
        </Card>
    );
};

export default TeacherHomework;
