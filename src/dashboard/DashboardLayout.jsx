import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
    Moon
} from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import './dashboard.css';

const DashboardLayout = ({ children, title = "Overview" }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedItems, setExpandedItems] = React.useState({});
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isDarkMode, setIsDarkMode] = React.useState(false);
    const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);

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

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        {
            icon: Users,
            label: 'Student Management',
            path: '/dashboard/students',
            subItems: [
                { label: 'Admission Book', path: '/dashboard/students/admission' },
                { label: 'Class Sessions', path: '/dashboard/students/sessions' },
                { label: 'Curriculums', path: '/dashboard/students/curriculums' },
                { label: 'Reports', path: '/dashboard/students/reports' },
                { label: 'Class Times', path: '/dashboard/students/times' },
                { label: 'Settings / Setup', path: '/dashboard/students/settings' }
            ]
        },
        {
            icon: GraduationCap,
            label: 'Student Academics',
            path: '/dashboard/academics',
            subItems: [
                { label: 'Marks Inputs', path: '/dashboard/academics/marks' },
                { label: 'Curriculum Setup', path: '/dashboard/academics/curriculum' },
                { label: 'Subjects', path: '/dashboard/academics/subjects' },
                { label: 'Subject Allocation', path: '/dashboard/academics/allocation' },
                { label: 'Grading Scheme', path: '/dashboard/academics/grading' },
                { label: 'Reports', path: '/dashboard/academics/reports' },
                { label: 'Settings', path: '/dashboard/academics/settings' }
            ]
        },
        {
            icon: CreditCard,
            label: 'Student Fees',
            path: '/dashboard/fees',
            subItems: [
                { label: 'Receipt Book', path: '/dashboard/fees/receipts' },
                { label: 'Student Invoice', path: '/dashboard/fees/invoice' },
                { label: 'Student Arrears', path: '/dashboard/fees/arrears' },
                { label: 'Fee Structure', path: '/dashboard/fees/structure' },
                { label: 'Report Settings', path: '/dashboard/fees/settings' }
            ]
        },
        {
            icon: DollarSign,
            label: 'Finance',
            path: '/dashboard/finance',
            subItems: [
                { label: 'Accounts Payable', path: '/dashboard/finance/payable' },
                { label: 'Customer Invoice', path: '/dashboard/finance/invoice' },
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
            subItems: [
                { label: 'Purchase Requisition', path: '/dashboard/procurement/requisition' },
                { label: 'Purchase Order', path: '/dashboard/procurement/order' },
                { label: 'G.R.N', path: '/dashboard/procurement/grn' },
                { label: 'Supply Management', path: '/dashboard/procurement/suppliers' },
                { label: 'Inventories', path: '/dashboard/procurement/inventory' },
                { label: 'Inventory Journal', path: '/dashboard/procurement/journal' },
                { label: 'Procurement Reports', path: '/dashboard/procurement/reports' },
                { label: 'E.G.P', path: '/dashboard/procurement/egp' },
                { label: 'Settings', path: '/dashboard/procurement/settings' }
            ]
        },
        {
            icon: Briefcase,
            label: 'Human Resource',
            path: '/dashboard/hr',
            subItems: [
                { label: 'Staff Register', path: '/hr/staff-register' },
                { label: 'Staff Attendance', path: '/hr/staff-attendance' },
                { label: 'Staff Performance', path: '/hr/staff-performance' },
                { label: 'Recruitments', path: '/hr/recruitments' },
                { label: 'Leave Management', path: '/dashboard/hr/leave' },
                { label: 'HR Reports', path: '/hr/hr-reports' },
                { label: 'HR Settings', path: '/hr/hr-settings' }
            ]
        },
        {
            icon: DollarSign,
            label: 'Payroll',
            path: '/dashboard/payroll',
            subItems: [
                { label: 'Payroll', path: '/dashboard/payroll/process' },
                { label: 'Employee Earnings', path: '/dashboard/payroll/earnings' },
                { label: 'Employee Deductions', path: '/dashboard/payroll/deductions' },
                { label: 'Financial Institution', path: '/dashboard/payroll/financial' },
                { label: 'Statutory Settings', path: '/dashboard/payroll/statutory' },
                { label: 'Payroll Settings', path: '/dashboard/payroll/settings' }
            ]
        },
        {
            icon: UserCog,
            label: 'User Management',
            path: '/dashboard/users',
            subItems: [
                { label: 'My Account', path: '/dashboard/users/account' },
                { label: 'Users', path: '/dashboard/users/list' }
            ]
        },
        { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
    ];

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
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
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

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <div key={item.path} className="nav-item-wrapper">
                            {item.subItems ? (
                                <>
                                    <div
                                        className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                                        onClick={() => toggleExpand(item.path)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyPress={(e) => e.key === 'Enter' && toggleExpand(item.path)}
                                    >
                                        <div className="nav-item-content">
                                            <item.icon size={20} className="nav-icon" />
                                            <span className="nav-label">{item.label}</span>
                                        </div>
                                        {expandedItems[item.path] ?
                                            <ChevronDown size={16} className="nav-chevron" /> :
                                            <ChevronRight size={16} className="nav-chevron" />
                                        }
                                    </div>
                                    <div className={`nav-sub-items ${expandedItems[item.path] ? 'expanded' : ''}`}>
                                        {item.subItems.map(sub => (
                                            <Link
                                                key={sub.path}
                                                to={sub.path}
                                                className={`nav-sub-item ${location.pathname === sub.path ? 'active' : ''}`}
                                                onClick={handleNavClick}
                                            >
                                                {sub.label}
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <Link
                                    to={item.path}
                                    className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                                    onClick={handleNavClick}
                                >
                                    <div className="nav-item-content">
                                        <item.icon size={20} className="nav-icon" />
                                        <span className="nav-label">{item.label}</span>
                                    </div>
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="theme-toggle">
                        <button
                            onClick={toggleDarkMode}
                            className="theme-toggle-btn"
                            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={18} className="logout-icon" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="top-header">
                    <div className="header-left">
                        <button
                            className="menu-toggle-btn"
                            onClick={toggleSidebar}
                            aria-label="Toggle sidebar"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="header-title">
                            <h1>{title}</h1>
                            {windowWidth >= 1024 && (
                                <span className="header-subtitle">Welcome back, Admin</span>
                            )}
                        </div>
                    </div>

                    <div className="header-right">
                        <div className="header-actions">
                            <button className="header-action-btn" aria-label="Search">
                                <Search size={20} />
                            </button>
                            <button className="header-action-btn notification-btn" aria-label="Notifications">
                                <Bell size={20} />
                                <span className="notification-badge">3</span>
                            </button>
                            <button
                                onClick={toggleDarkMode}
                                className="header-action-btn theme-btn"
                                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                            >
                                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        </div>

                        <div className="user-profile">
                            <div className="avatar">AD</div>
                            <div className="user-info">
                                <span className="user-name">Admin User</span>
                                <span className="user-role">System Administrator</span>
                            </div>
                            {windowWidth >= 640 && (
                                <ChevronDown size={16} className="user-dropdown" />
                            )}
                        </div>
                    </div>
                </header>

                <div className="content-wrapper">
                    <div className="content-container">
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