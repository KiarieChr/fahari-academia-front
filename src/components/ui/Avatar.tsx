// Avatar Component - User avatar with fallback
import React from 'react';
import { User } from 'lucide-react';

const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
};

const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-gray-400',
    away: 'bg-amber-500',
    busy: 'bg-red-500',
};

const Avatar = ({
    src,
    alt = 'User',
    name,
    size = 'md',
    shape = 'circle', // circle, square
    status,
    statusPosition = 'bottom-right',
    className = '',
    fallbackColor,
}) => {
    const getInitials = (name) => {
        if (!name) return '';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return parts[0].slice(0, 2).toUpperCase();
    };

    // Generate consistent color from name
    const getBackgroundColor = (name) => {
        if (fallbackColor) return fallbackColor;
        const colors = [
            'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500',
            'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500',
        ];
        if (!name) return colors[0];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const initials = getInitials(name);

    const statusPositionClasses = {
        'bottom-right': 'bottom-0 right-0',
        'top-right': 'top-0 right-0',
        'bottom-left': 'bottom-0 left-0',
        'top-left': 'top-0 left-0',
    };

    return (
        <div className={`relative inline-flex ${className}`}>
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className={`
                        ${sizeClasses[size]}
                        ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'}
                        object-cover border-2 border-white shadow-sm
                    `}
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
            ) : null}
            
            <div
                className={`
                    ${sizeClasses[size]}
                    ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'}
                    ${getBackgroundColor(name)}
                    ${src ? 'hidden' : 'flex'}
                    items-center justify-center text-white font-semibold
                    border-2 border-white shadow-sm
                `}
            >
                {initials || <User size={size === 'xs' ? 12 : size === 'sm' ? 14 : 18} />}
            </div>

            {status && (
                <span className={`
                    absolute ${statusPositionClasses[statusPosition]}
                    w-3 h-3 ${statusColors[status] || statusColors.offline}
                    rounded-full border-2 border-white
                `} />
            )}
        </div>
    );
};

// Avatar Group Component
export const AvatarGroup = ({ 
    avatars = [], 
    max = 4, 
    size = 'md',
    className = '' 
}) => {
    const visibleAvatars = avatars.slice(0, max);
    const remainingCount = avatars.length - max;

    return (
        <div className={`flex -space-x-2 ${className}`}>
            {visibleAvatars.map((avatar, index) => (
                <Avatar
                    key={index}
                    {...avatar}
                    size={size}
                    className="ring-2 ring-white"
                />
            ))}
            {remainingCount > 0 && (
                <div className={`
                    ${sizeClasses[size]}
                    rounded-full bg-gray-100 text-gray-600 font-medium
                    flex items-center justify-center
                    ring-2 ring-white
                `}>
                    +{remainingCount}
                </div>
            )}
        </div>
    );
};

export default Avatar;
