import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import './MyAccount.css';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield,
    Key,
    Bell,
    Globe,
    FileText,
    Download,
    Eye,
    EyeOff,
    Camera,
    Check,
    X,
    Save,
    Edit2,
    Lock,
    LogOut,
    ShieldCheck,
    Smartphone,
    AlertTriangle,
    ChevronRight,
    ExternalLink,
    Cpu,
    HardDrive,
    Clock,
    Wifi,
    WifiOff,
    Battery,
    BatteryCharging,
    Database,
    RefreshCw
} from 'lucide-react';

const MyAccount = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState(null);
    const [activities, setActivities] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
    const [terminatingId, setTerminatingId] = useState(null);

    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        location: '',
        joinDate: '',
        avatar: '',
        bio: '',
        notifications: {
            email: true,
            push: true,
            security: true,
            marketing: false
        },
        twoFactor: false,
        sessionTimeout: 30,
        language: 'en',
        timezone: 'Africa/Nairobi'
    });

    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_new_password: ''
    });

    // Fetch user profile
    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            // api.js returns the unwrapped body directly — no .data wrapper
            const response = await api.get('/api/users/profile/');

            // Backend returns { success: true, profile: {...} } or a flat user object
            const profile = response?.success ? response.profile : response;

            if (profile && typeof profile === 'object') {
                setUserData(prev => ({
                    ...prev,
                    firstName: profile.first_name || '',
                    lastName: profile.last_name || '',
                    email: profile.email || '',
                    phone: profile.phone || '',
                    location: profile.address || '',
                    role: profile.role || 'User',
                    joinDate: profile.date_joined ? new Date(profile.date_joined).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) : '',
                    avatar: (profile.first_name?.[0] || '') + (profile.last_name?.[0] || ''),
                    department: profile.department || 'General',
                    bio: profile.bio || 'No bio provided',
                }));
                if (profile.avatar || profile.picture) {
                    setPreviewAvatar(profile.avatar || profile.picture);
                }
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            toast.error('Failed to load profile. ' + (error?.message || ''));
        } finally {
            setLoading(false);
        }
    };

    // Fetch active sessions
    const fetchActiveSessions = async () => {
        try {
            // api.js returns body directly — backend sends { success, sessions: [...] }
            const response = await api.get('/api/users/sessions/');
            const sessions = response?.success ? response.sessions : (Array.isArray(response) ? response : []);

            if (Array.isArray(sessions)) {
                setActiveSessions(sessions.map(s => ({
                    id: s.id ?? s.session_key,
                    device: s.device || 'Unknown Device',
                    browser: s.browser || 'Unknown Browser',
                    os: s.os || 'Unknown OS',
                    location: s.location || 'Unknown',
                    ip: s.ip || 'Unknown IP',
                    createdAt: s.created_at ? new Date(s.created_at).toLocaleString() : '',
                    lastActive: s.last_used ? new Date(s.last_used).toLocaleString()
                        : s.expire_date ? new Date(s.expire_date).toLocaleString()
                        : 'Unknown',
                    current: s.current || false,
                    label: s.label || '',
                })));
            } else {
                setActiveSessions([]);
            }
        } catch (error) {
            console.error("Failed to fetch active sessions", error);
            setActiveSessions([]);
        }
    };

    // Fetch activity log
    const fetchActivities = async () => {
        try {
            // api.js returns body directly — backend sends { success, activities: [...] }
            const response = await api.get('/api/users/activities/');
            const acts = response?.success ? response.activities : (Array.isArray(response) ? response : []);
            setActivities(Array.isArray(acts) ? acts.slice(0, 10) : []);
        } catch (error) {
            console.error("Failed to fetch activities", error);
            setActivities([]);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (activeTab === 'sessions') {
            fetchActiveSessions();
        } else if (activeTab === 'activity') {
            fetchActivities();
        }
    }, [activeTab]);

    const handleProfileUpdate = (field, value) => {
        setUserData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setSubmitting(true);
            const payload = {
                first_name: userData.firstName,
                last_name: userData.lastName,
                email: userData.email,
                phone: userData.phone,
                address: userData.location,
                bio: userData.bio
            };

            if (avatarFile) {
                const formData = new FormData();
                formData.append('avatar', avatarFile);
                try {
                    // api.js handles FormData — do NOT set Content-Type manually
                    await api.post('/api/users/upload_avatar/', formData);
                    setAvatarFile(null);
                } catch (error) {
                    console.error('Avatar upload failed:', error);
                    toast.error(error?.data?.message || 'Failed to upload avatar');
                    setSubmitting(false);
                    return;
                }
            }

            // DRF router generates /api/users/update_profile/ for detail=False + put/patch
            await api.patch('/api/users/update_profile/', payload);
            setIsEditing(false);
            setAvatarFile(null);
            fetchUserProfile();
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error(error);
            toast.error(error?.data?.message || error?.message || 'Failed to update profile');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (passwordData.new_password !== passwordData.confirm_new_password) {
            toast.error('New passwords do not match!');
            return;
        }
        if (passwordData.new_password.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }
        try {
            setSubmitting(true);
            await api.post('/api/users/change_password/', passwordData);
            setPasswordData({ old_password: '', new_password: '', confirm_new_password: '' });
            toast.success('Password changed successfully');
        } catch (error) {
            console.error(error);
            toast.error(error?.data?.message || error?.data?.errors?.old_password?.[0] || error?.message || 'Failed to change password');
        } finally {
            setSubmitting(false);
        }
    };

    const handleNotificationToggle = (type) => {
        setUserData(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [type]: !prev.notifications[type]
            }
        }));
    };

    const handleTwoFactorToggle = () => {
        setUserData(prev => ({
            ...prev,
            twoFactor: !prev.twoFactor
        }));
    };

    const terminateSession = async (sessionId) => {
        setTerminatingId(sessionId);
        try {
            // api.js returns unwrapped body — { success, message }
            const response = await api.post('/api/users/terminate_session/', { token_id: sessionId });
            toast.success(response?.message || 'Session terminated successfully');
            fetchActiveSessions();
        } catch (error) {
            console.error('Failed to terminate session:', error);
            toast.error('Failed to terminate session: ' + (error?.data?.message || error?.message || 'Unknown error'));
        } finally {
            setTerminatingId(null);
        }
    };

    const terminateAllSessions = async () => {
        try {
            const response = await api.post('/api/users/logout_all/');
            toast.success(response?.message || 'Logged out from all devices successfully');
            setTimeout(() => fetchActiveSessions(), 500);
        } catch (error) {
            console.error('Failed to logout all sessions:', error);
            toast.error('Failed to logout all sessions: ' + (error?.data?.message || error?.message || 'Unknown error'));
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your profile...</p>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="dashboard-container">
                <div className="content-container">
                    {/* Header */}
                    <div className="account-header">
                        <div className="header-content">
                            <h1 className="account-title">
                                <User className="account-title-icon" />
                                My Account
                            </h1>
                            <p className="account-subtitle">Manage your profile, security, and preferences</p>
                        </div>
                        <div className="header-actions">
                            <button 
                                className="btn btn-danger btn-icon"
                                onClick={terminateAllSessions}
                            >
                                <LogOut size={18} />
                                <span>Logout All Sessions</span>
                            </button>
                        </div>
                    </div>

                    <div className="account-layout">
                        {/* Left Sidebar */}
                        <div className="account-sidebar">
                            <div className="account-profile-card">
                                <div className="profile-avatar-section">
                                    <div className="avatar-wrapper">
                                        <div className="profile-avatar">
                                            {previewAvatar ? (
                                                <img src={previewAvatar} alt={userData.firstName} />
                                            ) : (
                                                <span className="avatar-initials">{userData.avatar}</span>
                                            )}
                                        </div>
                                        <label className="avatar-upload-btn">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                                className="visually-hidden"
                                            />
                                            <Camera size={16} />
                                        </label>
                                    </div>
                                    <div className="profile-info">
                                        <h3 className="profile-name">{userData.firstName} {userData.lastName}</h3>
                                        <p className="profile-role">{userData.role}</p>
                                        <span className="status-badge active">
                                            <div className="status-dot"></div>
                                            Active
                                        </span>
                                    </div>
                                </div>

                                <div className="profile-stats">
                                    <div className="stat-item">
                                        <div className="stat-icon">
                                            <Calendar size={18} />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-label">Joined</span>
                                            <span className="stat-value">{userData.joinDate}</span>
                                        </div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-icon">
                                            <Database size={18} />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-label">Department</span>
                                            <span className="stat-value">{userData.department}</span>
                                        </div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-icon">
                                            <Smartphone size={18} />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-label">Sessions</span>
                                            <span className="stat-value">{activeSessions.length} active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="account-nav">
                                <nav className="nav-list">
                                    <button
                                        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('profile')}
                                    >
                                        <div className="nav-icon">
                                            <User size={20} />
                                        </div>
                                        <span>Profile</span>
                                        <ChevronRight className="nav-chevron" size={16} />
                                    </button>
                                    <button
                                        className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('security')}
                                    >
                                        <div className="nav-icon">
                                            <Shield size={20} />
                                        </div>
                                        <span>Security</span>
                                        <ChevronRight className="nav-chevron" size={16} />
                                    </button>
                                    <button
                                        className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('notifications')}
                                    >
                                        <div className="nav-icon">
                                            <Bell size={20} />
                                        </div>
                                        <span>Notifications</span>
                                        <ChevronRight className="nav-chevron" size={16} />
                                    </button>
                                    <button
                                        className={`nav-item ${activeTab === 'sessions' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('sessions')}
                                    >
                                        <div className="nav-icon">
                                            <Smartphone size={20} />
                                        </div>
                                        <span>Sessions</span>
                                        <ChevronRight className="nav-chevron" size={16} />
                                    </button>
                                    <button
                                        className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('activity')}
                                    >
                                        <div className="nav-icon">
                                            <FileText size={20} />
                                        </div>
                                        <span>Activity</span>
                                        <ChevronRight className="nav-chevron" size={16} />
                                    </button>
                                    <button
                                        className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('preferences')}
                                    >
                                        <div className="nav-icon">
                                            <Globe size={20} />
                                        </div>
                                        <span>Preferences</span>
                                        <ChevronRight className="nav-chevron" size={16} />
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="account-content">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="content-wrapper"
                                >
                                    {/* Profile Tab */}
                                    {activeTab === 'profile' && (
                                        <div className="content-card">
                                            <div className="card-header">
                                                <div className="header-left">
                                                    <h2 className="card-title">
                                                        <User className="card-title-icon" />
                                                        Profile Information
                                                    </h2>
                                                    <p className="card-subtitle">Update your personal details and profile information</p>
                                                </div>
                                                <div className="header-right">
                                                    {!isEditing ? (
                                                        <button
                                                            className="btn btn-primary btn-icon"
                                                            onClick={() => setIsEditing(true)}
                                                        >
                                                            <Edit2 size={18} />
                                                            <span>Edit Profile</span>
                                                        </button>
                                                    ) : (
                                                        <div className="action-buttons">
                                                            <button
                                                                className="btn btn-secondary btn-icon"
                                                                onClick={() => {
                                                                    setIsEditing(false);
                                                                    setAvatarFile(null);
                                                                    setPreviewAvatar(userData.avatar);
                                                                    fetchUserProfile();
                                                                }}
                                                            >
                                                                <X size={18} />
                                                                <span>Cancel</span>
                                                            </button>
                                                            <button
                                                                className="btn btn-primary btn-icon"
                                                                onClick={handleSaveProfile}
                                                                disabled={submitting}
                                                            >
                                                                <Save size={18} />
                                                                <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                <div className="profile-form">
                                                    <div className="form-section">
                                                        <h3 className="section-title">Personal Information</h3>
                                                        <div className="form-grid">
                                                            <div className="form-group">
                                                                <label className="form-label">
                                                                    <User size={16} />
                                                                    First Name
                                                                </label>
                                                                {isEditing ? (
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        value={userData.firstName}
                                                                        onChange={(e) => handleProfileUpdate('firstName', e.target.value)}
                                                                    />
                                                                ) : (
                                                                    <div className="form-value">{userData.firstName}</div>
                                                                )}
                                                            </div>
                                                            <div className="form-group">
                                                                <label className="form-label">
                                                                    <User size={16} />
                                                                    Last Name
                                                                </label>
                                                                {isEditing ? (
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        value={userData.lastName}
                                                                        onChange={(e) => handleProfileUpdate('lastName', e.target.value)}
                                                                    />
                                                                ) : (
                                                                    <div className="form-value">{userData.lastName}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="form-section">
                                                        <h3 className="section-title">Contact Information</h3>
                                                        <div className="form-grid">
                                                            <div className="form-group">
                                                                <label className="form-label">
                                                                    <Mail size={16} />
                                                                    Email Address
                                                                </label>
                                                                {isEditing ? (
                                                                    <input
                                                                        type="email"
                                                                        className="form-control"
                                                                        value={userData.email}
                                                                        onChange={(e) => handleProfileUpdate('email', e.target.value)}
                                                                    />
                                                                ) : (
                                                                    <div className="form-value">{userData.email}</div>
                                                                )}
                                                            </div>
                                                            <div className="form-group">
                                                                <label className="form-label">
                                                                    <Phone size={16} />
                                                                    Phone Number
                                                                </label>
                                                                {isEditing ? (
                                                                    <input
                                                                        type="tel"
                                                                        className="form-control"
                                                                        value={userData.phone}
                                                                        onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                                                                    />
                                                                ) : (
                                                                    <div className="form-value">{userData.phone}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                <MapPin size={16} />
                                                                Location
                                                            </label>
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    value={userData.location}
                                                                    onChange={(e) => handleProfileUpdate('location', e.target.value)}
                                                                />
                                                            ) : (
                                                                <div className="form-value">{userData.location || 'Not specified'}</div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="form-section">
                                                        <h3 className="section-title">Bio</h3>
                                                        <div className="form-group">
                                                            {isEditing ? (
                                                                <textarea
                                                                    className="form-control"
                                                                    rows="4"
                                                                    value={userData.bio}
                                                                    onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                                                                    placeholder="Tell us about yourself..."
                                                                />
                                                            ) : (
                                                                <div className="form-value bio-text">
                                                                    {userData.bio || 'No bio provided'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Security Tab */}
                                    {activeTab === 'security' && (
                                        <div className="content-card">
                                            <div className="card-header">
                                                <div className="header-left">
                                                    <h2 className="card-title">
                                                        <Shield className="card-title-icon" />
                                                        Security Settings
                                                    </h2>
                                                    <p className="card-subtitle">Manage your account security and authentication</p>
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                <div className="security-sections">
                                                    {/* Password Change */}
                                                    <div className="security-section">
                                                        <div className="section-header">
                                                            <div className="header-content">
                                                                <div className="header-icon">
                                                                    <Key size={24} />
                                                                </div>
                                                                <div>
                                                                    <h3 className="section-title">Change Password</h3>
                                                                    <p className="section-subtitle">Update your account password</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="section-body">
                                                            <div className="form-grid">
                                                                <div className="form-group">
                                                                    <label className="form-label">Current Password</label>
                                                                    <div className="password-input">
                                                                        <input
                                                                            type={showCurrentPassword ? "text" : "password"}
                                                                            className="form-control"
                                                                            value={passwordData.old_password}
                                                                            onChange={(e) => handlePasswordChange('old_password', e.target.value)}
                                                                            placeholder="Enter current password"
                                                                        />
                                                                        <button
                                                                            className="password-toggle"
                                                                            type="button"
                                                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                                        >
                                                                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="form-group">
                                                                    <label className="form-label">New Password</label>
                                                                    <div className="password-input">
                                                                        <input
                                                                            type={showNewPassword ? "text" : "password"}
                                                                            className="form-control"
                                                                            value={passwordData.new_password}
                                                                            onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                                                                            placeholder="Enter new password"
                                                                        />
                                                                        <button
                                                                            className="password-toggle"
                                                                            type="button"
                                                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                                                        >
                                                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="form-group">
                                                                    <label className="form-label">Confirm New Password</label>
                                                                    <div className="password-input">
                                                                        <input
                                                                            type={showConfirmPassword ? "text" : "password"}
                                                                            className="form-control"
                                                                            value={passwordData.confirm_new_password}
                                                                            onChange={(e) => handlePasswordChange('confirm_new_password', e.target.value)}
                                                                            placeholder="Confirm new password"
                                                                        />
                                                                        <button
                                                                            className="password-toggle"
                                                                            type="button"
                                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                        >
                                                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="section-actions">
                                                                <button
                                                                    className="btn btn-primary"
                                                                    onClick={handlePasswordUpdate}
                                                                    disabled={!passwordData.old_password || !passwordData.new_password || submitting}
                                                                >
                                                                    {submitting ? 'Updating...' : 'Update Password'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Two-Factor Authentication */}
                                                    <div className="security-section">
                                                        <div className="section-header">
                                                            <div className="header-content">
                                                                <div className="header-icon">
                                                                    <ShieldCheck size={24} />
                                                                </div>
                                                                <div>
                                                                    <h3 className="section-title">Two-Factor Authentication</h3>
                                                                    <p className="section-subtitle">Add an extra layer of security to your account</p>
                                                                </div>
                                                            </div>
                                                            <div className="toggle-wrapper">
                                                                <label className="toggle-switch">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={userData.twoFactor}
                                                                        onChange={handleTwoFactorToggle}
                                                                    />
                                                                    <span className="toggle-slider"></span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className="section-body">
                                                            {userData.twoFactor ? (
                                                                <div className="alert alert-success">
                                                                    <Check size={20} />
                                                                    <div>
                                                                        <strong>Two-factor authentication is enabled</strong>
                                                                        <p>Your account is protected with an extra layer of security.</p>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="alert alert-warning">
                                                                    <AlertTriangle size={20} />
                                                                    <div>
                                                                        <strong>Two-factor authentication is disabled</strong>
                                                                        <p>Enable two-factor authentication for enhanced security.</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Security Tips */}
                                                    <div className="security-section">
                                                        <div className="section-header">
                                                            <div className="header-content">
                                                                <h3 className="section-title">Security Tips</h3>
                                                                <p className="section-subtitle">Best practices to keep your account secure</p>
                                                            </div>
                                                        </div>
                                                        <div className="section-body">
                                                            <div className="tips-list">
                                                                <div className="tip-item">
                                                                    <Check className="tip-icon success" size={18} />
                                                                    <span>Use a strong, unique password</span>
                                                                </div>
                                                                <div className="tip-item">
                                                                    <Check className="tip-icon success" size={18} />
                                                                    <span>Enable two-factor authentication</span>
                                                                </div>
                                                                <div className="tip-item">
                                                                    <Check className="tip-icon success" size={18} />
                                                                    <span>Regularly update your password</span>
                                                                </div>
                                                                <div className="tip-item">
                                                                    <Check className="tip-icon success" size={18} />
                                                                    <span>Review active sessions regularly</span>
                                                                </div>
                                                                <div className="tip-item">
                                                                    <Check className="tip-icon success" size={18} />
                                                                    <span>Use trusted devices only</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Notifications Tab */}
                                    {activeTab === 'notifications' && (
                                        <div className="content-card">
                                            <div className="card-header">
                                                <div className="header-left">
                                                    <h2 className="card-title">
                                                        <Bell className="card-title-icon" />
                                                        Notification Preferences
                                                    </h2>
                                                    <p className="card-subtitle">Choose how you want to be notified</p>
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                <div className="notifications-list">
                                                    {Object.entries(userData.notifications).map(([key, value]) => (
                                                        <div key={key} className="notification-item">
                                                            <div className="notification-content">
                                                                <h4 className="notification-title">
                                                                    {key.charAt(0).toUpperCase() + key.slice(1)} Notifications
                                                                </h4>
                                                                <p className="notification-description">
                                                                    {key === 'email' && 'Receive updates via email'}
                                                                    {key === 'push' && 'Receive browser push notifications'}
                                                                    {key === 'security' && 'Get notified about security events'}
                                                                    {key === 'marketing' && 'Receive product updates and offers'}
                                                                </p>
                                                            </div>
                                                            <label className="toggle-switch">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={value}
                                                                    onChange={() => handleNotificationToggle(key)}
                                                                />
                                                                <span className="toggle-slider"></span>
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Sessions Tab */}
                                    {activeTab === 'sessions' && (
                                        <div className="content-card">
                                            <div className="card-header">
                                                <div className="header-left">
                                                    <h2 className="card-title">
                                                        <Smartphone className="card-title-icon" />
                                                        Active Sessions
                                                    </h2>
                                                    <p className="card-subtitle">Manage your active login sessions</p>
                                                </div>
                                                <button className="btn btn-secondary btn-icon" onClick={fetchActiveSessions}>
                                                    <RefreshCw size={18} />
                                                    <span>Refresh</span>
                                                </button>
                                            </div>
                                            <div className="card-body">
                                                <div className="sessions-list">
                                                    {activeSessions.map((session) => (
                                                        <div key={session.id} className="session-card">
                                                            <div className="session-header">
                                                                <div className="session-info">
                                                                    <div className="session-device">
                                                                        <h4>{session.device}</h4>
                                                                        {session.current && (
                                                                            <span className="current-badge">Current Session</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="session-details">
                                                                        <span className="detail-item">
                                                                            <Cpu size={14} />
                                                                            {session.browser}
                                                                        </span>
                                                                        <span className="detail-item">
                                                                            <HardDrive size={14} />
                                                                            {session.os}
                                                                        </span>
                                                                        <span className="detail-item">
                                                                            <MapPin size={14} />
                                                                            {session.location}
                                                                        </span>
                                                                        <span className="detail-item">
                                                                            <Wifi size={14} />
                                                                            {session.ip}
                                                                        </span>
                                                                        <span className="detail-item">
                                                                            <Clock size={14} />
                                                                            Last active: {session.lastActive}
                                                                        </span>
                                                                        {session.createdAt && (
                                                                            <span className="detail-item">
                                                                                <Clock size={14} />
                                                                                Signed in: {session.createdAt}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {!session.current && (
                                                                    <button
                                                                        className="btn btn-danger btn-sm"
                                                                        onClick={() => terminateSession(session.id)}
                                                                        disabled={terminatingId === session.id}
                                                                    >
                                                                        {terminatingId === session.id ? 'Terminating…' : 'Terminate'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Activity Tab */}
                                    {activeTab === 'activity' && (
                                        <div className="content-card">
                                            <div className="card-header">
                                                <div className="header-left">
                                                    <h2 className="card-title">
                                                        <FileText className="card-title-icon" />
                                                        Activity Log
                                                    </h2>
                                                    <p className="card-subtitle">Recent account activities</p>
                                                </div>
                                                <button className="btn btn-secondary btn-icon">
                                                    <Download size={18} />
                                                    <span>Export Log</span>
                                                </button>
                                            </div>
                                            <div className="card-body">
                                                <div className="activity-table-container">
                                                    <table className="activity-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Activity</th>
                                                                <th>Device</th>
                                                                <th>Location</th>
                                                                <th>Time</th>
                                                                <th>Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {activities.map((activity) => (
                                                                <tr key={activity.id}>
                                                                    <td>
                                                                        <div className="activity-item">
                                                                            <div className={`activity-icon ${activity.type}`}>
                                                                                {activity.type === 'login' && <Key size={16} />}
                                                                                {activity.type === 'password' && <Lock size={16} />}
                                                                                {activity.type === 'profile' && <User size={16} />}
                                                                            </div>
                                                                            <span>{activity.description}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td>{activity.device}</td>
                                                                    <td>{activity.location}</td>
                                                                    <td>{activity.time}</td>
                                                                    <td>
                                                                        <span className={`status-badge ${activity.status}`}>
                                                                            {activity.status === 'success' ? 'Success' : 'Info'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Preferences Tab */}
                                    {activeTab === 'preferences' && (
                                        <div className="content-card">
                                            <div className="card-header">
                                                <div className="header-left">
                                                    <h2 className="card-title">
                                                        <Globe className="card-title-icon" />
                                                        Preferences
                                                    </h2>
                                                    <p className="card-subtitle">Customize your experience</p>
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                <div className="preferences-form">
                                                    <div className="form-grid">
                                                        <div className="form-group">
                                                            <label className="form-label">Language</label>
                                                            <select className="form-select" value={userData.language}>
                                                                <option value="en">English</option>
                                                                <option value="es">Spanish</option>
                                                                <option value="fr">French</option>
                                                                <option value="de">German</option>
                                                                <option value="sw">Swahili</option>
                                                            </select>
                                                        </div>
                                                        <div className="form-group">
                                                            <label className="form-label">Timezone</label>
                                                            <select className="form-select" value={userData.timezone}>
                                                                <option value="Africa/Nairobi">East Africa Time (EAT)</option>
                                                                <option value="UTC">UTC</option>
                                                                <option value="America/New_York">Eastern Time (ET)</option>
                                                                <option value="Europe/London">London (GMT)</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="form-group">
                                                        <label className="form-label">Session Timeout</label>
                                                        <select className="form-select" value={userData.sessionTimeout}>
                                                            <option value="15">15 minutes</option>
                                                            <option value="30">30 minutes</option>
                                                            <option value="60">1 hour</option>
                                                            <option value="120">2 hours</option>
                                                            <option value="0">Never</option>
                                                        </select>
                                                        <div className="form-help">
                                                            Automatically log out after specified period of inactivity
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MyAccount;