import React, { useState, useEffect, useMemo } from 'react';
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
    Sun,
    Moon,
    CalendarDays,
    Compass,
    BookMarked,
} from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { usePermissions } from '../auth/PermissionProvider';
import SystemTour from '../components/common/SystemTour';
import TopBar from './components/TopBar';
import './dashboard.css';

const DashboardLayout = ({ children, title }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedItems, setExpandedItems] = React.useState({});
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isCompactMode, setIsCompactMode] = React.useState(
        () => localStorage.getItem('fahari-compact-sidebar') === '1'
    );
    const [isDarkMode, setIsDarkMode] = React.useState(false);
    const [isSettingsPanelOpen, setIsSettingsPanelOpen] = React.useState(false);
    const [activeTheme, setActiveTheme] = React.useState(
        () => localStorage.getItem('fahari-theme') || 'ocean'
    );
    const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
    const [pageTitle, setPageTitle] = useState('Overview');
    const [currentUser, setCurrentUser] = useState(null);
    const [isTourRunning, setIsTourRunning] = useState(false);
    const [sidebarSearch, setSidebarSearch] = useState('');
    const [compactPopover, setCompactPopover] = useState(null); // { item, top }
    const [compactTooltip, setCompactTooltip] = useState(null); // { label, top }


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
                { label: 'Admissions Overview',    path: '/dashboard/students/admission/overview' },
                { label: 'Enquiries',              path: '/dashboard/students/admission/enquiries', badge: 'NEW' },
                { label: 'Applications Register',  path: '/dashboard/students/admission/applications' },
                { label: 'Admission Register',     path: '/dashboard/students/admission/records' },
                { label: 'Nominal Roll',           path: '/dashboard/students/admission/nominal-roll' },
                { label: 'Student Reporting',      path: '/dashboard/students/admission/reporting' },
                { label: 'Repeaters & Transfers',  path: '/dashboard/students/admission/repeaters' },
                { label: 'Terms & Academic Sessions', path: '/dashboard/students/academic-sessions' },
                { label: 'Curriculums',            path: '/dashboard/students/curriculums' },
                { label: 'Settings / Setup',       path: '/dashboard/students/settings' }
            ]
        },
        {
            icon: CalendarDays,
            label: 'Timetables',
            path: '/dashboard/timetables',
            module: 'timetables'
        },
        {
            icon: GraduationCap,
            label: 'Student Academics',
            path: '/dashboard/academics',
            module: 'academics',
            subItems: [
                { label: 'Class Sessions',         path: '/dashboard/students/sessions' },
                { label: 'Exam Schedules', path: '/dashboard/academics/exam-schedules' },
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
                { label: 'Fee Templates', path: '/dashboard/fees/structure?tab=templates' },
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
                { label: 'Accounts Receivable', path: '/dashboard/finance/receivable' },
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


    // Auto-expand the parent whose child is currently active
    useEffect(() => {
        const autoExpand = {};
        navItems.forEach(item => {
            if (item.subItems) {
                const hasActiveChild = item.subItems.some(sub => 
                    location.pathname === sub.path || location.pathname.startsWith(sub.path + '/')
                );
                const isParentActive = (location.pathname.startsWith(item.path) && 
                    !navItems.some(other => other !== item && other.subItems?.some(sub => 
                        location.pathname === sub.path || location.pathname.startsWith(sub.path + '/')
                    ))
                ) || hasActiveChild;

                if (isParentActive) {
                    autoExpand[item.path] = true;
                }
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

    // Close compact popover when navigating
    React.useEffect(() => {
        setCompactPopover(null);
        setCompactTooltip(null);
    }, [location.pathname]);

    // Close compact popover on outside click
    React.useEffect(() => {
        if (!compactPopover) return;
        const handleOutside = (e) => {
            if (!e.target.closest('.compact-popover') && !e.target.closest('.compact-nav-icon')) {
                setCompactPopover(null);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [compactPopover]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleHamburgerClick = () => {
        if (windowWidth < 768) {
            toggleSidebar();
        } else {
            const next = !isCompactMode;
            setIsCompactMode(next);
            localStorage.setItem('fahari-compact-sidebar', next ? '1' : '0');
        }
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
                        placeholder="Search menu…"
                        className="sidebar-search-input"
                        value={sidebarSearch}
                        onChange={e => setSidebarSearch(e.target.value)}
                    />
                    {sidebarSearch && (
                        <button
                            onClick={() => setSidebarSearch('')}
                            className="ml-auto text-slate-400 hover:text-white transition-colors"
                            aria-label="Clear search"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>

                <nav className="sidebar-nav" data-tour="sidebar-nav">
                    {navItems.filter(item => {
                        if (item.sectionLabel) return true;
                        // Live search filter
                        if (sidebarSearch.trim()) {
                            const q = sidebarSearch.toLowerCase();
                            const labelMatch = item.label?.toLowerCase().includes(q);
                            const subMatch = item.subItems?.some(s => s.label.toLowerCase().includes(q));
                            return labelMatch || subMatch;
                        }
                        // Permission filter
                        if (!item.module) return true;
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
                            item.subItems.some(sub => location.pathname === sub.path || location.pathname.startsWith(sub.path + '/'));
                        const isParentActive = item.subItems
                            ? (location.pathname.startsWith(item.path) && 
                               !navItems.some(other => other !== item && other.subItems?.some(sub => 
                                   location.pathname === sub.path || location.pathname.startsWith(sub.path + '/')
                               ))
                              ) || isChildActive
                            : location.pathname === item.path;

                        return (
                            <div key={item.path} className="nav-item-wrapper">
                                {isCompactMode ? (
                                    /* ── Compact Mode: icon + tooltip + click popup ── */
                                    item.subItems ? (
                                        <div
                                            className={[
                                                'nav-item compact-nav-icon',
                                                isParentActive ? 'parent-active' : '',
                                                compactPopover?.item.path === item.path ? 'is-expanded' : '',
                                            ].filter(Boolean).join(' ')}
                                            onClick={(e) => {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setCompactPopover(prev =>
                                                    prev?.item.path === item.path ? null : { item, top: rect.top }
                                                );
                                                setCompactTooltip(null);
                                            }}
                                            onMouseEnter={(e) => {
                                                if (compactPopover?.item.path === item.path) return;
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setCompactTooltip({ label: item.label, top: rect.top + rect.height / 2 });
                                            }}
                                            onMouseLeave={() => setCompactTooltip(null)}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <div className="nav-item-content">
                                                <item.icon size={20} className="nav-icon" />
                                            </div>
                                        </div>
                                    ) : (
                                        <Link
                                            to={item.path}
                                            className={`nav-item compact-nav-icon ${isParentActive ? 'active' : ''}`}
                                            onClick={handleNavClick}
                                            onMouseEnter={(e) => {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setCompactTooltip({ label: item.label, top: rect.top + rect.height / 2 });
                                            }}
                                            onMouseLeave={() => setCompactTooltip(null)}
                                        >
                                            <div className="nav-item-content">
                                                <item.icon size={20} className="nav-icon" />
                                            </div>
                                        </Link>
                                    )
                                ) : (
                                    /* ── Expanded Mode: full nav with labels ── */
                                    item.subItems ? (
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
                                                {item.subItems
                                                  .filter(sub => !sidebarSearch.trim() || sub.label.toLowerCase().includes(sidebarSearch.toLowerCase()))
                                                  .map(sub => (
                                                    <Link
                                                        key={sub.path}
                                                        to={sub.path}
                                                        className={`nav-sub-item ${location.pathname === sub.path ? 'active' : ''}`}
                                                        onClick={handleNavClick}
                                                    >
                                                        <span className="sub-item-dot" />
                                                        <span className="flex-1">{sub.label}</span>
                                                        {sub.badge && (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[0.55rem] font-bold bg-indigo-500/30 text-indigo-200 ml-1">
                                                                {sub.badge}
                                                            </span>
                                                        )}
                                                    </Link>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <Link
                                            to={item.path}
                                            className={`nav-item ${isParentActive ? 'active' : ''}`}
                                            onClick={handleNavClick}
                                        >
                                            <div className="nav-item-content">
                                                <item.icon size={20} className="nav-icon" />
                                                <span className="nav-label">{item.label}</span>
                                            </div>
                                        </Link>
                                    )
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    {/* ── Color Theme Picker — MOVED to settings panel ── */}

                    {/* ── Dark Mode Toggle — MOVED to settings panel ── */}

                    <div className="flex items-center gap-2 mb-2 w-full">
                        <button onClick={handleLogout} className="logout-btn flex-1">
                            <LogOut size={18} className="logout-icon" />
                            <span className="compact-hide">Logout</span>
                        </button>
                        
                        {windowWidth >= 768 && (
                            <button 
                                onClick={() => {
                                    const next = !isCompactMode;
                                    setIsCompactMode(next);
                                    localStorage.setItem('fahari-compact-sidebar', next ? '1' : '0');
                                }} 
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
                <TopBar
                    currentUser={currentUser}
                    isDarkMode={isDarkMode}
                    onToggleSidebar={handleHamburgerClick}
                    onToggleDarkMode={toggleDarkMode}
                    onLogout={handleLogout}
                />

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
                        <Link to="/dashboard/students/admissions/overview" className="mobile-nav-item">
                            <Users size={20} />
                            <span>Students</span>
                        </Link>
                        <Link to="/dashboard/fees/receipts" className="mobile-nav-item">
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

            {/* ── Floating Settings FAB ──────────────────────────────────────── */}
            <button
                id="settings-fab"
                onClick={() => setIsSettingsPanelOpen(true)}
                aria-label="Open appearance settings"
                style={{
                    position: 'fixed',
                    bottom: '40px',
                    right: '28px',
                    zIndex: 1200,
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.45)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1) rotate(30deg)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(99,102,241,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) rotate(0deg)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.45)'; }}
            >
                <Settings size={20} color="#fff" />
            </button>

            {/* ── Settings Offcanvas Backdrop ────────────────────────────────── */}
            {isSettingsPanelOpen && (
                <div
                    onClick={() => setIsSettingsPanelOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1299,
                        background: 'rgba(15,15,35,0.35)',
                        backdropFilter: 'blur(2px)',
                        animation: 'fadeInBackdrop 0.2s ease',
                    }}
                />
            )}

            {/* ── Settings Offcanvas Panel ───────────────────────────────────── */}
            <aside
                style={{
                    position: 'fixed',
                    top: 0,
                    right: isSettingsPanelOpen ? 0 : '-360px',
                    width: '320px',
                    height: '100vh',
                    zIndex: 1300,
                    background: isDarkMode
                        ? 'linear-gradient(180deg,#1e1b4b 0%,#0f172a 100%)'
                        : 'linear-gradient(180deg,#ffffff 0%,#f8f8ff 100%)',
                    borderLeft: isDarkMode ? '1px solid rgba(99,102,241,0.2)' : '1px solid #e5e7eb',
                    boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
                    transition: 'right 0.35s cubic-bezier(0.4,0,0.2,1)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {/* Panel Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 20px 16px',
                    borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid #f0f0f8',
                    background: isDarkMode
                        ? 'linear-gradient(90deg,rgba(99,102,241,0.15),transparent)'
                        : 'linear-gradient(90deg,rgba(99,102,241,0.06),transparent)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '10px',
                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
                        }}>
                            <Settings size={18} color="#fff" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: isDarkMode ? '#f1f5f9' : '#1e1b4b' }}>Appearance</p>
                            <p style={{ margin: 0, fontSize: '0.68rem', color: isDarkMode ? '#94a3b8' : '#9ca3af' }}>Customise your experience</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsSettingsPanelOpen(false)}
                        style={{
                            width: 32, height: 32, borderRadius: '8px', border: 'none',
                            background: isDarkMode ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
                            color: isDarkMode ? '#94a3b8' : '#6b7280',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.15s',
                        }}
                        aria-label="Close settings"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Panel Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

                    {/* ── Dark Mode ── */}
                    <div style={{
                        marginBottom: '24px',
                        padding: '16px',
                        borderRadius: '14px',
                        background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f9fafb',
                        border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb',
                    }}>
                        <p style={{ margin: '0 0 14px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: isDarkMode ? '#64748b' : '#9ca3af' }}>Colour Mode</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {[{ label: 'Light', icon: <Sun size={16}/>, val: false }, { label: 'Dark', icon: <Moon size={16}/>, val: true }].map(opt => (
                                <button
                                    key={opt.label}
                                    onClick={() => { setIsDarkMode(opt.val); document.documentElement.classList.toggle('dark-mode', opt.val); }}
                                    style={{
                                        flex: 1, padding: '10px 8px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                                        fontSize: '0.72rem', fontWeight: 600,
                                        transition: 'all 0.2s',
                                        background: isDarkMode === opt.val
                                            ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                                            : isDarkMode ? 'rgba(255,255,255,0.06)' : '#fff',
                                        color: isDarkMode === opt.val ? '#fff' : isDarkMode ? '#94a3b8' : '#6b7280',
                                        boxShadow: isDarkMode === opt.val ? '0 4px 14px rgba(99,102,241,0.35)' : 'none',
                                        border: isDarkMode === opt.val ? 'none' : isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                                    }}
                                >
                                    {opt.icon}
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Theme Colours ── */}
                    <div style={{
                        marginBottom: '24px',
                        padding: '16px',
                        borderRadius: '14px',
                        background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f9fafb',
                        border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb',
                    }}>
                        <p style={{ margin: '0 0 14px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: isDarkMode ? '#64748b' : '#9ca3af' }}>Accent Colour</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {THEMES.map(t => (
                                <button
                                    key={t.key}
                                    onClick={() => applyTheme(t.key)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '10px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                        background: activeTheme === t.key
                                            ? isDarkMode ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.08)'
                                            : 'transparent',
                                        outline: activeTheme === t.key ? `2px solid ${t.color}` : '2px solid transparent',
                                        transition: 'all 0.15s',
                                        width: '100%',
                                    }}
                                    aria-label={`Switch to ${t.label} theme`}
                                >
                                    <span style={{
                                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                                        background: t.color,
                                        boxShadow: activeTheme === t.key ? `0 0 0 3px ${t.color}40` : 'none',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'box-shadow 0.2s',
                                    }}>
                                        {activeTheme === t.key && (
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: activeTheme === t.key ? 700 : 500, color: isDarkMode ? '#e2e8f0' : '#374151' }}>
                                        {t.label}
                                    </span>
                                    {activeTheme === t.key && (
                                        <span style={{ marginLeft: 'auto', fontSize: '0.6rem', fontWeight: 700, color: t.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Layout ── */}
                    <div style={{
                        marginBottom: '24px',
                        padding: '16px',
                        borderRadius: '14px',
                        background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f9fafb',
                        border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb',
                    }}>
                        <p style={{ margin: '0 0 14px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: isDarkMode ? '#64748b' : '#9ca3af' }}>Sidebar</p>

                        {/* Compact mode */}
                        {windowWidth >= 768 && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: isDarkMode ? '#e2e8f0' : '#374151' }}>Compact Sidebar</p>
                                    <p style={{ margin: 0, fontSize: '0.68rem', color: isDarkMode ? '#64748b' : '#9ca3af' }}>Collapse to icon-only mode</p>
                                </div>
                                {/* Toggle */}
                                <button
                                    onClick={() => {
                                        const next = !isCompactMode;
                                        setIsCompactMode(next);
                                        localStorage.setItem('fahari-compact-sidebar', next ? '1' : '0');
                                    }}
                                    style={{
                                        width: 44, height: 24, borderRadius: '12px', border: 'none', cursor: 'pointer',
                                        background: isCompactMode ? 'linear-gradient(90deg,#6366f1,#8b5cf6)' : isDarkMode ? '#334155' : '#e5e7eb',
                                        position: 'relative', transition: 'background 0.25s',
                                        flexShrink: 0,
                                    }}
                                    aria-label="Toggle compact sidebar"
                                >
                                    <span style={{
                                        position: 'absolute', top: 3,
                                        left: isCompactMode ? 23 : 3,
                                        width: 18, height: 18, borderRadius: '50%',
                                        background: '#fff',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                                        transition: 'left 0.25s',
                                    }} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── Version badge ── */}
                    <div style={{ textAlign: 'center', marginTop: '8px' }}>
                        <p style={{ fontSize: '0.65rem', color: isDarkMode ? '#334155' : '#d1d5db', margin: 0 }}>Fahari ERP · Appearance Settings</p>
                    </div>
                </div>
            </aside>

            {/* Keyframe for backdrop fade */}
            <style>{`
                @keyframes fadeInBackdrop {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                #settings-fab:focus-visible {
                    outline: 3px solid rgba(139,92,246,0.6);
                    outline-offset: 3px;
                }
            `}</style>

            {/* ── Compact Sidebar Tooltip ───────────────────────────────────── */}
            {isCompactMode && compactTooltip && (
                <div
                    className="compact-tooltip"
                    style={{ top: compactTooltip.top, transform: 'translateY(-50%)' }}
                >
                    {compactTooltip.label}
                </div>
            )}

            {/* ── Compact Sidebar Submenu Popover ───────────────────────────── */}
            {isCompactMode && compactPopover && (
                <div
                    className="compact-popover"
                    style={{
                        top: Math.min(
                            compactPopover.top,
                            window.innerHeight - (compactPopover.item.subItems.length * 42 + 56)
                        ),
                    }}
                >
                    <div className="compact-popover-header">
                        {compactPopover.item.label}
                    </div>
                    {compactPopover.item.subItems.map(sub => (
                        <Link
                            key={sub.path}
                            to={sub.path}
                            className={`compact-popover-item ${location.pathname === sub.path ? 'active' : ''}`}
                            onClick={() => { setCompactPopover(null); handleNavClick(); }}
                        >
                            <span className="sub-dot" />
                            {sub.label}
                            {sub.badge && (
                                <span style={{ marginLeft: 'auto', fontSize: '0.55rem', fontWeight: 700, background: 'rgba(99,102,241,0.3)', color: '#a5b4fc', padding: '2px 7px', borderRadius: '10px' }}>
                                    {sub.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            )}

        </div>
    );
};

export default DashboardLayout;
