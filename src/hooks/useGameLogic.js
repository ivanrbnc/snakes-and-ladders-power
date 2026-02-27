import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { supabase, supabaseUrl, supabaseAnonKey } from '../lib/supabase';
import {
    FULL_BOARD_EXTRAS,
    LDR_CARDS,
    POWER_CARDS,
    MAX_POWER_CARDS,
    generateLoveSquares,
    generatePowerSquares
} from '../configuration/gameConstants';

export const useGameLogic = () => {
    const [roomId, setRoomId] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [playerAvatar, setPlayerAvatar] = useState('🐻');
    const [inRoom, setInRoom] = useState(false);
    const [roomData, setRoomData] = useState(null);
    const [diceRoll, setDiceRoll] = useState(1);
    const [isRolling, setIsRolling] = useState(false);
    const [rollingPlayer, setRollingPlayer] = useState(null);
    const [message, setMessage] = useState("");
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

    // Refs
    const isRollingRef = useRef(false);
    const hasLandedRef = useRef(false);
    const animatingPlayerRef = useRef(null);
    const visualPositionsRef = useRef({});
    const channelRef = useRef(null);
    const myPlayerId = useRef(sessionStorage.getItem('ldr_player_id') || Math.random().toString(36).substr(2, 9));
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
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => {
            if (prev.some(t => t.msg === msg)) return prev;
            return [...prev, { id, msg }];
        });
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
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
            }
        };

        window.addEventListener('beforeunload', handleUnload);
        window.addEventListener('unload', handleUnload);
        return () => {
            window.removeEventListener('beforeunload', handleUnload);
            window.removeEventListener('unload', handleUnload);
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
            .on('broadcast', { event: 'dice_rolling' }, ({ payload }) => {
                const { name, diceValue } = payload;
                if (window.diceInterval) clearInterval(window.diceInterval);
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
                const { diceValue, playerId, name, startPosition, newPosition, isSpecial, specialType, nextTurn, loveCard, foundPowerCard } = payload;
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
                    setVisualPositions(prev => ({ ...prev, [playerId]: newPosition }));
                }
                animatingPlayerRef.current = null;

                let rollMsg = `${name} rolled ${diceValue}!`;
                if (isSpecial) {
                    if (specialType === 'ladder') {
                        rollMsg += ` Climbed to ${newPosition} via ladder!`;
                    } else if (specialType === 'snake') {
                        rollMsg += ` Slided to ${newPosition} via snake!`;
                    }
                }
                addToast(rollMsg);
                setRoomData(prev => {
                    if (!prev) return prev;
                    const newPlayers = prev.players.map(p => p.id === playerId ? { ...p, position: newPosition } : p);
                    return { ...prev, players: newPlayers, turn: nextTurn };
                });
                if (loveCard !== null && loveCard !== undefined) setTimeout(() => setCurrentCard(LDR_CARDS[loveCard]), 500);
                if (playerId === myPlayerId.current && foundPowerCard) {
                    const card = POWER_CARDS.find(c => c.id === foundPowerCard);
                    if (card) setPendingPowerCard(card);
                }
            })
            .on('broadcast', { event: 'game_over' }, ({ payload }) => {
                setWinner(payload.winner);
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ff4d6d', '#ffb3c1', '#ffffff'] });
            })
            .on('broadcast', { event: 'power_card_action' }, async ({ payload }) => {
                const { msg, movement } = payload;
                if (movement) await fastWalk(movement.playerId, movement.start, movement.end);
                if (msg) addToast(msg);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => {
                const newData = payload.new?.data;
                if (!newData) return;
                setRoomStatus({ exists: true, count: newData.players.length, maxPlayers: newData.maxPlayers, hasPassword: !!newData.password, waitingPlayer: newData.players[0]?.name });
                const oldTurn = roomDataRef.current?.turn;
                if (oldTurn !== undefined && oldTurn !== newData.turn) setHasRolledThisTurn(false);
                setRoomData(newData);
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
                        setRoomStatus({ exists: true, count: dbData.players.length, maxPlayers: dbData.maxPlayers, hasPassword: !!dbData.password, waitingPlayer: dbData.players[0]?.name });
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
            const colors = ['#ff4d6d', '#4d96ff', '#52b788', '#ffb703', '#9b5de5', '#f15bb5'];
            room = {
                players: [{ id: myPlayerId.current, name: playerName, avatar: playerAvatar, position: 1, color: colors[0], powerCards: [], protected: false, skippingTurn: false, nextRollGuaranteed: null }],
                turn: 0, gameStarted: false, loveCardIndex: 0, maxPlayers: parseInt(maxPlayersInput) || 2, password: passwordInput || null, roomId,
                loveSquares: generateLoveSquares(), powerSquares: []
            };
            room.powerSquares = generatePowerSquares(room.loveSquares);
            await supabase.from('rooms').upsert([{ id: roomId, data: room }]);
        } else {
            room = roomRow.data;
            if (room.password && enteredPassword !== room.password) return addToast("Incorrect password!");
            if (!room.players.find(p => p.id === myPlayerId.current)) {
                if (room.players.length < room.maxPlayers) {
                    const colors = ['#ff4d6d', '#4d96ff', '#52b788', '#ffb703', '#9b5de5', '#f15bb5'];
                    room.players.push({ id: myPlayerId.current, name: playerName, avatar: playerAvatar, position: 1, color: colors[room.players.length % colors.length], powerCards: [], protected: false, skippingTurn: false, nextRollGuaranteed: null });
                    await supabase.from('rooms').update({ data: room }).eq('id', roomId);
                } else return addToast("Room is full!");
            }
        }
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
        channelRef.current.send({ type: 'broadcast', event: 'dice_rolling', payload: { name: player.name, diceValue } });
        setTimeout(async () => {
            const startPosition = player.position;
            let newPos = player.position + diceValue;
            if (newPos > 100) newPos = player.position;
            const finalPosition = FULL_BOARD_EXTRAS[newPos] || newPos;
            const isSpecial = !!FULL_BOARD_EXTRAS[newPos];
            const currentRoomForRoll = roomDataRef.current;
            let loveCard = null;
            if ((currentRoomForRoll.loveSquares || []).includes(finalPosition)) {
                loveCard = currentRoomForRoll.loveCardIndex;
                currentRoomForRoll.loveCardIndex = (currentRoomForRoll.loveCardIndex + 1) % LDR_CARDS.length;
            }
            const foundPower = (currentRoomForRoll.powerSquares || []).includes(finalPosition) ? POWER_CARDS[Math.floor(Math.random() * POWER_CARDS.length)] : null;
            const nextTurn = (currentRoomForRoll.turn + 1) % currentRoomForRoll.players.length;
            const updatedPlayers = currentRoomForRoll.players.map(p => p.id === myPlayerId.current ? { ...p, position: finalPosition, nextRollGuaranteed: null } : p);
            const updatedRoom = { ...currentRoomForRoll, players: updatedPlayers, turn: nextTurn };
            await supabase.from('rooms').update({ data: updatedRoom }).eq('id', roomId);
            channelRef.current.send({ type: 'broadcast', event: 'dice_rolled', payload: { diceValue, playerId: myPlayerId.current, name: player.name, startPosition, newPosition: finalPosition, isSpecial, specialType: isSpecial ? (finalPosition > newPos ? 'ladder' : 'snake') : null, nextTurn, loveCard, foundPowerCard: foundPower?.id || null } });
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
                else if (card.id === 'lucky-dice') {
                    player.nextRollGuaranteed = 6;
                    actorMsg = `${player.name} used Lucky Dice! 🎲`;
                }
                else if (card.id === 'swap' && targetId) {
                    const target = currentRoom.players.find(tp => tp.id === targetId);
                    if (target) player.position = target.position;
                    // Actor Msg will be set in the target handling block below
                }
            }

            if (player.id === targetId) {
                if (card.id === 'swap') {
                    player.position = actor.position;
                    actorMsg = `${actor.name} swapped with ${player.name}! 🔄`;
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

        const updatedRoom = { ...currentRoom, players: updatedPlayers };
        setRoomData(updatedRoom);
        setTargetSelection(null);

        try {
            await supabase.from('rooms').update({ data: updatedRoom }).eq('id', roomId);
            channelRef.current.send({ type: 'broadcast', event: 'power_card_action', payload: { movement, msg: actorMsg } });
            if (movement) await fastWalk(movement.playerId, movement.start, movement.end);
            if (actorMsg) addToast(actorMsg);
        } catch (err) { console.error(err); }
    };

    const copyRoomLink = () => { navigator.clipboard.writeText(window.location.href); addToast("Link copied! 📋"); };
    const setDebugRoll = async (val) => {
        if (!roomData) return;
        const updated = { ...roomData, players: roomData.players.map(p => p.id === myPlayerId.current ? { ...p, nextRollGuaranteed: val } : p) };
        setRoomData(updated);
        await supabase.from('rooms').update({ data: updated }).eq('id', roomId);
        addToast(`Debug: Next roll set to ${val}`);
    };

    return {
        roomId, setRoomId, playerName, setPlayerName, playerAvatar, setPlayerAvatar, inRoom, roomData, isRolling, rollingPlayer, currentCard, setCurrentCard, winner, roomStatus, setRoomStatus, visualPositions, toasts, maxPlayersInput, setMaxPlayersInput, passwordInput, setPasswordInput, enteredPassword, setEnteredPassword, showPasswordPrompt, setShowPasswordPrompt, rollingValue, hasLanded, pendingPowerCard, setPendingPowerCard, targetSelection, setTargetSelection, hasRolledThisTurn, myPlayerId, joinRoom, rollDice, handlePowerCardChoice, onUseCardFromInventory, executePowerCard, copyRoomLink, setDebugRoll
    };
};
