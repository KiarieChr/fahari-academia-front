import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Shared Modal component — the single source of truth for all modals.
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - title: string | ReactNode
 *  - subtitle: string (optional grey text below title)
 *  - icon: ReactNode | Component (optional icon left of title)
 *  - children: body content
 *  - footer: ReactNode (rendered in sticky footer)
 *  - size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
 *  - closeOnOutsideClick: boolean (default true)
 *  - showCloseButton: boolean (default true)
 *  - bodyClassName: string (extra classes on body div)
 *  - headerClassName: string (extra classes on header div)
 *  - accentColor: string (thin top bar color, e.g. 'bg-indigo-500')
 *  - noPadding: boolean (remove body padding for custom layouts)
 */

const SIZE_MAP = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-[calc(100vw-2rem)]',
};

const renderIcon = (icon) => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    // Component reference (function or forwardRef)
    return React.createElement(icon, { size: 20 });
};

const Modal = ({
    isOpen,
    onClose,
    title,
    subtitle,
    icon,
    children,
    size = 'md',
    footer,
    closeOnOutsideClick = true,
    showCloseButton = true,
    bodyClassName = '',
    headerClassName = '',
    accentColor = 'bg-indigo-500',
    noPadding = false,
}) => {
    const panelRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[6px] transition-opacity"
                onClick={closeOnOutsideClick ? onClose : undefined}
            />

            {/* Panel */}
            <div
                ref={panelRef}
                className={`relative bg-white rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] w-full ${SIZE_MAP[size] || SIZE_MAP.md} flex flex-col overflow-hidden max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-2 duration-200`}
                role="dialog"
                aria-modal="true"
            >
                {/* Accent top bar */}
                {accentColor && <div className={`h-1 shrink-0 ${accentColor}`} />}

                {/* Header */}
                {(title || showCloseButton) && (
                    <div className={`flex items-center justify-between px-8 py-5 border-b border-gray-100 shrink-0 ${headerClassName}`}>
                        <div className="flex items-center gap-3.5 min-w-0">
                            {icon && (
                                <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    {renderIcon(icon)}
                                </div>
                            )}
                            <div className="min-w-0">
                                {typeof title === 'string' ? (
                                    <h3 className="text-[17px] font-bold text-gray-900 leading-6 truncate">{title}</h3>
                                ) : (
                                    title
                                )}
                                {subtitle && <p className="text-[13px] text-gray-400 mt-1 truncate">{subtitle}</p>}
                            </div>
                        </div>
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-2 -mr-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors shrink-0"
                                aria-label="Close modal"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className={`overflow-y-auto flex-1 ${noPadding ? '' : 'px-8 py-7'} ${bodyClassName}`}>
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-gray-100 bg-gray-50/50 shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─── Convenience sub-components ─── */

/** Standard cancel button for modal footers */
Modal.CancelButton = ({ onClick, children = 'Cancel' }) => (
    <button
        type="button"
        onClick={onClick}
        className="px-6 py-2.5 text-[13px] font-semibold text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
    >
        {children}
    </button>
);

/** Standard primary action button for modal footers */
Modal.SubmitButton = ({ onClick, form, disabled, loading, children, label, className = '' }) => (
    <button
        type={form ? 'submit' : 'button'}
        form={form}
        onClick={onClick}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 px-7 py-2.5 text-[13px] font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200/60 transition-all disabled:opacity-50 active:scale-[0.98] ${className}`}
    >
        {loading && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
        )}
        {children || label || 'Save'}
    </button>
);

/** Standard danger action button for modal footers */
Modal.DangerButton = ({ onClick, disabled, loading, children = 'Delete' }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        className="inline-flex items-center justify-center gap-2 px-7 py-2.5 text-[13px] font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-sm shadow-red-200/60 transition-all disabled:opacity-50 active:scale-[0.98]"
    >
        {loading && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
        )}
        {children}
    </button>
);

/** Section divider for organizing form groups inside modal body */
Modal.Section = ({ icon, title, children }) => (
    <div className="space-y-4">
        {title && (
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                {icon && (
                    <span className="text-gray-400 shrink-0">
                        {React.isValidElement(icon) ? icon : React.createElement(icon, { size: 14 })}
                    </span>
                )}
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</h4>
            </div>
        )}
        {children}
    </div>
);

export default Modal;
