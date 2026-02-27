import React, { useRef, useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { motion } from 'framer-motion';

const CameraCapture = ({ onCapture, onCancel }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [hasCamera, setHasCamera] = useState(true);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setHasCamera(false);
            }
        };

        startCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        const size = Math.min(video.videoWidth, video.videoHeight);
        const xOffset = (video.videoWidth - size) / 2;
        const yOffset = (video.videoHeight - size) / 2;

        canvas.width = 120;
        canvas.height = 120;

        // Draw centered square crop and resize
        context.drawImage(video, xOffset, yOffset, size, size, 0, 0, 120, 120);

        // Convert to webp to save space
        const dataUrl = canvas.toDataURL('image/webp', 0.8);
        onCapture(dataUrl);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', zIndex: 1000
            }}
        >
            <div style={{ background: '#fff', padding: '20px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ marginBottom: '15px', color: '#ff4d6d' }}>Take a Photo</h3>

                {!hasCamera ? (
                    <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                        <p>Camera access denied or unavailable.</p>
                        <button type="button" onClick={onCancel} className="btn" style={{ marginTop: '20px' }}>Close</button>
                    </div>
                ) : (
                    <>
                        <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden', border: '4px solid #ff4d6d', backgroundColor: '#000' }}>
                            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                            <button type="button" onClick={onCancel} className="btn" style={{ background: '#eee', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <X size={20} /> Cancel
                            </button>
                            <button type="button" onClick={capturePhoto} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Camera size={20} /> Capture
                            </button>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default CameraCapture;
