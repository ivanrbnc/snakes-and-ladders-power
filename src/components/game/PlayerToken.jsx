import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

const PlayerToken = ({ player, pos, getPositionCoords }) => {
    const coords = getPositionCoords(pos);

    return (
        <motion.div
            key={player.id}
            className="player-token"
            style={{ backgroundColor: player.color, fontSize: '18px' }}
            initial={false}
            animate={{ left: coords.x, top: coords.y }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            {player.avatar ? (
                player.avatar.startsWith('data:image') ? (
                    <img src={player.avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                    player.avatar
                )
            ) : <User size={16} />}
        </motion.div>
    );
};

export default PlayerToken;
