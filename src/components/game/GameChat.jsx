import React, { useEffect, useRef, useState } from 'react';
import GifPicker from './GifPicker';

const GameChat = ({ messages, onSend, myPlayerId, players, isMobile }) => {
    const bottomRef = useRef(null);
    const [text, setText] = useState('');
    const [showGifPicker, setShowGifPicker] = useState(false);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const submit = () => {
        const trimmed = text.trim();
        if (!trimmed) return;
        onSend({ text: trimmed });
        setText('');
    };

    const handleGifSelect = (gif) => {
        onSend({ gifUrl: gif.gifUrl, gifThumb: gif.gifThumb, gifTitle: gif.gifTitle });
        setShowGifPicker(false);
    };

    const myPlayer = players?.find(p => p.id === myPlayerId);

    return (
        <div className={isMobile ? '' : 'glass-panel right-panel-section'} style={{ padding: isMobile ? '0' : '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, height: '100%', minHeight: 0, boxSizing: 'border-box' }}>
            <h3 style={{ marginBottom: '0', fontSize: '1.2rem', flexShrink: 0 }}>Chat</h3>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', minHeight: 0, overflow: 'hidden auto', paddingRight: '4px', marginRight: '-4px' }}>
                {messages.length === 0 && (
                    <span style={{ fontSize: '0.9rem', color: '#ff4d6d', fontStyle: 'italic', fontWeight: 600, textAlign: 'center', padding: '10px 0', display: 'block' }}>Say something! 💬</span>
                )}
                {messages.map((msg) => {
                    const isMe = msg.playerId === myPlayerId;
                    return (
                        <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                            <span style={{ fontSize: '0.65rem', color: msg.color || '#aaa', fontWeight: 700, marginBottom: '2px' }}>
                                {isMe ? 'You' : msg.name}
                            </span>
                            {msg.gifUrl ? (
                                <img
                                    src={msg.gifUrl}
                                    alt={msg.gifTitle || 'GIF'}
                                    style={{ maxWidth: '160px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}
                                />
                            ) : (
                                <div style={{
                                    background: isMe ? (myPlayer?.color || '#ff4d6d') : '#f0f0f0',
                                    color: isMe ? 'white' : '#333',
                                    borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                    padding: '6px 10px', fontSize: '0.82rem',
                                    maxWidth: '90%', wordBreak: 'break-word',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                }}>
                                    {msg.text}
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* GIF picker — modal on mobile, inline on desktop */}
            {showGifPicker && isMobile && (
                <div
                    onClick={() => setShowGifPicker(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 4000,
                        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'flex-end',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{ width: '100%', height: '60dvh', display: 'flex', flexDirection: 'column' }}
                    >
                        <GifPicker onSelect={handleGifSelect} onClose={() => setShowGifPicker(false)} />
                    </div>
                </div>
            )}
            {showGifPicker && !isMobile && (
                <div style={{ flexShrink: 0, maxHeight: '260px', display: 'flex', flexDirection: 'column' }}>
                    <GifPicker onSelect={handleGifSelect} onClose={() => setShowGifPicker(false)} />
                </div>
            )}

            {/* Input row */}
            <div style={{ flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                        onClick={() => setShowGifPicker(v => !v)}
                        title="Send a GIF"
                        style={{
                            flexShrink: 0, width: '34px', height: '34px', borderRadius: '50%',
                            background: showGifPicker ? '#ff4d6d' : 'rgba(255,77,109,0.1)',
                            color: showGifPicker ? 'white' : '#ff4d6d',
                            border: 'none', fontSize: '0.75rem', fontWeight: 800,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: "'Outfit', sans-serif", transition: 'all 0.15s',
                        }}
                    >
                        GIF
                    </button>
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
        </div>
    );
};

export default GameChat;
