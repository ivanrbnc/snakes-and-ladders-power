import React, { useState, useEffect, useRef } from 'react';
import { Users, Zap, ScrollText, MessageCircle } from 'lucide-react';

const TABS = [
    { id: 'players', label: 'Players', icon: Users },
    { id: 'cards',   label: 'Cards',   icon: Zap },
    { id: 'log',     label: 'Log',     icon: ScrollText },
    { id: 'chat',    label: 'Chat',    icon: MessageCircle },
];

const MobileLayout = ({ board, gamePanel, powerInventory, gameLog, gameChat, rollButton, onCopyLink, chatMessages }) => {
    const [activeTab, setActiveTab] = useState('players');
    const [unreadChat, setUnreadChat] = useState(0);
    const prevMessageCount = useRef(0);

    useEffect(() => {
        const count = chatMessages?.length || 0;
        if (activeTab !== 'chat' && count > prevMessageCount.current) {
            setUnreadChat(prev => prev + (count - prevMessageCount.current));
        }
        prevMessageCount.current = count;
    }, [chatMessages, activeTab]);

    const handleTabClick = (id) => {
        setActiveTab(id);
        if (id === 'chat') setUnreadChat(0);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden', position: 'fixed', inset: 0 }}>
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
                        onClick={() => handleTabClick(id)}
                        style={{
                            flex: 1, padding: '6px 0', border: 'none', background: 'none',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                            cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                            color: activeTab === id ? '#ff4d6d' : '#aaa',
                            fontWeight: activeTab === id ? 800 : 400,
                            fontSize: '0.65rem',
                            borderBottom: activeTab === id ? '2px solid #ff4d6d' : '2px solid transparent',
                            transition: 'all 0.15s',
                            position: 'relative',
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <Icon size={14} />
                            {id === 'chat' && unreadChat > 0 && (
                                <span style={{
                                    position: 'absolute', top: '-3px', right: '-5px',
                                    background: '#ff4d6d',
                                    borderRadius: '50%',
                                    width: '8px', height: '8px',
                                }} />
                            )}
                        </div>
                        {label}
                    </button>
                ))}
            </div>

            {/* Panel content */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'rgba(255,240,243,0.5)' }}>
                {/* Scrollable tabs */}
                {activeTab !== 'chat' && (
                    <div style={{ flex: 1, overflowY: activeTab === 'players' ? 'hidden' : 'auto', padding: '10px 12px 4px', minHeight: 0 }}>
                        {activeTab === 'players' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', height: 'fit-content' }}>
                                {gamePanel}
                                <button
                                    className="btn love-btn"
                                    onClick={onCopyLink}
                                    style={{ marginTop: '14px', background: 'transparent', color: 'var(--primary)', border: '1.5px solid var(--primary)', fontSize: '0.88rem', padding: '8px 20px', width: 'fit-content' }}
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
                background: 'rgba(255,240,243,0.85)', backdropFilter: 'blur(10px)',
                borderTop: '1px solid rgba(255,77,109,0.15)',
            }}>
                {rollButton}
            </div>
        </div>
    );
};

export default MobileLayout;
