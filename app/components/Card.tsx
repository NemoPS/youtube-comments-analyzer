import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`bg-base-200 rounded-lg overflow-hidden shadow-top-light ${className}`}>
            <div className="p-4">
                {children}
            </div>
        </div>
    );
}