import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Menu, Search, Bell, Sun, Moon, ChevronDown, LogOut,
    UserCog, Settings, X, GraduationCap, CalendarDays,
    Zap, FileText, Users, CreditCard, DollarSign,
    ShoppingCart, Briefcase, LayoutDashboard, ChevronRight,
    Clock, CheckCircle2, AlertCircle, Info, TrendingUp,
    Command, ArrowRight, Star, Wifi, WifiOff
} from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import './TopBar.css';

/* ─── Breadcrumb map ─────────────────────────────────────────── */
const BREADCRUMB_MAP = [
    { path: '/dashboard',                          crumbs: [{ label: 'Dashboard', icon: LayoutDashboard }] },
    { path: '/dashboard/students',                 crumbs: [{ label: 'Students', icon: Users }, { label: 'Management' }] },
    { path: '/dashboard/students/admission',                    crumbs: [{ label: 'Students', icon: Users }, { label: 'Admission Book' }] },
    { path: '/dashboard/students/admission/overview',           crumbs: [{ label: 'Students', icon: Users }, { label: 'Admissions Overview' }] },
    { path: '/dashboard/students/admission/enquiries',          crumbs: [{ label: 'Students', icon: Users }, { label: 'Enquiries Register' }] },
    { path: '/dashboard/students/admission/applications',       crumbs: [{ label: 'Students', icon: Users }, { label: 'Applications Register' }] },
    { path: '/dashboard/students/admission/records',            crumbs: [{ label: 'Students', icon: Users }, { label: 'Admission Register' }] },
    { path: '/dashboard/students/admission/nominal-roll',       crumbs: [{ label: 'Students', icon: Users }, { label: 'Nominal Roll' }] },
    { path: '/dashboard/students/admission/reporting',          crumbs: [{ label: 'Students', icon: Users }, { label: 'Student Reporting' }] },
    { path: '/dashboard/students/admission/repeaters',          crumbs: [{ label: 'Students', icon: Users }, { label: 'Repeaters & Transfers' }] },
    { path: '/dashboard/students/sessions',        crumbs: [{ label: 'Academics', icon: GraduationCap }, { label: 'Class Sessions' }] },
    { path: '/dashboard/students/academic-sessions', crumbs: [{ label: 'Students', icon: Users }, { label: 'Terms & Academic Sessions' }] },
    { path: '/dashboard/students/curriculums',     crumbs: [{ label: 'Students', icon: Users }, { label: 'Curriculums' }] },
    { path: '/dashboard/students/reports',         crumbs: [{ label: 'Students', icon: Users }, { label: 'Reports' }] },
    { path: '/dashboard/students/settings',        crumbs: [{ label: 'Students', icon: Users }, { label: 'Settings' }] },
    { path: '/dashboard/timetables',               crumbs: [{ label: 'Timetables', icon: CalendarDays }] },
    { path: '/dashboard/academics',                crumbs: [{ label: 'Academics', icon: GraduationCap }] },
    { path: '/dashboard/academics/marks',          crumbs: [{ label: 'Academics', icon: GraduationCap }, { label: 'Marks Input' }] },
    { path: '/dashboard/academics/subjects',       crumbs: [{ label: 'Academics', icon: GraduationCap }, { label: 'Subjects' }] },
    { path: '/dashboard/academics/grading',        crumbs: [{ label: 'Academics', icon: GraduationCap }, { label: 'Grading Scheme' }] },
    { path: '/dashboard/academics/reports',        crumbs: [{ label: 'Academics', icon: GraduationCap }, { label: 'Reports' }] },
    { path: '/dashboard/academics/assignments',    crumbs: [{ label: 'Academics', icon: GraduationCap }, { label: 'Assignments' }] },
    { path: '/dashboard/fees',                     crumbs: [{ label: 'Fees', icon: CreditCard }] },
    { path: '/dashboard/fees/receipts',            crumbs: [{ label: 'Fees', icon: CreditCard }, { label: 'Receipt Book' }] },
    { path: '/dashboard/fees/invoice',             crumbs: [{ label: 'Fees', icon: CreditCard }, { label: 'Student Invoices' }] },
    { path: '/dashboard/fees/arrears',             crumbs: [{ label: 'Fees', icon: CreditCard }, { label: 'Arrears' }] },
    { path: '/dashboard/fees/structure',           crumbs: [{ label: 'Fees', icon: CreditCard }, { label: 'Fee Structure' }] },
    { path: '/dashboard/fees/templates',           crumbs: [{ label: 'Fees', icon: CreditCard }, { label: 'Fee Templates' }] },
    { path: '/dashboard/finance',                  crumbs: [{ label: 'Finance', icon: DollarSign }] },
    { path: '/dashboard/finance/payable',          crumbs: [{ label: 'Finance', icon: DollarSign }, { label: 'Accounts Payable' }] },
    { path: '/dashboard/finance/journals',         crumbs: [{ label: 'Finance', icon: DollarSign }, { label: 'Journals' }] },
    { path: '/dashboard/finance/reports',          crumbs: [{ label: 'Finance', icon: DollarSign }, { label: 'Reports' }] },
    { path: '/dashboard/finance/chart',            crumbs: [{ label: 'Finance', icon: DollarSign }, { label: 'Chart of Accounts' }] },
    { path: '/dashboard/procurement',             crumbs: [{ label: 'Procurement', icon: ShoppingCart }] },
    { path: '/dashboard/procurement/requisition', crumbs: [{ label: 'Procurement', icon: ShoppingCart }, { label: 'Requisitions' }] },
    { path: '/dashboard/procurement/order',       crumbs: [{ label: 'Procurement', icon: ShoppingCart }, { label: 'Purchase Orders' }] },
    { path: '/dashboard/procurement/rfq',         crumbs: [{ label: 'Procurement', icon: ShoppingCart }, { label: 'RFQ' }] },
    { path: '/dashboard/procurement/grn',         crumbs: [{ label: 'Procurement', icon: ShoppingCart }, { label: 'GRN' }] },
    { path: '/dashboard/fleet',                    crumbs: [{ label: 'Fleet', icon: ShoppingCart }] },
    { path: '/dashboard/hr',                       crumbs: [{ label: 'Human Resource', icon: Briefcase }] },
    { path: '/dashboard/hr/staff-register',        crumbs: [{ label: 'HR', icon: Briefcase }, { label: 'Staff Register' }] },
    { path: '/dashboard/hr/leave',                 crumbs: [{ label: 'HR', icon: Briefcase }, { label: 'Leave Management' }] },
    { path: '/dashboard/hr/staff-attendance',      crumbs: [{ label: 'HR', icon: Briefcase }, { label: 'Staff Attendance' }] },
    { path: '/dashboard/payroll',                  crumbs: [{ label: 'Payroll', icon: DollarSign }] },
    { path: '/dashboard/users',                    crumbs: [{ label: 'Users', icon: UserCog }] },
    { path: '/dashboard/users/account',            crumbs: [{ label: 'Users', icon: UserCog }, { label: 'My Account' }] },
    { path: '/dashboard/settings',                 crumbs: [{ label: 'Settings', icon: Settings }] },
];

