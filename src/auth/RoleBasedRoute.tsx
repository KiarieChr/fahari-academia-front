import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../services/api';

/**
 * Route guard that checks user role flags (is_student, is_parent, etc.)
 * and redirects unauthorized users to their correct dashboard.
 *
 * Props:
 *   allowedRoles  – array of role keys: 'student' | 'parent' | 'staff'
 *   children      – the component to render if authorized
 */
const RoleBasedRoute = ({ allowedRoles, children }) => {
    const [status, setStatus] = useState('loading'); // loading | allowed | redirect
    const [redirectTo, setRedirectTo] = useState('/');

    useEffect(() => {
        let cancelled = false;

        const check = async () => {
            try {
                const data = await api.getCurrentUser();
                const user = data.success ? data.profile : data;

                if (cancelled) return;

                const userRole = getUserRole(user);

                if (allowedRoles.includes(userRole)) {
                    setStatus('allowed');
                } else {
                    // Redirect to the correct dashboard
                    setRedirectTo(getDashboardPath(userRole));
                    setStatus('redirect');
                }
            } catch {
                if (!cancelled) {
                    setRedirectTo('/');
                    setStatus('redirect');
                }
            }
        };

        check();
        return () => { cancelled = true; };
    }, [allowedRoles]);

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-500 text-sm">Checking access…</p>
                </div>
            </div>
        );
    }

    if (status === 'redirect') {
        return <Navigate to={redirectTo} replace />;
    }

    return children;
};

/** Determine the primary role of a user from their boolean flags. */
export function getUserRole(user) {
    if (!user) return 'unknown';
    if (user.is_student) return 'student';
    if (user.is_parent) return 'parent';
    // All other users (admin, lecturer, dep_head, superuser) get the staff dashboard
    return 'staff';
}

/** Return the correct dashboard path for a given role. */
export function getDashboardPath(role) {
    switch (role) {
        case 'student': return '/student';
        case 'parent': return '/parent';
        default: return '/dashboard';
    }
}

export default RoleBasedRoute;
