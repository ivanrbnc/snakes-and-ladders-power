import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const LoveCard = ({ currentCard, setCurrentCard }) => {
    if (!currentCard) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel"
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 1000,
                maxWidth: '400px',
                backgroundColor: 'white',
                border: '3px solid var(--primary)',
                borderRadius: '20px'
            }}
        >
            <Heart fill="#ff4d6d" color="#ff4d6d" size={40} style={{ marginBottom: '20px' }} />
            <h2>Couple Challenge!</h2>
            <p style={{ margin: '20px 0', fontSize: '1.2rem' }}>{currentCard}</p>
            <button className="btn" onClick={() => setCurrentCard(null)}>Done! ❤️</button>
        </motion.div>
    );
};

export default LoveCard;
