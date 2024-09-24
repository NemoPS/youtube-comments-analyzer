import React from 'react';

export function DummySearchCard() {
    return (
        <div className="bg-base-200 p-4 rounded-lg shadow-md animate-pulse flex items-center">
            <div className="w-16 h-16 bg-gray-300 rounded-md mr-4"></div>
            <div className="flex-grow">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
        </div>
    );
}