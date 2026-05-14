import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';

const DevTools = ({ setDebugRoll, setDebugTeleport }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [teleportValue, setTeleportValue] = useState('');

    const handleTeleport = () => {
        const val = parseInt(teleportValue);
        if (val >= 1 && val <= 99) {
            setDebugTeleport(val);
            setTeleportValue('');
        }
    };

    return (
        <div className="dev-tools-container">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="dev-panel glass-panel"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    >
                        <p className="dev-title">Force Next Roll</p>
                        <div className="dev-grid">
                            {[1, 2, 3, 4, 5, 6].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setDebugRoll(num)}
                                    className="dev-btn"
                                >
                                    {num}
                                </button>
                            ))}
                        </div>

                        <p className="dev-title" style={{ marginTop: '14px' }}>Teleport to Tile</p>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <input
                                type="number"
                                min="1"
                                max="99"
                                value={teleportValue}
                                onChange={e => {
                                    const v = e.target.value.replace(/\D/g, '');
                                    if (v === '') { setTeleportValue(''); return; }
                                    setTeleportValue(String(Math.min(99, Math.max(1, parseInt(v)))));
                                }}
                                onKeyDown={e => e.key === 'Enter' && handleTeleport()}
                                placeholder="1–99"
                                className="dev-teleport-input"
                            />
                            <button onClick={handleTeleport} className="dev-btn dev-btn-go">Go</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                className={`dev-toggle ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Developer Tools"
            >
                <Settings size={20} />
            </button>

            <style jsx>{`
                .dev-tools-container {
                    position: fixed;
                    left: 20px;
                    bottom: 20px;
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }
                @media (max-width: 1023px) {
                    .dev-tools-container { display: none; }
                }
                .dev-panel {
                    padding: 15px;
                    width: 180px;
                    background: rgba(255, 255, 255, 0.9);
                    border: 1px solid #ddd;
                }
                .dev-title {
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    margin-bottom: 10px;
                    color: #888;
                    letter-spacing: 0.5px;
                }
                .dev-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                }
                .dev-btn {
                    padding: 8px;
                    border-radius: 8px;
                    border: 1px solid #eee;
                    background: white;
                    font-size: 0.85rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .dev-btn:hover {
                    background: #ff4d6d;
                    color: white;
                    border-color: #ff4d6d;
                }
                .dev-btn-go {
                    padding: 8px 12px;
                    flex-shrink: 0;
                }
                .dev-teleport-input {
                    flex: 1;
                    width: 0;
                    padding: 8px;
                    border-radius: 8px;
                    border: 1px solid #eee;
                    font-size: 0.85rem;
                    font-weight: 700;
                    outline: none;
                    text-align: center;
                }
                .dev-teleport-input:focus {
                    border-color: #ff4d6d;
                }
                .dev-toggle {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    border: none;
                    background: white;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #888;
                    transition: all 0.3s;
                }
                .dev-toggle:hover {
                    color: #ff4d6d;
                    transform: rotate(45deg);
                }
                .dev-toggle.active {
                    background: #ff4d6d;
                    color: white;
                }
            `}</style>
        </div>
    );
};

export default DevTools;
