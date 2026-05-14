import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, RefreshCw, Snowflake, FastForward, Trash2 } from 'lucide-react';
import { POWER_CARDS } from '../../configuration/gameConstants';

const PowerInventory = ({ players, myPlayerId, onUseCard, isMyTurn, disabled, isMobile = false }) => {
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
        <div className={isMobile ? 'power-inventory mobile' : 'power-inventory glass-panel'}>
            <h3 className="inventory-title">
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
                            No cards yet. Land on a yellow Zap square!
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
                                whileHover={canUse ? { scale: 1.05 } : {}}
                                onClick={() => canUse && onUseCard(card, index)}
                                style={{
                                    marginTop: index === 0 ? 0 : '10px'
                                }}
                            >
                                <div className="card-header">
                                    <div className="card-icon">{getIcon(card.id)}</div>
                                    <span className="card-name">{card.name}</span>
                                </div>
                                <div className="card-desc">{card.description}</div>
                                {canUse && <div className="use-hint">Click to Use</div>}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <style jsx>{`
                .power-inventory {
                    width: 100%;
                    padding: 20px;
                }
                .power-inventory.mobile {
                    padding: 0;
                }
                .inventory-title {
                    display: flex;
                    align-items: center;
                    margin-bottom: 20px;
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: inherit;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .mobile .inventory-title {
                    margin-bottom: 15px;
                }
                .cards-list {
                    display: flex;
                    flex-direction: column;
                }
                .empty-msg {
                    font-size: 0.9rem;
                    color: #ff4d6d;
                    text-align: center;
                    padding: 10px 0;
                    font-style: italic;
                    font-weight: 600;
                }
                .power-card {
                    background: white;
                    border-radius: 12px;
                    padding: 10px 15px;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    cursor: pointer;
                    border: 1px solid #ddd;
                    transition: all 0.2s ease;
                    position: relative;
                    color: #333;
                }
                .power-card.usable:hover {
                    border-color: #ffb703;
                    box-shadow: 0 4px 12px rgba(255, 183, 3, 0.2);
                    transform: translateX(10px);
                }
                .power-card.disabled {
                    cursor: not-allowed;
                    opacity: 0.6;
                }
                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .card-icon {
                    color: #ffb703;
                    display: flex;
                    align-items: center;
                }
                .card-name {
                    font-weight: 600;
                    font-size: 0.95rem;
                }
                .card-desc {
                   display: none;
                   font-size: 0.8rem;
                   color: #666;
                   line-height: 1.2;
                   padding-top: 5px;
                   border-top: 1px solid #eee;
                }
                .power-card:hover .card-desc {
                    display: block;
                }
                .use-hint {
                    position: absolute;
                    top: 10px;
                    right: 8px;
                    font-size: 0.6rem;
                    color: #ffb703;
                    font-weight: bold;
                    opacity: 0;
                }
                .power-card.usable:hover .use-hint {
                    opacity: 1;
                }
                .power-card.rare { border-left: 4px solid #9b5de5; }
                .power-card.uncommon { border-left: 4px solid #4d96ff; }
                .power-card.common { border-left: 4px solid #52b788; }
            `}</style>
        </div>
    );
};

export default PowerInventory;
