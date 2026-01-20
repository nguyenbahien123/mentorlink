import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, options = {}) => {
        // Normalize options: support both string shorthand ('success' | 'error' | 'warning' | 'info' | 'danger')
        const opts = typeof options === 'string' ? { variant: options } : (options || {});
        let variant = opts.variant || opts.type || 'success';
        // Map common alias
        if (variant === 'error') variant = 'danger';
        const delay = typeof opts.delay === 'number' ? opts.delay : 3000;

        const id = Date.now() + Math.random();
        const toast = { id, message, variant, delay };
        setToasts((t) => [...t, toast]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((t) => t.filter(x => x.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Offset the container from top so it won't be hidden behind header */}
            <ToastContainer position="top-end" className="p-3" style={{ top: '72px' }}>
                {toasts.map((t) => (
                    <Toast key={t.id} onClose={() => removeToast(t.id)} bg={t.variant} delay={t.delay} autohide>
                        <Toast.Body className={t.variant !== 'light' ? 'text-white' : ''}>{t.message}</Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};

export default ToastContext;
