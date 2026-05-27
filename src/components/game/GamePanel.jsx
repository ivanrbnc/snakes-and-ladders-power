import { Dice5, Zap } from 'lucide-react';

const GamePanel = ({ roomData, myPlayerId, rollDice, isRolling, copyRoomLink, hideRollButton, hideCopyLink, isMobile = false }) => {
    return (
        <>
            <div className={isMobile ? '' : 'info-panel glass-panel'}>
                <h3 style={{ marginBottom: isMobile ? '8px' : '15px', fontSize: '1.2rem' }}>Players in the room</h3>
                {roomData?.players.map(p => {
                    const isActive = roomData.players[roomData.turn]?.id === p.id;
                    const cardCount = (p.powerCards || []).length;
                    const isProtected = p.protected;
                    const isFrozen = p.skippingTurn;
                    const isLucky = !!p.nextRollGuaranteed;
                    return (
                        <div key={p.id} className="player-info" style={{ opacity: isActive ? 1 : 0.6 }}>
                            <div className="color-dot" style={{ backgroundColor: p.color }} />
                            <span style={{ fontWeight: isActive ? 'bold' : 'normal', display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                                {p.avatar ? (
                                    p.avatar.startsWith('data:image') ? (
                                        <img src={p.avatar} alt="avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <span>{p.avatar}</span>
                                    )
                                ) : null}
                                <span>{p.name} {p.id === myPlayerId ? "(You)" : ""}</span>
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto', flexShrink: 0 }}>
                                {isFrozen && <span title="Frozen" style={{ fontSize: '0.75rem' }}>❄️</span>}
                                {isProtected && <span title="Shielded" style={{ fontSize: '0.75rem' }}>🛡️</span>}
                                {isLucky && <span title="Lucky next roll" style={{ fontSize: '0.75rem' }}>🎲</span>}
                                {cardCount > 0 && (
                                    <span style={{
                                        display: 'flex', alignItems: 'center', gap: '2px',
                                        fontSize: '0.7rem', color: '#ffb703', fontWeight: 700,
                                    }}>
                                        <Zap size={11} fill="#ffb703" color="#ffb703" />
                                        {cardCount}
                                    </span>
                                )}
                            </span>
                        </div>
                    );
                })}

                {roomData?.players.length < (roomData?.maxPlayers || 2)
                    ? <p style={{ marginTop: isMobile ? '8px' : '15px', fontSize: isMobile ? '0.78rem' : '0.9rem', color: 'var(--primary)', fontStyle: 'italic', fontWeight: 600 }}>Waiting for players... ⏳</p>
                    : <div className="turn-indicator" style={{ marginTop: isMobile ? '8px' : '15px', fontSize: isMobile ? '0.8rem' : undefined }}>
                        {roomData.players[roomData.turn]?.id === myPlayerId
                            ? "It's Your Turn! 🎲"
                            : `Waiting for ${roomData.players[roomData.turn]?.name || "..."}`}
                    </div>
                }

                {!hideCopyLink && (
                    <button
                        className="btn love-btn"
                        onClick={copyRoomLink}
                        style={{
                            marginTop: isMobile ? '12px' : '20px',
                            background: 'transparent',
                            color: 'var(--primary)',
                            border: '1.5px solid var(--primary)',
                            fontSize: isMobile ? '0.78rem' : '0.9rem',
                            padding: isMobile ? '6px 14px' : '10px',
                            width: isMobile ? 'fit-content' : undefined,
                        }}
                    >
                        Copy Invitation Link
                    </button>
                )}
            </div >

            {!hideRollButton && (
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
            )}
        </>
    );
};

export default GamePanel;
