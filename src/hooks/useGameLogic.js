import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { supabase, supabaseUrl, supabaseAnonKey } from '../lib/supabase';
import {
    FULL_BOARD_EXTRAS,
    FRIENDSHIP_BOARD_EXTRAS,
    LDR_CARDS,
    FRIENDSHIP_CARDS,
    POWER_CARDS,
    MAX_POWER_CARDS,
    generateLoveSquares,
    generatePowerSquares
} from '../configuration/gameConstants';

const isFriendshipMode = (room) => (room?.maxPlayers || 2) >= 3;
const getActiveCards = (room) => isFriendshipMode(room) ? FRIENDSHIP_CARDS : LDR_CARDS;
const getActiveBoardExtras = (room) => isFriendshipMode(room) ? FRIENDSHIP_BOARD_EXTRAS : FULL_BOARD_EXTRAS;

const shuffleDeck = (cards) => {
    const indices = cards.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
};

export const useGameLogic = () => {
    const [roomId, setRoomId] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [playerAvatar, setPlayerAvatar] = useState('🐻');
    const [playerColor, setPlayerColor] = useState('#ff4d6d');
    const [inRoom, setInRoom] = useState(false);
    const [roomData, setRoomData] = useState(null);
    const [isRolling, setIsRolling] = useState(false);
    const [rollingPlayer, setRollingPlayer] = useState(null);
    const [currentCard, setCurrentCard] = useState(null);
    const [winner, setWinner] = useState(null);
    const [roomStatus, setRoomStatus] = useState({ exists: false, count: 0, waitingPlayer: null, maxPlayers: 2, hasPassword: false });
    const [visualPositions, setVisualPositions] = useState({});
    const [toasts, setToasts] = useState([]);

    // Config inputs
    const [maxPlayersInput, setMaxPlayersInput] = useState(2);
    const [passwordInput, setPasswordInput] = useState('');
    const [enteredPassword, setEnteredPassword] = useState('');
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [rollingValue, setRollingValue] = useState(1);
    const [hasLanded, setHasLanded] = useState(false);
    const [pendingPowerCard, setPendingPowerCard] = useState(null);
    const [targetSelection, setTargetSelection] = useState(null);
    const [hasRolledThisTurn, setHasRolledThisTurn] = useState(false);
    const [flashCard, setFlashCard] = useState(null);
    const [powerEvent, setPowerEvent] = useState(null);
    const [isLuckyRoll, setIsLuckyRoll] = useState(false);
    const [activeJump, setActiveJump] = useState(null);
    const [logs, setLogs] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);

    // Refs
    const isRollingRef = useRef(false);
    const hasLandedRef = useRef(false);
    const animatingPlayerRef = useRef(null);
    const visualPositionsRef = useRef({});
    const channelRef = useRef(null);
    const myPlayerId = useRef(sessionStorage.getItem('ldr_player_id') || Math.random().toString(36).substring(2, 11));
    if (!sessionStorage.getItem('ldr_player_id')) {
        sessionStorage.setItem('ldr_player_id', myPlayerId.current);
    }
    const roomDataRef = useRef(null);
    const inRoomRef = useRef(false);

    useEffect(() => { isRollingRef.current = isRolling; }, [isRolling]);
    useEffect(() => { hasLandedRef.current = hasLanded; }, [hasLanded]);
    useEffect(() => { roomDataRef.current = roomData; }, [roomData]);
    useEffect(() => { visualPositionsRef.current = visualPositions; }, [visualPositions]);
    useEffect(() => { inRoomRef.current = inRoom; }, [inRoom]);

    const addToast = useCallback((msg) => {
        const id = Math.random().toString(36).substring(2, 11);
        setToasts(prev => {
            if (prev.some(t => t.msg === msg)) return prev;
            return [...prev, { id, msg }];
        });
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const addLog = useCallback((msg, color) => {
        const id = Math.random().toString(36).substring(2, 11);
        const entry = { id, msg, color };
        setLogs(prev => [...prev.slice(-99), entry]);
        return entry;
    }, []);

    const appendLogToRoom = useCallback((room, entry) => {
        const logs = [...(room.logs || []).slice(-99), entry];
        return { ...room, logs };
    }, []);

    useEffect(() => {
        const handleUnload = () => {
            if (inRoomRef.current && roomId) {
                const url = `${supabaseUrl}/rest/v1/rpc/leave_room`;
                const body = JSON.stringify({ p_room_id: roomId, p_player_id: myPlayerId.current });
                const blob = new Blob([body], { type: 'application/json' });
                navigator.sendBeacon(url, blob);

                const headers = {
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                    'Content-Type': 'application/json'
                };
                fetch(url, { method: 'POST', headers, body, keepalive: true });

                // Broadcast so other players see the leave in their log
                const me = roomDataRef.current?.players.find(p => p.id === myPlayerId.current);
                if (me && channelRef.current) {
                    channelRef.current.send({ type: 'broadcast', event: 'player_left', payload: { name: me.name, color: me.color } });
                }
            }
        };

        window.addEventListener('beforeunload', handleUnload);
        return () => {
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [roomId]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        let id = params.get('room');
        if (!id) id = Math.floor(1000 + Math.random() * 9000).toString();
        setRoomId(id);
    }, []);

    const fastWalk = async (playerId, start, end) => {
        if (start === end) return;
        animatingPlayerRef.current = playerId;
        const diff = end - start;
        const steps = Math.abs(diff);
        const direction = diff > 0 ? 1 : -1;
        for (let i = 1; i <= steps; i++) {
            const nextStep = start + (i * direction);
            setVisualPositions(prev => ({ ...prev, [playerId]: nextStep }));
            await new Promise(r => setTimeout(r, 100));
        }
        animatingPlayerRef.current = null;
    };

    useEffect(() => {
        if (!roomId) return;
        const channel = supabase.channel(`room:${roomId}`, {
            config: { presence: { key: myPlayerId.current }, broadcast: { self: true } }
        });

        channel
            .on('broadcast', { event: 'card_shuffled' }, ({ payload }) => {
                const cards = isFriendshipMode(roomDataRef.current) ? FRIENDSHIP_CARDS : LDR_CARDS;
                setCurrentCard(cards[payload.cardIndex]);
                setLogs(prev => [...prev.slice(-99), { id: Math.random().toString(36).substring(2, 11), msg: `${payload.name} shuffled the card 🔀`, color: payload.color }]);
            })
            .on('broadcast', { event: 'player_left' }, ({ payload }) => {
                setLogs(prev => [...prev.slice(-99), { id: Math.random().toString(36).substring(2, 11), msg: `${payload.name} left the room 👋`, color: payload.color }]);
            })
            .on('broadcast', { event: 'dice_rolling' }, ({ payload }) => {
                const { name, isLucky } = payload;
                if (window.diceInterval) clearInterval(window.diceInterval);
                setIsLuckyRoll(!!isLucky);
                setRollingPlayer(name);
                setHasLanded(false);
                hasLandedRef.current = false;
                setIsRolling(true);
                isRollingRef.current = true;
                let prevVal = 1;
                window.diceInterval = setInterval(() => {
                    let nextVal;
                    do {
                        nextVal = Math.floor(Math.random() * 6) + 1;
                    } while (nextVal === prevVal); // Make sure it always changes frame to frame
                    prevVal = nextVal;
                    setRollingValue(nextVal);
                }, 80);
            })
            .on('broadcast', { event: 'dice_rolled' }, async ({ payload }) => {
                const { diceValue, playerId, name, startPosition, newPosition, isSpecial, specialType, shieldBlockedSnake, nextTurn, loveCardIndex, foundPowerCard, logId, winLogId } = payload;
                if (window.diceInterval) clearInterval(window.diceInterval);
                setRollingValue(diceValue);
                setRollingPlayer(name);
                setHasLanded(true);
                hasLandedRef.current = true;
                setIsRolling(true);
                isRollingRef.current = true;
                await new Promise(r => setTimeout(r, 1000));
                setIsRolling(false);
                isRollingRef.current = false;
                setHasLanded(false);
                setIsLuckyRoll(false);
                hasLandedRef.current = false;
                animatingPlayerRef.current = playerId;
                let currentPos = startPosition || 1;
                setVisualPositions(prev => ({ ...prev, [playerId]: currentPos }));
                for (let i = 1; i <= diceValue; i++) {
                    const nextStep = startPosition + i;
                    if (nextStep > 100) break;
                    setVisualPositions(prev => ({ ...prev, [playerId]: nextStep }));
                    await new Promise(r => setTimeout(r, 300));
                }
                if (isSpecial && newPosition !== (startPosition + diceValue)) {
                    await new Promise(r => setTimeout(r, 500));
                    setActiveJump(startPosition + diceValue);
                    setVisualPositions(prev => ({ ...prev, [playerId]: newPosition }));
                    setTimeout(() => setActiveJump(null), 1500);
                }
                animatingPlayerRef.current = null;

                if (shieldBlockedSnake) {
                    const ev = { id: crypto.randomUUID(), type: 'shield_blocked', message: `${name}'s shield blocked the snake! 🛡️`, targetId: playerId, actorId: playerId };
                    setPowerEvent(ev);
                    setTimeout(() => setPowerEvent(null), 3000);
                }

                let rollMsg = `${name} rolled ${diceValue}!`;
                if (shieldBlockedSnake) {
                    rollMsg += ` Shield blocked the snake! 🛡️`;
                } else if (isSpecial) {
                    if (specialType === 'ladder') rollMsg += ` Climbed to ${newPosition} via ladder!`;
                    else if (specialType === 'snake') rollMsg += ` Slid to ${newPosition} via snake!`;
                }
                addToast(rollMsg);
                const playerColor = roomDataRef.current?.players.find(p => p.id === playerId)?.color;
                setLogs(prev => {
                    const id = logId || Math.random().toString(36).substring(2, 11);
                    if (prev.some(l => l.id === id)) return prev;
                    const entries = [{ id, msg: rollMsg, color: playerColor }];
                    if (winLogId) entries.push({ id: winLogId, msg: `🏆 ${name} wins!`, color: '#ffd700' });
                    return [...prev.slice(-99), ...entries];
                });
                setRoomData(prev => {
                    if (!prev) return prev;
                    const newPlayers = prev.players.map(p => p.id === playerId ? { ...p, position: newPosition } : p);
                    return { ...prev, players: newPlayers, turn: nextTurn };
                });
                if (loveCardIndex !== null && loveCardIndex !== undefined) {
                    const cards = getActiveCards(roomDataRef.current);
                    setTimeout(() => setCurrentCard(cards[loveCardIndex]), 500);
                }
                if (playerId === myPlayerId.current && foundPowerCard) {
                    const card = POWER_CARDS.find(c => c.id === foundPowerCard);
                    if (card) setPendingPowerCard(card);
                }
            })
            .on('broadcast', { event: 'game_over' }, ({ payload }) => {
                setWinner(payload.winner);
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ff4d6d', '#ffb3c1', '#ffffff'] });
            })
            .on('broadcast', { event: 'teleport' }, ({ payload }) => {
                const { playerId, pos } = payload;
                setVisualPositions(prev => ({ ...prev, [playerId]: pos }));
                setRoomData(prev => {
                    if (!prev) return prev;
                    return { ...prev, players: prev.players.map(p => p.id === playerId ? { ...p, position: pos } : p) };
                });
                const tpName = roomDataRef.current?.players.find(p => p.id === playerId)?.name || 'Someone';
                const tpColor = roomDataRef.current?.players.find(p => p.id === playerId)?.color;
                addToast(`Debug: Teleported to tile ${pos}`);
                addLog(`🔧 ${tpName} teleported to tile ${pos}`, tpColor);
            })
            .on('broadcast', { event: 'power_card_action' }, async ({ payload }) => {
                const { msg, movement, cardId, targetId } = payload;

                if (cardId) {
                    setFlashCard(cardId);
                    setTimeout(() => setFlashCard(null), 600);
                }

                const isBlocked = msg?.includes('blocked');
                const isTarget = targetId === myPlayerId.current;
                const actorId = payload.actorId;
                const isActor = actorId === myPlayerId.current;
                let overlayType = null;
                if (cardId === 'freeze') overlayType = isBlocked ? 'shield_blocked' : 'freeze';
                else if (cardId === 'prank') overlayType = isBlocked ? 'shield_blocked' : 'prank';
                else if (cardId === 'swap') overlayType = isBlocked ? 'shield_blocked' : 'swap';
                else if (cardId === 'lucky') overlayType = 'lucky';
                else if (cardId === 'turbo') overlayType = 'turbo';
                else if (cardId === 'shield') overlayType = 'shield_activate';

                if (overlayType) {
                    const players = roomDataRef.current?.players || [];
                    const actorName = players.find(p => p.id === actorId)?.name || '';
                    const targetName = players.find(p => p.id === targetId)?.name || '';
                    const event = { id: crypto.randomUUID(), type: overlayType, message: msg || '', targetId, actorId, isTarget, isActor, actorName, targetName };
                    setPowerEvent(event);
                    setTimeout(() => setPowerEvent(null), 3000);
                }

                if (movement) await fastWalk(movement.playerId, movement.start, movement.end);
                if (msg) {
                    const actorColor = roomDataRef.current?.players.find(p => p.id === actorId)?.color;
                    addLog(msg, actorColor);

                    const actorName = roomDataRef.current?.players.find(p => p.id === actorId)?.name || 'Someone';
                    let toastMsg = msg;
                    if (isActor && !isBlocked) {
                        if (cardId === 'freeze') toastMsg = msg.replace(/^.+ froze /, "You froze ");
                        else if (cardId === 'prank') toastMsg = msg.replace(/^.+ pranked /, "You pranked ");
                        else if (cardId === 'swap') toastMsg = msg.replace(/^.+ swapped with /, "You swapped with ");
                    } else if (isTarget && !isBlocked) {
                        if (cardId === 'freeze') toastMsg = `You've been frozen by ${actorName}! ❄️`;
                        else if (cardId === 'prank') toastMsg = `You've been pranked by ${actorName}! 🍌`;
                        else if (cardId === 'swap') toastMsg = `You've been swapped by ${actorName}! 🔄`;
                    }
                    addToast(toastMsg);
                }
            })
            .on('broadcast', { event: 'chat_message' }, ({ payload }) => {
                setChatMessages(prev => [...prev.slice(-99), payload]);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => {
                const newData = payload.new?.data;
                if (!newData) return;
                setRoomStatus({ exists: true, count: newData.players.length, maxPlayers: newData.maxPlayers, hasPassword: !!newData.password, waitingPlayer: newData.players[0]?.name, takenColors: newData.players.map(p => p.color) });
                const oldTurn = roomDataRef.current?.turn;
                if (oldTurn !== undefined && oldTurn !== newData.turn) setHasRolledThisTurn(false);
                setRoomData(newData);
                if (newData.logs?.length) {
                    setLogs(prev => {
                        const existingIds = new Set(prev.map(l => l.id));
                        const newEntries = newData.logs.filter(l => !existingIds.has(l.id));
                        return newEntries.length ? [...prev, ...newEntries].slice(-100) : prev;
                    });
                }
                setVisualPositions(prev => {
                    const next = { ...prev };
                    if (isRollingRef.current || hasLandedRef.current || animatingPlayerRef.current) return prev;
                    newData.players.forEach(p => {
                        if (next[p.id] === undefined || Math.abs(p.position - next[p.id]) > 1) next[p.id] = p.position;
                    });
                    return next;
                });
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    const { data } = await supabase.from('rooms').select('data').eq('id', roomId).maybeSingle();
                    if (data && data.data) {
                        const dbData = data.data;
                        setRoomStatus({ exists: true, count: dbData.players.length, maxPlayers: dbData.maxPlayers, hasPassword: !!dbData.password, waitingPlayer: dbData.players[0]?.name, takenColors: dbData.players.map(p => p.color) });
                        if (inRoomRef.current) setRoomData(dbData);
                    } else setRoomStatus({ exists: false, count: 0 });
                }
            });
        channelRef.current = channel;
        return () => { supabase.removeChannel(channel); };
    }, [roomId, addToast]);

    const joinRoom = async () => {
        if (!playerName.trim()) return addToast("Please enter your name!");
        if (roomStatus.exists && roomStatus.hasPassword && !enteredPassword) return addToast("Enter the password!");
        const { data: roomRow } = await supabase.from('rooms').select('*').eq('id', roomId).maybeSingle();
        let room;
        if (!roomRow || !roomRow.data || !roomRow.data.players || roomRow.data.players.length === 0) {
            const maxPlayers = parseInt(maxPlayersInput) || 2;
            const friendship = maxPlayers >= 3;
            room = {
                players: [{ id: myPlayerId.current, name: playerName, avatar: playerAvatar, position: 1, color: playerColor, powerCards: [], protected: false, skippingTurn: false, nextRollGuaranteed: null }],
                turn: 0, gameStarted: false, maxPlayers, password: passwordInput || null, roomId,
                isFriendship: friendship,
                loveCardQueue: shuffleDeck(friendship ? FRIENDSHIP_CARDS : LDR_CARDS),
                loveSquares: generateLoveSquares(friendship ? FRIENDSHIP_BOARD_EXTRAS : FULL_BOARD_EXTRAS), powerSquares: []
            };
            room.powerSquares = generatePowerSquares(room.loveSquares, friendship ? FRIENDSHIP_BOARD_EXTRAS : FULL_BOARD_EXTRAS);
            room = appendLogToRoom(room, { id: Math.random().toString(36).substring(2, 11), msg: `${playerName} created the room 🎉`, color: playerColor });
            await supabase.from('rooms').upsert([{ id: roomId, data: room }]);
        } else {
            room = roomRow.data;
            if (room.password && enteredPassword !== room.password) return addToast("Incorrect password!");
            if (!room.players.find(p => p.id === myPlayerId.current)) {
                if (room.players.length < room.maxPlayers) {
                    const takenColors = room.players.map(p => p.color);
                    if (takenColors.includes(playerColor)) return addToast("That color is already taken! Pick another.");
                    room.players.push({ id: myPlayerId.current, name: playerName, avatar: playerAvatar, position: 1, color: playerColor, powerCards: [], protected: false, skippingTurn: false, nextRollGuaranteed: null });
                    room = appendLogToRoom(room, { id: Math.random().toString(36).substring(2, 11), msg: `${playerName} joined the room 👋`, color: playerColor });
                    await supabase.from('rooms').update({ data: room }).eq('id', roomId);
                } else return addToast("Room is full!");
            }
        }
        if (room.logs) setLogs(room.logs);
        if (room.chatMessages) setChatMessages(room.chatMessages);
        setRoomData(room);
        setInRoom(true);
        const url = new URL(window.location);
        url.searchParams.set('room', roomId);
        window.history.pushState({}, '', url);
    };

    const rollDice = async () => {
        const room = roomDataRef.current;
        if (!room || room.players[room.turn]?.id !== myPlayerId.current) return;
        const player = room.players[room.turn];
        if (player.skippingTurn) {
            addToast("You are frozen! Skipping turn... ❄️");
            const updatedPlayers = room.players.map(p => p.id === myPlayerId.current ? { ...p, skippingTurn: false } : p);
            const updatedRoom = { ...room, players: updatedPlayers, turn: (room.turn + 1) % room.players.length };
            await supabase.from('rooms').update({ data: updatedRoom }).eq('id', roomId);
            return;
        }
        const diceValue = Number(player.nextRollGuaranteed) || (Math.floor(Math.random() * 6) + 1);
        setHasRolledThisTurn(true);
        isRollingRef.current = true; // block re-taps before broadcast echo arrives
        channelRef.current.send({ type: 'broadcast', event: 'dice_rolling', payload: { name: player.name, diceValue, isLucky: !!player.nextRollGuaranteed } });
        setTimeout(async () => {
            const startPosition = player.position;
            let newPos = player.position + diceValue;
            if (newPos > 100) newPos = 100;
            const boardExtras = getActiveBoardExtras(roomDataRef.current);
            const rawExtra = boardExtras[newPos];
            const isSnake = rawExtra !== undefined && rawExtra < newPos;
            const shieldBlocksSnake = isSnake && player.protected;
            const finalPosition = shieldBlocksSnake ? newPos : (rawExtra || newPos);
            const isSpecial = !!rawExtra && !shieldBlocksSnake;
            const currentRoomForRoll = roomDataRef.current;
            let loveCard = null;
            if ((currentRoomForRoll.loveSquares || []).includes(finalPosition)) {
                const activeCards = getActiveCards(currentRoomForRoll);
                let queue = currentRoomForRoll.loveCardQueue?.length ? [...currentRoomForRoll.loveCardQueue] : shuffleDeck(activeCards);
                loveCard = queue.shift();
                if (queue.length === 0) queue = shuffleDeck(activeCards);
                currentRoomForRoll.loveCardQueue = queue;
            }
            const foundPower = (currentRoomForRoll.powerSquares || []).includes(finalPosition) ? POWER_CARDS[Math.floor(Math.random() * POWER_CARDS.length)] : null;
            const nextTurn = (currentRoomForRoll.turn + 1) % currentRoomForRoll.players.length;
            const updatedPlayers = currentRoomForRoll.players.map(p => p.id === myPlayerId.current ? { ...p, position: finalPosition, nextRollGuaranteed: null, protected: shieldBlocksSnake ? false : p.protected } : p);
            let rollMsg = `${player.name} rolled ${diceValue}!`;
            if (shieldBlocksSnake) rollMsg += ` Shield blocked the snake! 🛡️`;
            else if (boardExtras[finalPosition] === undefined && finalPosition !== (player.position + diceValue)) {
                if (finalPosition > player.position + diceValue) rollMsg += ` Climbed to ${finalPosition} via ladder!`;
                else rollMsg += ` Slid to ${finalPosition} via snake!`;
            }
            const logEntry = { id: Math.random().toString(36).substring(2, 11), msg: rollMsg, color: player.color };
            let roomWithLog = appendLogToRoom({ ...currentRoomForRoll, players: updatedPlayers, turn: nextTurn, gameStarted: true }, logEntry);
            let winLogId = null;
            if (finalPosition === 100) {
                winLogId = Math.random().toString(36).substring(2, 11);
                const winEntry = { id: winLogId, msg: `🏆 ${player.name} wins!`, color: '#ffd700' };
                roomWithLog = appendLogToRoom(roomWithLog, winEntry);
            }
            await supabase.from('rooms').update({ data: roomWithLog }).eq('id', roomId);
            channelRef.current.send({ type: 'broadcast', event: 'dice_rolled', payload: { diceValue, playerId: myPlayerId.current, name: player.name, startPosition, newPosition: finalPosition, isSpecial, specialType: isSpecial ? (finalPosition > newPos ? 'ladder' : 'snake') : null, shieldBlockedSnake: shieldBlocksSnake, nextTurn, loveCardIndex: loveCard, foundPowerCard: foundPower?.id || null, logId: logEntry.id, winLogId } });
            if (finalPosition === 100) channelRef.current.send({ type: 'broadcast', event: 'game_over', payload: { winner: player.name } });
        }, 1200);
    };

    const handlePowerCardChoice = async (choice) => {
        const card = pendingPowerCard;
        if (!roomData || !card) return setPendingPowerCard(null);
        if (choice === 'save') {
            const player = roomData.players.find(p => p.id === myPlayerId.current);
            if (player && (player.powerCards || []).length < MAX_POWER_CARDS) {
                const updatedPlayers = roomData.players.map(p => p.id === myPlayerId.current ? { ...p, powerCards: [...(p.powerCards || []), card.id] } : p);
                const updatedRoom = { ...roomData, players: updatedPlayers };
                setRoomData(updatedRoom);
                await supabase.from('rooms').update({ data: updatedRoom }).eq('id', roomId);
                addToast(`Saved ${card.name}!`);
            }
        } else addToast("You can only use cards BEFORE rolling!");
        setPendingPowerCard(null);
    };

    const onUseCardFromInventory = (card, index) => {
        // If the card constant has requiresTarget, we MUST trigger selection
        if (card.requiresTarget) {
            setTargetSelection({ card, loveCardIndex: index });
        } else {
            executePowerCard(card, index);
        }
    };

    const executePowerCard = async (card, loveCardIndex, targetId = null) => {
        const currentRoom = roomDataRef.current;
        if (!currentRoom) return;

        let actorMsg = "";
        let movement = null;
        const actor = currentRoom.players.find(p => p.id === myPlayerId.current);

        const updatedPlayers = currentRoom.players.map(p => {
            let player = { ...p };
            if (player.id === myPlayerId.current) {
                player.powerCards = [...(p.powerCards || [])];
                if (loveCardIndex !== -1) player.powerCards.splice(loveCardIndex, 1);

                if (card.id === 'shield') {
                    player.protected = true;
                    actorMsg = `${player.name} activated a Shield! 🛡️`;
                }
                else if (card.id === 'turbo') {
                    const start = player.position;
                    player.position = Math.min(100, player.position + 4);
                    movement = { playerId: player.id, start, end: player.position };
                    actorMsg = `${player.name} used Turbo! ⚡`;
                }
                else if (card.id === 'lucky') {
                    player.nextRollGuaranteed = 6;
                    actorMsg = `${player.name} used Lucky Dice! 🎲`;
                }
                else if (card.id === 'swap' && targetId) {
                    const target = currentRoom.players.find(tp => tp.id === targetId);
                    if (target && !target.protected) player.position = target.position;
                    // Actor Msg will be set in the target handling block below
                }
            }

            if (player.id === targetId) {
                if (card.id === 'swap') {
                    if (player.protected) {
                        player.protected = false;
                        actorMsg = `${player.name}'s shield blocked ${actor.name}'s Swap! 🛡️`;
                    } else {
                        player.position = actor.position;
                        actorMsg = `${actor.name} swapped with ${player.name}! 🔄`;
                    }
                }
                else if (card.id === 'freeze') {
                    if (player.protected) {
                        player.protected = false;
                        actorMsg = `${player.name}'s shield blocked ${actor.name}'s Freeze! 🛡️`;
                    }
                    else {
                        player.skippingTurn = true;
                        actorMsg = `${actor.name} froze ${player.name}! ❄️`;
                    }
                }
                else if (card.id === 'prank') {
                    if (player.protected) {
                        player.protected = false;
                        actorMsg = `${player.name}'s shield blocked ${actor.name}'s Prank! 🛡️`;
                    }
                    else {
                        const start = player.position;
                        player.position = Math.max(1, player.position - 4);
                        movement = { playerId: player.id, start, end: player.position };
                        actorMsg = `${actor.name} pranked ${player.name}! 🍌`;
                    }
                }
            }
            return player;
        });

        const actorColor = currentRoom.players.find(p => p.id === myPlayerId.current)?.color;
        const logEntry = actorMsg ? { id: Math.random().toString(36).substring(2, 11), msg: actorMsg, color: actorColor } : null;
        const updatedRoom = logEntry ? appendLogToRoom({ ...currentRoom, players: updatedPlayers }, logEntry) : { ...currentRoom, players: updatedPlayers };
        setRoomData(updatedRoom);
        setTargetSelection(null);

        try {
            await supabase.from('rooms').update({ data: updatedRoom }).eq('id', roomId);
            channelRef.current.send({ type: 'broadcast', event: 'power_card_action', payload: { movement, msg: actorMsg, cardId: card.id, targetId, actorId: myPlayerId.current } });
            if (movement) await fastWalk(movement.playerId, movement.start, movement.end);
        } catch (err) { console.error(err); }
    };

    const copyRoomLink = () => { navigator.clipboard.writeText(window.location.href); addToast("Link copied! 📋"); };

    const sendChat = async (payload) => {
        if (!channelRef.current || !roomData) return;
        const me = roomData.players.find(p => p.id === myPlayerId.current);
        if (!me) return;
        const msg = { id: crypto.randomUUID(), playerId: myPlayerId.current, name: me.name, color: me.color, ...payload };
        channelRef.current.send({ type: 'broadcast', event: 'chat_message', payload: msg });
        const chatMessages = [...(roomData.chatMessages || []).slice(-99), msg];
        await supabase.from('rooms').update({ data: { ...roomData, chatMessages } }).eq('id', roomId);
    };
    const shuffleCard = async () => {
        const room = roomDataRef.current;
        if (!room) return;
        const activeCards = getActiveCards(room);
        let queue = room.loveCardQueue?.length ? [...room.loveCardQueue] : shuffleDeck(activeCards);
        const nextIndex = queue.shift();
        if (queue.length === 0) queue = shuffleDeck(activeCards);
        const updated = { ...room, loveCardQueue: queue };
        setRoomData(updated);
        await supabase.from('rooms').update({ data: updated }).eq('id', roomId);
        const me = room.players.find(p => p.id === myPlayerId.current);
        channelRef.current.send({ type: 'broadcast', event: 'card_shuffled', payload: { cardIndex: nextIndex, name: me?.name, color: me?.color } });
    };

    const setDebugRoll = async (val) => {
        if (!roomData) return;
        const updated = { ...roomData, players: roomData.players.map(p => p.id === myPlayerId.current ? { ...p, nextRollGuaranteed: val } : p) };
        setRoomData(updated);
        await supabase.from('rooms').update({ data: updated }).eq('id', roomId);
        addToast(`Debug: Next roll set to ${val}`);
    };

    const setDebugTeleport = async (tile) => {
        if (!roomData) return;
        const pos = Math.max(1, Math.min(99, parseInt(tile) || 1));
        const me = roomData.players.find(p => p.id === myPlayerId.current);
        const logEntry = { id: Math.random().toString(36).substring(2, 11), msg: `🔧 ${me?.name || 'Someone'} teleported to tile ${pos}`, color: me?.color };
        const updated = appendLogToRoom({ ...roomData, players: roomData.players.map(p => p.id === myPlayerId.current ? { ...p, position: pos } : p) }, logEntry);
        await supabase.from('rooms').update({ data: updated }).eq('id', roomId);
        channelRef.current.send({ type: 'broadcast', event: 'teleport', payload: { playerId: myPlayerId.current, pos } });
    };

    return {
        roomId, setRoomId, playerName, setPlayerName, playerAvatar, setPlayerAvatar, playerColor, setPlayerColor, inRoom, roomData, isRolling, rollingPlayer, currentCard, setCurrentCard, winner, roomStatus, setRoomStatus, visualPositions, toasts, maxPlayersInput, setMaxPlayersInput, passwordInput, setPasswordInput, enteredPassword, setEnteredPassword, showPasswordPrompt, setShowPasswordPrompt, rollingValue, hasLanded, pendingPowerCard, setPendingPowerCard, targetSelection, setTargetSelection, hasRolledThisTurn, myPlayerId, joinRoom, rollDice, handlePowerCardChoice, onUseCardFromInventory, executePowerCard, copyRoomLink, setDebugRoll, setDebugTeleport, flashCard, powerEvent, isLuckyRoll, activeJump, logs, chatMessages, sendChat, shuffleCard
    };
};
