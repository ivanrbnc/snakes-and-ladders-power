import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContainer = ({ toasts }) => {
    return (
        <div className="toast-container">
            <AnimatePresence>
                {toasts.map(t => (
                    <motion.div
                        key={t.id}
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        className="toast"
                    >
                        {t.msg}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
