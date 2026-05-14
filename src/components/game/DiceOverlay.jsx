import React from 'react';
import { motion } from 'framer-motion';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

const DiceOverlay = ({ isRolling, hasLanded, rollingValue, rollingPlayer, isLucky }) => {
    if (!isRolling) return null;

    const diceColor = isLucky ? '#ffb703' : '#ff4d6d';
    const borderColor = hasLanded ? (isLucky ? '#ffb703' : '#ff4d6d') : 'none';

    return (
        <div className="dice-overlay">
            {isLucky && !hasLanded && (
                <motion.div
                    animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute',
                        width: '220px',
                        height: '220px',
                        borderRadius: '36px',
                        background: 'rgba(255, 183, 3, 0.35)',
                        filter: 'blur(18px)',
                        pointerEvents: 'none',
                    }}
                />
            )}
            <motion.div
                className="dice large"
                animate={hasLanded ? {
                    rotate: 360,
                    scale: [1.3, 1.1],
                    y: 0
                } : {
                    rotate: [0, 90, 180, 270, 360],
                    scale: [1, 1.3, 1],
                    y: [0, -20, 0]
                }}
                transition={hasLanded
                    ? { type: "spring", stiffness: 260, damping: 20 }
                    : { repeat: Infinity, duration: 0.6, type: "tween", ease: "linear" }}
                style={{
                    fontSize: '8rem',
                    filter: isLucky
                        ? 'drop-shadow(0 10px 24px rgba(255,183,3,0.6))'
                        : 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'white',
                    width: '180px',
                    height: '180px',
                    borderRadius: '30px',
                    boxShadow: isLucky
                        ? '0 20px 40px rgba(255,183,3,0.35)'
                        : '0 20px 40px rgba(0,0,0,0.2)',
                    border: hasLanded ? `5px solid ${borderColor}` : (isLucky ? '3px solid #ffb703' : 'none'),
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {rollingValue === 1 && <Dice1 size={120} color={diceColor} />}
                {rollingValue === 2 && <Dice2 size={120} color={diceColor} />}
                {rollingValue === 3 && <Dice3 size={120} color={diceColor} />}
                {rollingValue === 4 && <Dice4 size={120} color={diceColor} />}
                {rollingValue === 5 && <Dice5 size={120} color={diceColor} />}
                {rollingValue === 6 && <Dice6 size={120} color={diceColor} />}
            </motion.div>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                    marginTop: '30px',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: isLucky ? '#ffb703' : 'var(--primary)',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {hasLanded
                    ? `${rollingPlayer} gets ${rollingValue}${isLucky ? ' 🎲✨' : ' ✨'}`
                    : `${rollingPlayer} is rolling..${isLucky ? ' 🎲' : ''}`}
            </motion.p>
        </div>
    );
};

export default DiceOverlay;
