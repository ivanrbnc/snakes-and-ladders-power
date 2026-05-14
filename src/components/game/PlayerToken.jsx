import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';

const SMELLY = ['💨', '😵', '💨', '🤢', '💨'];

const PlayerToken = ({ player, pos, getPositionCoords, isActive, powerEvent }) => {
    const coords = getPositionCoords(pos);
    const [shieldBreaking, setShieldBreaking] = useState(false);
    const [pranked, setPranked] = useState(false);
    const prevIsActive = React.useRef(false);

    const isEventTarget = powerEvent?.targetId === player.id;
    const isEventActor  = powerEvent?.actorId  === player.id;

    useEffect(() => {
        if (!powerEvent?.id) return;
        if (isEventTarget && powerEvent.type === 'shield_blocked') {
            setShieldBreaking(true);
            const t = setTimeout(() => setShieldBreaking(false), 1000);
            return () => clearTimeout(t);
        }
        if (isEventTarget && powerEvent.type === 'prank') {
            setPranked(true);
        }
    }, [powerEvent?.id]);

    // Clear prank when the pranked player finishes their turn (isActive goes true → false)
    useEffect(() => {
        if (pranked && prevIsActive.current && !isActive) {
            setPranked(false);
        }
        prevIsActive.current = isActive;
    }, [isActive]);

    const isFrozen    = player.skippingTurn;
    const isProtected = player.protected;

    return (
        <motion.div
            key={player.id}
            className="player-token"
            style={{
                backgroundColor: player.color,
                fontSize: '22px',
                transform: 'translate(-50%, -50%)',
                boxShadow: isActive
                    ? `0 0 0 3px white, 0 0 0 5px ${player.color}, 0 4px 12px rgba(0,0,0,0.3)`
                    : '0 2px 6px rgba(0,0,0,0.2)',
                zIndex: isActive ? 10 : 5,
                overflow: 'visible',
            }}
            initial={false}
            animate={{ left: coords.x, top: coords.y }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            {/* Active turn pulse ring */}
            {isActive && (
                <motion.div
                    style={{
                        position: 'absolute', inset: '-6px', borderRadius: '50%',
                        border: `3px solid ${player.color}`, pointerEvents: 'none',
                    }}
                    animate={{ scale: [1, 1.35, 1], opacity: [0.9, 0, 0.9] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                />
            )}

            {/* ── Shield bubble + atom orbits ── */}
            {isProtected && !shieldBreaking && (
                <>
                    <motion.div
                        style={{
                            position: 'absolute', inset: '-10px', borderRadius: '50%',
                            border: '2px solid rgba(100,180,255,0.9)',
                            background: 'radial-gradient(circle, rgba(100,180,255,0.22) 0%, rgba(60,140,255,0.06) 70%, transparent 100%)',
                            pointerEvents: 'none', zIndex: 20,
                            boxShadow: '0 0 10px rgba(100,180,255,0.5), inset 0 0 8px rgba(100,180,255,0.3)',
                        }}
                        animate={{ scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    {[
                        { tilt: '0deg',   dur: 2.2, color: '#64b4ff' },
                        { tilt: '60deg',  dur: 2.8, color: '#a0d0ff' },
                        { tilt: '-60deg', dur: 3.4, color: '#c0e8ff' },
                    ].map(({ tilt, dur, color }, ri) => (
                        <motion.div key={ri} style={{
                            position: 'absolute', top: '50%', left: '50%',
                            width: '36px', height: '36px',
                            marginTop: '-18px', marginLeft: '-18px',
                            borderRadius: '50%', border: `1px solid ${color}55`,
                            pointerEvents: 'none', zIndex: 22,
                            transform: `rotateX(70deg) rotateZ(${tilt})`,
                        }}
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: dur, repeat: Infinity, ease: 'linear' }}
                        >
                            <div style={{
                                position: 'absolute', top: '-4px', left: '50%',
                                width: '7px', height: '7px', marginLeft: '-3.5px',
                                borderRadius: '50%', background: color,
                                boxShadow: `0 0 7px ${color}`,
                            }} />
                        </motion.div>
                    ))}
                </>
            )}

            {/* ── Shield shatter fragments ── */}
            <AnimatePresence>
                {shieldBreaking && [...Array(8)].map((_, i) => {
                    const angle = (i / 8) * 360;
                    const rad = (angle * Math.PI) / 180;
                    return (
                        <motion.div key={i}
                            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                            animate={{ opacity: 0, x: Math.cos(rad) * 28, y: Math.sin(rad) * 28, scale: 0.3, rotate: angle + 90 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            style={{
                                position: 'absolute', top: '50%', left: '50%',
                                width: '10px', height: '6px', marginTop: '-3px', marginLeft: '-5px',
                                background: '#64b4ff', borderRadius: '2px',
                                pointerEvents: 'none', zIndex: 30,
                                boxShadow: '0 0 4px #64b4ff88',
                            }}
                        />
                    );
                })}
            </AnimatePresence>

            {/* ── Freeze: ice crust + drifting snowflake particles ── */}
            {isFrozen && (
                <>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            position: 'absolute', inset: '-5px', borderRadius: '50%',
                            border: '3px solid #b8e0ff',
                            background: 'radial-gradient(circle, rgba(200,235,255,0.55) 0%, rgba(140,200,255,0.25) 60%, transparent 100%)',
                            pointerEvents: 'none', zIndex: 20,
                            boxShadow: '0 0 12px rgba(140,200,255,0.7), inset 0 0 8px rgba(180,220,255,0.5)',
                        }}
                    >
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                            <div key={i} style={{
                                position: 'absolute', top: '50%', left: '50%',
                                width: '3px', height: '9px',
                                background: 'linear-gradient(to top, rgba(140,200,255,0.9), white)',
                                borderRadius: '2px 2px 0 0',
                                transformOrigin: 'bottom center',
                                transform: `translate(-50%, -100%) rotate(${angle}deg) translateY(14px)`,
                                opacity: 0.85,
                            }} />
                        ))}
                    </motion.div>

                    {/* Drifting snowflake particles */}
                    {[...Array(5)].map((_, i) => (
                        <motion.div key={`snow-${i}`}
                            initial={{ opacity: 0, y: 0, x: (i - 2) * 6 }}
                            animate={{ opacity: [0, 0.9, 0.9, 0], y: -28, x: (i - 2) * 6 + (i % 2 === 0 ? 4 : -4) }}
                            transition={{ duration: 1.6, delay: i * 0.4, repeat: Infinity, ease: 'easeOut' }}
                            style={{
                                position: 'absolute', top: '-2px', left: '50%',
                                fontSize: '9px', pointerEvents: 'none', zIndex: 25,
                                marginLeft: '-4px',
                            }}
                        >
                            ❄️
                        </motion.div>
                    ))}
                    <span style={{ position: 'absolute', top: '-17px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', pointerEvents: 'none' }}>❄️</span>
                </>
            )}

            {/* ── Prank: smelly particles floating above head ── */}
            {pranked && (
                <>
                    {SMELLY.map((emoji, i) => (
                        <motion.div key={`stink-${i}`}
                            initial={{ opacity: 0, y: 0, x: (i - 2) * 7, scale: 0.6 }}
                            animate={{
                                opacity: [0, 1, 0.8, 0],
                                y: [-10, -30 - i * 6],
                                x: [(i - 2) * 7, (i - 2) * 7 + (i % 2 === 0 ? 5 : -5)],
                                scale: [0.6, 1, 0.8],
                            }}
                            transition={{ duration: 1.8, delay: i * 0.35, repeat: Infinity, ease: 'easeOut' }}
                            style={{
                                position: 'absolute', top: '-8px', left: '50%',
                                fontSize: '11px', pointerEvents: 'none', zIndex: 25,
                                marginLeft: '-5px',
                            }}
                        >
                            {emoji}
                        </motion.div>
                    ))}
                </>
            )}

            {/* ── Lucky charm: gold atom orbits ── */}
            {isEventActor && powerEvent?.type === 'lucky' && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.7, 0] }}
                        transition={{ duration: 2 }}
                        style={{
                            position: 'absolute', inset: '-8px', borderRadius: '50%',
                            border: '2px solid #ffd700',
                            boxShadow: '0 0 14px #ffd70088',
                            pointerEvents: 'none', zIndex: 24,
                        }}
                    />
                    {[
                        { tilt: '0deg',   dur: 1.6, color: '#ffd700' },
                        { tilt: '60deg',  dur: 2.1, color: '#ffec6e' },
                        { tilt: '-60deg', dur: 2.6, color: '#ffe033' },
                    ].map(({ tilt, dur, color }, ri) => (
                        <motion.div key={ri} style={{
                            position: 'absolute', top: '50%', left: '50%',
                            width: '36px', height: '36px',
                            marginTop: '-18px', marginLeft: '-18px',
                            borderRadius: '50%', border: `1px solid ${color}55`,
                            pointerEvents: 'none', zIndex: 25,
                            transform: `rotateX(70deg) rotateZ(${tilt})`,
                        }}
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: dur, repeat: Infinity, ease: 'linear' }}
                        >
                            <div style={{
                                position: 'absolute', top: '-4px', left: '50%',
                                width: '7px', height: '7px', marginLeft: '-3.5px',
                                borderRadius: '50%', background: color,
                                boxShadow: `0 0 8px ${color}`,
                            }} />
                        </motion.div>
                    ))}
                </>
            )}

            {/* ── Turbo: speed lines ── */}
            {isEventActor && powerEvent?.type === 'turbo' && (
                <>
                    {[-6, 0, 6].map((offset, i) => (
                        <motion.div key={i}
                            initial={{ opacity: 0, scaleX: 0, x: 0 }}
                            animate={{ opacity: [0, 0.9, 0], scaleX: [0, 1, 1], x: [-30, -60] }}
                            transition={{ duration: 0.5, delay: i * 0.07, repeat: 3 }}
                            style={{
                                position: 'absolute', top: `calc(50% + ${offset}px)`,
                                left: '50%', width: '28px', height: '2px',
                                background: 'linear-gradient(to left, #ffb703, transparent)',
                                borderRadius: '2px', transformOrigin: 'right center',
                                pointerEvents: 'none', zIndex: 25,
                            }}
                        />
                    ))}
                </>
            )}

            {/* ── Avatar ── */}
            {player.avatar ? (
                player.avatar.startsWith('data:image') ? (
                    <img src={player.avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : player.avatar
            ) : <User size={20} />}
        </motion.div>
    );
};

export default PlayerToken;
