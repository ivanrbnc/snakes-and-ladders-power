import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Shuffle, Users } from 'lucide-react';

const LoveCard = ({ currentCard, setCurrentCard, onShuffle, isFriendship }) => {
    return (
        <AnimatePresence>
            {currentCard && (
                <motion.div
                    key="love-card-root"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ position: 'fixed', inset: 0, zIndex: 999, pointerEvents: 'none' }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'radial-gradient(ellipse at center, rgba(255,77,109,0.45) 0%, rgba(255,179,193,0.2) 60%, transparent 100%)',
                        }}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: '-50%', y: 'calc(-50% + 20px)' }}
                        animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                        exit={{ opacity: 0, scale: 0.85, x: '-50%', y: 'calc(-50% + 10px)' }}
                        transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.1 }}
                        className="glass-panel"
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            willChange: 'transform',
                            padding: '40px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            maxWidth: '400px',
                            backgroundColor: 'white',
                            border: `3px solid ${isFriendship ? '#4d96ff' : 'var(--primary)'}`,
                            borderRadius: '20px',
                            pointerEvents: 'all',
                        }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], rotate: [0, -8, 8, 0] }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            {isFriendship
                                ? <Users fill="#4d96ff" color="#4d96ff" size={40} style={{ marginBottom: '20px' }} />
                                : <Heart fill="#ff4d6d" color="#ff4d6d" size={40} style={{ marginBottom: '20px' }} />}
                        </motion.div>
                        <h2>{isFriendship ? 'Friend Challenge!' : 'Couple Challenge!'}</h2>
                        <p style={{ margin: '20px 0', fontSize: '1.2rem' }}>{currentCard}</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn" onClick={() => setCurrentCard(null)}>{isFriendship ? 'Done! 🤝' : 'Done! ❤️'}</button>
                            {onShuffle && (
                                <button
                                    className="btn"
                                    onClick={onShuffle}
                                    style={{ background: isFriendship ? 'rgba(77,150,255,0.1)' : 'rgba(255,77,109,0.1)', color: isFriendship ? '#4d96ff' : '#ff4d6d', boxShadow: 'none' }}
                                    title="Get a different card"
                                >
                                    <Shuffle size={16} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoveCard;
