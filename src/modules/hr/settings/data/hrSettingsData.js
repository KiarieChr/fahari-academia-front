
import {
    Calendar, Clock, Award, Users, DollarSign, UserCog, Shield, Bell, Box, FileText, Zap
} from 'lucide-react';

export const settingsCategories = [
    { id: 'leave', label: 'Leave Settings', icon: Calendar, description: 'Manage leave types, accruals, and holidays.' },
    { id: 'attendance-policy', label: 'Attendance Policy', icon: Zap, description: 'Configure clocking methods, geofence, and employee profiles.' },
    { id: 'attendance', label: 'Attendance Rules', icon: Clock, description: 'Configure shifts, working hours, and grace periods.' },
    { id: 'performance', label: 'Performance', icon: Award, description: 'Setup review cycles, KPIs, and scoring models.' },
    { id: 'recruitment', label: 'Recruitment', icon: Users, description: 'Define hiring stages and interview panels.' },
    { id: 'payroll', label: 'Payroll Rules', icon: DollarSign, description: 'Salary structures, allowances, and deductions.' },
    { id: 'employees', label: 'Employee Mgmt', icon: UserCog, description: 'Job titles, departments, and employment types.' },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield, description: 'Manage access control and user roles.' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Configure email alerts and system notifications.' },
    { id: 'integrations', label: 'Integrations', icon: Box, description: 'Connect with third-party tools and APIs.' },
    { id: 'audit', label: 'Audit Logs', icon: FileText, description: 'View system activity and changes history.' },
];

export const leaveSettingsData = {
    leaveTypes: [
        { id: 1, name: 'Annual Leave', days: 21, carryForward: true },
        { id: 2, name: 'Sick Leave', days: 14, carryForward: false },
        { id: 3, name: 'Maternity Leave', days: 90, carryForward: false },
        { id: 4, name: 'Paternity Leave', days: 14, carryForward: false },
    ],
    generalRules: [
        { id: 'require_approval', label: 'Require Manager Approval', value: true, type: 'toggle' },
        { id: 'allow_negative_balance', label: 'Allow Negative Balance', value: false, type: 'toggle' },
        { id: 'weekend_inclusion', label: 'Include Weekends in Leave Count', value: false, type: 'toggle' },
    ]
};

export const attendanceSettingsData = {
    shifts: [
        { id: 1, name: 'General Shift', start: '08:00', end: '17:00' },
        { id: 2, name: 'Morning Shift', start: '06:00', end: '15:00' },
        { id: 3, name: 'Night Shift', start: '22:00', end: '07:00' },
    ],
    rules: [
        { id: 'grace_period', label: 'Late Arrival Grace Period (mins)', value: 15, type: 'number' },
        { id: 'half_day_hours', label: 'Minimum Hours for Half Day', value: 4, type: 'number' },
        { id: 'auto_checkout', label: 'Auto Checkout at Shift End', value: false, type: 'toggle' },
    ]
};

export const rolesData = [
    { id: 1, name: 'Super Admin', users: 2, description: 'Full access to all modules.' },
    { id: 2, name: 'HR Manager', users: 5, description: 'Can manage staff, leave, and payroll.' },
    { id: 3, name: 'Department Head', users: 12, description: 'Access to team data and approvals.' },
    { id: 4, name: 'Employee', users: 142, description: 'Self-service portal access only.' },
];

export const auditLogsData = [
    { id: 1, action: "Updated Leave Policy", user: "Admin User", module: "Leave", timestamp: "2024-10-24 10:30 AM" },
    { id: 2, action: "Created New Shift 'Night A'", user: "HR Manager", module: "Attendance", timestamp: "2024-10-23 04:15 PM" },
    { id: 3, action: "Modified Role Permissions", user: "Super Admin", module: "Roles", timestamp: "2024-10-22 09:00 AM" },
    { id: 4, action: "Enabled Biometric Integration", user: "IT Admin", module: "Integrations", timestamp: "2024-10-21 11:45 AM" },
    { id: 5, action: "Changed Payroll Cycle", user: "Finance Lead", module: "Payroll", timestamp: "2024-10-20 02:30 PM" },
];

export const integrationSettingsData = [
    { id: 1, name: 'Biometric Devices', status: 'Connected', type: 'Hardware' },
    { id: 2, name: 'Slack Notifications', status: 'Disconnected', type: 'Messaging' },
    { id: 3, name: 'Google Calendar', status: 'Active', type: 'Calendar' },
];
