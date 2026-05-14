import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Dice5 } from 'lucide-react';

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
import PowerCardFlash from './components/game/PowerCardFlash';
import PowerCardOverlay from './components/game/PowerCardOverlay';
import PowerFoundModal from './components/game/PowerFoundModal';
import TargetSelectionModal from './components/game/TargetSelectionModal';
import PlayerToken from './components/game/PlayerToken';
import DevTools from './components/game/DevTools';
import GameLog from './components/game/GameLog';
import GameChat from './components/game/GameChat';
import MobileLayout from './components/game/MobileLayout';

// Constants
import { MAX_POWER_CARDS } from './configuration/gameConstants';
import { getPositionCoords } from './utils/gameUtils';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

function App() {
  const isMobile = useIsMobile();

  const {
    roomId, setRoomId, playerName, setPlayerName, playerAvatar, setPlayerAvatar, playerColor, setPlayerColor, inRoom, roomData, isRolling, rollingPlayer,
    currentCard, setCurrentCard, winner, roomStatus, setRoomStatus, visualPositions, toasts,
    maxPlayersInput, setMaxPlayersInput, passwordInput, setPasswordInput,
    enteredPassword, setEnteredPassword, showPasswordPrompt, setShowPasswordPrompt,
    rollingValue, hasLanded, pendingPowerCard, setPendingPowerCard,
    targetSelection, setTargetSelection, hasRolledThisTurn, myPlayerId,
    joinRoom, rollDice, handlePowerCardChoice, onUseCardFromInventory,
    executePowerCard, copyRoomLink, setDebugRoll, setDebugTeleport, flashCard, powerEvent, isLuckyRoll, activeJump, logs, chatMessages, sendChat
  } = useGameLogic();

  useEffect(() => {
    if (inRoom && isMobile) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [inRoom, isMobile]);

  const tokens = (
    <AnimatePresence>
      {roomData?.players.map((p) => (
        <PlayerToken
          key={p.id}
          player={p}
          pos={visualPositions[p.id] || p.position}
          getPositionCoords={getPositionCoords}
          isActive={roomData?.players[roomData.turn]?.id === p.id}
          powerEvent={powerEvent}
        />
      ))}
    </AnimatePresence>
  );

  const modals = (
    <>
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
      <PowerCardFlash cardId={flashCard} />
      <PowerCardOverlay event={powerEvent} />
      <WinnerOverlay winner={winner} players={roomData?.players} />
    </>
  );

  const rollBtn = (
    <button
      className="btn"
      onClick={rollDice}
      disabled={roomData?.players.length < (roomData?.maxPlayers || 2) || roomData?.players[roomData.turn]?.id !== myPlayerId.current || isRolling}
      style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
    >
      <Dice5 size={20} style={{ marginRight: '8px' }} />
      {roomData?.players.length < (roomData?.maxPlayers || 2)
        ? `Waiting for players (${roomData?.players.length}/${roomData?.maxPlayers})...`
        : 'Roll Dice'}
    </button>
  );

  return (
    <>
      <ToastContainer toasts={toasts} />

      {!inRoom ? (
        <Lobby
          roomStatus={roomStatus}
          playerName={playerName}
          setPlayerName={setPlayerName}
          playerAvatar={playerAvatar}
          setPlayerAvatar={setPlayerAvatar}
          playerColor={playerColor}
          setPlayerColor={setPlayerColor}
          takenColors={roomStatus.takenColors || []}
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
      ) : isMobile ? (
        <>
          <MobileLayout
            board={
              <Board
                roomData={roomData}
                activeJump={activeJump}
                renderVisuals={() => tokens}
                isMobile
              />
            }
            gamePanel={
              <GamePanel
                roomData={roomData}
                myPlayerId={myPlayerId.current}
                rollDice={rollDice}
                isRolling={isRolling}
                copyRoomLink={copyRoomLink}
                hideRollButton
                hideCopyLink
                isMobile
              />
            }
            onCopyLink={copyRoomLink}
            powerInventory={
              <PowerInventory
                players={roomData?.players || []}
                myPlayerId={myPlayerId.current}
                onUseCard={onUseCardFromInventory}
                isMyTurn={roomData?.players && roomData.players[roomData.turn]?.id === myPlayerId.current}
                disabled={!!pendingPowerCard || !!targetSelection || hasRolledThisTurn}
                isMobile
              />
            }
            gameLog={<GameLog logs={logs} height="auto" isMobile />}
            gameChat={
              <GameChat
                messages={chatMessages}
                onSend={sendChat}
                myPlayerId={myPlayerId.current}
                players={roomData?.players}
                isMobile
              />
            }
            rollButton={rollBtn}
          />
          <DiceOverlay isRolling={isRolling} hasLanded={hasLanded} rollingValue={rollingValue} rollingPlayer={rollingPlayer} isLucky={isLuckyRoll} />
          <LoveCard currentCard={currentCard} setCurrentCard={setCurrentCard} />
          {modals}
        </>
      ) : (
        <div className="game-container">
          <h1 className="title">Snakes & Ladders</h1>

          <div className="side-panel-container">
            <GamePanel
              roomData={roomData}
              roomId={roomId}
              myPlayerId={myPlayerId.current}
              rollDice={rollDice}
              isRolling={isRolling}
              copyRoomLink={copyRoomLink}
            />
            <PowerInventory
              players={roomData?.players || []}
              myPlayerId={myPlayerId.current}
              onUseCard={onUseCardFromInventory}
              isMyTurn={roomData?.players && roomData.players[roomData.turn]?.id === myPlayerId.current}
              disabled={!!pendingPowerCard || !!targetSelection || hasRolledThisTurn}
            />
          </div>

          <Board
            roomData={roomData}
            activeJump={activeJump}
            renderVisuals={() => tokens}
          />

          <DiceOverlay isRolling={isRolling} hasLanded={hasLanded} rollingValue={rollingValue} rollingPlayer={rollingPlayer} isLucky={isLuckyRoll} />
          <LoveCard currentCard={currentCard} setCurrentCard={setCurrentCard} />
          {modals}

          <div className="right-panel-container" style={{ display: 'flex', flexDirection: 'column' }}>
            <GameLog logs={logs} height="220px" />
            <GameChat
              messages={chatMessages}
              onSend={sendChat}
              myPlayerId={myPlayerId.current}
              players={roomData?.players}
            />
          </div>

          {import.meta.env.VITE_ENVIRONMENT === 'DEV' && <DevTools setDebugRoll={setDebugRoll} setDebugTeleport={setDebugTeleport} />}
        </div>
      )}
    </>
  );
}

export default App;
