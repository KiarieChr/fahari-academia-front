import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import AuthLayout from './AuthLayout';



const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const VerifyOtp = () => {
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Email not found. Please start from the forgot password page.');
            navigate('/forgot-password');
            return;
        }
        setIsLoading(true);
        try {
            await api.verifyOtp(email, otp);
            toast.success('OTP verified successfully');
            navigate('/reset-password', { state: { email, code: otp } });
        } catch (error) {
            toast.error(error.message || 'Invalid or expired OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Verification" subtitle="Enter the code sent to your email">
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
                        <KeyRound size={30} color="#3f51b5" />
                    </div>
                    <h2 style={{ margin: '0 0 0.5rem', color: '#1a237e' }}>Enter OTP</h2>
                    <p style={{ margin: 0, color: '#9fa8da', fontSize: '0.95rem' }}>
                        We sent a code to your email.
                    </p>
                </motion.div>

                <motion.form
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                    onSubmit={handleSubmit}
                >
                    <motion.div variants={itemVariants} className="form-group">
                        <label className="form-label" style={{ textAlign: 'center' }}>Verification Code</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="123456"
                            style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.5rem', fontWeight: 700 }}
                            value={otp}
                            maxLength={6}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            required
                        />
                    </motion.div>

                    <motion.button
                        variants={itemVariants}
                        type="submit"
                        className="submit-btn"
                        disabled={isLoading || otp.length < 4}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isLoading ? <Loader2 className="spinner" /> : 'Verify Code'}
                    </motion.button>
                </motion.form>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{ textAlign: 'center', marginTop: '2rem' }}
                >
                    <Link to="/forgot-password" style={{
                        color: '#5c6bc0', textDecoration: 'none', fontSize: '0.9rem',
                        display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600
                    }}>
                        <ArrowLeft size={16} /> Wrong Email?
                    </Link>
                </motion.div>
            </div>
        </AuthLayout>
    );
};

export default VerifyOtp;
