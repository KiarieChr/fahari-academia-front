import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md', // sm, md, lg, xl, full
    footer,
    closeOnOutsideClick = true,
    showCloseButton = true
}) => {

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-xl',
        lg: 'max-w-3xl',
        xl: 'max-w-5xl',
        full: 'max-w-full m-4 h-[calc(100vh-2rem)]'
    };

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={closeOnOutsideClick ? onClose : undefined}
            />

            {/* Modal Content */}
            <div
                className={`
                    relative 
                    bg-white 
                    rounded-xl 
                    shadow-2xl 
                    w-full 
                    ${sizeClasses[size] || sizeClasses.md} 
                    flex 
                    flex-col 
                    overflow-hidden
                    transform 
                    transition-all 
                    animate-in 
                    fade-in 
                    zoom-in-95 
                    duration-200
                    max-h-[90vh] px-5 py-5
                `}
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10 shrink-0">
                        <div>
                            {title && <h3 className="text-xl font-bold text-gray-900 leading-6">{title}</h3>}
                        </div>
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className="p-8 overflow-y-auto flex-1">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
