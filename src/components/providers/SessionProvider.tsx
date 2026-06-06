// Session Provider - Handles session management UI
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, WifiOff, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';
import {
    setSessionExpiredCallback,
    setNetworkErrorCallback,
    extendSession,
    getSessionTimeRemaining
} from '../../services/apiClient';

const SessionContext = createContext(null);

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within SessionProvider');
    }
    return context;
};

export const SessionProvider = ({ children }) => {
    const navigate = useNavigate();
    const [showSessionWarning, setShowSessionWarning] = useState(false);
    const [showNetworkError, setShowNetworkError] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);

    // Handle session expiry
    const handleSessionExpired = useCallback((reason) => {
        if (reason === 'warning') {
            setShowSessionWarning(true);
            // Start countdown
            const interval = setInterval(() => {
                const remaining = getSessionTimeRemaining();
                setTimeRemaining(Math.floor(remaining / 1000));
                if (remaining <= 0) {
                    clearInterval(interval);
                }
            }, 1000);
        } else {
            setShowSessionWarning(false);
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            if (reason === 'inactivity') {
                toast.warning('Session expired due to inactivity');
            } else if (reason === 'unauthorized') {
                toast.error('Your session has expired. Please login again.');
            }

            navigate('/', { replace: true });
        }
    }, [navigate]);

    // Handle network errors
    const handleNetworkError = useCallback(() => {
        setShowNetworkError(true);
        toast.error('Network connection lost. Please check your internet.');
    }, []);

    // Initialize session callbacks
    useEffect(() => {
        setSessionExpiredCallback(handleSessionExpired);
        setNetworkErrorCallback(handleNetworkError);

        // Check network status
        const handleOnline = () => {
            setShowNetworkError(false);
            toast.success('Connection restored');
        };

        const handleOffline = () => {
            setShowNetworkError(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [handleSessionExpired, handleNetworkError]);

    // Extend session
    const handleExtendSession = () => {
        extendSession();
        setShowSessionWarning(false);
        toast.success('Session extended');
    };

    // Logout
    const handleLogout = () => {
        setShowSessionWarning(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/', { replace: true });
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <SessionContext.Provider value={{
            extendSession: handleExtendSession,
            logout: handleLogout,
            isNetworkError: showNetworkError
        }}>
            {children}

            {/* Session Warning Modal */}
            <AnimatePresence>
                {showSessionWarning && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                        >
                            <div className="p-8 text-center">
                                <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-6">
                                    <Clock size={40} className="text-amber-500" />
                                </div>

                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Session Expiring Soon
                                </h2>

                                <p className="text-gray-600 mb-4">
                                    Your session will expire due to inactivity.
                                </p>

                                <div className="text-4xl font-bold text-amber-600 mb-6">
                                    {formatTime(timeRemaining)}
                                </div>

                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={handleLogout}
                                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        <LogOut size={18} className="inline mr-2" />
                                        Logout
                                    </button>
                                    <button
                                        onClick={handleExtendSession}
                                        className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors"
                                        style={{ backgroundColor: 'var(--primary-color)' }}
                                    >
                                        Continue Session
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Network Error Banner */}
            <AnimatePresence>
                {showNetworkError && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-0 left-0 right-0 z-[9998] bg-red-600 text-white py-3 px-4"
                    >
                        <div className="flex items-center justify-center gap-3 max-w-7xl mx-auto">
                            <WifiOff size={20} />
                            <span className="font-medium">
                                Network connection lost. Some features may not work.
                            </span>
                            <button
                                onClick={() => window.location.reload()}
                                className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </SessionContext.Provider>
    );
};

export default SessionProvider;
