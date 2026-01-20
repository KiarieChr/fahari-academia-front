import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import AuthLayout from './AuthLayout';
import './auth.css';

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const ResetPassword = () => {
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (passwords.new.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        if (!/\d/.test(passwords.new)) {
            setError('Password must contain at least one number');
            return;
        }
        if (!/[!@#$%^&*]/.test(passwords.new)) {
            setError('Password must contain at least one special character');
            return;
        }

        if (passwords.new !== passwords.confirm) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await api.firstTimeSetup({
                password: passwords.new,
                // confirm_password: passwords.confirm // Add if backend requires it
            });
            toast.success("Password Set Successfully! Please login again.");
            navigate('/login'); // Redirect to login after password set
        } catch (err) {
            setError(err.message || "Failed to set password");
            toast.error(err.message || "Failed to set password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="New Password" subtitle="create a strong password">
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
                        <Lock size={30} color="#3f51b5" />
                    </div>
                    <h2 style={{ margin: '0 0 0.5rem', color: '#1a237e' }}>Reset Password</h2>
                    <p style={{ margin: 0, color: '#9fa8da', fontSize: '0.95rem' }}>
                        Your new password must be different from previously used passwords.
                    </p>
                </motion.div>

                <motion.form
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                    onSubmit={handleSubmit}
                >
                    <motion.div variants={itemVariants} className="form-group">
                        <label className="form-label">New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showNew ? 'text' : 'password'}
                                className="form-input"
                                placeholder="••••••••"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: '#9fa8da'
                                }}
                            >
                                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {/* Password Rules */}
                        <div style={{ marginTop: '0.8rem', background: '#f5f6fa', padding: '0.8rem', borderRadius: '8px' }}>
                            <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#5c6bc0' }}>Password Requirements:</p>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#9fa8da', listStyleType: 'disc' }}>
                                <li style={{ color: passwords.new.length >= 8 ? '#4caf50' : '#9fa8da' }}>At least 8 characters</li>
                                <li style={{ color: /\d/.test(passwords.new) ? '#4caf50' : '#9fa8da' }}>At least one number</li>
                                <li style={{ color: /[!@#$%^&*]/.test(passwords.new) ? '#4caf50' : '#9fa8da' }}>At least one special character (!@#$%^&*)</li>
                            </ul>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                className="form-input"
                                placeholder="••••••••"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: '#9fa8da'
                                }}
                            >
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {error && (
                            <p className="validation-message" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                                {error}
                            </p>
                        )}
                    </motion.div>

                    <motion.button
                        variants={itemVariants}
                        type="submit"
                        className="submit-btn"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isLoading ? <Loader2 className="spinner" /> : 'Reset Password'}
                    </motion.button>
                </motion.form>
            </div>
        </AuthLayout>
    );
};

export default ResetPassword;
