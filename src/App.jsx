import React, { useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { User } from 'lucide-react';

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

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
const socket = io(SOCKET_URL);

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

  // Check room status when roomId or inRoom changes
  useEffect(() => {
    if (roomId && !inRoom) {
      socket.emit('check_room', { roomId });
    }
  }, [roomId, inRoom]);

  const addToast = useCallback((msg) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    roomDataRef.current = roomData;
  }, [roomData]);

  useEffect(() => {
    visualPositionsRef.current = visualPositions;
  }, [visualPositions]);

  useEffect(() => {
    socket.on('room_status', (data) => {
      setRoomStatus(data);
    });

    socket.on('room_status_update', (data) => {
      if (data.roomId === roomId) {
        setRoomStatus(prev => ({ ...prev, ...data, exists: true }));
      }
    });

    socket.on('room_update', (data) => {
      setRoomData(data);
      setRoomStatus({ count: data.players.length, waitingPlayer: data.players[0]?.name });

      // Securely enter room only if server confirms our ID is in the player list
      if (data.players.some(p => p.id === socket.id)) {
        setInRoom(true);
      }

      // Initialize visual positions if not set
      setVisualPositions(prev => {
        const next = { ...prev };
        data.players.forEach(p => {
          if (next[p.id] === undefined) next[p.id] = p.position;
        });
        return next;
      });

      if (data.players.length >= 2) {
        addToast("Game is active! Good luck! ❤️");
      }
    });

    socket.on('dice_rolling', ({ playerId, name, diceValue }) => {
      const resolvedName = name || roomDataRef.current?.players.find(p => p.id === playerId)?.name || 'Someone';
      setRollingPlayer(resolvedName);
      setIsRolling(true);
      setHasLanded(false);

      // Animate the dice rolling
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
    });

    socket.on('dice_rolled', async ({ diceValue, playerId, name, newPosition, isSpecial, specialType, nextTurn, loveCard }) => {
      setDiceRoll(diceValue);
      setRollingValue(diceValue);
      setRollingPlayer(name || roomDataRef.current?.players.find(p => p.id === playerId)?.name || 'Someone');
      setHasLanded(true);

      // Pause for exactly 1 second while showing the final number (stopped)
      await new Promise(r => setTimeout(r, 1000));

      setIsRolling(false);
      setHasLanded(false);

      const resolvedName = name || roomDataRef.current?.players.find(p => p.id === playerId)?.name || 'Someone';

      // Step-by-step movement - Use Ref to avoid stale closure
      let currentPos = visualPositionsRef.current[playerId] || 1;
      const steps = diceValue;

      for (let i = 1; i <= steps; i++) {
        const nextStep = currentPos + i;
        if (nextStep > 100) break;
        setVisualPositions(prev => ({ ...prev, [playerId]: nextStep }));
        await new Promise(r => setTimeout(r, 300));
      }

      // If special jump (snake/ladder)
      if (isSpecial) {
        await new Promise(r => setTimeout(r, 500));
        setVisualPositions(prev => ({ ...prev, [playerId]: newPosition }));
      }

      let msg = `${resolvedName} rolled a ${diceValue}!`;
      if (isSpecial) {
        msg += ` Moving to ${newPosition} via ${specialType}!`;
        addToast(msg);
      } else {
        addToast(msg);
      }

      setMessage(msg);

      setRoomData(prev => {
        const newPlayers = prev.players.map(p =>
          p.id === playerId ? { ...p, position: newPosition } : p
        );
        return { ...prev, players: newPlayers, turn: nextTurn };
      });

      // Handle love card
      if (loveCard !== null && loveCard !== undefined) {
        setTimeout(() => {
          setCurrentCard(LDR_CARDS[loveCard]);
        }, 1000);
      }
    });

    socket.on('game_over', ({ winner }) => {
      setWinner(winner);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff4d6d', '#ffb3c1', '#ffffff']
      });
    });

    socket.on('error', (err) => addToast(`Error: ${err}`));

    return () => {
      socket.off('room_update');
      socket.off('dice_rolled');
      socket.off('dice_rolling');
      socket.off('game_over');
      socket.off('error');
    };
  }, [roomId]); // Added roomId to deps to ensure status updates work

  const joinRoom = () => {
    if (!playerName.trim()) return addToast("Please enter your name!");

    if (roomStatus.exists && roomStatus.hasPassword && !enteredPassword) {
      return addToast("This room is private. Please enter the password!");
    }

    if (roomStatus.exists && roomStatus.hasPassword && enteredPassword != passwordInput) {
      return addToast("Incorrect password!");
    }

    if (roomId) {
      socket.emit('join_room', {
        roomId,
        name: playerName,
        maxPlayers: maxPlayersInput,
        password: passwordInput,
        enteredPassword: enteredPassword
      });

      const url = new URL(window.location);
      url.searchParams.set('room', roomId);
      window.history.pushState({}, '', url);
    }
  };

  const rollDice = () => {
    if (roomData?.players[roomData.turn]?.id !== socket.id) return;
    socket.emit('roll_dice', { roomId });
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
            socket={socket}
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
