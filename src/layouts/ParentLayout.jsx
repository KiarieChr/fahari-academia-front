import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, ClipboardList, CreditCard,
    Calendar, MessageSquare, User, LogOut, Menu, X,
    Bell, Sun, Moon, ChevronDown, GraduationCap
} from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import '../dashboard/dashboard.css';

const ParentLayout = ({ children, title }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [pageTitle, setPageTitle] = useState('Dashboard');
    const [currentUser, setCurrentUser] = useState(null);
    const [expandedItems, setExpandedItems] = useState({});

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/parent' },
        { sectionLabel: 'MY CHILDREN' },
        {
            icon: Users,
            label: 'Children',
            path: '/parent/children',
            subItems: [
                { label: 'Overview', path: '/parent/children' },
                { label: 'Attendance', path: '/parent/children/attendance' },
            ]
        },
        {
            icon: ClipboardList,
            label: 'Academic Progress',
            path: '/parent/academics',
            subItems: [
                { label: 'Report Cards', path: '/parent/academics/reports' },
                { label: 'Results', path: '/parent/academics/results' },
                { label: 'Assignments', path: '/parent/assignments' },
            ]
        },
        { sectionLabel: 'FINANCE' },
        {
            icon: CreditCard,
            label: 'Fee Statements',
            path: '/parent/fees',
            subItems: [
                { label: 'Balances', path: '/parent/fees/balances' },
                { label: 'Payment History', path: '/parent/fees/payments' },
            ]
        },
        { sectionLabel: 'COMMUNICATION' },
        { icon: MessageSquare, label: 'Messages', path: '/parent/messages' },
        { icon: Calendar, label: 'Events', path: '/parent/events' },
        { icon: User, label: 'My Profile', path: '/parent/profile' },
    ];

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const data = await api.getCurrentUser();
                const profile = data.success ? data.profile : data;
                setCurrentUser({
                    firstName: profile.first_name || '',
                    lastName: profile.last_name || '',
                    email: profile.email || '',
                    role: 'Parent',
                    avatar: profile.avatar || null,
                    initials: (
                        (profile.first_name?.[0] || '') +
                        (profile.last_name?.[0] || '')
                    ).toUpperCase() || '?',
                });
            } catch { /* fallback UI handles it */ }
        };
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        const autoExpand = {};
        navItems.forEach(item => {
            if (item.subItems && location.pathname.startsWith(item.path)) {
                autoExpand[item.path] = true;
            }
        });
        setExpandedItems(prev => ({ ...prev, ...autoExpand }));
    }, [location.pathname]);

    useEffect(() => {
        const currentPath = location.pathname;
        let foundTitle = 'Dashboard';
        const exactMatch = navItems.find(item => item.path === currentPath);
        if (exactMatch) {
            foundTitle = exactMatch.label;
        } else {
            for (const item of navItems) {
                if (item.subItems) {
                    const subItem = item.subItems.find(sub => sub.path === currentPath);
                    if (subItem) { foundTitle = `${item.label} / ${subItem.label}`; break; }
                }
                if (item.path && currentPath.startsWith(item.path) && item.path !== '/parent') {
                    foundTitle = item.label;
                }
            }
        }
        setPageTitle(foundTitle);
    }, [location.pathname]);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            if (window.innerWidth >= 768 && isSidebarOpen) setIsSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isSidebarOpen]);

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

    const toggleExpand = (path) => setExpandedItems(prev => ({ ...prev, [path]: !prev[path] }));
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleDarkMode = () => { setIsDarkMode(!isDarkMode); document.documentElement.classList.toggle('dark-mode'); };

    const handleLogout = async () => {
        try { await api.logout(); } catch {}
        localStorage.removeItem('token');
        toast.success("Logged out successfully");
        navigate('/');
    };

    const handleNavClick = () => { if (windowWidth < 768) setIsSidebarOpen(false); };

    return (
        <div className="dashboard-container">
            {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}

            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="brand-text">
                        <GraduationCap size={28} />
                        <span className="brand-name">Parent Portal</span>
                    </div>
                    <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)} aria-label="Close sidebar">
                        <X size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item, idx) => {
                        if (item.sectionLabel) {
                            return <div key={`section-${idx}`} className="nav-section-label">{item.sectionLabel}</div>;
                        }
                        const isChildActive = item.subItems?.some(sub => location.pathname === sub.path);
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
                                            role="button" tabIndex={0}
                                        >
                                            <div className="nav-item-content">
                                                <item.icon size={20} className="nav-icon" />
                                                <span className="nav-label">{item.label}</span>
                                            </div>
                                            <ChevronDown size={15} className={`nav-chevron ${expandedItems[item.path] ? 'rotated' : ''}`} />
                                        </div>
                                        <div className={`nav-sub-items ${expandedItems[item.path] ? 'expanded' : ''}`}>
                                            {item.subItems.map(sub => (
                                                <Link key={sub.path} to={sub.path}
                                                    className={`nav-sub-item ${location.pathname === sub.path ? 'active' : ''}`}
                                                    onClick={handleNavClick}>
                                                    <span className="sub-item-dot" />
                                                    {sub.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <Link to={item.path}
                                        className={`nav-item ${isParentActive ? 'active' : ''}`}
                                        onClick={handleNavClick}>
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
                    <div className="theme-toggle">
                        <button onClick={toggleDarkMode} className="theme-toggle-btn">
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

            <main className="main-content">
                <header className="top-header">
                    <div className="header-left">
                        <button className="menu-toggle-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
                            <Menu size={24} />
                        </button>
                        <div className="header-title">
                            <h1>{title || pageTitle}</h1>
                            {windowWidth >= 1024 && (
                                <span className="header-subtitle">
                                    Welcome, {currentUser?.firstName || 'Parent'}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="header-actions">
                            <button className="header-action-btn notification-btn" aria-label="Notifications">
                                <Bell size={20} />
                                <span className="notification-badge">0</span>
                            </button>
                        </div>
                        <div className="user-profile">
                            {currentUser?.avatar ? (
                                <img src={currentUser.avatar} alt="Avatar" className="avatar" style={{ objectFit: 'cover' }} />
                            ) : (
                                <div className="avatar">{currentUser?.initials || '??'}</div>
                            )}
                            <div className="user-info">
                                <span className="user-name">
                                    {currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() || currentUser.email : 'Loading…'}
                                </span>
                                <span className="user-role">Parent / Guardian</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="content-wrapper">
                    <div className="content-container h-full">{children}</div>
                </div>

                {windowWidth < 768 && (
                    <nav className="mobile-bottom-nav">
                        <Link to="/parent" className="mobile-nav-item">
                            <LayoutDashboard size={20} /><span>Home</span>
                        </Link>
                        <Link to="/parent/children" className="mobile-nav-item">
                            <Users size={20} /><span>Children</span>
                        </Link>
                        <Link to="/parent/academics" className="mobile-nav-item">
                            <ClipboardList size={20} /><span>Academics</span>
                        </Link>
                        <Link to="/parent/fees" className="mobile-nav-item">
                            <CreditCard size={20} /><span>Fees</span>
                        </Link>
                        <button className="mobile-nav-item menu-btn" onClick={toggleSidebar}>
                            <Menu size={20} /><span>Menu</span>
                        </button>
                    </nav>
                )}
            </main>
        </div>
    );
};

export default ParentLayout;
