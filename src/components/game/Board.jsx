import React from 'react';
import { Heart, Zap } from 'lucide-react';
import { FULL_BOARD_EXTRAS } from '../../configuration/gameConstants';

const Board = ({ roomData, renderVisuals }) => {
    const getSquareCoords = (pos, isJump = false, seed = 0) => {
        const row = Math.floor((pos - 1) / 10);
        const col = (pos - 1) % 10;
        const x = row % 2 === 0 ? col : 9 - col;
        const y = 9 - row;

        if (!isJump) {
            return { x: x * 60 + 30, y: y * 60 + 30 };
        }

        // Deterministically pick a corner based on square position and seed
        const corners = [
            { ox: 15, oy: 15 }, // Top-Left
            { ox: 45, oy: 15 }, // Top-Right
            { ox: 15, oy: 45 }, // Bottom-Left
            { ox: 45, oy: 45 }  // Bottom-Right
        ];

        const hash = Math.abs(Math.sin(pos + seed) * 10000);
        const cornerIdx = Math.floor(hash % 4);
        const { ox, oy } = corners[cornerIdx];

        return { x: x * 60 + ox, y: y * 60 + oy };
    };

    const renderCells = () => {
        const cells = [];
        const loveSquares = roomData?.loveSquares || [];

        for (let r = 9; r >= 0; r--) {
            for (let c = 0; c < 10; c++) {
                let num;
                if (r % 2 === 0) {
                    num = (r * 10) + c + 1;
                } else {
                    num = (r * 10) + (9 - c) + 1;
                }

                const isLoveSquare = loveSquares.includes(num);
                const isPowerSquare = (roomData?.powerSquares || []).includes(num);

                cells.push(
                    <div key={num} className="cell" style={{
                        position: 'relative',
                        background: isLoveSquare ? 'rgba(255, 117, 143, 0.1)' : (isPowerSquare ? 'rgba(255, 183, 3, 0.1)' : 'transparent')
                    }}>
                        <span className="cell-number">{num}</span>
                        {isLoveSquare && (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                opacity: 0.8,
                                color: '#ff4d6d',
                                zIndex: 1
                            }}>
                                <Heart fill="#ff4d6d" size={32} />
                            </div>
                        )}
                        {isPowerSquare && (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                opacity: 0.8,
                                color: '#ffb703',
                                zIndex: 1
                            }}>
                                <Zap fill="#ffb703" size={32} />
                            </div>
                        )}
                    </div>
                );
            }
        }
        return cells;
    };

    // Deterministic "random" based on seed so snakes don't re-render differently each time
    const seededRandom = (seed) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    };

    const renderLadder = (s, e, startCoords, endCoords, idx) => {
        const dx = endCoords.x - startCoords.x;
        const dy = endCoords.y - startCoords.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;

        // Wood tones for variety
        const palettes = [
            { main: '#8b5a2b', light: '#a67c52', dark: '#5d3a1a' },
            { main: '#7c4e2a', light: '#966d4b', dark: '#4a2d15' },
            { main: '#a0785a', light: '#c1a189', dark: '#634431' }
        ];
        const pal = palettes[idx % palettes.length];

        const railWidth = 6;
        const ladderWidth = 18;
        const numRungs = Math.max(3, Math.floor(length / 25));
        const shadowId = `ladShadow${idx}`;
        const gradId = `ladGrad${idx}`;

        return (
            <g key={`ladder-${s}`} filter={`url(#${shadowId})`} opacity={0.75}>
                <defs>
                    <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.4" />
                    </filter>
                    <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={pal.dark} />
                        <stop offset="50%" stopColor={pal.light} />
                        <stop offset="100%" stopColor={pal.dark} />
                    </linearGradient>
                </defs>

                {/* We transform the whole ladder to simplify drawing */}
                <g transform={`translate(${startCoords.x}, ${startCoords.y}) rotate(${angleDeg + 90})`}>
                    {/* Rails */}
                    <rect
                        x={-ladderWidth / 2 - railWidth / 2} y={-length}
                        width={railWidth} height={length}
                        fill={`url(#${gradId})`} rx="2"
                    />
                    <rect
                        x={ladderWidth / 2 - railWidth / 2} y={-length}
                        width={railWidth} height={length}
                        fill={`url(#${gradId})`} rx="2"
                    />

                    {/* Rails Grain/Detail */}
                    <line x1={-ladderWidth / 2} y1={0} x2={-ladderWidth / 2} y2={-length} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <line x1={ladderWidth / 2} y1={0} x2={ladderWidth / 2} y2={-length} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                    {/* Rungs */}
                    {[...Array(numRungs)].map((_, i) => {
                        const yPos = -(length / (numRungs + 1)) * (i + 1);
                        return (
                            <g key={i}>
                                {/* Rung shadow */}
                                <rect
                                    x={-ladderWidth / 2 - 2} y={yPos + 1}
                                    width={ladderWidth + 4} height="4"
                                    fill="rgba(0,0,0,0.2)" rx="1"
                                />
                                {/* Rung body */}
                                <rect
                                    x={-ladderWidth / 2 - 2} y={yPos}
                                    width={ladderWidth + 4} height="4"
                                    fill={pal.main} rx="1.5"
                                />
                                {/* Rung Highlight */}
                                <rect
                                    x={-ladderWidth / 2 - 1} y={yPos}
                                    width={ladderWidth + 2} height="1.5"
                                    fill={pal.light} rx="0.5" opacity="0.6"
                                />
                                {/* Nails */}
                                <circle cx={-ladderWidth / 2} cy={yPos + 2} r="0.8" fill={pal.dark} />
                                <circle cx={ladderWidth / 2} cy={yPos + 2} r="0.8" fill={pal.dark} />
                            </g>
                        );
                    })}
                </g>
            </g>
        );
    };

    const renderSnake = (s, e, startCoords, endCoords, idx) => {
        const seed = s * 7 + idx;

        // Palette of snake color schemes
        const snakePalettes = [
            { body: '#2d8c4e', bodyDark: '#1a5c32', belly: '#a8d89a', eye: '#f5e642', tongue: '#e03040' },
            { body: '#7b4bb5', bodyDark: '#4a2475', belly: '#c9a8f0', eye: '#f0d060', tongue: '#e03040' },
            { body: '#c0392b', bodyDark: '#7c1a12', belly: '#f5b8b0', eye: '#fff59d', tongue: '#4a0010' },
            { body: '#1a6b8a', bodyDark: '#0d3d55', belly: '#80cfe8', eye: '#ffd54f', tongue: '#e03040' },
        ];
        const pal = snakePalettes[idx % snakePalettes.length];
        const shadowId = `snakeShadow${idx}`;
        const bodyGradId = `snakeBodyGrad${idx}`;
        const scalePatId = `snakeScales${idx}`;

        // Create a focused wave along the path
        const dx = endCoords.x - startCoords.x;
        const dy = endCoords.y - startCoords.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / dist; // Unit vector
        const uy = dy / dist;
        const px = -uy; // Perpendicular vector
        const py = ux;

        const numPoints = 20;
        const points = [];
        for (let i = 0; i <= numPoints; i++) {
            const ratio = i / numPoints;
            const baseX = startCoords.x + dx * ratio;
            const baseY = startCoords.y + dy * ratio;

            // Adjust frequency and amplitude based on distance - avoids jagged short snakes
            const waveFreq = dist < 100 ? 1 : 1.5;
            const maxAmp = Math.min(20, dist / 4);
            const amplitude = Math.sin(ratio * Math.PI) * maxAmp;
            const offset = Math.sin(ratio * Math.PI * waveFreq) * amplitude;

            points.push({
                x: baseX + px * offset,
                y: baseY + py * offset
            });
        }

        // Build a truly smooth path using Quadratic Bezier segments
        let pathD = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const cpX = (p0.x + p1.x) / 2;
            const cpY = (p0.y + p1.y) / 2;
            pathD += ` Q ${p0.x} ${p0.y} ${cpX} ${cpY}`;
        }
        pathD += ` L ${endCoords.x} ${endCoords.y}`;

        // Head direction
        const lastPt = points[points.length - 2];
        const headX = endCoords.x;
        const headY = endCoords.y;
        const headAngle = Math.atan2(headY - lastPt.y, headX - lastPt.x) * 180 / Math.PI;

        // Scale pattern squares — subtle diamonds along body
        const scaleColor = pal.bodyDark;

        return (
            <g key={`snake-${s}`} opacity={0.85}>
                <defs>
                    <linearGradient id={bodyGradId} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={pal.body} />
                        <stop offset="50%" stopColor={pal.bodyDark} />
                        <stop offset="100%" stopColor={pal.body} />
                    </linearGradient>
                    <pattern id={scalePatId} x="0" y="0" width="12" height="10" patternUnits="userSpaceOnUse">
                        <polygon points="6,1 11,5 6,9 1,5" fill={scaleColor} opacity="0.45" />
                    </pattern>
                    <filter id={shadowId} x="-10%" y="-10%" width="130%" height="130%">
                        <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#00000060" />
                    </filter>
                </defs>

                {/* Drop shadow path */}
                <path
                    d={pathD}
                    fill="none"
                    stroke="#00000040"
                    strokeWidth="13"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform="translate(2,3)"
                />

                {/* Main body */}
                <path
                    d={pathD}
                    fill="none"
                    stroke={`url(#${bodyGradId})`}
                    strokeWidth="11"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Scale texture overlay */}
                <path
                    d={pathD}
                    fill="none"
                    stroke={`url(#${scalePatId})`}
                    strokeWidth="11"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.6"
                />

                {/* Belly highlight */}
                <path
                    d={pathD}
                    fill="none"
                    stroke={pal.belly}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="6,8"
                    opacity="0.45"
                />

                {/* Head */}
                <g transform={`translate(${headX}, ${headY}) rotate(${headAngle})`}>
                    {/* Head shape */}
                    <ellipse cx="0" cy="0" rx="10" ry="8" fill={pal.body} filter={`url(#${shadowId})`} />
                    <ellipse cx="0" cy="0" rx="10" ry="8" fill={scaleColor} opacity="0.2" />
                    {/* Nostrils */}
                    <circle cx="7" cy="-3" r="1.2" fill={pal.bodyDark} />
                    <circle cx="7" cy="3" r="1.2" fill={pal.bodyDark} />
                    {/* Eyes */}
                    <circle cx="3" cy="-4.5" r="3" fill={pal.eye} />
                    <circle cx="3" cy="4.5" r="3" fill={pal.eye} />
                    <circle cx="4" cy="-4.5" r="1.5" fill="#111" />
                    <circle cx="4" cy="4.5" r="1.5" fill="#111" />
                    <circle cx="4.5" cy="-5" r="0.5" fill="white" opacity="0.8" />
                    <circle cx="4.5" cy="4" r="0.5" fill="white" opacity="0.8" />
                    {/* Tongue */}
                    <line x1="9" y1="0" x2="15" y2="0" stroke={pal.tongue} strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="15" y1="0" x2="18" y2="-2.5" stroke={pal.tongue} strokeWidth="1" strokeLinecap="round" />
                    <line x1="15" y1="0" x2="18" y2="2.5" stroke={pal.tongue} strokeWidth="1" strokeLinecap="round" />
                </g>

                {/* Tail tip at start (tapered) */}
                <circle cx={startCoords.x} cy={startCoords.y} r="4" fill={pal.bodyDark} />
                <circle cx={startCoords.x} cy={startCoords.y} r="2" fill={pal.belly} opacity="0.6" />

            </g>
        );
    };

    const renderJumps = () => {
        let ladderIdx = 0;
        let snakeIdx = 0;
        const boardExtras = roomData?.FULL_BOARD_EXTRAS || FULL_BOARD_EXTRAS;

        return (
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5, overflow: 'visible' }}>
                {Object.entries(boardExtras).map(([start, end]) => {
                    const s = parseInt(start);
                    const e = parseInt(end);
                    const startCoords = getSquareCoords(s, true, s);
                    const endCoords = getSquareCoords(e, true, s);
                    const isLadder = e > s;

                    if (isLadder) {
                        return renderLadder(s, e, startCoords, endCoords, ladderIdx++);
                    } else {
                        return renderSnake(s, e, startCoords, endCoords, snakeIdx++);
                    }
                })}
            </svg>
        );
    };

    return (
        <div className="board-container">
            <div className="board">
                {renderCells()}
                {renderJumps()}
                {renderVisuals()}
            </div>
        </div>
    );
};

export default Board;