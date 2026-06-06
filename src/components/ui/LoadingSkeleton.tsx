// LoadingSkeleton Component - Content placeholder animations
import React from 'react';

const LoadingSkeleton = ({
    variant = 'text', // text, circular, rectangular, card, table, profile
    width,
    height,
    count = 1,
    className = '',
    animation = 'pulse', // pulse, wave
}) => {
    const baseClass = `
        bg-gray-200 
        ${animation === 'pulse' ? 'animate-pulse' : 'skeleton-wave'}
    `;

    const variants = {
        text: (i) => (
            <div
                key={i}
                className={`${baseClass} rounded h-4 ${className}`}
                style={{ width: width || `${Math.random() * 40 + 60}%`, height }}
            />
        ),

        circular: (i) => (
            <div
                key={i}
                className={`${baseClass} rounded-full ${className}`}
                style={{
                    width: width || '40px',
                    height: height || width || '40px'
                }}
            />
        ),

        rectangular: (i) => (
            <div
                key={i}
                className={`${baseClass} rounded-lg ${className}`}
                style={{ width: width || '100%', height: height || '120px' }}
            />
        ),

        card: (i) => (
            <div key={i} className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
                <div className="flex items-start justify-between mb-4">
                    <div className={`${baseClass} rounded h-5 w-24`} />
                    <div className={`${baseClass} rounded-full h-10 w-10`} />
                </div>
                <div className={`${baseClass} rounded h-8 w-20 mb-3`} />
                <div className={`${baseClass} rounded h-3 w-32`} />
            </div>
        ),

        table: (i) => (
            <div key={i} className={`flex items-center gap-4 py-4 border-b border-gray-100 ${className}`}>
                <div className={`${baseClass} rounded-full h-10 w-10 flex-shrink-0`} />
                <div className="flex-1 space-y-2">
                    <div className={`${baseClass} rounded h-4 w-3/4`} />
                    <div className={`${baseClass} rounded h-3 w-1/2`} />
                </div>
                <div className={`${baseClass} rounded h-6 w-16`} />
            </div>
        ),

        profile: (i) => (
            <div key={i} className={`${className}`}>
                <div className="flex items-center gap-4 mb-6">
                    <div className={`${baseClass} rounded-full h-20 w-20`} />
                    <div className="space-y-2">
                        <div className={`${baseClass} rounded h-6 w-40`} />
                        <div className={`${baseClass} rounded h-4 w-32`} />
                        <div className={`${baseClass} rounded h-3 w-24`} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, j) => (
                        <div key={j} className="space-y-2">
                            <div className={`${baseClass} rounded h-3 w-20`} />
                            <div className={`${baseClass} rounded h-5 w-full`} />
                        </div>
                    ))}
                </div>
            </div>
        ),

        stat: (i) => (
            <div key={i} className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 ${className}`}>
                <div className="flex justify-between items-start mb-3">
                    <div className={`${baseClass} rounded h-4 w-20`} />
                    <div className={`${baseClass} rounded-lg h-10 w-10`} />
                </div>
                <div className={`${baseClass} rounded h-8 w-16 mb-2`} />
                <div className={`${baseClass} rounded h-3 w-24`} />
            </div>
        ),
    };

    const renderVariant = variants[variant] || variants.text;

    return (
        <div className={variant === 'text' && count > 1 ? 'space-y-2' : ''}>
            {[...Array(count)].map((_, i) => renderVariant(i))}
        </div>
    );
};

// Specialized skeleton components for common use cases
export const TableSkeleton = ({ rows = 5 }) => (
    <div className="divide-y divide-gray-100">
        {[...Array(rows)].map((_, i) => (
            <LoadingSkeleton key={i} variant="table" />
        ))}
    </div>
);

export const CardGridSkeleton = ({ count = 4 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(count)].map((_, i) => (
            <LoadingSkeleton key={i} variant="stat" />
        ))}
    </div>
);

export const ProfileSkeleton = () => <LoadingSkeleton variant="profile" />;

export default LoadingSkeleton;
