import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((a, b = {}) => {
        // Backwards-compatible: support both (message, variant/options) and (variant, message)
        const knownVariants = ['success', 'error', 'warning', 'info', 'danger', 'light'];

        let message;
        let opts = {};

        if (typeof a === 'string' && knownVariants.includes(a)) {
            // called as (variant, messageOrOptions)
            if (typeof b === 'string') {
                message = b;
                opts = { variant: a };
            } else {
                message = b && b.message ? b.message : '';
                opts = { variant: a, ...(b || {}) };
            }
        } else {
            // called as (message, options)
            message = a;
            opts = typeof b === 'string' ? { variant: b } : (b || {});
        }

        let variant = opts.variant || opts.type || 'success';
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
