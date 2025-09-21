
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import schedule from '../../data/schedule.js';

const ChessBoard = () => {
  const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const board = fen.split(' ')[0].split('/');
  const boardSize = 8;

  const pieceUnicode: { [key: string]: string } = {
    'p': '♟︎', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
    'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔',
  };

  const renderBoard = () => {
    let squares = [];
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
              <span className="text-black" style={{textShadow: '0 0 2px white, 0 0 2px white'}}>{pieceUnicode[piece]}</span>
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
    <div className="w-full max-w-[512px] aspect-square grid grid-cols-8 grid-rows-8 shadow-2xl rounded-lg overflow-hidden border-4 border-slate-700">{renderBoard()}</div>
  );
};

const TeacherSession: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [activeTab, setActiveTab] = useState('Meeting');

    const session = schedule.find(s => s.id === sessionId);

    if (!session) {
        return <Card>Session not found.</Card>;
    }

    const tabs = ['Meeting', 'Chat', 'Attendance'];
    if (session.isChessEnabled) {
        tabs.splice(1, 0, 'Chessboard');
    }

    const tabClasses = (tabName: string) => 
        `px-4 sm:px-6 py-3 font-semibold rounded-t-lg cursor-pointer transition-colors duration-200 text-sm sm:text-base whitespace-nowrap ${
            activeTab === tabName ? 'bg-base-100 text-primary border-b-2 border-primary -mb-px' : 'bg-transparent text-text-secondary hover:text-primary'
        }`;

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{session.title}</h2>
                <p className="text-text-secondary">Live Session</p>
            </Card>

            <div>
                <div className="border-b border-slate-300 flex space-x-0 sm:space-x-2 overflow-x-auto">
                    {tabs.map(tab => (
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
                    {activeTab === 'Chessboard' && (
                         <div className="flex flex-col items-center p-2 sm:p-4">
                            <ChessBoard />
                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                                <button className="px-4 py-2 bg-gradient-to-r from-primary to-blue-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-px transition-all">Start/Stop Clock</button>
                                <button className="px-4 py-2 bg-gradient-to-r from-secondary to-green-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-px transition-all">Grant/Revoke Control</button>
                                <button className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-accent text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-px transition-all">Load FEN/PGN</button>
                                <button className="px-4 py-2 bg-neutral text-white font-semibold rounded-lg hover:bg-neutral/90 transition">Freeze/Unfreeze</button>
                                <button className="px-4 py-2 bg-error text-white font-semibold rounded-lg hover:bg-error/90 transition">Reset Board</button>
                            </div>
                         </div>
                    )}
                    {activeTab === 'Chat' && <div>Chat Panel Content</div>}
                    {activeTab === 'Attendance' && <div>Attendance Panel Content</div>}
                </Card>
            </div>
        </div>
    );
};

export default TeacherSession;