/* ─── Command Palette items ──────────────────────────────────── */
const COMMAND_ITEMS = [
    { label: 'Dashboard',              path: '/dashboard',                                            icon: LayoutDashboard, category: 'Navigate' },
    { label: 'Student Management',     path: '/dashboard/students',                                   icon: Users,           category: 'Navigate' },
    { label: 'Admissions Overview',    path: '/dashboard/students/admission/overview',                icon: Users,           category: 'Admissions' },
    { label: 'Applications Register',  path: '/dashboard/students/admission/applications',            icon: Users,           category: 'Admissions' },
    { label: 'Admission Register',     path: '/dashboard/students/admission/records',                 icon: Users,           category: 'Admissions' },
    { label: 'Nominal Roll',           path: '/dashboard/students/admission/nominal-roll',            icon: Users,           category: 'Admissions' },
    { label: 'Student Reporting',      path: '/dashboard/students/admission/reporting',               icon: Users,           category: 'Admissions' },
    { label: 'Repeaters & Transfers',  path: '/dashboard/students/admission/repeaters',               icon: Users,           category: 'Admissions' },
    { label: 'Timetables',         path: '/dashboard/timetables',            icon: CalendarDays,    category: 'Navigate' },
    { label: 'Marks Input',        path: '/dashboard/academics/marks',       icon: GraduationCap,   category: 'Navigate' },
    { label: 'Assignments',        path: '/dashboard/academics/assignments',  icon: GraduationCap,   category: 'Navigate' },
    { label: 'Fee Receipts',       path: '/dashboard/fees/receipts',         icon: CreditCard,      category: 'Navigate' },
    { label: 'Student Invoices',   path: '/dashboard/fees/invoice',          icon: CreditCard,      category: 'Navigate' },
    { label: 'Student Arrears',    path: '/dashboard/fees/arrears',          icon: CreditCard,      category: 'Navigate' },
    { label: 'Finance Reports',    path: '/dashboard/finance/reports',       icon: DollarSign,      category: 'Navigate' },
    { label: 'Chart of Accounts',  path: '/dashboard/finance/chart',         icon: DollarSign,      category: 'Navigate' },
    { label: 'Purchase Orders',    path: '/dashboard/procurement/order',     icon: ShoppingCart,    category: 'Navigate' },
    { label: 'Staff Register',     path: '/dashboard/hr/staff-register',     icon: Briefcase,       category: 'Navigate' },
    { label: 'Leave Management',   path: '/dashboard/hr/leave',              icon: Briefcase,       category: 'Navigate' },
    { label: 'Payroll',            path: '/dashboard/payroll/process',       icon: DollarSign,      category: 'Navigate' },
    { label: 'My Account',         path: '/dashboard/users/account',         icon: UserCog,         category: 'Account' },
    { label: 'Settings',           path: '/dashboard/settings',              icon: Settings,        category: 'Account' },
];

