import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Heart, Lock, Camera } from 'lucide-react';
import CameraCapture from './CameraCapture';

const LOBBY_COLORS = ['#ff4d6d', '#4d96ff', '#52b788', '#ffb703', '#9b5de5', '#f15bb5'];

const Lobby = ({
    roomStatus,
    playerName,
    setPlayerName,
    playerAvatar,
    setPlayerAvatar,
    playerColor,
    setPlayerColor,
    takenColors,
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
    const [showCamera, setShowCamera] = useState(false);

    useEffect(() => {
        if (takenColors.includes(playerColor)) {
            const first = LOBBY_COLORS.find(c => !takenColors.includes(c));
            if (first) setPlayerColor(first);
        }
    }, [takenColors]);

    return (
        <div className="setup-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '16px 20px 32px' }}>
            <h1 className="title" style={{ fontSize: 'clamp(2.5rem, 8vh, 3.8rem)', margin: 0 }}>Snakes & Ladders</h1>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    joinRoom();
                }}
                className="glass-panel"
                style={{ padding: '20px 25px', display: 'flex', flexDirection: 'column', gap: '12px', width: '90%', maxWidth: '340px', position: 'relative' }}
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

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
                            >
                                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', opacity: 0.7, marginLeft: '5px' }}>Your Nickname</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '4px 10px', borderRadius: '10px', border: '1px solid #eee' }}>
                                    <User color="#ff4d6d" size={16} />
                                    <input
                                        type="text"
                                        placeholder="e.g. Jowie"
                                        value={playerName}
                                        onChange={(e) => setPlayerName(e.target.value)}
                                        autoFocus
                                        style={{ border: 'none', padding: '4px', width: '100%', outline: 'none', fontSize: '0.85rem', color: '#590d22', opacity: 0.8 }}
                                    />
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
                            >
                                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', opacity: 0.7, marginLeft: '5px' }}>Select Avatar</label>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                    {['🐻', '🐶', '🐱', '🦊', '🐰', '🐼', '🐸', '🐷', '🐨', '🐯', '🐧', '🐢', '🦄', '📷'].map((emoji, index) => {
                                        if (emoji === '📷') {
                                            const isImage = playerAvatar && playerAvatar.startsWith('data:image');
                                            return (
                                                <button
                                                    key="camera"
                                                    type="button"
                                                    onClick={() => setShowCamera(true)}
                                                    style={{
                                                        fontSize: '1.2rem',
                                                        padding: '0',
                                                        borderRadius: '50%',
                                                        border: '2px solid',
                                                        borderColor: isImage ? '#ff4d6d' : 'transparent',
                                                        background: isImage ? '#fff0f3' : 'transparent',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        width: '36px',
                                                        height: '36px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {isImage ? (
                                                        <img src={playerAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <Camera size={18} color={playerAvatar === emoji ? '#ff4d6d' : '#666'} />
                                                    )}
                                                </button>
                                            );
                                        }
                                        return (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => setPlayerAvatar(emoji)}
                                                style={{
                                                    fontSize: '1.3rem',
                                                    padding: '4px',
                                                    borderRadius: '50%',
                                                    border: '2px solid',
                                                    borderColor: playerAvatar === emoji ? '#ff4d6d' : 'transparent',
                                                    background: playerAvatar === emoji ? '#fff0f3' : 'transparent',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    width: '36px',
                                                    height: '36px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                {emoji}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
                            >
                                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', opacity: 0.7, marginLeft: '5px' }}>Player Color</label>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    {LOBBY_COLORS.map(c => {
                                        const isTaken = takenColors.includes(c) && c !== playerColor;
                                        return (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => !isTaken && setPlayerColor(c)}
                                                title={isTaken ? 'Already taken' : c}
                                                style={{
                                                    width: '28px', height: '28px', borderRadius: '50%',
                                                    background: c, border: playerColor === c ? '3px solid #333' : '3px solid transparent',
                                                    cursor: isTaken ? 'not-allowed' : 'pointer',
                                                    opacity: isTaken ? 0.3 : 1,
                                                    transition: 'all 0.15s',
                                                    flexShrink: 0,
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </motion.div>

                            {!roomStatus.exists ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.7, marginLeft: '5px' }}>Max Players</label>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {[2, 3, 4, 5, 6].map(num => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => setMaxPlayersInput(num)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '6px 0',
                                                        borderRadius: '8px',
                                                        border: '2px solid',
                                                        borderColor: maxPlayersInput === num ? '#ff4d6d' : '#f0f0f0',
                                                        background: maxPlayersInput === num ? '#fff0f3' : '#fff',
                                                        color: maxPlayersInput === num ? '#ff4d6d' : '#666',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.7, marginLeft: '5px' }}>Password (optional)</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '4px 10px', borderRadius: '10px', border: '1px solid #eee' }}>
                                            <Lock color="#ff4d6d" size={14} />
                                            <input
                                                type="password"
                                                placeholder="Leave blank for public"
                                                value={passwordInput}
                                                onChange={(e) => setPasswordInput(e.target.value)}
                                                style={{ border: 'none', padding: '4px', width: '100%', outline: 'none', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ) : roomStatus.hasPassword ? (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
                                >
                                    <label style={{ fontSize: '0.75rem', fontWeight: 'bold', opacity: 0.7, marginLeft: '5px' }}>Password</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '4px 10px', borderRadius: '10px', border: '1px solid #eee' }}>
                                        <Lock color="#ff4d6d" size={16} />
                                        <input
                                            type="password"
                                            placeholder="Enter room password..."
                                            value={enteredPassword}
                                            onChange={(e) => setEnteredPassword(e.target.value)}
                                            style={{ border: 'none', padding: '4px', width: '100%', outline: 'none', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                </motion.div>
                            ) : null}

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
                            >
                                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', opacity: 0.7, marginLeft: '5px' }}>Room Code</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff0f3', padding: '4px 10px', borderRadius: '10px' }}>
                                    <Heart color="#ff4d6d" fill="#ff4d6d" size={16} />
                                    <input
                                        type="text"
                                        value={roomId}
                                        onChange={(e) => {
                                            setRoomId(e.target.value);
                                            setRoomStatus({ exists: false, count: 0 });
                                        }}
                                        placeholder="Room Code"
                                        style={{ border: 'none', padding: '4px', width: '100%', outline: 'none', background: 'transparent', color: '#ff4d6d', fontWeight: 'bold', fontSize: '0.85rem' }}
                                    />
                                </div>
                            </motion.div>
                        </div>

                        <motion.button
                            type="submit"
                            className="btn"
                            style={{ padding: '12px', fontSize: '1.1rem', marginTop: '5px' }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            {!roomStatus.exists ? "Start & Invite Partners" : "Enter Journey"}
                        </motion.button>
                    </>
                )}
            </form>

            {showCamera && (
                <CameraCapture
                    onCapture={(dataUrl) => {
                        setPlayerAvatar(dataUrl);
                        setShowCamera(false);
                    }}
                    onCancel={() => setShowCamera(false)}
                />
            )}
        </div>
    );
};

export default Lobby;
