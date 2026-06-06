import React from 'react';
import AuthLayout from './AuthLayout';
import LoginForm from './LoginForm';

const Login = () => {
    return (
        <AuthLayout title="Fahari Academia" subtitle="Manage your institution efficiently">
            <LoginForm />
        </AuthLayout>
    );
};

export default Login;