/* ─── Mock Notifications ─────────────────────────────────────── */
const MOCK_NOTIFICATIONS = [
    { id: 1, type: 'warning', title: 'Fee Arrears Alert', body: '12 students have outstanding balances exceeding KSh 10,000.', time: '2 min ago', read: false },
    { id: 2, type: 'info',    title: 'New Admission',     body: 'A new student has been admitted to Form 1A.', time: '15 min ago', read: false },
    { id: 3, type: 'success', title: 'Payroll Processed', body: 'May 2025 payroll has been successfully processed.', time: '1 hr ago', read: false },
    { id: 4, type: 'info',    title: 'Leave Request',     body: 'Jane Mwangi has submitted a leave request for review.', time: '3 hrs ago', read: true },
    { id: 5, type: 'warning', title: 'Exam Due Soon',     body: 'Mid-term results entry deadline is in 3 days.', time: '5 hrs ago', read: true },
];

const NOTIFICATION_ICONS = {
    warning: { icon: AlertCircle, color: '#f59e0b', bg: '#fef3c7' },
    info:    { icon: Info,         color: '#3b82f6', bg: '#eff6ff' },
    success: { icon: CheckCircle2, color: '#10b981', bg: '#ecfdf5' },
};

/* ─── Live Clock ─────────────────────────────────────────────── */
const LiveClock = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);
    return (
        <span className="tb-live-clock">
            {time.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
        </span>
    );
};

/* ─── Role colour map ────────────────────────────────────────── */
const ROLE_COLORS = {
    admin:       { bg: '#dbeafe', color: '#1d4ed8', label: 'Admin' },
    super_admin: { bg: '#ede9fe', color: '#7c3aed', label: 'Super Admin' },
    school_admin:{ bg: '#dbeafe', color: '#1d4ed8', label: 'School Admin' },
    principal:   { bg: '#dcfce7', color: '#15803d', label: 'Principal' },
    director:    { bg: '#fce7f3', color: '#be185d', label: 'Director' },
    bursar:      { bg: '#fef3c7', color: '#b45309', label: 'Bursar' },
    teacher:     { bg: '#ecfdf5', color: '#059669', label: 'Teacher' },
    user:        { bg: '#f1f5f9', color: '#475569', label: 'User' },
};

