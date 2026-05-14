import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CONFIGS = {
    freeze: {
        emoji: '❄️', color: '#4d96ff', border: '#4d96ff',
        title: "You've been Frozen!",
    },
    prank: {
        emoji: '🍌', color: '#ff4d6d', border: '#ff4d6d',
        title: "You've been Pranked!",
    },
    swap: {
        emoji: '🔄', color: '#9b5de5', border: '#9b5de5',
        title: 'Positions Swapped!',
    },
    shield_blocked: {
        emoji: '🛡️', color: '#64b4ff', border: '#64b4ff',
        title: 'Shield Blocked It!',
    },
    shield_activate: {
        emoji: '🛡️', color: '#64b4ff', border: '#64b4ff',
        title: 'Shield Activated!',
    },
    lucky: {
        emoji: '🎲', color: '#ffd700', border: '#ffd700',
        title: 'Lucky Charm!',
    },
    turbo: {
        emoji: '⚡', color: '#ffb703', border: '#ffb703',
        title: 'Turbo Boost!',
    },
};

/* Freeze: icy blue vignette + snowflakes drift down */
const FreezeScreenEffect = () => (
    <>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.65, 0.45, 0] }}
            transition={{ duration: 2.5, times: [0, 0.15, 0.5, 1] }}
            style={{
                position: 'fixed', inset: 0, zIndex: 9990, pointerEvents: 'none',
                background: 'radial-gradient(ellipse at center, rgba(140,200,255,0.4) 0%, rgba(60,120,255,0.6) 100%)',
            }}
        />
        {[...Array(12)].map((_, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, y: -20, x: `${8 + i * 7.5}vw` }}
                animate={{ opacity: [0, 0.9, 0], y: '110vh', x: `${8 + i * 7.5 + (i % 2 === 0 ? 2 : -2)}vw` }}
                transition={{ duration: 1.8 + (i % 3) * 0.4, delay: i * 0.1 }}
                style={{
                    position: 'fixed', top: 0, zIndex: 9991, pointerEvents: 'none',
                    fontSize: `${1 + (i % 3) * 0.5}rem`,
                }}
            >
                ❄️
            </motion.div>
        ))}
    </>
);

/* Prank: banana rolls across screen */
const BananaRoll = () => (
    <motion.div
        initial={{ x: '-10vw', y: '60vh', rotate: 0, opacity: 1 }}
        animate={{ x: '110vw', y: '55vh', rotate: 720, opacity: [1, 1, 0] }}
        transition={{ duration: 1.1, ease: 'easeIn' }}
        style={{
            position: 'fixed', zIndex: 9995, pointerEvents: 'none',
            fontSize: '3rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
        }}
    >
        🍌
    </motion.div>
);

/* Swap: purple aura + orbiting sparks */
const SwapAura = () => (
    <>
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.55, 0.3, 0], scale: [0.8, 1.05, 1.1] }}
            transition={{ duration: 1.8, times: [0, 0.25, 0.6, 1] }}
            style={{
                position: 'fixed', inset: 0, zIndex: 9990, pointerEvents: 'none',
                background: 'radial-gradient(ellipse at center, rgba(155,93,229,0.45) 0%, rgba(155,93,229,0.15) 55%, transparent 80%)',
            }}
        />
        {[0, 72, 144, 216, 288].map((deg, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, rotate: deg, scale: 0 }}
                animate={{ opacity: [0, 1, 0], rotate: deg + 180, scale: [0, 1.2, 0] }}
                transition={{ duration: 1.2, delay: i * 0.06 }}
                style={{
                    position: 'fixed', top: '50%', left: '50%',
                    width: '8px', height: '8px', marginTop: '-4px', marginLeft: '-4px',
                    borderRadius: '50%', background: '#c77dff',
                    transformOrigin: '4px 90px',
                    zIndex: 9992, pointerEvents: 'none',
                    boxShadow: '0 0 8px #c77dff',
                }}
            />
        ))}
    </>
);

/* Shield broken: blue shockwave rings */
const ShieldBreakEffect = () => (
    <>
        {[0, 0.15, 0.3].map((delay, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0.8, scale: 0.2, x: '-50%', y: '-50%' }}
                animate={{ opacity: 0, scale: 2.5 }}
                transition={{ duration: 0.7, delay, ease: 'easeOut' }}
                style={{
                    position: 'fixed', top: '50%', left: '50%',
                    width: '200px', height: '200px', borderRadius: '50%',
                    border: '4px solid #64b4ff',
                    zIndex: 9992, pointerEvents: 'none',
                    boxShadow: '0 0 20px #64b4ff88',
                }}
            />
        ))}
    </>
);

/* Shield activate: blue expanding pulse */
const ShieldActivateEffect = () => (
    <>
        {[0, 0.2, 0.4].map((delay, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0.7, scale: 0.1, x: '-50%', y: '-50%' }}
                animate={{ opacity: 0, scale: 2 }}
                transition={{ duration: 0.9, delay, ease: 'easeOut' }}
                style={{
                    position: 'fixed', top: '50%', left: '50%',
                    width: '180px', height: '180px', borderRadius: '50%',
                    border: '3px solid #64b4ff', background: 'rgba(100,180,255,0.08)',
                    zIndex: 9992, pointerEvents: 'none',
                    boxShadow: '0 0 16px #64b4ff66',
                }}
            />
        ))}
    </>
);

