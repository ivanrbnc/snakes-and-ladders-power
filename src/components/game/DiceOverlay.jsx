import React from 'react';
import { motion } from 'framer-motion';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

const DiceOverlay = ({ isRolling, hasLanded, rollingValue, rollingPlayer }) => {
    if (!isRolling) return null;

    return (
        <div className="dice-overlay">
            <motion.div
                className="dice large"
                animate={hasLanded ? {
                    rotate: 0,
                    scale: 1.1,
                    y: 0
                } : {
                    rotate: [0, 90, 180, 270, 360],
                    scale: [1, 1.3, 1],
                    y: [0, -20, 0]
                }}
                transition={hasLanded ? { duration: 0.2 } : { repeat: Infinity, duration: 0.4 }}
                style={{
                    fontSize: '8rem',
                    filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'white',
                    width: '180px',
                    height: '180px',
                    borderRadius: '30px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    border: hasLanded ? '5px solid #ff4d6d' : 'none'
                }}
            >
                {rollingValue === 1 && <Dice1 size={120} color="#ff4d6d" />}
                {rollingValue === 2 && <Dice2 size={120} color="#ff4d6d" />}
                {rollingValue === 3 && <Dice3 size={120} color="#ff4d6d" />}
                {rollingValue === 4 && <Dice4 size={120} color="#ff4d6d" />}
                {rollingValue === 5 && <Dice5 size={120} color="#ff4d6d" />}
                {rollingValue === 6 && <Dice6 size={120} color="#ff4d6d" />}
            </motion.div>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                    marginTop: '30px',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: 'var(--primary)',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
            >
                {hasLanded ? `${rollingPlayer} gets ${rollingValue}! ✨` : `${rollingPlayer} is rolling...`}
            </motion.p>
        </div>
    );
};

export default DiceOverlay;
