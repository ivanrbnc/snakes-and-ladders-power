export const getPositionCoords = (pos) => {
    const row = Math.floor((pos - 1) / 10);
    const col = (pos - 1) % 10;
    const x = row % 2 === 0 ? col : 9 - col;
    const y = 9 - row;
    return {
        x: `${(x * 10) + 5}%`,
        y: `${(y * 10) + 5}%`
    };
};
