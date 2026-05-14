import React, { useEffect, useRef, useState } from 'react';

const GameChat = ({ messages, onSend, myPlayerId, players, isMobile }) => {
    const bottomRef = useRef(null);
    const [text, setText] = useState('');

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const submit = () => {
        const trimmed = text.trim();
        if (!trimmed) return;
        onSend(trimmed);
        setText('');
    };

    const myPlayer = players?.find(p => p.id === myPlayerId);

    return (
        <div className={isMobile ? '' : 'glass-panel right-panel-section'} style={{ padding: isMobile ? '0' : '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, height: '100%', minHeight: 0, boxSizing: 'border-box' }}>
            <h3 style={{ marginBottom: '0', fontSize: '1.2rem', flexShrink: 0 }}>Chat</h3>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', minHeight: 0, overflow: 'hidden auto' }}>
                {messages.length === 0 && (
                    <span style={{ fontSize: '0.9rem', color: '#ff4d6d', opacity: 0.7, fontStyle: 'italic', textAlign: 'center', padding: '10px 0', display: 'block' }}>Say something! 💬</span>
                )}
                {messages.map((msg) => {
                    const isMe = msg.playerId === myPlayerId;
                    return (
                        <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                            <span style={{ fontSize: '0.65rem', color: msg.color || '#aaa', fontWeight: 700, marginBottom: '2px' }}>
                                {isMe ? 'You' : msg.name}
                            </span>
                            <div style={{
                                background: isMe ? (myPlayer?.color || '#ff4d6d') : '#f0f0f0',
                                color: isMe ? 'white' : '#333',
                                borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                padding: '6px 10px',
                                fontSize: '0.82rem',
                                maxWidth: '90%',
                                wordBreak: 'break-word',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                            }}>
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
                <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submit()}
                    placeholder="Type a message..."
                    maxLength={200}
                    style={{
                        flex: 1, minWidth: 0, padding: '7px 10px', borderRadius: '10px',
                        border: '1px solid #eee', fontSize: '0.82rem',
                        outline: 'none', fontFamily: "'Outfit', sans-serif",
                    }}
                />
                <button
                    onClick={submit}
                    style={{
                        flexShrink: 0, width: '34px', height: '34px', borderRadius: '50%',
                        background: '#ff4d6d', color: 'white', border: 'none',
                        fontSize: '0.9rem', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        paddingLeft: '2px', paddingBottom: '1px',
                        boxShadow: '0 2px 6px rgba(255,77,109,0.4)',
                    }}
                >
                    ➤
                </button>
            </div>
        </div>
    );
};

export default GameChat;
