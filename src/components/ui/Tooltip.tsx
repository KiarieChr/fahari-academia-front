// Tooltip Component - Contextual information popups
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Tooltip = ({
    children,
    content,
    position = 'top', // top, bottom, left, right
    delay = 200,
    className = '',
    contentClassName = '',
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);

    const handleMouseEnter = () => {
        const id = setTimeout(() => setIsVisible(true), delay);
        setTimeoutId(id);
    };

    const handleMouseLeave = () => {
        if (timeoutId) clearTimeout(timeoutId);
        setIsVisible(false);
    };

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-x-transparent border-b-transparent',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-x-transparent border-t-transparent',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-y-transparent border-r-transparent',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-y-transparent border-l-transparent',
    };

    const animationVariants = {
        top: { initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 } },
        bottom: { initial: { opacity: 0, y: -5 }, animate: { opacity: 1, y: 0 } },
        left: { initial: { opacity: 0, x: 5 }, animate: { opacity: 1, x: 0 } },
        right: { initial: { opacity: 0, x: -5 }, animate: { opacity: 1, x: 0 } },
    };

    if (!content) return children;

    return (
        <div
            className={`relative inline-flex ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={animationVariants[position].initial}
                        animate={animationVariants[position].animate}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`
                            absolute z-[9999] ${positionClasses[position]}
                            px-3 py-2 text-xs font-medium text-white
                            bg-gray-900 rounded-lg shadow-lg
                            whitespace-nowrap pointer-events-none
                            ${contentClassName}
                        `}
                    >
                        {content}
                        {/* Arrow */}
                        <div className={`
                            absolute w-0 h-0
                            border-4 ${arrowClasses[position]}
                        `} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tooltip;
