import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

const WinnerOverlay = ({ winner }) => {
    if (!winner) return null;

    return (
        <div className="overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(255, 77, 109, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass-panel"
                style={{ backgroundColor: 'white', padding: '60px', textAlign: 'center' }}
            >
                <Trophy size={80} color="#ffd700" style={{ marginBottom: '20px' }} />
                <h1>{winner} Wins!</h1>
                <p>Congratulation! ❤️</p>
                <button className="btn" style={{ marginTop: '30px' }} onClick={() => window.location.href = '/'}>Play Again</button>
            </motion.div>
        </div>
    );
};

export default WinnerOverlay;
