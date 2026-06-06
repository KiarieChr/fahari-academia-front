import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import {
    LayoutDashboard, BookOpen, ClipboardList, CreditCard,
    Calendar, User, LogOut, Menu, X, ChevronDown, GraduationCap, FileText, Sun, Moon
} from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import TopBar from '../dashboard/components/TopBar';
import '../dashboard/dashboard.css';

const StudentLayout = ({ children, title = '' }) => {
    const navigate = useNavigate();
    const location = useLocation(); const pathname = location.pathname;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [pageTitle, setPageTitle] = useState('Dashboard');
    const [currentUser, setCurrentUser] = useState(null);
    const [expandedItems, setExpandedItems] = useState({});

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/student' },
        { sectionLabel: 'ACADEMICS' },
        {
            icon: BookOpen,
            label: 'My Classes',
            path: '/student/classes',
            subItems: [
                { label: 'Timetable', path: '/student/classes/timetable' },
                { label: 'Subjects', path: '/student/classes/subjects' },
            ]
        },
        {
            icon: ClipboardList,
            label: 'My Results',
            path: '/student/results',
            subItems: [
                { label: 'Report Cards', path: '/student/results/reports' },
                { label: 'Transcripts', path: '/student/results/transcripts' },
            ]
        },
        { icon: FileText, label: 'Assignments', path: '/student/assignments' },
        { sectionLabel: 'FINANCE' },
        {
            icon: CreditCard,
            label: 'My Fees',
            path: '/student/fees',
            subItems: [
                { label: 'Fee Statement', path: '/student/fees/statement' },
                { label: 'Payment History', path: '/student/fees/payments' },
                { label: 'Financial Statement', path: '/student/fees/financial-statement' },
            ]
        },
        { sectionLabel: 'OTHER' },
        { icon: Calendar, label: 'Events', path: '/student/events' },
        { icon: User, label: 'My Profile', path: '/student/profile' },
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
                    role: 'Student',
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
            if (item.subItems && pathname && pathname.startsWith(item.path)) {
                autoExpand[item.path] = true;
            }
        });
        setExpandedItems(prev => ({ ...prev, ...autoExpand }));
    }, [pathname]);

    useEffect(() => {
        const currentPath = pathname || '';
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
                if (item.path && currentPath.startsWith(item.path) && item.path !== '/student') {
                    foundTitle = item.label;
                }
            }
        }
        setPageTitle(foundTitle);
    }, [pathname]);

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
                        <span className="brand-name">Student Portal</span>
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
                        const isChildActive = item.subItems?.some(sub => pathname === sub.path);
                        const isParentActive = item.subItems
                            ? (pathname || '').startsWith(item.path)
                            : pathname === item.path;

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
                                                    className={`nav-sub-item ${pathname === sub.path ? 'active' : ''}`}
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
                <TopBar
                    currentUser={currentUser}
                    isDarkMode={isDarkMode}
                    onToggleSidebar={toggleSidebar}
                    onToggleDarkMode={toggleDarkMode}
                    onLogout={handleLogout}
                />

                <div className="content-wrapper">
                    <div className="content-container h-full">{children}</div>
                </div>

                {windowWidth < 768 && (
                    <nav className="mobile-bottom-nav">
                        <Link to="/student" className="mobile-nav-item">
                            <LayoutDashboard size={20} /><span>Home</span>
                        </Link>
                        <Link to="/student/classes" className="mobile-nav-item">
                            <BookOpen size={20} /><span>Classes</span>
                        </Link>
                        <Link to="/student/results" className="mobile-nav-item">
                            <ClipboardList size={20} /><span>Results</span>
                        </Link>
                        <Link to="/student/fees" className="mobile-nav-item">
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

export default StudentLayout;
