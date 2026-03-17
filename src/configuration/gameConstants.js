export const FULL_BOARD_EXTRAS = {
    // 🪜 Ladders (progression boost)
    3: 24, 8: 29, 21: 41, 28: 47, 32: 70, 38: 66, 62: 83, 87: 93,

    // 🐍 Snakes (punishment)
    26: 6, 46: 25, 50: 11, 58: 19, 65: 60, 74: 48, 89: 68, 92: 88, 96: 75, 97: 84, 99: 80
};

export const LDR_CARDS = [
    "What made you smile today? Show me that smile right now.",
    "Tell me one thing you miss about me… and point to where you feel it most.",
    "Set a timer. Plan your next date in 30 seconds.",
    "Describe your perfect date once we're finally in the same place.",
    "What was the best part of your day?",
    "What's a song that reminds you of us? Play a few seconds for me.",
    "If I could appear in your room for 5 minutes right now, what would we do?",
    "What's the first thing we'll eat together when we reunite?",
    "Give me your cutest look right now.",
    "How do you see our relationship growing?",
    "If we can't say anything to each other now, what will happen later, when we meet?",
    "Describe the hug or cuddle you're craving from me most!",
    "Confess a thought about the other player.",
    "What's your favorite intimate memory of us?",
    "When did you know you had feelings for me?",
    "What’s something I do that always makes you smile?",
    "If you could choose anywhere in the world for us to live together, where would it be?",
    "What is a place from your past that you would love to visit with me?",
    "Ask each other random question!",
    "What’s a good thing about the way we handle conflict? What’s one thing that could be improved?",
    "When do you feel most secure in our relationship?",
    "What are the little things that your partner makes you happy?",
    "What do you think are your strength as a partner?",
    "What do you think makes us 'click'?",
    "If we were sharing this bed right now, where would your hands go first?",
    "Tell me one fantasy you've had about us in the last few days.",
    "What would you do if your partner forbade you to do something you enjoy?",
    "Tell me about the time when you felt most jealous.",
    "What's one little habit of mine that secretly melts you? 🥰",
    "Play 10–15 seconds of the song that always puts you in the mood for me.",
    "What’s something I could do more often to support you?",
    "What’s the difference between this relationship and your past ones?",
    "How do you feel of each other right now?"
];

export const TOTAL_LOVE_CARDS = LDR_CARDS.length;
export const PLAYER_COLORS = ['#ff4d6d', '#4d96ff', '#52b788', '#ffb703', '#9b5de5', '#f15bb5'];

/**
 * Generates squares evenly distributed across the board using segments.
 * This ensures no clustering and no overlap with snakes/ladders.
 */
const generateDistributedSquares = (count, excludes = []) => {
    const squares = [];
    const segmentSize = 98 / count; // Board is 2-99
    const excludeSet = new Set(excludes);

    for (let i = 0; i < count; i++) {
        const start = Math.floor(2 + (i * segmentSize));
        const end = Math.floor(2 + ((i + 1) * segmentSize));

        // Find all possible valid squares in this segment
        const candidates = [];
        for (let s = start; s < end; s++) {
            if (!FULL_BOARD_EXTRAS[s] && !excludeSet.has(s) && s < 100) {
                candidates.push(s);
            }
        }

        if (candidates.length > 0) {
            squares.push(candidates[Math.floor(Math.random() * candidates.length)]);
        } else {
            // Fallback: If segment is too crowded with snakes/ladders, search nearby
            let fallback = start;
            while (fallback < 100 && (FULL_BOARD_EXTRAS[fallback] || excludeSet.has(fallback) || squares.includes(fallback))) {
                fallback++;
            }
            if (fallback < 100) squares.push(fallback);
        }
    }
    return squares;
};

export const generateLoveSquares = () => {
    return generateDistributedSquares(22);
};

export const generatePowerSquares = (loveSquares) => {
    return generateDistributedSquares(20, loveSquares);
};

export const POWER_CARDS = [
    {
        id: 'shield',
        name: '🛡️ Shield',
        description: 'Protects you from the next offensive card used against you.',
        type: 'defensive',
        rarity: 'common'
    },
    {
        id: 'swap',
        name: '🔄 Swap',
        description: 'Swap your position with any player.',
        type: 'offensive',
        requiresTarget: true,
        rarity: 'rare'
    },
    {
        id: 'freeze',
        name: '❄️ Freeze',
        description: 'Target player skips their next turn.',
        type: 'offensive',
        requiresTarget: true,
        rarity: 'uncommon'
    },
    {
        id: 'turbo',
        name: '⚡ Turbo',
        description: 'Instantly move forward 4 squares.',
        type: 'support',
        rarity: 'common'
    },
    {
        id: 'prank',
        name: '🍌 Prank',
        description: 'Target player moves backward 4 squares.',
        type: 'offensive',
        requiresTarget: true,
        rarity: 'common'
    },
    {
        id: 'lucky',
        name: '🎲 Lucky',
        description: 'Your next roll will be a guaranteed 6.',
        type: 'support',
        rarity: 'uncommon'
    }
];

export const MAX_POWER_CARDS = 3;
