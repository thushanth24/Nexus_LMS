
import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import * as api from '../../services/api';
import { ChessPreset } from '../../types';

const TeacherChessLibrary: React.FC = () => {
    const [presets, setPresets] = useState<ChessPreset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPresets = async () => {
            try {
                setLoading(true);
                const data = await api.getChessPresets();
                setPresets(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || "Failed to fetch chess presets");
            } finally {
                setLoading(false);
            }
        };
        fetchPresets();
    }, []);

    return (
        <Card title="Chess Library">
            <p className="mb-4">Manage your FEN/PGN presets.</p>
            {loading && <p>Loading presets...</p>}
            {error && <p className="text-error">Error: {error}</p>}
            {!loading && !error && (
                <div className="space-y-3">
                    {presets.map(p => (
                        <div key={p.id} className="p-3 bg-base-200/50 rounded-lg">
                            <p className="font-bold">{p.label}</p>
                            <code className="text-sm text-text-secondary break-all">{p.fen || p.pgn}</code>
                        </div>
                    ))}
                    {presets.length === 0 && <p className="text-text-secondary">No presets found.</p>}
                </div>
            )}
        </Card>
    );
};

export default TeacherChessLibrary;