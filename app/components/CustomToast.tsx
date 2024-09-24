import { toast, ToastOptions } from 'react-hot-toast';

interface CustomToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
}

const toastOptions: ToastOptions = {
    duration: 3000,
    position: 'top-center',
};

const baseStyle = {
    background: '#1F2937', // Dark background
    color: '#FFFFFF',      // White text
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
};

export function showCustomToast({ message, type }: CustomToastProps) {
    const borderColor = type === 'error' ? '#F87272' :
        type === 'success' ? '#36D399' :
            '#0EA5E9';

    const style = {
        ...baseStyle,
        borderLeft: `4px solid ${borderColor}`,
    };

    switch (type) {
        case 'success':
            toast.success(message, { ...toastOptions, style });
            break;
        case 'error':
            toast.error(message, { ...toastOptions, style });
            break;
        case 'info':
            toast(message, { ...toastOptions, style });
            break;
        default:
            toast(message, { ...toastOptions, style });
    }
}