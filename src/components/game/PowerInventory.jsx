import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, RefreshCw, Snowflake, FastForward, Trash2 } from 'lucide-react';
import { POWER_CARDS } from '../../configuration/gameConstants';

const PowerInventory = ({ players, myPlayerId, onUseCard, isMyTurn, disabled }) => {
    const me = players.find(p => p.id === myPlayerId);
    if (!me) return null;

    const cards = me.powerCards || [];
    const canUse = isMyTurn && !disabled;

    const getIcon = (id) => {
        switch (id) {
            case 'shield': return <Shield size={20} />;
            case 'swap': return <RefreshCw size={20} />;
            case 'freeze': return <Snowflake size={20} />;
            case 'turbo': return <FastForward size={20} />;
            case 'prank': return <Zap size={20} />;
            case 'lucky-dice': return <Zap size={20} />;
            default: return <Zap size={20} />;
        }
    };

    return (
        <div className="power-inventory">
            <h3 className="inventory-title">
                <Zap size={18} fill="#ffb703" color="#ffb703" />
                Power Cards ({cards.length}/3)
            </h3>

            <div className="cards-list">
                <AnimatePresence>
                    {cards.length === 0 && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="empty-msg"
                        >
                            No cards yet. Land on a yellow <Zap size={14} inline /> square!
                        </motion.p>
                    )}
                    {cards.map((cardId, index) => {
                        const card = POWER_CARDS.find(c => c.id === cardId);
                        if (!card) return null;

                        return (
                            <motion.div
                                key={`${cardId}-${index}`}
                                className={`power-card ${card.rarity} ${canUse ? 'usable' : 'disabled'}`}
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 50, opacity: 0 }}
                                whileHover={canUse ? { scale: 1.05, x: -15, zIndex: 10 + index } : {}}
                                onClick={() => canUse && onUseCard(card, index)}
                                style={{
                                    zIndex: index,
                                    marginTop: index === 0 ? 0 : -35
                                }}
                            >
                                <div className="card-icon">{getIcon(card.id)}</div>
                                <div className="card-info">
                                    <span className="card-name">{card.name}</span>
                                    <span className="card-desc">{card.description}</span>
                                </div>
                                {canUse && <div className="use-hint">Click to Use</div>}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <style jsx>{`
                .power-inventory {
                    position: fixed;
                    right: 20px;
                    top: 100px;
                    width: 260px;
                    background: rgba(255, 77, 109, 0.15);
                    backdrop-filter: blur(16px);
                    border-radius: 20px;
                    padding: 24px 16px;
                    border: 1px solid rgba(255, 77, 109, 0.3);
                    color: #590d22;
                    z-index: 100;
                    box-shadow: 0 12px 40px rgba(255, 77, 109, 0.15);
                }
                .inventory-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 30px;
                    font-size: 1.1rem;
                    color: #ff4d6d;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .cards-list {
                    display: flex;
                    flex-direction: column;
                    padding-bottom: 20px;
                }
                .empty-msg {
                    font-size: 0.9rem;
                    color: #ff4d6d;
                    opacity: 0.8;
                    text-align: center;
                    padding: 20px 0;
                    font-style: italic;
                    font-weight: 600;
                }
                .power-card {
                    background: rgba(255, 255, 255, 0.9);
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    gap: 12px;
                    cursor: pointer;
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    position: relative;
                    color: #333;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }
                .power-card.usable:hover {
                    box-shadow: 0 8px 25px rgba(255, 183, 3, 0.4);
                }
                .power-card.disabled {
                    cursor: not-allowed;
                    filter: grayscale(0.2) brightness(0.9);
                    opacity: 0.9;
                }
                .card-icon {
                    background: #fff9db;
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #ffb703;
                    flex-shrink: 0;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
                }
                .card-info {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .card-name {
                    font-weight: 800;
                    font-size: 1rem;
                    color: #222;
                }
                .card-desc {
                    font-size: 0.8rem;
                    color: #666;
                    margin-top: 4px;
                    line-height: 1.3;
                    display: none;
                }
                .power-card.usable:hover .card-desc {
                    display: block;
                }
                .use-hint {
                    position: absolute;
                    bottom: 6px;
                    right: 12px;
                    font-size: 0.65rem;
                    color: #ffb703;
                    font-weight: 800;
                    opacity: 0;
                    text-transform: uppercase;
                }
                .power-card.usable:hover .use-hint {
                    opacity: 0.8;
                }

                .power-card.rare { border-right: 5px solid #9b5de5; }
                .power-card.uncommon { border-right: 5px solid #4d96ff; }
                .power-card.common { border-right: 5px solid #52b788; }
            `}</style>
        </div>
    );
};

export default PowerInventory;
