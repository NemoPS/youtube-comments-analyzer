import { toast, ToastOptions } from 'react-hot-toast';

interface CustomToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
}

const toastOptions: ToastOptions = {
    duration: 3000,
    position: 'top-center',
    className: 'custom-toast',
};

export function showCustomToast({ message, type }: CustomToastProps) {
    switch (type) {
        case 'success':
            toast.success(message, toastOptions);
            break;
        case 'error':
            toast.error(message, toastOptions);
            break;
        case 'info':
            toast(message, toastOptions);
            break;
        default:
            toast(message, toastOptions);
    }
}