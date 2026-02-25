import React, { useState, useEffect } from 'react';
import { Monitor, Laptop, Tablet, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const ResponsiveBlocker = ({ children }) => {
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const checkSize = () => {
            setIsSmallScreen(window.innerWidth < 1024);
        };

        checkSize();
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, []);

    if (!isSmallScreen) return children;

    return (
        <div className="responsive-blocker">
            <motion.div
                className="blocker-content glass-panel"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="icon-row">
                    <Smartphone className="device-icon mobile" size={32} />
                    <div className="divider"></div>
                    <div className="allowed-devices">
                        <Tablet className="device-icon" size={32} />
                        <Laptop className="device-icon" size={40} />
                        <Monitor className="device-icon" size={48} />
                    </div>
                </div>

                <h1>Desktop Only</h1>
                <p>
                    This game is designed for a premium experience on <strong>Tablets, Laptops, or Desktops</strong>.
                </p>
                <div className="reason">
                    The game board and side panels require a larger screen to play comfortably.
                </div>

                <p className="footer-msg">Please switch to a larger device to join the fun! ❤️</p>
            </motion.div>

            <style jsx>{`
                .responsive-blocker {
                    position: fixed;
                    inset: 0;
                    background: radial-gradient(circle at center, #fff0f3, #ffe3e0);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    padding: 20px;
                    text-align: center;
                }
                .blocker-content {
                    max-width: 400px;
                    padding: 40px 30px;
                    background: white;
                    border: 2px solid #ff4d6d;
                }
                .icon-row {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .device-icon {
                    color: #ff4d6d;
                    opacity: 0.8;
                }
                .device-icon.mobile {
                    color: #ccc;
                    position: relative;
                }
                .device-icon.mobile::after {
                    content: '✕';
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    font-size: 20px;
                    color: #ff4d6d;
                    font-weight: bold;
                }
                .divider {
                    width: 2px;
                    height: 40px;
                    background: #eee;
                }
                .allowed-devices {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                h1 {
                    font-family: 'Pacifico', cursive;
                    color: #ff4d6d;
                    margin-bottom: 20px;
                }
                p {
                    margin-bottom: 15px;
                    line-height: 1.6;
                    color: #590d22;
                }
                .reason {
                    font-size: 0.85rem;
                    background: rgba(255, 77, 109, 0.05);
                    padding: 15px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                    border: 1px dashed rgba(255, 77, 109, 0.2);
                }
                .footer-msg {
                    font-weight: 800;
                    margin-top: 20px;
                }
            `}</style>
        </div>
    );
};

export default ResponsiveBlocker;
