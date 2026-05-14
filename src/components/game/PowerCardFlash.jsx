import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CARD_COLORS = {
    shield:  { bg: '#52b788', glow: 'rgba(82, 183, 136, 0.6)',  emoji: '🛡️' },
    swap:    { bg: '#9b5de5', glow: 'rgba(155, 93, 229, 0.6)', emoji: '🔄' },
    freeze:  { bg: '#4d96ff', glow: 'rgba(77, 150, 255, 0.6)', emoji: '❄️' },
    turbo:   { bg: '#ffb703', glow: 'rgba(255, 183, 3, 0.6)',  emoji: '⚡' },
    prank:   { bg: '#ff4d6d', glow: 'rgba(255, 77, 109, 0.6)', emoji: '🍌' },
    lucky:   { bg: '#ffb703', glow: 'rgba(255, 183, 3, 0.6)',  emoji: '🎲' },
};

const PowerCardFlash = ({ cardId }) => {
    const config = CARD_COLORS[cardId];
    if (!config) return null;

    return (
        <AnimatePresence>
            {cardId && (
                <motion.div
                    key={cardId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.55, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: config.bg,
                        zIndex: 9998,
                        pointerEvents: 'none',
                        boxShadow: `inset 0 0 120px ${config.glow}`,
                    }}
                />
            )}
        </AnimatePresence>
    );
};

export default PowerCardFlash;
