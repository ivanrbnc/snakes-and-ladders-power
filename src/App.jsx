import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { User } from 'lucide-react';
import { supabase } from './lib/supabase';

// Sub-components
import Lobby from './components/lobby/Lobby';
import Board from './components/game/Board';
import DiceOverlay from './components/game/DiceOverlay';
import GamePanel from './components/game/GamePanel';
import ToastContainer from './components/common/Toast';
import LoveCard from './components/game/LoveCard';
import WinnerOverlay from './components/game/WinnerOverlay';

// Constants
import { FULL_BOARD_EXTRAS, LDR_CARDS } from './constants/gameConstants';

// No global socket anymore, we'll create channels per room

function App() {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [diceRoll, setDiceRoll] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [rollingPlayer, setRollingPlayer] = useState(null);
  const [message, setMessage] = useState("");
  const [currentCard, setCurrentCard] = useState(null);
  const [winner, setWinner] = useState(null);
  const [roomStatus, setRoomStatus] = useState({ exists: false, count: 0, waitingPlayer: null, maxPlayers: 2, hasPassword: false });
  const [visualPositions, setVisualPositions] = useState({}); // playerId -> position
  const [toasts, setToasts] = useState([]);

  // Config inputs
  const [maxPlayersInput, setMaxPlayersInput] = useState(2);
  const [passwordInput, setPasswordInput] = useState('');
  const [enteredPassword, setEnteredPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [rollingValue, setRollingValue] = useState(1);
  const [hasLanded, setHasLanded] = useState(false);

  const channelRef = useRef(null);
  const myPlayerId = useRef(Math.random().toString(36).substr(2, 9)); // Stable ID for this session
  const roomDataRef = useRef(null);
  const visualPositionsRef = useRef(visualPositions);

  // Room ID from URL or generate new 4-digit code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let id = params.get('room');
    if (!id) {
      id = Math.floor(1000 + Math.random() * 9000).toString();
    }
    setRoomId(id);
  }, []);

  const addToast = useCallback((msg) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Check room status when roomId or inRoom changes
  useEffect(() => {
    if (roomId && !inRoom) {
      const checkRoom = async () => {
        try {
          const { data, error } = await supabase
            .from('rooms')
            .select('id, data')
            .eq('id', roomId)
            .maybeSingle();

          if (error) throw error;

          if (data) {
            const roomDataFromDb = data.data;
            setRoomStatus({
              exists: true,
              count: roomDataFromDb.players.length,
              maxPlayers: roomDataFromDb.maxPlayers,
              hasPassword: !!roomDataFromDb.password,
              waitingPlayer: roomDataFromDb.players[0]?.name
            });
          } else {
            setRoomStatus({ exists: false, count: 0 });
          }
        } catch (err) {
          console.error("Error checking room:", err);
          // If table doesn't exist, we'll see it here
          if (err.code === '42P01') {
            addToast("Supabase Error: 'rooms' table not found. Please check your database setup!");
          }
        }
      };
      checkRoom();
    }
  }, [roomId, inRoom, addToast]);

  useEffect(() => {
    roomDataRef.current = roomData;
  }, [roomData]);

  useEffect(() => {
    visualPositionsRef.current = visualPositions;
  }, [visualPositions]);

  // Subscribe to room updates
  useEffect(() => {
    if (!roomId || !inRoom) return;

    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        presence: {
          key: playerName,
        },
        broadcast: {
          self: true,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Handle presence if needed
      })
      .on('broadcast', { event: 'dice_rolling' }, ({ payload }) => {
        const { playerId, name, diceValue } = payload;
        setRollingPlayer(name);
        setIsRolling(true);
        setHasLanded(false);

        let startTime = Date.now();
        const duration = 1500;
        const interval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          if (elapsed < duration - 200) {
            setRollingValue(Math.floor(Math.random() * 6) + 1);
          } else {
            setRollingValue(diceValue);
            clearInterval(interval);
          }
        }, 80);
      })
      .on('broadcast', { event: 'dice_rolled' }, async ({ payload }) => {
        const { diceValue, playerId, name, newPosition, isSpecial, specialType, nextTurn, loveCard } = payload;

        setDiceRoll(diceValue);
        setRollingValue(diceValue);
        setRollingPlayer(name);
        setHasLanded(true);

        await new Promise(r => setTimeout(r, 1000));

        setIsRolling(false);
        setHasLanded(false);

        let currentPos = visualPositionsRef.current[playerId] || 1;
        const steps = diceValue;

        for (let i = 1; i <= steps; i++) {
          const nextStep = currentPos + i;
          if (nextStep > 100) break;
          setVisualPositions(prev => ({ ...prev, [playerId]: nextStep }));
          await new Promise(r => setTimeout(r, 300));
        }

        if (isSpecial) {
          await new Promise(r => setTimeout(r, 500));
          setVisualPositions(prev => ({ ...prev, [playerId]: newPosition }));
        }

        let msg = `${name} rolled a ${diceValue}!`;
        if (isSpecial) {
          msg += ` Moving to ${newPosition} via ${specialType}!`;
        }
        addToast(msg);
        setMessage(msg);

        // Update local state (the DB update is handled by the roller)
        setRoomData(prev => {
          if (!prev) return prev;
          const newPlayers = prev.players.map(p =>
            p.id === playerId ? { ...p, position: newPosition } : p
          );
          return { ...prev, players: newPlayers, turn: nextTurn };
        });

        if (loveCard !== null && loveCard !== undefined) {
          setTimeout(() => {
            setCurrentCard(LDR_CARDS[loveCard]);
          }, 1000);
        }
      })
      .on('broadcast', { event: 'game_over' }, ({ payload }) => {
        setWinner(payload.winner);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff4d6d', '#ffb3c1', '#ffffff']
        });
      })
      .subscribe();

    // Also listen to database changes for persistent state sync
    const dbSubscription = supabase
      .channel(`db-changes:${roomId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`
      }, (payload) => {
        const newData = payload.new.data;
        setRoomData(newData);

        // Sync visual positions if jumped
        setVisualPositions(prev => {
          const next = { ...prev };
          newData.players.forEach(p => {
            if (next[p.id] === undefined) next[p.id] = p.position;
          });
          return next;
        });
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(dbSubscription);
    };
  }, [roomId, inRoom, playerName]);

  const joinRoom = async () => {
    if (!playerName.trim()) return addToast("Please enter your name!");

    if (roomStatus.exists && roomStatus.hasPassword && !enteredPassword) {
      return addToast("This room is private. Please enter the password!");
    }

    // Fetch latest room data to join
    const { data: roomRow, error: fetchError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .maybeSingle();

    if (fetchError) {
      console.error("Fetch Error:", fetchError);
      return addToast("Connection error: " + fetchError.message);
    }

    let room;
    if (!roomRow) {
      // Create new room
      const colors = ['#ff4d6d', '#4d96ff', '#52b788', '#ffb703', '#9b5de5', '#f15bb5'];
      room = {
        players: [{
          id: myPlayerId.current,
          name: playerName,
          position: 1,
          color: colors[0]
        }],
        turn: 0,
        gameStarted: false,
        loveSquares: [],
        cardIndex: 0,
        maxPlayers: parseInt(maxPlayersInput) || 2,
        password: passwordInput || null,
        roomId
      };

      // Generate love squares
      const squares = new Set();
      while (squares.size < 20) {
        const r = Math.floor(Math.random() * 98) + 2;
        if (!FULL_BOARD_EXTRAS[r]) squares.add(r);
      }
      room.loveSquares = Array.from(squares);

      const { error: insertError } = await supabase.from('rooms').insert([{ id: roomId, data: room }]);
      if (insertError) {
        if (insertError.code === '23505') {
          // Race condition: someone else created it in the last split second
          return joinRoom();
        }
        console.error("Insert Error:", insertError);
        return addToast("Failed to create room: " + insertError.message);
      }
    } else {
      room = roomRow.data;
      if (room.password && enteredPassword !== room.password) {
        return addToast("Incorrect password!");
      }

      const isAlreadyIn = room.players.find(p => p.id === myPlayerId.current);
      if (isAlreadyIn) {
        // Player is returning - sync their name if it changed? No, keep existing.
      } else if (room.players.length < room.maxPlayers) {
        const colors = ['#ff4d6d', '#4d96ff', '#52b788', '#ffb703', '#9b5de5', '#f15bb5'];
        room.players.push({
          id: myPlayerId.current,
          name: playerName,
          position: 1,
          color: colors[room.players.length % colors.length]
        });

        const { error: updateError } = await supabase.from('rooms').update({ data: room }).eq('id', roomId);
        if (updateError) {
          console.error("Update Error:", updateError);
          return addToast("Failed to update room: " + updateError.message);
        }
      } else {
        return addToast("Room is full!");
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
    const diceValue = Math.floor(Math.random() * 6) + 1;

    // Broadcast "rolling" animation
    channelRef.current.send({
      type: 'broadcast',
      event: 'dice_rolling',
      payload: { playerId: myPlayerId.current, name: player.name, diceValue }
    });

    // Wait for animation
    setTimeout(async () => {
      let newPosition = player.position + diceValue;
      if (newPosition > 100) newPosition = player.position;

      const finalPosition = FULL_BOARD_EXTRAS[newPosition] || newPosition;
      const isSpecial = !!FULL_BOARD_EXTRAS[newPosition];
      const specialType = isSpecial ? (FULL_BOARD_EXTRAS[newPosition] > newPosition ? 'ladder' : 'snake') : null;

      const landedOnLove = room.loveSquares.includes(finalPosition);
      let loveCard = null;
      if (landedOnLove) {
        loveCard = room.cardIndex;
        room.cardIndex = (room.cardIndex + 1) % 22; // TOTAL_LOVE_CARDS
      }

      const nextTurn = (room.turn + 1) % room.players.length;

      // Update local state for immediate feedback
      player.position = finalPosition;
      room.turn = nextTurn;

      // Update Database
      await supabase.from('rooms').update({ data: room }).eq('id', roomId);

      // Broadcast "rolled" event for animation
      channelRef.current.send({
        type: 'broadcast',
        event: 'dice_rolled',
        payload: {
          diceValue,
          playerId: myPlayerId.current,
          name: player.name,
          newPosition: finalPosition,
          isSpecial,
          specialType,
          nextTurn,
          loveCard
        }
      });

      if (finalPosition === 100) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'game_over',
          payload: { winner: player.name }
        });
      }
    }, 1500);
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast("Invite link copied to clipboard! 📋✨");
  };

  const getPositionCoords = (pos) => {
    const row = Math.floor((pos - 1) / 10);
    const col = (pos - 1) % 10;
    const x = row % 2 === 0 ? col : 9 - col;
    const y = 9 - row;
    return { x: x * 60 + 15, y: y * 60 + 15 };
  };

  return (
    <>
      <ToastContainer toasts={toasts} />

      {!inRoom ? (
        <Lobby
          roomStatus={roomStatus}
          playerName={playerName}
          setPlayerName={setPlayerName}
          maxPlayersInput={maxPlayersInput}
          setMaxPlayersInput={setMaxPlayersInput}
          passwordInput={passwordInput}
          setPasswordInput={setPasswordInput}
          enteredPassword={enteredPassword}
          setEnteredPassword={setEnteredPassword}
          roomId={roomId}
          setRoomId={setRoomId}
          setRoomStatus={setRoomStatus}
          joinRoom={joinRoom}
          showPasswordPrompt={showPasswordPrompt}
        />
      ) : (
        <div className="game-container">
          <h1 className="title">Snakes & Ladders</h1>

          <GamePanel
            roomData={roomData}
            roomId={roomId}
            myPlayerId={myPlayerId.current}
            rollDice={rollDice}
            isRolling={isRolling}
            copyRoomLink={copyRoomLink}
          />

          <Board
            roomData={roomData}
            renderVisuals={() => (
              <AnimatePresence>
                {roomData?.players.map((p) => {
                  const pos = visualPositions[p.id] || p.position;
                  const coords = getPositionCoords(pos);
                  return (
                    <motion.div
                      key={p.id}
                      className="player-token"
                      style={{ backgroundColor: p.color }}
                      initial={false}
                      animate={{ left: coords.x, top: coords.y }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <User size={16} />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          />

          <DiceOverlay
            isRolling={isRolling}
            hasLanded={hasLanded}
            rollingValue={rollingValue}
            rollingPlayer={rollingPlayer}
          />

          <LoveCard currentCard={currentCard} setCurrentCard={setCurrentCard} />

          <WinnerOverlay winner={winner} />
        </div>
      )}
    </>
  );
}

export default App;