/* Lucky: gold sparkle burst from center */
const LuckyEffect = () => (
    <>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 1.5 }}
            style={{
                position: 'fixed', inset: 0, zIndex: 9990, pointerEvents: 'none',
                background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.35) 0%, transparent 65%)',
            }}
        />
        {[...Array(10)].map((_, i) => {
            const angle = (i / 10) * 360;
            const rad = (angle * Math.PI) / 180;
            return (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: '50vw', y: '50vh', scale: 0 }}
                    animate={{
                        opacity: [0, 1, 0],
                        x: `calc(50vw + ${Math.cos(rad) * 180}px)`,
                        y: `calc(50vh + ${Math.sin(rad) * 180}px)`,
                        scale: [0, 1.4, 0],
                    }}
                    transition={{ duration: 0.9, delay: i * 0.06 }}
                    style={{
                        position: 'fixed', zIndex: 9993, pointerEvents: 'none',
                        fontSize: '1.2rem',
                    }}
                >
                    ✨
                </motion.div>
            );
        })}
    </>
);

/* Turbo: speed lines sweep across screen */
const TurboEffect = () => (
    <>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.35, 0] }}
            transition={{ duration: 0.8 }}
            style={{
                position: 'fixed', inset: 0, zIndex: 9990, pointerEvents: 'none',
                background: 'linear-gradient(to right, transparent 30%, rgba(255,183,3,0.3) 100%)',
            }}
        />
        {[...Array(8)].map((_, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, scaleX: 0, x: '-100vw' }}
                animate={{ opacity: [0, 0.85, 0], scaleX: [0, 1, 1], x: '110vw' }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                style={{
                    position: 'fixed',
                    top: `${15 + i * 9}%`,
                    left: 0, width: '100vw', height: '3px',
                    background: 'linear-gradient(to right, transparent, #ffb703, transparent)',
                    transformOrigin: 'left center',
                    zIndex: 9991, pointerEvents: 'none',
                    borderRadius: '2px',
                }}
            />
        ))}
    </>
);

const PowerCardOverlay = ({ event }) => {
    const config = event ? CONFIGS[event.type] : null;

    return (
        <AnimatePresence>
            {config && (
                <>
                    {event.type === 'freeze'         && <FreezeScreenEffect    key={`fx-${event.id}`} />}
                    {event.type === 'prank'          && <BananaRoll            key={`fx-${event.id}`} />}
                    {event.type === 'swap'           && <SwapAura              key={`fx-${event.id}`} />}
                    {event.type === 'shield_blocked' && <ShieldBreakEffect     key={`fx-${event.id}`} />}
                    {event.type === 'shield_activate'&& <ShieldActivateEffect  key={`fx-${event.id}`} />}
                    {event.type === 'lucky'          && <LuckyEffect           key={`fx-${event.id}`} />}
                    {event.type === 'turbo'          && <TurboEffect           key={`fx-${event.id}`} />}

                    {/* Central modal */}
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, scale: 0.7, x: '-50%', y: 'calc(-50% - 30px)' }}
                        animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                        exit={{ opacity: 0, scale: 0.85, x: '-50%', y: 'calc(-50% - 20px)' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                        style={{
                            position: 'fixed', top: '50%', left: '50%',
                            zIndex: 9999, willChange: 'transform',
                            background: 'rgba(255,255,255,0.96)',
                            backdropFilter: 'blur(14px)',
                            border: `3px solid ${config.border}`,
                            borderRadius: '24px',
                            padding: '40px 56px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                            boxShadow: `0 20px 60px rgba(0,0,0,0.18), 0 0 40px ${config.border}55`,
                            textAlign: 'center', pointerEvents: 'none', minWidth: '300px',
                        }}
                    >
                        {/* Freeze shimmer overlay on card */}
                        {event.type === 'freeze' && (
                            <motion.div
                                style={{ position: 'absolute', inset: 0, borderRadius: '22px', background: 'rgba(168,216,255,0.2)', pointerEvents: 'none' }}
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.2, repeat: 2 }}
                            />
                        )}

                        <motion.span
                            animate={
                                event.type === 'freeze'         ? { rotate: [-8, 8, -6, 6, 0], scale: [1, 1.2, 1] } :
                                event.type === 'prank'          ? { rotate: [0, -20, 20, -15, 15, 0], y: [0, -10, 0, -6, 0], scale: [1, 1.4, 1] } :
                                event.type === 'swap'           ? { rotate: [0, 180, 360], scale: [1, 1.3, 1] } :
                                event.type === 'lucky'          ? { rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.5, 1] } :
                                event.type === 'turbo'          ? { x: [0, 8, -4, 6, 0], scale: [1, 1.3, 1] } :
                                                                  { scale: [1, 1.4, 0.9, 1.1, 1], rotate: [0, -10, 10, -5, 0] }
                            }
                            transition={{ duration: event.type === 'swap' ? 0.8 : 0.6, delay: 0.1 }}
                            style={{ fontSize: '4rem', lineHeight: 1 }}
                        >
                            {config.emoji}
                        </motion.span>

                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: config.color }}>
                            {config.title}
                        </div>
                        <div style={{ fontSize: '1rem', color: '#555', fontWeight: 500 }}>
                            {event.message}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default PowerCardOverlay;
