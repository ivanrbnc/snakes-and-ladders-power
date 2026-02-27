import React from 'react';
import { User, Dice5 } from 'lucide-react';
import { motion } from 'framer-motion';

const GamePanel = ({ roomData, roomId, myPlayerId, rollDice, isRolling, copyRoomLink }) => {
    return (
        <>
            <div className="info-panel glass-panel">
                <h3 style={{ marginBottom: '15px' }}>Players in the room</h3>
                {roomData?.players.map(p => (
                    <div key={p.id} className="player-info" style={{ opacity: roomData.players[roomData.turn]?.id === p.id ? 1 : 0.6 }}>
                        <div className="color-dot" style={{ backgroundColor: p.color }} />
                        <span style={{ fontWeight: roomData.players[roomData.turn]?.id === p.id ? 'bold' : 'normal', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {p.avatar ? (
                                p.avatar.startsWith('data:image') ? (
                                    <img src={p.avatar} alt="avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    <span>{p.avatar}</span>
                                )
                            ) : null}
                            <span>{p.name} {p.id === myPlayerId ? "(You)" : ""}</span>
                        </span>
                    </div>
                ))}

                <div className="turn-indicator" style={{ marginTop: '15px' }}>
                    {roomData?.players.length < (roomData?.maxPlayers || 2)
                        ? <span style={{ fontSize: '0.94rem', opacity: 0.8, fontWeight: 'normal' }}>Waiting for players... ⏳</span>
                        : roomData.players[roomData.turn]?.id === myPlayerId
                            ? "It's Your Turn! 🎲"
                            : `Waiting for ${roomData.players[roomData.turn]?.name || "..."}`}
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
            </div >

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
