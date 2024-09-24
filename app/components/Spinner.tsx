import React from 'react';

interface SpinnerProps {
    size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function Spinner({ size = 'md' }: SpinnerProps) {
    const sizeClasses = {
        xs: 'w-4 h-4',
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className={`animate-spin rounded-full border-t-2 border-primary ${sizeClasses[size]}`}></div>
    );
}