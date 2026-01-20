import React from 'react';
import './auth.css';

const AuthLayout = ({ children, title = "Fahari Academia", subtitle = "Manage your institution efficiently" }) => {
    return (
        <div className="auth-container">
            <div
                className="auth-left"
                style={{ backgroundImage: `url('/class.ico.jpg')` }}
            >
                <div className="auth-overlay"></div>
                <div className="auth-content" style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <h1 className="brand-title">{title}</h1>
                        <p className="brand-subtitle">{subtitle}</p>
                    </div>
                </div>
            </div>

            <div className="auth-right">
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
