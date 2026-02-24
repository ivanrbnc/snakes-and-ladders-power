import React from 'react';
import { motion } from 'framer-motion';
import { User, Heart, Lock } from 'lucide-react';

const Lobby = ({
    roomStatus,
    playerName,
    setPlayerName,
    maxPlayersInput,
    setMaxPlayersInput,
    passwordInput,
    setPasswordInput,
    enteredPassword,
    setEnteredPassword,
    roomId,
    setRoomId,
    setRoomStatus,
    joinRoom,
    showPasswordPrompt
}) => {
    return (
        <div className="setup-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '20px' }}>
            <h1 className="title" style={{ fontSize: '3.5rem' }}>Snakes & Ladders</h1>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    joinRoom();
                }}
                className="glass-panel"
                style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '25px', width: '400px', position: 'relative' }}
            >
                {roomStatus.exists && roomStatus.count >= roomStatus.maxPlayers ? (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '1.2rem', color: '#ff4d6d', fontWeight: 'bold', marginBottom: '10px' }}>The room is full.</p>
                        <p style={{ color: '#666' }}>({roomStatus.count}/{roomStatus.maxPlayers} players already playing)</p>
                        <button type="button" className="btn" style={{ marginTop: '20px' }} onClick={() => window.location.href = window.location.origin}>Try another room</button>
                    </div>
                ) : (
                    <>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ color: '#ff4d6d', fontSize: '1.5rem', marginBottom: '5px' }}>
                                {!roomStatus.exists ? "Host a New Journey" : "Join The Journey"}
                            </h2>
                            <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>
                                {!roomStatus.exists ? "Choose your rules and invite others!" : "Your partner is waiting for you!"}
                            </p>
                        </div>

                        {roomStatus.exists && (
                            <div style={{ background: 'rgba(255, 77, 109, 0.08)', padding: '15px', borderRadius: '15px', border: '1px dashed #ff4d6d' }}>
                                <p style={{ color: '#ff4d6d', fontWeight: 'bold', fontSize: '1rem', textAlign: 'center', marginBottom: '5px' }}>
                                    {roomStatus.waitingPlayer}{roomStatus.count > 1 ? ` & ${roomStatus.count - 1} others` : ''} is online!
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', fontSize: '0.8rem', opacity: 0.7 }}>
                                    <span>Capacity: {roomStatus.count}/{roomStatus.maxPlayers}</span>
                                    <span>•</span>
                                    <span>{roomStatus.hasPassword ? "Private Room 🔒" : "Public Room 🔓"}</span>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', opacity: 0.7, marginLeft: '5px' }}>Your Nickname</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '5px 12px', borderRadius: '10px', border: '1px solid #eee' }}>
                                    <User color="#ff4d6d" size={18} />
                                    <input
                                        type="text"
                                        placeholder="e.g. Jowie"
                                        value={playerName}
                                        onChange={(e) => setPlayerName(e.target.value)}
                                        autoFocus
                                        style={{ border: 'none', padding: '8px', width: '100%', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            {!roomStatus.exists ? (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 'bold', opacity: 0.7, marginLeft: '5px' }}>Max Players</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {[2, 3, 4, 5, 6].map(num => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => setMaxPlayersInput(num)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px 0',
                                                        borderRadius: '10px',
                                                        border: '2px solid',
                                                        borderColor: maxPlayersInput === num ? '#ff4d6d' : '#f0f0f0',
                                                        background: maxPlayersInput === num ? '#fff0f3' : '#fff',
                                                        color: maxPlayersInput === num ? '#ff4d6d' : '#666',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 'bold', opacity: 0.7, marginLeft: '5px' }}>Optional Password</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '5px 12px', borderRadius: '10px', border: '1px solid #eee' }}>
                                            <Lock color="#ff4d6d" size={18} />
                                            <input
                                                type="password"
                                                placeholder="Leave blank for public"
                                                value={passwordInput}
                                                onChange={(e) => setPasswordInput(e.target.value)}
                                                style={{ border: 'none', padding: '8px', width: '100%', outline: 'none' }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ) : roomStatus.hasPassword ? (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', opacity: 0.7, marginLeft: '5px' }}>Password</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '5px 12px', borderRadius: '10px', border: '1px solid #eee' }}>
                                        <Lock color="#ff4d6d" size={18} />
                                        <input
                                            type="password"
                                            placeholder="Enter room password..."
                                            value={enteredPassword}
                                            onChange={(e) => setEnteredPassword(e.target.value)}
                                            style={{ border: 'none', padding: '8px', width: '100%', outline: 'none' }}
                                        />
                                    </div>
                                </motion.div>
                            ) : null}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', opacity: 0.7, marginLeft: '5px' }}>Room Code</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff0f3', padding: '5px 12px', borderRadius: '10px' }}>
                                    <Heart color="#ff4d6d" fill="#ff4d6d" size={18} />
                                    <input
                                        type="text"
                                        value={roomId}
                                        onChange={(e) => {
                                            setRoomId(e.target.value);
                                            setRoomStatus({ exists: false, count: 0 });
                                        }}
                                        placeholder="Room Code"
                                        style={{ border: 'none', padding: '8px', width: '100%', outline: 'none', background: 'transparent', color: '#ff4d6d', fontWeight: 'bold' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn" style={{ padding: '15px', fontSize: '1.2rem', marginTop: '10px' }}>
                            {!roomStatus.exists ? "Start & Invite Partners" : "Enter Journey"}
                        </button>
                    </>
                )}
            </form>
        </div>
    );
};

export default Lobby;
