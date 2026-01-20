import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import AuthLayout from './AuthLayout';
import './auth.css';

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.forgotPassword(email);
            // Navigate to OTP page, passing email
            navigate('/verify-otp', { state: { email } });
        } catch (error) {
            toast.error(error.message || "Failed to send reset email");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Recovery" subtitle="Reset your password">
            <div className="form-wrapper">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={itemVariants}
                    style={{ textAlign: 'center', marginBottom: '2rem' }}
                >
                    <div style={{
                        width: 60, height: 60, background: '#e8eaf6', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
                    }}>
                        <Mail size={30} color="#3f51b5" />
                    </div>
                    <h2 style={{ margin: '0 0 0.5rem', color: '#1a237e' }}>Forgot Password?</h2>
                    <p style={{ margin: 0, color: '#9fa8da', fontSize: '0.95rem' }}>
                        Enter your email to receive a verification code.
                    </p>
                </motion.div>

                <motion.form
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                    onSubmit={handleSubmit}
                >
                    <motion.div variants={itemVariants} className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="name@school.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </motion.div>

                    <motion.button
                        variants={itemVariants}
                        type="submit"
                        className="submit-btn"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isLoading ? <Loader2 className="spinner" /> : 'Send OTP'}
                    </motion.button>
                </motion.form>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{ textAlign: 'center', marginTop: '2rem' }}
                >
                    <Link to="/" style={{
                        color: '#5c6bc0', textDecoration: 'none', fontSize: '0.9rem',
                        display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600
                    }}>
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </motion.div>
            </div>
        </AuthLayout>
    );
};

export default ForgotPassword;
