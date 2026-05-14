import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

const WinnerOverlay = ({ winner, players }) => {
    useEffect(() => {
        if (!winner) return;
        const burst = () => {
            confetti({ particleCount: 120, spread: 80, origin: { x: 0.3, y: 0.6 }, colors: ['#ff4d6d', '#ffb703', '#9b5de5', '#52b788', '#4d96ff'] });
            confetti({ particleCount: 120, spread: 80, origin: { x: 0.7, y: 0.6 }, colors: ['#ff4d6d', '#ffb703', '#9b5de5', '#52b788', '#4d96ff'] });
        };
        burst();
        const t1 = setTimeout(burst, 600);
        const t2 = setTimeout(burst, 1200);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [winner]);

    if (!winner) return null;

    const winnerPlayer = players?.find(p => p.name === winner);

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(255, 77, 109, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
            <motion.div
                initial={{ y: 60, opacity: 0, scale: 0.85 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="glass-panel"
                style={{ backgroundColor: 'white', padding: '60px', textAlign: 'center', minWidth: '320px' }}
            >
                <motion.div
                    animate={{ rotate: [0, -12, 12, -8, 8, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{ marginBottom: '16px' }}
                >
                    <Trophy size={80} color="#ffd700" />
                </motion.div>

                {winnerPlayer && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            width: '72px', height: '72px', borderRadius: '50%',
                            background: winnerPlayer.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem', margin: '0 auto 16px',
                            border: '4px solid #ffd700',
                            boxShadow: '0 0 20px rgba(255,215,0,0.5)',
                            overflow: 'hidden',
                        }}
                    >
                        {winnerPlayer.avatar ? (
                            winnerPlayer.avatar.startsWith('data:image') ? (
                                <img src={winnerPlayer.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : winnerPlayer.avatar
                        ) : '🏆'}
                    </motion.div>
                )}

                <h1 style={{ marginBottom: '8px' }}>{winner} Wins!</h1>
                <p style={{ fontSize: '1.2rem' }}>Congratulations! ❤️</p>
                <button className="btn" style={{ marginTop: '30px' }} onClick={() => window.location.href = '/'}>Play Again</button>
            </motion.div>
        </div>
    );
};

export default WinnerOverlay;
