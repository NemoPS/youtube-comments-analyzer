import React from 'react';

interface SpinnerProps {
    size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function Spinner({ size = 'md' }: SpinnerProps) {
    return (
        <div className={`loading loading-spinner loading-${size}`}></div>
    );
}