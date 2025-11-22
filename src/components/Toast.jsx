import { useState, useEffect } from 'react';

let toastId = 0;

export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'info', duration = 4000) => {
        const id = toastId++;
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, duration);
    };

    return { toasts, showToast };
};

const Toast = ({ toasts }) => {
    if (toasts.length === 0) return null;

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {toasts.map(toast => (
                <div key={toast.id} className={`toast toast-${toast.type} animate-slide-in`}>
                    <strong style={{ display: 'block', marginBottom: '0.25rem', textTransform: 'capitalize' }}>
                        {toast.type}
                    </strong>
                    <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>{toast.message}</p>
                </div>
            ))}
        </div>
    );
};

export default Toast;
