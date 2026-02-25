import React from 'react';
import { User, Dice5 } from 'lucide-react';
import { motion } from 'framer-motion';

const GamePanel = ({ roomData, roomId, myPlayerId, rollDice, isRolling, copyRoomLink, setDebugRoll }) => {
    return (
        <>
            <div className="info-panel glass-panel">
                <h3 style={{ marginBottom: '15px' }}>Players Online</h3>
                {roomData?.players.map(p => (
                    <div key={p.id} className="player-info" style={{ opacity: roomData.players[roomData.turn]?.id === p.id ? 1 : 0.6 }}>
                        <div className="color-dot" style={{ backgroundColor: p.color }} />
                        <span style={{ fontWeight: roomData.players[roomData.turn]?.id === p.id ? 'bold' : 'normal' }}>
                            {p.name} {p.id === myPlayerId ? "(You)" : ""}
                        </span>
                    </div>
                ))}
                <div className="turn-indicator">
                    {roomData?.players && roomData.players[roomData.turn]?.id === myPlayerId ? "It's Your Turn! 🎲" : `Waiting for ${roomData?.players && (roomData.players[roomData.turn]?.name || '...')}`}
                </div>

                <button
                    className="btn love-btn"
                    onClick={copyRoomLink}
                    style={{
                        marginTop: '20px',
                        background: 'rgba(255, 77, 109, 0.1)',
                        color: '#ff4d6d',
                        fontSize: '0.9rem',
                        padding: '10px'
                    }}
                >
                    Copy Invitation Link
                </button>

                {/* Debug Tools */}
                <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '8px' }}>Dev: Force Next Roll</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' }}>
                        {[1, 2, 3, 4, 5, 6].map(num => (
                            <button
                                key={num}
                                onClick={() => setDebugRoll(num)}
                                style={{
                                    padding: '5px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    background: 'white',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Roll {num}
                            </button>
                        ))}
                    </div>
                </div>


            </div>

            <div className="controls">
                <div className="dice-container">
                    <button
                        className="btn"
                        onClick={rollDice}
                        disabled={roomData?.players.length < (roomData?.maxPlayers || 2) || roomData?.players[roomData.turn]?.id !== myPlayerId || isRolling}
                    >
                        <Dice5 size={20} style={{ marginRight: '8px' }} />
                        {roomData?.players.length < (roomData?.maxPlayers || 2) ? `Waiting for players (${roomData?.players.length}/${roomData?.maxPlayers})...` : "Roll Dice"}
                    </button>
                </div>
            </div>
        </>
    );
};

export default GamePanel;
