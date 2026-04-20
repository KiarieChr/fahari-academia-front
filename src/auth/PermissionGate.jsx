import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from './PermissionProvider';

/**
 * Route guard that checks permissions before rendering children.
 * Redirects to /dashboard with a "not authorized" state if denied.
 *
 * Props:
 *   module       – module key (e.g. 'finance', 'hr') checked via hasModuleAccess
 *   permission   – single permission string (e.g. 'fees.view_feestructure')
 *   permissions  – array of permissions; user needs at least ONE (any)
 *   requireAll   – if true with permissions array, user needs ALL of them
 *   fallback     – custom element to show instead of redirect when denied
 *   children     – content to render if authorized
 */
const PermissionGate = ({
    module,
    permission,
    permissions: permList,
    requireAll = false,
    fallback,
    children,
}) => {
    const { loading, hasPermission, hasAnyPermission, hasAllPermissions, hasModuleAccess, isSuperuser } = usePermissions();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Superusers bypass all checks
    if (isSuperuser) return children;

    let allowed = true;

    if (module) {
        allowed = hasModuleAccess(module);
    } else if (permission) {
        allowed = hasPermission(permission);
    } else if (permList && permList.length > 0) {
        allowed = requireAll ? hasAllPermissions(permList) : hasAnyPermission(permList);
    }

    if (!allowed) {
        if (fallback) return fallback;
        return (
            <Navigate to="/dashboard" replace state={{ accessDenied: true }} />
        );
    }

    return children;
};

export default PermissionGate;
