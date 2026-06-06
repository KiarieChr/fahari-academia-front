import React from 'react';
import { useAuth } from './AuthProvider';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const AuthLoadingWrapper = ({ children }) => {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <Loader2 size={40} className="text-blue-600" />
                </motion.div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 text-sm font-medium text-gray-500"
                >
                    Initializing...
                </motion.p>
            </div>
        );
    }

    return <>{children}</>;
};

export default AuthLoadingWrapper;
