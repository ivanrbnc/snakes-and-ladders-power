import React, { useState, useEffect, useRef, useCallback } from 'react';

const API_KEY = import.meta.env.VITE_KLIPY_API_KEY;
const BASE_URL = `https://api.klipy.com/api/v1/${API_KEY}/gifs`;

const fetchGifs = async (query) => {
    const url = query
        ? `${BASE_URL}/search?q=${encodeURIComponent(query)}&per_page=20`
        : `${BASE_URL}/trending?per_page=20`;
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
    const json = await res.json();
    return json?.data?.data || [];
};

const GifPicker = ({ onSelect, onClose }) => {
    const [query, setQuery] = useState('');
    const [gifs, setGifs] = useState([]);
    const [loading, setLoading] = useState(true);
    const debounceRef = useRef(null);
    const inputRef = useRef(null);

    const load = useCallback(async (q) => {
        setLoading(true);
        try {
            const results = await fetchGifs(q);
            setGifs(results);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(''); inputRef.current?.focus(); }, []);

    const handleSearch = (e) => {
        const val = e.target.value;
        setQuery(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => load(val.trim()), 500);
    };

    return (
        <div style={{
            background: 'white', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,77,109,0.2)',
            display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden',
        }}>
            {/* Search bar */}
            <div style={{ padding: '8px 10px', borderBottom: '1px solid #f0f0f0', flexShrink: 0, display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                    ref={inputRef}
                    value={query}
                    onChange={handleSearch}
                    placeholder="Search GIFs..."
                    style={{
                        flex: 1, border: '1px solid #eee', borderRadius: '8px',
                        padding: '5px 8px', fontSize: '0.8rem', outline: 'none',
                        fontFamily: "'Outfit', sans-serif",
                    }}
                />
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#aaa', lineHeight: 1 }}
                >✕</button>
            </div>

            {/* GIF grid */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#aaa', fontSize: '0.85rem' }}>Loading...</div>
                ) : gifs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#aaa', fontSize: '0.85rem' }}>No GIFs found</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                        {gifs.map((gif) => {
                            const thumb = gif.file?.xs?.jpg?.url || gif.file?.xs?.gif?.url;
                            const full = gif.file?.sm?.gif?.url || gif.file?.md?.gif?.url;
                            if (!thumb || !full) return null;
                            return (
                                <img
                                    key={gif.id}
                                    src={thumb}
                                    alt={gif.title}
                                    onClick={() => onSelect({ gifUrl: full, gifThumb: thumb, gifTitle: gif.title })}
                                    style={{
                                        width: '100%', aspectRatio: '1', objectFit: 'cover',
                                        borderRadius: '8px', cursor: 'pointer',
                                        transition: 'opacity 0.15s',
                                    }}
                                    onMouseEnter={e => e.target.style.opacity = '0.8'}
                                    onMouseLeave={e => e.target.style.opacity = '1'}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Attribution */}
            <div style={{ padding: '4px 8px', fontSize: '0.6rem', color: '#ccc', textAlign: 'right', flexShrink: 0 }}>
                Powered by Klipy
            </div>
        </div>
    );
};

export default GifPicker;
