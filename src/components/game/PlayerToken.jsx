import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

const PlayerToken = ({ player, pos, getPositionCoords }) => {
    const coords = getPositionCoords(pos);

    return (
        <motion.div
            key={player.id}
            className="player-token"
            style={{ backgroundColor: player.color }}
            initial={false}
            animate={{ left: coords.x, top: coords.y }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <User size={16} />
        </motion.div>
    );
};

export default PlayerToken;
