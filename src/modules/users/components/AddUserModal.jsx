import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const AddUserModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-overlay"
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem'
                    }}
                >
                    <motion.div
                        className="modal-content"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            width: '100%',
                            maxWidth: '500px',
                            padding: '2rem',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            position: 'relative'
                        }}
                    >
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '1.5rem',
                                right: '1.5rem',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: '#94a3b8'
                            }}
                        >
                            <X size={24} />
                        </button>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Add New User</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Enter the details to create a new user account.</p>

                        <form style={{ display: 'grid', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>First Name</label>
                                    <input type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color-light)', outline: 'none' }} placeholder="John" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Last Name</label>
                                    <input type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color-light)', outline: 'none' }} placeholder="Doe" />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Email Address</label>
                                <input type="email" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color-light)', outline: 'none' }} placeholder="john.doe@example.com" />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Role</label>
                                <select style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color-light)', outline: 'none', background: 'white' }}>
                                    <option>Student</option>
                                    <option>Lecturer</option>
                                    <option>Parent</option>
                                    <option>Admin</option>
                                </select>
                            </div>

                            <button
                                type="button"
                                style={{
                                    marginTop: '1rem',
                                    background: 'var(--primary-color)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Create User
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AddUserModal;
