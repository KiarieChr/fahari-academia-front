import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    Users,
    CreditCard,
    GraduationCap,
    Briefcase,
    DollarSign,
    LogOut,
    Menu,
    UserCog,
    Settings,
    ChevronDown,
    ChevronRight,
    X,
    Search,
    Bell,
    Sun,
    Moon,
    CalendarDays,
    Compass,
} from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { usePermissions } from '../auth/PermissionProvider';
import SystemTour from '../components/common/SystemTour';
import './dashboard.css';

const DashboardLayout = ({ children, title }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedItems, setExpandedItems] = React.useState({});
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isCompactMode, setIsCompactMode] = React.useState(false);
    const [isDarkMode, setIsDarkMode] = React.useState(false);
    const [activeTheme, setActiveTheme] = React.useState(
        () => localStorage.getItem('fahari-theme') || 'ocean'
    );
    const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
    const [pageTitle, setPageTitle] = useState('Overview');
    const [currentUser, setCurrentUser] = useState(null);
    const [isTourRunning, setIsTourRunning] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = React.useRef(null);

    const TOUR_VERSION = 'v1';

    const getTourStorageKey = (user) => {
        const identity = user?.id || user?.email || user?.initials || 'anonymous';
        return `system_tour_seen_${identity}_${TOUR_VERSION}`;
    };

    const startTour = () => {
        setIsTourRunning(true);
    };

    const handleTourFinish = () => {
        if (currentUser) {
            localStorage.setItem(getTourStorageKey(currentUser), '1');
        }
        sessionStorage.removeItem('force_system_tour');
        setIsTourRunning(false);
    };

    const openProfile = () => {
        setIsUserMenuOpen(false);
        navigate('/dashboard/users/account');
    };

    const openUserSettings = () => {
        setIsUserMenuOpen(false);
        navigate('/dashboard/settings');
    };

    const { hasModuleAccess, isSuperuser } = usePermissions();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { sectionLabel: 'ACADEMICS' },
        {
            icon: Users,
            label: 'Student Management',
            path: '/dashboard/students',
            module: 'students',
            subItems: [
                { label: 'Admission Book', path: '/dashboard/students/admission' },
                { label: 'Academic Sessions', path: '/dashboard/students/academic-sessions' },
                { label: 'Class Sessions', path: '/dashboard/students/sessions' },
                { label: 'Curriculums', path: '/dashboard/students/curriculums' },
                { label: 'Reports', path: '/dashboard/students/reports' },
                { label: 'Settings / Setup', path: '/dashboard/students/settings' }
            ]
        },
        {
            icon: CalendarDays,
            label: 'Timetables',
            path: '/dashboard/timetables',
            module: 'timetables',
            subItems: [
                { label: 'Weekly Timetable', path: '/dashboard/timetables' },
                { label: 'Day Structure', path: '/dashboard/timetables?tab=slots' },
                { label: 'Work Allocations', path: '/dashboard/timetables?tab=allocations' },
                { label: 'Teacher Schedules', path: '/dashboard/timetables?tab=teachers' },
                { label: 'Room Allocation', path: '/dashboard/timetables?tab=rooms' },
                { label: 'Analytics', path: '/dashboard/timetables?tab=analytics' },
            ]
        },
        {
            icon: GraduationCap,
            label: 'Student Academics',
            path: '/dashboard/academics',
            module: 'academics',
            subItems: [
                { label: 'Marks Inputs', path: '/dashboard/academics/marks' },
                { label: 'Curriculum Setup', path: '/dashboard/academics/curriculum' },
                { label: 'Subjects', path: '/dashboard/academics/subjects' },
                { label: 'Subject Allocation', path: '/dashboard/academics/allocation' },
                { label: 'Grading Scheme', path: '/dashboard/academics/grading' },
                { label: 'Reports', path: '/dashboard/academics/reports' },
                { label: 'Assignments', path: '/dashboard/academics/assignments' },
                { label: 'Settings', path: '/dashboard/academics/settings' }
            ]
        },
        { sectionLabel: 'OPERATIONS' },
        {
            icon: CreditCard,
            label: 'Student Fees',
            path: '/dashboard/fees',
            module: 'fees',
            subItems: [
                { label: 'Receipt Book', path: '/dashboard/fees/receipts' },
                { label: 'Student Invoice', path: '/dashboard/fees/invoice' },
                { label: 'Student Arrears', path: '/dashboard/fees/arrears' },
                { label: 'Fee Structure', path: '/dashboard/fees/structure' },
                { label: 'Fee Templates', path: '/dashboard/fees/templates' },
                { label: 'Report Settings', path: '/dashboard/fees/settings' }
            ]
        },
        {
            icon: DollarSign,
            label: 'Finance',
            path: '/dashboard/finance',
            module: 'finance',
            subItems: [
                { label: 'Accounts Payable', path: '/dashboard/finance/payable' },
                { label: 'Customer Invoice', path: '/dashboard/fees/invoice' },
                { label: 'Chart of Accounts', path: '/dashboard/finance/chart' },
                { label: 'Journals', path: '/dashboard/finance/journals' },
                { label: 'Finance Report', path: '/dashboard/finance/reports' },
                { label: 'Finance Settings', path: '/dashboard/finance/settings' }
            ]
        },
        {
            icon: ShoppingCart,
            label: 'Procurement',
            path: '/dashboard/procurement',
            module: 'procurement',
            subItems: [
                { label: 'Purchase Requisition', path: '/dashboard/procurement/requisition' },
                { label: 'Purchase Order', path: '/dashboard/procurement/order' },
                { label: 'RFQ & Quotations', path: '/dashboard/procurement/rfq' },
                { label: 'G.R.N', path: '/dashboard/procurement/grn' },
                { label: 'Contracts', path: '/dashboard/procurement/contracts' },
                { label: 'Supply Management', path: '/dashboard/procurement/suppliers' },
                { label: 'Inventories', path: '/dashboard/procurement/inventory' },
                { label: 'Inventory Journal', path: '/dashboard/procurement/journal' },
                { label: 'Procurement Reports', path: '/dashboard/procurement/reports' },
                { label: 'E.G.P', path: '/dashboard/procurement/egp' },
                { label: 'Settings', path: '/dashboard/procurement/settings' }
            ]
        },
        {
            icon: Compass,
            label: 'Fleet Management',
            path: '/dashboard/fleet',
            module: 'fleet',
            subItems: [
                { label: 'Fleet Dashboard', path: '/dashboard/fleet' },
                { label: 'Vehicles', path: '/dashboard/fleet?tab=vehicles' },
                { label: 'Drivers', path: '/dashboard/fleet?tab=drivers' },
                { label: 'Trips', path: '/dashboard/fleet?tab=trips' },
                { label: 'Fuel & Mileage', path: '/dashboard/fleet?tab=fuel' },
                { label: 'Maintenance', path: '/dashboard/fleet?tab=maintenance' },
                { label: 'Expenses', path: '/dashboard/fleet?tab=expenses' },
            ]
        },
        { sectionLabel: 'PEOPLE' },
        {
            icon: Briefcase,
            label: 'Human Resource',
            path: '/dashboard/hr',
            module: 'hr',
            subItems: [
                { label: 'Staff Register', path: '/dashboard/hr/staff-register' },
                { label: 'Staff Attendance', path: '/dashboard/hr/staff-attendance' },
                { label: 'Staff Performance', path: '/dashboard/hr/staff-performance' },
                { label: 'Recruitments', path: '/dashboard/hr/recruitments' },
                { label: 'Leave Management', path: '/dashboard/hr/leave' },
                { label: 'HR Reports', path: '/dashboard/hr/hr-reports' },
                { label: 'HR Settings', path: '/dashboard/hr/hr-settings' }
            ]
        },
        {
            icon: DollarSign,
            label: 'Payroll',
            path: '/dashboard/payroll',
            module: 'payroll',
            subItems: [
                { label: 'Payroll', path: '/dashboard/payroll/process' },
                { label: 'Employee Earnings', path: '/dashboard/payroll/earnings' },
                { label: 'Employee Deductions', path: '/dashboard/payroll/deductions' },
                { label: 'Financial Institution', path: '/dashboard/payroll/financial' },
                { label: 'Statutory Settings', path: '/dashboard/payroll/statutory' },
                { label: 'Pension Schemes', path: '/dashboard/payroll/pension' },
                { label: 'Payroll Reports', path: '/dashboard/payroll/reports' },
                { label: 'Payroll Settings', path: '/dashboard/payroll/settings' }
            ]
        },
        { sectionLabel: 'ADMINISTRATION' },
        {
            icon: UserCog,
            label: 'User Management',
            path: '/dashboard/users',
            module: 'users',
            subItems: [
                { label: 'My Account', path: '/dashboard/users/account' },
                { label: 'Users', path: '/dashboard/users/list' }
            ]
        },
        { icon: Settings, label: 'Settings', path: '/dashboard/settings', module: 'settings', subItems: [
                { label: 'Institution Profile', path: '/dashboard/settings' },
                { label: 'Campuses', path: '/dashboard/settings?tab=campuses' }
            ]
        },
    ];

    // Auto-expand the parent whose child is currently active
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const data = await api.getCurrentUser();
                const profile = data.success ? data.profile : data;
                setCurrentUser({
                    id:        profile.id || profile.user?.id || null,
                    firstName: profile.first_name || '',
                    lastName:  profile.last_name  || '',
                    email:     profile.email      || '',
                    role:      profile.role        || 'User',
                    avatar:    profile.avatar      || null,
                    initials: (
                        (profile.first_name?.[0] || '') +
                        (profile.last_name?.[0]  || '')
                    ).toUpperCase() || '?',
                });
            } catch {
                // silently keep null — fallback UI handles it
            }
        };
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const hasSeenTour = localStorage.getItem(getTourStorageKey(currentUser)) === '1';
        const forceTour = sessionStorage.getItem('force_system_tour') === '1';

        if (forceTour || !hasSeenTour) {
            const timer = setTimeout(() => {
                setIsTourRunning(true);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [currentUser]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (!userMenuRef.current?.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    // Auto-expand the parent whose child is currently active
    useEffect(() => {
        const autoExpand = {};
        navItems.forEach(item => {
            if (item.subItems && location.pathname.startsWith(item.path)) {
                autoExpand[item.path] = true;
            }
        });
        setExpandedItems(prev => ({ ...prev, ...autoExpand }));
    }, [location.pathname]);

    // Determine Page Title based on current path
    useEffect(() => {
        const currentPath = location.pathname;
        let title = 'Dashboard';

        // Exact match
        const exactMatch = navItems.find(item => item.path === currentPath);
        if (exactMatch) {
            title = exactMatch.label;
        } else {
            // Check subItems
            for (const item of navItems) {
                if (item.subItems) {
                    const subItem = item.subItems.find(sub => sub.path === currentPath);
                    if (subItem) {
                        title = `${item.label} / ${subItem.label}`;
                        break;
                    }
                }
                // Check if path starts with item path (for dynamic module pages)
                if (currentPath.startsWith(item.path) && item.path !== '/dashboard') {
                    title = item.label;
                }
            }
        }
        setPageTitle(title);
    }, [location, navItems]);

    // Close sidebar when resizing to larger screens
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            if (window.innerWidth >= 768 && isSidebarOpen) {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isSidebarOpen]);

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (windowWidth < 768 && isSidebarOpen &&
                !event.target.closest('.sidebar') &&
                !event.target.closest('.menu-toggle-btn')) {
                setIsSidebarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSidebarOpen, windowWidth]);

    const toggleExpand = (path) => {
        setExpandedItems(prev => ({ ...prev, [path]: !prev[path] }));
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark-mode');
    };

    // ── Theme Switcher ──────────────────────────────────────────────────
    const THEMES = [
        { key: 'ocean',   color: '#3f51b5', label: 'Ocean Blue'    },
        { key: 'emerald', color: '#059669', label: 'Emerald Green'  },
        { key: 'purple',  color: '#7c3aed', label: 'Royal Purple'   },
        { key: 'crimson', color: '#dc2626', label: 'Crimson Red'    },
        { key: 'amber',   color: '#d97706', label: 'Amber Gold'     },
    ];

    const applyTheme = (themeKey) => {
        document.documentElement.setAttribute('data-theme', themeKey);
        localStorage.setItem('fahari-theme', themeKey);
        setActiveTheme(themeKey);
    };

    // Apply persisted theme on mount
    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', activeTheme);
    }, []);

    const handleLogout = async () => {
        try {
            await api.logout();
            localStorage.removeItem('token');
            toast.success("Logged out successfully");
            navigate('/');
        } catch (error) {
            localStorage.removeItem('token');
            navigate('/');
        }
    };

    // Auto-close submenus on mobile when navigating
    const handleNavClick = () => {
        if (windowWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className="dashboard-container">
            <SystemTour run={isTourRunning} onFinish={handleTourFinish} />
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''} ${isCompactMode ? 'compact' : ''}`}>
                <div className="sidebar-header">
                    <div className="brand-text">
                        <GraduationCap size={28} />
                        <span className="brand-name">Fahari ERP</span>
                    </div>
                    <button
                        className="sidebar-close-btn"
                        onClick={() => setIsSidebarOpen(false)}
                        aria-label="Close sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="sidebar-search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search menu..."
                        className="sidebar-search-input"
                    />
                </div>

                <nav className="sidebar-nav" data-tour="sidebar-nav">
                    {navItems.filter(item => {
                        // Always show section labels and items without a module key
                        if (item.sectionLabel || !item.module) return true;
                        return hasModuleAccess(item.module);
                    }).filter((item, idx, arr) => {
                        // Remove section labels that have no visible children after them
                        if (!item.sectionLabel) return true;
                        const nextItems = arr.slice(idx + 1);
                        const nextSection = nextItems.findIndex(i => i.sectionLabel);
                        const children = nextSection === -1 ? nextItems : nextItems.slice(0, nextSection);
                        return children.some(i => !i.sectionLabel);
                    }).map((item, idx) => {
                        if (item.sectionLabel) {
                            return (
                                <div key={`section-${idx}`} className="nav-section-label">
                                    {item.sectionLabel}
                                </div>
                            );
                        }

                        const isChildActive = item.subItems &&
                            item.subItems.some(sub => location.pathname === sub.path);
                        const isParentActive = item.subItems
                            ? location.pathname.startsWith(item.path)
                            : location.pathname === item.path;

                        return (
                            <div key={item.path} className="nav-item-wrapper">
                                {item.subItems ? (
                                    <>
                                        <div
                                            className={[
                                                'nav-item',
                                                isParentActive ? 'parent-active' : '',
                                                isChildActive ? 'has-active-child' : '',
                                                expandedItems[item.path] ? 'is-expanded' : '',
                                            ].filter(Boolean).join(' ')}
                                            onClick={() => toggleExpand(item.path)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyPress={(e) => e.key === 'Enter' && toggleExpand(item.path)}
                                            title={isCompactMode ? item.label : undefined}
                                        >
                                            <div className="nav-item-content">
                                                <item.icon size={20} className="nav-icon" />
                                                <span className="nav-label">{item.label}</span>
                                            </div>
                                            <ChevronDown
                                                size={15}
                                                className={`nav-chevron ${expandedItems[item.path] ? 'rotated' : ''}`}
                                            />
                                        </div>
                                        <div className={`nav-sub-items ${expandedItems[item.path] ? 'expanded' : ''}`}>
                                            {item.subItems.map(sub => (
                                                <Link
                                                    key={sub.path}
                                                    to={sub.path}
                                                    className={`nav-sub-item ${location.pathname === sub.path ? 'active' : ''}`}
                                                    onClick={handleNavClick}
                                                    title={isCompactMode ? sub.label : undefined}
                                                >
                                                    <span className="sub-item-dot" />
                                                    {sub.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <Link
                                        to={item.path}
                                        className={`nav-item ${isParentActive ? 'active' : ''}`}
                                        onClick={handleNavClick}
                                        title={isCompactMode ? item.label : undefined}
                                    >
                                        <div className="nav-item-content">
                                            <item.icon size={20} className="nav-icon" />
                                            <span className="nav-label">{item.label}</span>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    {/* ── Color Theme Picker ── */}
                    <div className="theme-picker">
                        <span className="theme-picker-label">Theme</span>
                        <div className="theme-dot-row">
                            {THEMES.map(t => (
                                <button
                                    key={t.key}
                                    className={`theme-dot ${activeTheme === t.key ? 'active' : ''}`}
                                    style={{ backgroundColor: t.color }}
                                    onClick={() => applyTheme(t.key)}
                                    title={t.label}
                                    aria-label={`Switch to ${t.label} theme`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="theme-toggle">
                        <button
                            onClick={toggleDarkMode}
                            className="theme-toggle-btn"
                            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                            <span className="compact-hide">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2 w-full">
                        <button onClick={handleLogout} className="logout-btn flex-1">
                            <LogOut size={18} className="logout-icon" />
                            <span className="compact-hide">Logout</span>
                        </button>
                        
                        {windowWidth >= 768 && (
                            <button 
                                onClick={() => setIsCompactMode(!isCompactMode)} 
                                className="sidebar-compact-toggle flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex-shrink-0"
                                title={isCompactMode ? "Expand Sidebar" : "Compact Sidebar"}
                            >
                                <ChevronRight size={18} className={`transition-transform duration-300 ${isCompactMode ? '' : 'rotate-180'}`} />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`main-content ${isCompactMode ? 'compact' : ''}`}>
                <header className="top-header">
                    <div className="header-left">
                        <button
                            className="menu-toggle-btn"
                            onClick={toggleSidebar}
                            aria-label="Toggle sidebar"
                            data-tour="menu-toggle"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="header-title" data-tour="header-title">
                            <h1>{title || pageTitle}</h1>
                            {windowWidth >= 1024 && (
                                <span className="header-subtitle">
                                    Welcome back, {currentUser?.firstName || 'Admin'}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="header-right">
                        <div className="header-actions">
                            <button
                                className="header-action-btn tour-trigger-btn"
                                aria-label="Start system tour"
                                title="Start system tour"
                                onClick={startTour}
                            >
                                <Compass size={18} />
                                <span className="tour-trigger-text">Tour</span>
                            </button>
                            <button className="header-action-btn" aria-label="Search">
                                <Search size={20} />
                            </button>
                            <button className="header-action-btn notification-btn" aria-label="Notifications" data-tour="notifications">
                                <Bell size={20} />
                                <span className="notification-badge">3</span>
                            </button>
                            <button
                                onClick={toggleDarkMode}
                                className="header-action-btn theme-btn"
                                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                                data-tour="theme-toggle"
                            >
                                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        </div>

                        <div className="user-profile-wrap" ref={userMenuRef}>
                        <button
                            type="button"
                            className="user-profile"
                            data-tour="user-profile"
                            onClick={() => setIsUserMenuOpen(prev => !prev)}
                            aria-haspopup="menu"
                            aria-expanded={isUserMenuOpen}
                        >
                            {currentUser?.avatar ? (
                                <img
                                    src={currentUser.avatar}
                                    alt={`${currentUser.firstName} ${currentUser.lastName}`}
                                    className="avatar"
                                    style={{ objectFit: 'cover' }}
                                />
                            ) : (
                                <div className="avatar">{currentUser?.initials || '??'}</div>
                            )}
                            <div className="user-info">
                                <span className="user-name">
                                    {currentUser
                                        ? `${currentUser.firstName} ${currentUser.lastName}`.trim() || currentUser.email
                                        : 'Loading…'}
                                </span>
                                <span className="user-role">
                                    {currentUser?.role || '…'}
                                </span>
                            </div>
                            {windowWidth >= 640 && (
                                <ChevronDown size={16} className={`user-dropdown ${isUserMenuOpen ? 'open' : ''}`} />
                            )}
                        </button>
                        {isUserMenuOpen && (
                            <div className="user-menu" role="menu" aria-label="User menu">
                                <button type="button" className="user-menu-item" role="menuitem" onClick={openProfile}>
                                    <UserCog size={16} />
                                    <span>Profile (My Account)</span>
                                </button>
                                <button type="button" className="user-menu-item" role="menuitem" onClick={openUserSettings}>
                                    <Settings size={16} />
                                    <span>User Settings</span>
                                </button>
                            </div>
                        )}
                        </div>
                    </div>
                </header>

                <div className="content-wrapper" data-tour="content-area">
                    <div className="content-container h-full">
                        {children}
                    </div>
                </div>

                {/* Mobile Bottom Navigation */}
                {windowWidth < 768 && (
                    <nav className="mobile-bottom-nav">
                        <Link to="/dashboard" className="mobile-nav-item">
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </Link>
                        <Link to="/dashboard/students" className="mobile-nav-item">
                            <Users size={20} />
                            <span>Students</span>
                        </Link>
                        <Link to="/dashboard/fees" className="mobile-nav-item">
                            <CreditCard size={20} />
                            <span>Fees</span>
                        </Link>
                        <button
                            className="mobile-nav-item menu-btn"
                            onClick={toggleSidebar}
                        >
                            <Menu size={20} />
                            <span>Menu</span>
                        </button>
                    </nav>
                )}
            </main>
        </div>
    );
};

export default DashboardLayout;
