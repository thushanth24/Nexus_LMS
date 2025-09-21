
import React from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import schedule from '../../data/schedule.js';

// A simplified, view-only chessboard for students.
const ChessBoardDisplay = () => {
    const fen = "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 4"; // Italian Game opening
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
                        <div key={`${i}-${colIdx}`} className={`w-full h-full flex items-center justify-center text-[7vmin] sm:text-3xl md:text-4xl ${isLightSquare ? 'bg-[#f0d9b5]' : 'bg-[#b58863]'}`}>
                            <span className="text-black" style={{ textShadow: '0 0 2px white' }}>{pieceUnicode[piece]}</span>
                        </div>
                    );
                    colIdx++;
                } else {
                    for (let k = 0; k < parseInt(piece); k++) {
                        const isLightSquare = (i + colIdx) % 2 === 0;
                        squares.push(<div key={`${i}-${colIdx}`} className={`w-full h-full ${isLightSquare ? 'bg-[#f0d9b5]' : 'bg-[#b58863]'}`} />);
                        colIdx++;
                    }
                }
            }
        }
        return squares;
    };

    return (
        <div className="w-full max-w-[512px] aspect-square grid grid-cols-8 grid-rows-8 shadow-2xl border-4 border-[#3a3a3a] mx-auto">
            {renderBoard()}
        </div>
    );
};

const StudentSession: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const session = schedule.find(s => s.id === sessionId);

    if (!session) {
        return <Card>Session not found.</Card>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card title="Live Meeting">
                    <div className="bg-neutral text-white aspect-video rounded-lg flex items-center justify-center">
                        <h3 className="text-lg sm:text-2xl">LiveKit Video Area</h3>
                    </div>
                </Card>
            </div>
            <div className="space-y-6">
                <Card title="Session Info">
                    <h3 className="text-2xl font-bold">{session.title}</h3>
                    <p className="text-text-secondary">Role: Student/Spectator</p>
                </Card>
                {session.isChessEnabled && (
                    <Card title="Chessboard">
                        <p className="text-sm text-center text-text-secondary mb-4">The board will update as the teacher demonstrates.</p>
                        <ChessBoardDisplay />
                    </Card>
                )}
            </div>
        </div>
    );
};

export default StudentSession;
