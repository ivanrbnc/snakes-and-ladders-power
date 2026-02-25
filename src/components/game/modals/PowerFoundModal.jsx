import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const PowerFoundModal = ({ pendingPowerCard, players, myPlayerId, MAX_POWER_CARDS, onChoice, onDiscard }) => {
    if (!pendingPowerCard) return null;

    const myPlayer = players?.find(p => p.id === myPlayerId);
    const canSave = (myPlayer?.powerCards || []).length < MAX_POWER_CARDS;

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="power-found-modal"
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
            >
                <div className="zap-icon"><Zap fill="#ffb703" size={40} /></div>
                <h2>You found a Power Card!</h2>
                <div className="found-card-preview">
                    <h3>{pendingPowerCard.name}</h3>
                    <p>{pendingPowerCard.description}</p>
                </div>

                {canSave ? (
                    <div className="modal-actions">
                        <button onClick={() => onChoice('save')} className="btn-save" style={{ width: '100%' }}>Save to Inventory</button>
                    </div>
                ) : (
                    <div className="modal-actions" style={{ flexDirection: 'column', gap: '10px' }}>
                        <p style={{ color: '#ff4d6d', fontSize: '0.9rem', textAlign: 'center' }}>Inventory full! You can't use cards after rolling.</p>
                        <button onClick={onDiscard} className="btn-save" style={{ backgroundColor: '#666', width: '100%' }}>Discard Card</button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default PowerFoundModal;
