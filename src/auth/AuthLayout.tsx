import React from 'react';
import { motion } from 'framer-motion';

import './auth.css';

const AuthLayout = ({ children, title = "Fahari Academia", subtitle = "Manage your institution efficiently" }) => {
    // Split text into an array of characters
    const titleLetters = Array.from(title);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.2 }
        }
    };

    const letterVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', damping: 12, stiffness: 200 }
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div
                    className="auth-left"
                    style={{ backgroundImage: `url('/class.ico.jpg')` }}
                >
                    <div className="auth-overlay"></div>
                    <div className="auth-content" style={{ textAlign: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <motion.h1 
                                className="brand-title"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {titleLetters.map((letter, index) => (
                                    <motion.span 
                                        key={index} 
                                        variants={letterVariants}
                                        style={{ display: 'inline-block' }}
                                    >
                                        {letter === ' ' ? '\u00A0' : letter}
                                    </motion.span>
                                ))}
                            </motion.h1>
                            <motion.p 
                                className="brand-subtitle"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.6 }}
                            >
                                {subtitle}
                            </motion.p>
                        </div>
                    </div>
                </div>

                <div className="auth-right">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
