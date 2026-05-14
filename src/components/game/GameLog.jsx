import { useEffect, useRef } from 'react';

const GameLog = ({ logs, height }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="glass-panel right-panel-section" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', height: height === 'auto' ? undefined : (height || '100%'), minHeight: height === 'auto' ? undefined : '200px', flexShrink: height && height !== 'auto' ? 0 : undefined }}>
            <h3 style={{ marginBottom: '8px', fontSize: '1.2rem', flexShrink: 0 }}>Game Log</h3>
            <div style={{ overflowY: height === 'auto' ? 'visible' : 'auto', flex: height === 'auto' ? undefined : 1, display: 'flex', flexDirection: 'column', gap: '4px', minHeight: 0, paddingRight: '4px', marginRight: '-4px' }}>
                {logs.length === 0 && (
                    <span style={{ fontSize: '0.9rem', color: '#ff4d6d', opacity: 0.7, fontStyle: 'italic', textAlign: 'center', padding: '10px 0', display: 'block' }}>No events yet...</span>
                )}
                {logs.map((log) => (
                    <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <div style={{
                            width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                            backgroundColor: log.color || '#ccc', marginTop: '4px',
                        }} />
                        <span style={{ fontSize: '0.82rem', color: '#444', lineHeight: 1.4, fontFamily: 'inherit' }}>{log.msg}</span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default GameLog;
