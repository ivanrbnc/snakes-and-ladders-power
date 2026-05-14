import React, { useState } from 'react';
import { Users, Zap, ScrollText, MessageCircle } from 'lucide-react';

const TABS = [
    { id: 'players', label: 'Players', icon: Users },
    { id: 'cards',   label: 'Cards',   icon: Zap },
    { id: 'log',     label: 'Log',     icon: ScrollText },
    { id: 'chat',    label: 'Chat',    icon: MessageCircle },
];

const MobileLayout = ({ board, gamePanel, powerInventory, gameLog, gameChat, rollButton, onCopyLink }) => {
    const [activeTab, setActiveTab] = useState('players');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
            {/* Board */}
            <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'min(70vw, 70vh)', overflow: 'hidden' }}>
                {board}
            </div>

            {/* Tab bar */}
            <div style={{
                display: 'flex', flexShrink: 0,
                borderTop: '1px solid rgba(255,77,109,0.15)',
                borderBottom: '1px solid rgba(255,77,109,0.15)',
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(10px)',
            }}>
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        style={{
                            flex: 1, padding: '8px 0', border: 'none', background: 'none',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                            cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                            color: activeTab === id ? '#ff4d6d' : '#aaa',
                            fontWeight: activeTab === id ? 800 : 400,
                            fontSize: '0.65rem',
                            borderBottom: activeTab === id ? '2px solid #ff4d6d' : '2px solid transparent',
                            transition: 'all 0.15s',
                        }}
                    >
                        <Icon size={18} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Panel content — flex column, overflow hidden so each tab controls its own scroll */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                {/* Scrollable tabs */}
                {activeTab !== 'chat' && (
                    <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px 4px', minHeight: 0 }}>
                        {activeTab === 'players' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                {gamePanel}
                                <button
                                    className="btn love-btn"
                                    onClick={onCopyLink}
                                    style={{ marginTop: '2px', background: 'rgba(255,77,109,0.1)', color: '#ff4d6d', fontSize: '0.88rem', padding: '8px 20px', width: 'fit-content' }}
                                >
                                    Copy Invitation Link
                                </button>
                            </div>
                        )}
                        {activeTab === 'cards' && powerInventory}
                        {activeTab === 'log'   && gameLog}
                    </div>
                )}
                {/* Chat tab — fills height so input is always pinned at bottom */}
                {activeTab === 'chat' && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '10px 12px' }}>
                        {gameChat}
                    </div>
                )}
            </div>

            {/* Roll button */}
            <div style={{
                flexShrink: 0, padding: '6px 16px 12px',
                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
                borderTop: '1px solid rgba(255,77,109,0.1)',
            }}>
                {rollButton}
            </div>
        </div>
    );
};

export default MobileLayout;
