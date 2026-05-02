import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    loading = false,
    className = '',
    disabled,
    ...props
}) => {
    // Base classes common to all buttons
    const baseClasses = "group inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] rounded-xl focus:outline-none disabled:opacity-50 disabled:pointer-events-none";

    // Sizing
    const sizes = {
        sm: "px-3 py-1.5 text-xs gap-1.5",
        md: "px-4 py-2 text-sm gap-2",
        lg: "px-6 py-2.5 text-base gap-2.5",
        icon: "p-2",
    };

    // Variants (matching the "New Sale" screenshot aesthetic)
    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_4px_12px_rgba(79,70,229,0.25)] border border-transparent",
        secondary: "bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80 shadow-sm",
        outline: "bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-sm",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent",
        danger: "bg-red-500 text-white hover:bg-red-600 shadow-[0_4px_12px_rgba(239,68,68,0.25)] border border-transparent",
    };

    const combinedClasses = `${baseClasses} ${sizes[size]} ${variants[variant]} ${className}`;

    const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

    return (
        <button 
            className={combinedClasses} 
            disabled={disabled || loading} 
            {...props}
        >
            {loading ? (
                <Loader2 className="animate-spin" size={iconSize} />
            ) : (
                Icon && iconPosition === 'left' && (
                    <Icon 
                        size={iconSize} 
                        className={`transition-colors ${
                            variant === 'primary' ? 'opacity-90' : 
                            variant === 'outline' ? 'text-slate-400 group-hover:text-slate-600' :
                            variant === 'secondary' ? 'text-indigo-500 group-hover:text-indigo-700' : ''
                        }`} 
                    />
                )
            )}
            
            {children && <span>{children}</span>}

            {!loading && Icon && iconPosition === 'right' && (
                <Icon 
                    size={iconSize} 
                    className={`transition-all duration-200 ${
                        variant === 'primary' ? 'opacity-90 group-hover:-translate-y-0.5 group-hover:translate-x-0.5' : ''
                    }`} 
                />
            )}
        </button>
    );
};

export default Button;
