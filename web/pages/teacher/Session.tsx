import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import * as api from '../../services/api';
import { Session, User } from '../../types';

const ChessBoard = () => {
  const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const board = fen.split(' ')[0].split('/');
  const boardSize = 8;

  const pieceUnicode: { [key: string]: string } = {
    'p': '?', 'r': '?', 'n': '?', 'b': '?', 'q': '?', 'k': '?',
    'P': '?', 'R': '?', 'N': '?', 'B': '?', 'Q': '?', 'K': '?',
  };

  const renderBoard = () => {
    const squares: React.ReactNode[] = [];
    for (let i = 0; i < boardSize; i++) {
      let row = board[i];
      let colIdx = 0;
      for (let j = 0; j < row.length; j++) {
        const piece = row[j];
        if (isNaN(parseInt(piece))) {
          const isLightSquare = (i + colIdx) % 2 === 0;
          squares.push(
            <div
              key={`${i}-${colIdx}`}
              className={`w-full h-full flex items-center justify-center text-[7vmin] sm:text-4xl ${isLightSquare ? 'bg-[#f0d9b5]' : 'bg-[#b58863]'}`}
            >
              <span className="text-black" style={{ textShadow: '0 0 2px white, 0 0 2px white' }}>{pieceUnicode[piece]}</span>
            </div>
          );
          colIdx++;
        } else {
          for (let k = 0; k < parseInt(piece); k++) {
            const isLightSquare = (i + colIdx) % 2 === 0;
            squares.push(
              <div
                key={`${i}-${colIdx}`}
                className={`w-full h-full ${isLightSquare ? 'bg-[#f0d9b5]' : 'bg-[#b58863]'}`}
              />
            );
            colIdx++;
          }
        }
      }
    }
    return squares;
  };

  return (
    <div className="w-full max-w-[512px] aspect-square grid grid-cols-8 grid-rows-8 shadow-2xl rounded-lg overflow-hidden border-4 border-slate-700">
      {renderBoard()}
    </div>
  );
};

const TeacherSession: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [session, setSession] = useState<Session | null>(null);
    const [attendees, setAttendees] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'Meeting' | 'Chat' | 'Attendance' | 'Chessboard'>('Meeting');

    useEffect(() => {
        const fetchSession = async () => {
            if (!sessionId) return;
            try {
                setLoading(true);
                const fetchedSession = await api.getSessionById(sessionId);
                setSession(fetchedSession);
                setAttendees(fetchedSession.attendeesDetails ?? []);
                setError(null);
                if (fetchedSession.isChessEnabled) {
                    setActiveTab('Chessboard');
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load session');
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, [sessionId]);

    if (loading) {
        return <Card>Loading session...</Card>;
    }

    if (error) {
        return <Card className="text-error">{error}</Card>;
    }

    if (!session) {
        return <Card>Session not found.</Card>;
    }

    const tabs: ('Meeting' | 'Chat' | 'Attendance' | 'Chessboard')[] = session.isChessEnabled
        ? ['Meeting', 'Chessboard', 'Chat', 'Attendance']
        : ['Meeting', 'Chat', 'Attendance'];

    const tabClasses = (tabName: typeof tabs[number]) =>
        `px-4 sm:px-6 py-3 font-semibold rounded-t-lg cursor-pointer transition-colors duration-200 text-sm sm:text-base whitespace-nowrap ${
            activeTab === tabName ? 'bg-base-100 text-primary border-b-2 border-primary -mb-px' : 'bg-transparent text-text-secondary hover:text-primary'
        }`;

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{session.title}</h2>
                <p className="text-text-secondary">{session.classTitle || 'Live Session'}</p>
                <p className="text-sm text-text-secondary mt-2">
                    Starts at: {new Date(session.startsAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
            </Card>

            <div>
                <div className="border-b border-slate-300 flex space-x-0 sm:space-x-2 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={tabClasses(tab)}>
                            {tab}
                        </button>
                    ))}
                </div>
                <Card className="rounded-t-none">
                    {activeTab === 'Meeting' && (
                        <div className="bg-neutral text-white aspect-video rounded-lg flex items-center justify-center">
                            <h3 className="text-lg sm:text-2xl">LiveKit Video Embed Area</h3>
                        </div>
                    )}
                    {activeTab === 'Chessboard' && session.isChessEnabled && (
                        <div className="flex flex-col items-center p-2 sm:p-4">
                            <ChessBoard />
                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                                <button className="px-4 py-2 bg-gradient-to-r from-primary to-blue-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-px transition-all">
                                    Start/Stop Clock
                                </button>
                                <button className="px-4 py-2 bg-gradient-to-r from-secondary to-green-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-px transition-all">
                                    Grant/Revoke Control
                                </button>
                                <button className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-accent text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-px transition-all">
                                    Load FEN/PGN
                                </button>
                                <button className="px-4 py-2 bg-neutral text-white font-semibold rounded-lg hover:bg-neutral/90 transition">
                                    Freeze/Unfreeze
                                </button>
                                <button className="px-4 py-2 bg-error text-white font-semibold rounded-lg hover:bg-error/90 transition">
                                    Reset Board
                                </button>
                            </div>
                        </div>
                    )}
                    {activeTab === 'Chat' && <div>Chat panel coming soon.</div>}
                    {activeTab === 'Attendance' && (
                        <div className="space-y-2">
                            {attendees.length === 0 ? (
                                <p className="text-text-secondary">No attendees registered.</p>
                            ) : (
                                attendees.map((attendee) => (
                                    <div
                                        key={attendee.id}
                                        className="flex items-center justify-between p-3 bg-base-200/60 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={attendee.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(attendee.name)}`}
                                                alt={attendee.name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <div>
                                                <p className="font-semibold text-neutral">{attendee.name}</p>
                                                <p className="text-sm text-text-secondary">{attendee.email}</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 text-xs font-semibold rounded-md bg-primary/10 text-primary">
                                            {attendee.role}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default TeacherSession;