/* ═══════════════════════════════════════════════════════════════
   TopBar Component
═══════════════════════════════════════════════════════════════ */
const TopBar = ({
    currentUser,
    isDarkMode,
    onToggleSidebar,
    onToggleDarkMode,
    onLogout,
}) => {
    const navigate   = useNavigate();
    const location   = useLocation();

    /* ── State ─────────────────────────────────────────────────── */
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [cmdQuery, setCmdQuery]                     = useState('');
    const [cmdIndex, setCmdIndex]                     = useState(0);

    const [showNotifications, setShowNotifications]   = useState(false);
    const [notifications, setNotifications]           = useState(MOCK_NOTIFICATIONS);
    const [showUserMenu, setShowUserMenu]             = useState(false);

    const [isOnline, setIsOnline]                     = useState(navigator.onLine);

    /* ── Refs ───────────────────────────────────────────────────── */
    const cmdRef   = useRef(null);
    const cmdInputRef = useRef(null);
    const notifRef = useRef(null);
    const userRef  = useRef(null);

    /* ── Online / Offline detection ─────────────────────────────── */
    useEffect(() => {
        const on  = () => setIsOnline(true);
        const off = () => setIsOnline(false);
        window.addEventListener('online',  on);
        window.addEventListener('offline', off);
        return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
    }, []);

    /* ── Keyboard shortcut Ctrl/Cmd+K ───────────────────────────── */
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setShowCommandPalette(prev => !prev);
            }
            if (e.key === 'Escape') {
                setShowCommandPalette(false);
                setShowNotifications(false);
                setShowUserMenu(false);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    /* ── Focus cmd input when palette opens ─────────────────────── */
    useEffect(() => {
        if (showCommandPalette) {
            setCmdQuery('');
            setCmdIndex(0);
            setTimeout(() => cmdInputRef.current?.focus(), 50);
        }
    }, [showCommandPalette]);

    /* ── Close panels when clicking outside ─────────────────────── */
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
            if (userRef.current  && !userRef.current.contains(e.target))  setShowUserMenu(false);
            if (cmdRef.current   && !cmdRef.current.contains(e.target))   setShowCommandPalette(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* ── Breadcrumbs ─────────────────────────────────────────────── */
    const breadcrumbs = (() => {
        const path = location.pathname;
        // Longest match first — all admission pages have unique paths now
        const sorted = [...BREADCRUMB_MAP].sort((a, b) => b.path.length - a.path.length);
        const match  = sorted.find(m => path.startsWith(m.path));
        return match ? match.crumbs : [{ label: 'Dashboard', icon: LayoutDashboard }];
    })();

    /* ── Filtered command results ────────────────────────────────── */
    const filteredCmds = COMMAND_ITEMS.filter(c =>
        c.label.toLowerCase().includes(cmdQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(cmdQuery.toLowerCase())
    );

    /* ── Command palette keyboard nav ───────────────────────────── */
    const handleCmdKey = (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setCmdIndex(i => Math.min(i + 1, filteredCmds.length - 1)); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); setCmdIndex(i => Math.max(i - 1, 0)); }
        if (e.key === 'Enter' && filteredCmds[cmdIndex]) {
            navigate(filteredCmds[cmdIndex].path);
            setShowCommandPalette(false);
        }
    };

    /* ── Notifications helpers ───────────────────────────────────── */
    const unreadCount  = notifications.filter(n => !n.read).length;
    const markAllRead  = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const markOneRead  = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    const dismissOne   = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

    /* ── User role display ───────────────────────────────────────── */
    const roleKey   = currentUser?.role?.toLowerCase() || 'user';
    const roleStyle = ROLE_COLORS[roleKey] || ROLE_COLORS.user;

    /* ── Today's date chip ───────────────────────────────────────── */
    const dateStr = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

    /* ══════════════════════════════════════════════════════════════
       Render
    ══════════════════════════════════════════════════════════════ */
    return (
        <>
            {/* ── Command Palette Overlay ──────────────────────────────── */}
            {showCommandPalette && (
                <div className="tb-cmd-overlay" ref={cmdRef}>
                    <div className="tb-cmd-modal">
                        <div className="tb-cmd-search-row">
                            <Command size={18} className="tb-cmd-icon" />
                            <input
                                ref={cmdInputRef}
                                className="tb-cmd-input"
                                placeholder="Search pages, modules, actions…"
                                value={cmdQuery}
                                onChange={e => { setCmdQuery(e.target.value); setCmdIndex(0); }}
                                onKeyDown={handleCmdKey}
                            />
                            <kbd className="tb-cmd-esc" onClick={() => setShowCommandPalette(false)}>ESC</kbd>
                        </div>

                        <div className="tb-cmd-results">
                            {filteredCmds.length === 0 ? (
                                <div className="tb-cmd-empty">No results for "{cmdQuery}"</div>
                            ) : filteredCmds.map((item, idx) => (
                                <button
                                    key={item.path}
                                    className={`tb-cmd-item ${idx === cmdIndex ? 'selected' : ''}`}
                                    onClick={() => { navigate(item.path); setShowCommandPalette(false); }}
                                    onMouseEnter={() => setCmdIndex(idx)}
                                >
                                    <div className="tb-cmd-item-icon">
                                        <item.icon size={16} />
                                    </div>
                                    <div className="tb-cmd-item-text">
                                        <span className="tb-cmd-item-label">{item.label}</span>
                                        <span className="tb-cmd-item-category">{item.category}</span>
                                    </div>
                                    <ArrowRight size={14} className="tb-cmd-arrow" />
                                </button>
                            ))}
                        </div>

                        <div className="tb-cmd-footer">
                            <span><kbd>↑↓</kbd> Navigate</span>
                            <span><kbd>↵</kbd> Select</span>
                            <span><kbd>Esc</kbd> Close</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Notification Panel Overlay ───────────────────────────── */}
            {showNotifications && (
                <div className="tb-notif-panel" ref={notifRef}>
                    <div className="tb-notif-header">
                        <div>
                            <h3 className="tb-notif-title">Notifications</h3>
                            {unreadCount > 0 && <span className="tb-notif-count">{unreadCount} unread</span>}
                        </div>
                        {unreadCount > 0 && (
                            <button className="tb-notif-mark-all" onClick={markAllRead}>Mark all read</button>
                        )}
                    </div>
                    <div className="tb-notif-list">
                        {notifications.map(n => {
                            const cfg = NOTIFICATION_ICONS[n.type] || NOTIFICATION_ICONS.info;
                            const Icon = cfg.icon;
                            return (
                                <div key={n.id} className={`tb-notif-item ${!n.read ? 'unread' : ''}`} onClick={() => markOneRead(n.id)}>
                                    <div className="tb-notif-item-icon" style={{ background: cfg.bg, color: cfg.color }}>
                                        <Icon size={16} />
                                    </div>
                                    <div className="tb-notif-item-body">
                                        <p className="tb-notif-item-title">{n.title}</p>
                                        <p className="tb-notif-item-text">{n.body}</p>
                                        <span className="tb-notif-item-time">{n.time}</span>
                                    </div>
                                    <button
                                        className="tb-notif-dismiss"
                                        onClick={(e) => { e.stopPropagation(); dismissOne(n.id); }}
                                        title="Dismiss"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            );
                        })}
                        {notifications.length === 0 && (
                            <div className="tb-notif-empty">
                                <CheckCircle2 size={32} className="text-emerald-400" />
                                <p>You're all caught up!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Main Top Bar ─────────────────────────────────────────── */}
            <header className="tb-bar">

                {/* LEFT: hamburger + breadcrumbs */}
                <div className="tb-left">
                    <button className="tb-hamburger" onClick={onToggleSidebar} aria-label="Toggle sidebar" data-tour="menu-toggle">
                        <Menu size={20} />
                    </button>

                    <nav className="tb-breadcrumb" aria-label="breadcrumb">
                        {breadcrumbs.map((crumb, idx) => {
                            const Icon = crumb.icon;
                            return (
                                <React.Fragment key={idx}>
                                    {idx > 0 && <ChevronRight size={13} className="tb-crumb-sep" />}
                                    <span className={`tb-crumb ${idx === breadcrumbs.length - 1 ? 'current' : 'ancestor'}`}>
                                        {Icon && <Icon size={14} className="tb-crumb-icon" />}
                                        {crumb.label}
                                    </span>
                                </React.Fragment>
                            );
                        })}
                    </nav>
                </div>

                {/* CENTER: command palette trigger */}
                <div className="tb-center">
                    <button className="tb-search-trigger" onClick={() => setShowCommandPalette(true)}>
                        <Search size={15} className="tb-search-icon" />
                        <span className="tb-search-placeholder">Search modules, actions…</span>
                        <kbd className="tb-search-kbd">
                            <Command size={11} />K
                        </kbd>
                    </button>
                </div>

                {/* RIGHT: status + date + actions + user */}
                <div className="tb-right">

                    {/* Online / Offline pill */}
                    <div className={`tb-online-pill ${isOnline ? 'online' : 'offline'}`}>
                        {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                        <span>{isOnline ? 'Live' : 'Offline'}</span>
                    </div>

                    {/* Date + clock chip */}
                    <div className="tb-date-chip">
                        <CalendarDays size={13} />
                        <span>{dateStr}</span>
                        <span className="tb-dot">·</span>
                        <LiveClock />
                    </div>

                    {/* Dark mode toggle */}
                    <button
                        className="tb-icon-btn"
                        onClick={onToggleDarkMode}
                        title={isDarkMode ? 'Light mode' : 'Dark mode'}
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {/* Notifications */}
                    <div className="tb-notif-wrap">
                        <button
                            className={`tb-icon-btn notif ${unreadCount > 0 ? 'has-badge' : ''}`}
                            onClick={() => { setShowNotifications(p => !p); setShowUserMenu(false); }}
                            title="Notifications"
                            data-tour="notifications"
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span className="tb-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                            )}
                        </button>
                    </div>

                    {/* User Menu */}
                    <div className="tb-user-wrap" ref={userRef}>
                        <button
                            className="tb-user-btn"
                            onClick={() => { setShowUserMenu(p => !p); setShowNotifications(false); }}
                            aria-expanded={showUserMenu}
                        >
                            <div className="tb-avatar">
                                <span>{currentUser?.initials || 'U'}</span>
                                <span className="tb-avatar-status online" />
                            </div>
                            <div className="tb-user-info compact-hide">
                                <span className="tb-user-name">
                                    {currentUser?.firstName || 'User'} {currentUser?.lastName || ''}
                                </span>
                                <span
                                    className="tb-role-badge"
                                    style={{ background: roleStyle.bg, color: roleStyle.color }}
                                >
                                    {roleStyle.label}
                                </span>
                            </div>
                            <ChevronDown size={14} className={`tb-user-chevron ${showUserMenu ? 'open' : ''}`} />
                        </button>

                        {showUserMenu && (
                            <div className="tb-user-menu" role="menu">
                                {/* Profile header */}
                                <div className="tb-user-menu-header">
                                    <div className="tb-avatar lg">
                                        <span>{currentUser?.initials || 'U'}</span>
                                        <span className="tb-avatar-status online" />
                                    </div>
                                    <div>
                                        <p className="tb-um-name">{currentUser?.firstName} {currentUser?.lastName}</p>
                                        <p className="tb-um-email">{currentUser?.email}</p>
                                        <span
                                            className="tb-role-badge mt-1"
                                            style={{ background: roleStyle.bg, color: roleStyle.color }}
                                        >
                                            {roleStyle.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="tb-um-divider" />

                                <button className="tb-um-item" onClick={() => { setShowUserMenu(false); navigate('/dashboard/users/account'); }}>
                                    <UserCog size={16} />
                                    <span>My Profile</span>
                                    <kbd className="tb-um-shortcut">P</kbd>
                                </button>
                                <button className="tb-um-item" onClick={() => { setShowUserMenu(false); navigate('/dashboard/settings'); }}>
                                    <Settings size={16} />
                                    <span>Settings</span>
                                </button>

                                <div className="tb-um-divider" />

                                <button className="tb-um-item danger" onClick={onLogout}>
                                    <LogOut size={16} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
};

export default TopBar;
