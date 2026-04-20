import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const PermissionContext = createContext({
    permissions: [],
    user: null,
    loading: true,
    hasPermission: () => false,
    hasAnyPermission: () => false,
    hasAllPermissions: () => false,
    hasModuleAccess: () => false,
    isSuperuser: false,
    refreshPermissions: () => {},
});

/**
 * Maps each sidebar module/section to the Django permission codenames
 * that grant access. Uses app_label.codename format from Django's
 * get_all_permissions().
 */
const MODULE_PERMISSIONS = {
    // Academics
    students: ['student_management.view_application', 'student_management.view_student', 'accounts.view_student'],
    timetables: ['lesson_sessions.view_lessonsession', 'lesson_sessions.view_timeslot'],
    academics: ['examinations.view_exam', 'examinations.view_grade', 'course.view_subject'],

    // Operations
    fees: ['fees.view_feestructure', 'fees.view_feetemplate', 'payments.view_receipt', 'invoicing.view_invoice'],
    finance: ['finance.view_account', 'finance.view_transaction', 'journals.view_journal', 'budgets.view_budget'],
    procurement: ['inventory.view_item', 'inventory.view_purchaseorder', 'inventory.view_supplier'],

    // People
    hr: ['recruitment.view_jobrequisition', 'recruitment.view_jobapplication', 'accounts.view_employeeprofile'],
    payroll: ['payroll.view_payroll', 'payroll.view_earning', 'payroll.view_deduction'],

    // Administration
    users: ['accounts.view_user', 'auth.view_user'],
    settings: ['accounts.view_user', 'auth.view_group'],
};

export const PermissionProvider = ({ children }) => {
    const [permissions, setPermissions] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchPermissions = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setPermissions([]);
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const data = await api.getCurrentUser();
            const profile = data.success ? data.profile : data;
            setUser(profile);
            setPermissions(profile.permissions || []);
        } catch {
            setPermissions([]);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    // Listen for login/logout — re-fetch when token changes
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === 'token') fetchPermissions();
        };
        const onAuthChange = () => fetchPermissions();
        window.addEventListener('storage', onStorage);
        window.addEventListener('auth-change', onAuthChange);
        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('auth-change', onAuthChange);
        };
    }, [fetchPermissions]);

    const isSuperuser = !!user?.is_superuser;

    /** Check if user has a specific permission (e.g. "accounts.add_user") */
    const hasPermission = useCallback((perm) => {
        if (isSuperuser) return true;
        return permissions.includes(perm);
    }, [permissions, isSuperuser]);

    /** Check if user has ANY of the given permissions */
    const hasAnyPermission = useCallback((perms) => {
        if (isSuperuser) return true;
        return perms.some(p => permissions.includes(p));
    }, [permissions, isSuperuser]);

    /** Check if user has ALL of the given permissions */
    const hasAllPermissions = useCallback((perms) => {
        if (isSuperuser) return true;
        return perms.every(p => permissions.includes(p));
    }, [permissions, isSuperuser]);

    /** Check if user can access a module by key (matches any of its mapped permissions) */
    const hasModuleAccess = useCallback((moduleKey) => {
        if (isSuperuser) return true;
        const requiredPerms = MODULE_PERMISSIONS[moduleKey];
        if (!requiredPerms) return true; // Unknown module = allow
        return requiredPerms.some(p => permissions.includes(p));
    }, [permissions, isSuperuser]);

    return (
        <PermissionContext.Provider value={{
            permissions,
            user,
            loading,
            hasPermission,
            hasAnyPermission,
            hasAllPermissions,
            hasModuleAccess,
            isSuperuser,
            refreshPermissions: fetchPermissions,
        }}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermissions = () => useContext(PermissionContext);

export default PermissionProvider;
