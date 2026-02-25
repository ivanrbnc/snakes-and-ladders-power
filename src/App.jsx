import React from 'react';
import { AnimatePresence } from 'framer-motion';

// Hooks
import { useGameLogic } from './hooks/useGameLogic';

// Sub-components
import Lobby from './components/lobby/Lobby';
import Board from './components/game/Board';
import DiceOverlay from './components/game/DiceOverlay';
import GamePanel from './components/game/GamePanel';
import ToastContainer from './components/common/Toast';
import LoveCard from './components/game/LoveCard';
import WinnerOverlay from './components/game/WinnerOverlay';
import PowerInventory from './components/game/PowerInventory';
import PowerFoundModal from './components/game/modals/PowerFoundModal';
import TargetSelectionModal from './components/game/modals/TargetSelectionModal';
import PlayerToken from './components/game/PlayerToken';
import DevTools from './components/game/DevTools';

// Constants
import { MAX_POWER_CARDS } from './configuration/gameConstants';
import { getPositionCoords } from './utils/gameUtils';

function App() {
  const {
    roomId, setRoomId, playerName, setPlayerName, inRoom, roomData, isRolling, rollingPlayer,
    currentCard, setCurrentCard, winner, roomStatus, setRoomStatus, visualPositions, toasts,
    maxPlayersInput, setMaxPlayersInput, passwordInput, setPasswordInput,
    enteredPassword, setEnteredPassword, showPasswordPrompt, setShowPasswordPrompt,
    rollingValue, hasLanded, pendingPowerCard, setPendingPowerCard,
    targetSelection, setTargetSelection, hasRolledThisTurn, myPlayerId,
    joinRoom, rollDice, handlePowerCardChoice, onUseCardFromInventory,
    executePowerCard, copyRoomLink, setDebugRoll
  } = useGameLogic();

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
            setDebugRoll={setDebugRoll}
          />

          <Board
            roomData={roomData}
            renderVisuals={() => (
              <AnimatePresence>
                {roomData?.players.map((p) => (
                  <PlayerToken
                    key={p.id}
                    player={p}
                    pos={visualPositions[p.id] || p.position}
                    getPositionCoords={getPositionCoords}
                  />
                ))}
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

          <PowerInventory
            players={roomData?.players || []}
            myPlayerId={myPlayerId.current}
            onUseCard={onUseCardFromInventory}
            isMyTurn={roomData?.players && roomData.players[roomData.turn]?.id === myPlayerId.current}
            disabled={!!pendingPowerCard || !!targetSelection || hasRolledThisTurn}
          />

          <AnimatePresence>
            <PowerFoundModal
              pendingPowerCard={pendingPowerCard}
              players={roomData?.players}
              myPlayerId={myPlayerId.current}
              MAX_POWER_CARDS={MAX_POWER_CARDS}
              onChoice={handlePowerCardChoice}
              onDiscard={() => setPendingPowerCard(null)}
            />

            <TargetSelectionModal
              targetSelection={targetSelection}
              players={roomData?.players}
              myPlayerId={myPlayerId.current}
              onSelect={executePowerCard}
              onCancel={() => setTargetSelection(null)}
            />
          </AnimatePresence>

          <WinnerOverlay winner={winner} />

          {import.meta.env.VITE_ENVIRONMENT === 'DEV' && <DevTools setDebugRoll={setDebugRoll} />}
        </div>
      )}
    </>
  );
}

export default App;
