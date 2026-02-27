import React from 'react';
import { motion } from 'framer-motion';

const TargetSelectionModal = ({ targetSelection, players, myPlayerId, onSelect, onCancel }) => {
    if (!targetSelection || !players) return null;

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="target-modal"
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
            >
                <h3>Select a Target for {targetSelection.card.name}</h3>
                <div className="target-list">
                    {players
                        ?.filter(p => p.id !== myPlayerId)
                        .map(p => (
                            <button
                                key={p.id}
                                onClick={() => onSelect(targetSelection.card, targetSelection.loveCardIndex, p.id)}
                                style={{ backgroundColor: p.color }}
                            >
                                {p.name} {p.protected ? '🛡️' : ''}
                            </button>
                        ))
                    }
                    {players?.length <= 1 && <p>No other players to target!</p>}
                </div>
                <button className="btn-cancel" onClick={onCancel}>Cancel</button>
            </motion.div>
        </motion.div>
    );
};

export default TargetSelectionModal;
