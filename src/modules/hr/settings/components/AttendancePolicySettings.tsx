import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, MapPin, Zap, Smartphone, Users, ShieldCheck, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../../../../services/api';
import StatCardMini from '../../../../dashboard/components/StatCardMini';

const AttendancePolicySettings = () => {
    const [policies, setPolicies] = useState([]);
    const [campuses, setCampuses] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [accessProfiles, setAccessProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPolicy, setEditingPolicy] = useState(null);
    const [editingProfile, setEditingProfile] = useState(null);
    const [showPolicyForm, setShowPolicyForm] = useState(false);
    const [showProfileForm, setShowProfileForm] = useState(false);
    const [activeTab, setActiveTab] = useState('policies');

    const [policyForm, setPolicyForm] = useState({
        name: '',
        employee_category: 'all',
        work_days_per_week: 5,
        standard_hours_per_day: 8,
        grace_period_minutes: 15,
        requires_biometric: false,
        allow_biometric_clock_in: true,
        allow_remote_clock_in: true,
        allow_geolocation_clock_in: true,
        require_on_site_geofence: false,
        default_geofence_radius_meters: 200,
        effective_from: new Date().toISOString().split('T')[0],
        effective_to: null,
        is_active: true,
    });

    const [profileForm, setProfileForm] = useState({
        employee_id: '',
        enforce_biometric: null,
        allow_remote_clock_in: null,
        allow_geolocation_clock_in: null,
        require_on_site_geofence: null,
        assigned_campus_id: null,
        geofence_radius_meters: null,
        is_active: true,
    });

    const [campusForms, setCampusForms] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [policiesRes, campusesRes, employeesRes, profilesRes] = await Promise.all([
                api.get('/workforce/api/attendance-policies/'),
                api.get('/workforce/api/campuses/'),
                api.get('/workforce/api/employees/'),
                api.get('/workforce/api/employee-attendance-access-profiles/'),
            ]);
            setPolicies(policiesRes.results || policiesRes || []);
            setEmployees(employeesRes.results || employeesRes || []);
            setAccessProfiles(profilesRes.results || profilesRes || []);
            const campusData = campusesRes.results || campusesRes || [];
            setCampuses(campusData);
            
            const initialForms = {};
            campusData.forEach(c => {
                initialForms[c.id] = {
                    latitude: c.latitude || '',
                    longitude: c.longitude || '',
                    geofence_radius_meters: c.geofence_radius_meters || 200,
                };
            });
            setCampusForms(initialForms);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load attendance settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSavePolicy = async () => {
        try {
            if (!policyForm.name) {
                toast.error('Policy name is required');
                return;
            }
            if (editingPolicy) {
                await api.put(`/workforce/api/attendance-policies/${editingPolicy.id}/`, policyForm);
                toast.success('Policy updated successfully');
            } else {
                await api.post('/workforce/api/attendance-policies/', policyForm);
                toast.success('Policy created successfully');
            }
            setShowPolicyForm(false);
            setEditingPolicy(null);
            setPolicyForm({
                name: '',
                employee_category: 'all',
                work_days_per_week: 5,
                standard_hours_per_day: 8,
                grace_period_minutes: 15,
                requires_biometric: false,
                allow_biometric_clock_in: true,
                allow_remote_clock_in: true,
                allow_geolocation_clock_in: true,
                require_on_site_geofence: false,
                default_geofence_radius_meters: 200,
                effective_from: new Date().toISOString().split('T')[0],
                effective_to: null,
                is_active: true,
            });
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save policy');
        }
    };

    const handleDeletePolicy = async (id) => {
        if (!window.confirm('Are you sure you want to delete this policy?')) return;
        try {
            await api.delete(`/workforce/api/attendance-policies/${id}/`);
            toast.success('Policy deleted successfully');
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete policy');
        }
    };

    const handleEditPolicy = (policy) => {
        setEditingPolicy(policy);
        setPolicyForm(policy);
        setShowPolicyForm(true);
    };

    const handleSaveProfile = async () => {
        try {
            if (!profileForm.employee_id && !profileForm.employee) {
                toast.error('Employee is required');
                return;
            }
            
            const payload = {
                ...profileForm,
                employee: profileForm.employee_id || profileForm.employee,
                assigned_campus: profileForm.assigned_campus_id || profileForm.assigned_campus,
            };
            
            delete payload.employee_id;
            delete payload.assigned_campus_id;
            
            if (editingProfile) {
                await api.put(`/workforce/api/employee-attendance-access-profiles/${editingProfile.id}/`, payload);
                toast.success('Employee attendance profile updated successfully');
            } else {
                await api.post('/workforce/api/employee-attendance-access-profiles/', payload);
                toast.success('Employee attendance profile created successfully');
            }
            setShowProfileForm(false);
            setEditingProfile(null);
            setProfileForm({
                employee_id: '',
                enforce_biometric: null,
                allow_remote_clock_in: null,
                allow_geolocation_clock_in: null,
                require_on_site_geofence: null,
                assigned_campus_id: null,
                geofence_radius_meters: null,
                is_active: true,
            });
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save employee attendance profile');
        }
    };

    const handleUpdateCampus = async (campusId) => {
        try {
            const form = campusForms[campusId];
            if (!form || !form.latitude || !form.longitude) {
                toast.error('Latitude and longitude are required');
                return;
            }
            await api.patch(`/workforce/api/campuses/${campusId}/`, {
                latitude: parseFloat(form.latitude),
                longitude: parseFloat(form.longitude),
                geofence_radius_meters: parseInt(form.geofence_radius_meters),
            });
            toast.success('Campus geofence updated successfully');
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update campus geofence');
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading attendance settings...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="stats-grid-dense">
                <StatCardMini
                    title="Attendance Policies"
                    value={policies.length}
                    icon={ShieldCheck}
                    color="#dbeafe"
                    iconColor="#2563eb"
                />
                <StatCardMini
                    title="Active Policies"
                    value={policies.filter((policy) => policy.is_active).length}
                    icon={Zap}
                    color="#dcfce7"
                    iconColor="#16a34a"
                />
                <StatCardMini
                    title="Configured Campuses"
                    value={campuses.filter((campus) => campus.latitude && campus.longitude).length}
                    icon={Building2}
                    color="#ede9fe"
                    iconColor="#7c3aed"
                />
                <StatCardMini
                    title="Employee Overrides"
                    value={accessProfiles.length}
                    icon={Users}
                    color="#fef3c7"
                    iconColor="#d97706"
                />
            </div>

            {/* Tab Navigation */}
            <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                <div className="flex flex-wrap gap-3 border-b border-slate-200 pb-2">
                <button
                    onClick={() => setActiveTab('policies')}
                    className={`px-4 py-2 font-semibold transition-colors ${
                        activeTab === 'policies'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    Attendance Policies
                </button>
                <button
                    onClick={() => setActiveTab('geofence')}
                    className={`px-4 py-2 font-semibold transition-colors ${
                        activeTab === 'geofence'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    Campus Geofence
                </button>
                <button
                    onClick={() => setActiveTab('employees')}
                    className={`px-4 py-2 font-semibold transition-colors ${
                        activeTab === 'employees'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    Employee Access
                </button>
                </div>
            </div>

            {/* Policies Tab */}
            {activeTab === 'policies' && (
                <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Attendance Policies</h3>
                        <button
                            onClick={() => {
                                setEditingPolicy(null);
                                setShowPolicyForm(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Plus size={18} /> New Policy
                        </button>
                    </div>

                    {showPolicyForm && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-4"
                        >
                            <h4 className="font-semibold">{editingPolicy ? 'Edit' : 'Create'} Policy</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Policy Name"
                                    value={policyForm.name}
                                    onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })}
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                                <select
                                    value={policyForm.employee_category}
                                    onChange={(e) => setPolicyForm({ ...policyForm, employee_category: e.target.value })}
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Staff</option>
                                    <option value="teaching">Teaching Staff</option>
                                    <option value="non_teaching">Non-Teaching</option>
                                    <option value="management">Management</option>
                                </select>

                                <input
                                    type="date"
                                    value={policyForm.effective_from}
                                    onChange={(e) => setPolicyForm({ ...policyForm, effective_from: e.target.value })}
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                                <input
                                    type="date"
                                    placeholder="Effective To (Optional)"
                                    value={policyForm.effective_to || ''}
                                    onChange={(e) => setPolicyForm({ ...policyForm, effective_to: e.target.value || null })}
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                                <input
                                    type="number"
                                    placeholder="Work Days/Week"
                                    value={policyForm.work_days_per_week}
                                    onChange={(e) => setPolicyForm({ ...policyForm, work_days_per_week: parseInt(e.target.value) })}
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                                <input
                                    type="number"
                                    placeholder="Std Hours/Day"
                                    step="0.5"
                                    value={policyForm.standard_hours_per_day}
                                    onChange={(e) => setPolicyForm({ ...policyForm, standard_hours_per_day: parseFloat(e.target.value) })}
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                                <input
                                    type="number"
                                    placeholder="Grace Period (mins)"
                                    value={policyForm.grace_period_minutes}
                                    onChange={(e) => setPolicyForm({ ...policyForm, grace_period_minutes: parseInt(e.target.value) })}
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                                <input
                                    type="number"
                                    placeholder="Default Geofence Radius (m)"
                                    value={policyForm.default_geofence_radius_meters}
                                    onChange={(e) => setPolicyForm({ ...policyForm, default_geofence_radius_meters: parseInt(e.target.value) })}
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={policyForm.requires_biometric}
                                        onChange={(e) => setPolicyForm({ ...policyForm, requires_biometric: e.target.checked })}
                                        className="rounded"
                                    />
                                    <span className="flex items-center gap-2"><Zap size={16} /> Require Biometric</span>
                                </label>

                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={policyForm.allow_remote_clock_in}
                                        onChange={(e) => setPolicyForm({ ...policyForm, allow_remote_clock_in: e.target.checked })}
                                        className="rounded"
                                    />
                                    <span className="flex items-center gap-2"><Smartphone size={16} /> Allow Remote Clock-In</span>
                                </label>

                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={policyForm.allow_geolocation_clock_in}
                                        onChange={(e) => setPolicyForm({ ...policyForm, allow_geolocation_clock_in: e.target.checked })}
                                        className="rounded"
                                    />
                                    <span className="flex items-center gap-2"><MapPin size={16} /> Allow On-Site Geolocation</span>
                                </label>

                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={policyForm.require_on_site_geofence}
                                        onChange={(e) => setPolicyForm({ ...policyForm, require_on_site_geofence: e.target.checked })}
                                        className="rounded"
                                    />
                                    <span className="flex items-center gap-2">Require On-Site Geofence</span>
                                </label>

                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={policyForm.is_active}
                                        onChange={(e) => setPolicyForm({ ...policyForm, is_active: e.target.checked })}
                                        className="rounded"
                                    />
                                    <span>Active</span>
                                </label>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleSavePolicy}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Save Policy
                                </button>
                                <button
                                    onClick={() => setShowPolicyForm(false)}
                                    className="px-4 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    )}

                    <div className="grid gap-4">
                        {policies.map((policy) => (
                            <div key={policy.id} className="bg-white border border-slate-200 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-slate-900">{policy.name}</h4>
                                        <p className="text-sm text-slate-500">Category: {policy.employee_category}</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {policy.requires_biometric && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-semibold">
                                                    <Zap size={14} /> Biometric Required
                                                </span>
                                            )}
                                            {policy.allow_remote_clock_in && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                                    <Smartphone size={14} /> Remote Allowed
                                                </span>
                                            )}
                                            {policy.allow_geolocation_clock_in && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                                    <MapPin size={14} /> Geolocation Allowed
                                                </span>
                                            )}
                                            {policy.require_on_site_geofence && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                                                    Geofence Required
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditPolicy(policy)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeletePolicy(policy.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Campus Geofence Tab */}
            {activeTab === 'geofence' && (
                <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-semibold">Campus Geofence Configuration</h3>

                    <div className="grid gap-4">
                        {campuses.map((campus) => (
                            <div key={campus.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
                                <h4 className="font-semibold text-slate-900">{campus.name}</h4>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input
                                        type="number"
                                        placeholder="Latitude"
                                        step="0.000001"
                                        value={campusForms[campus.id]?.latitude || ''}
                                        onChange={(e) => setCampusForms({ 
                                            ...campusForms, 
                                            [campus.id]: { ...campusForms[campus.id], latitude: e.target.value } 
                                        })}
                                        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Longitude"
                                        step="0.000001"
                                        value={campusForms[campus.id]?.longitude || ''}
                                        onChange={(e) => setCampusForms({ 
                                            ...campusForms, 
                                            [campus.id]: { ...campusForms[campus.id], longitude: e.target.value } 
                                        })}
                                        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Radius (meters)"
                                        value={campusForms[campus.id]?.geofence_radius_meters || ''}
                                        onChange={(e) => setCampusForms({ 
                                            ...campusForms, 
                                            [campus.id]: { ...campusForms[campus.id], geofence_radius_meters: e.target.value } 
                                        })}
                                        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <button
                                    onClick={() => handleUpdateCampus(campus.id)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Update Geofence
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Employee Access Tab */}
            {activeTab === 'employees' && (
                <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Employee Attendance Access Profiles</h3>
                        <button
                            onClick={() => {
                                setEditingProfile(null);
                                setShowProfileForm(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Plus size={18} /> New Profile
                        </button>
                    </div>

                    {showProfileForm && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-4"
                        >
                            <h4 className="font-semibold">{editingProfile ? 'Edit' : 'Create'} Employee Access Profile</h4>

                            <select
                                value={profileForm.employee_id}
                                onChange={(e) => setProfileForm({ ...profileForm, employee_id: e.target.value })}
                                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            >
                                <option value="">Select Employee</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.employee_no} - {emp.first_name} {emp.last_name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={profileForm.assigned_campus_id || ''}
                                onChange={(e) => setProfileForm({ ...profileForm, assigned_campus_id: e.target.value ? parseInt(e.target.value) : null })}
                                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            >
                                <option value="">Assigned Campus (Optional)</option>
                                {campuses.map((campus) => (
                                    <option key={campus.id} value={campus.id}>
                                        {campus.name}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="number"
                                placeholder="Geofence Radius (meters) - Optional"
                                value={profileForm.geofence_radius_meters || ''}
                                onChange={(e) => setProfileForm({ ...profileForm, geofence_radius_meters: e.target.value ? parseInt(e.target.value) : null })}
                                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            />

                            <div className="space-y-3">
                                <label className="flex items-center gap-3">
                                    <select
                                        value={profileForm.enforce_biometric === null ? '' : profileForm.enforce_biometric ? 'true' : 'false'}
                                        onChange={(e) => setProfileForm({ ...profileForm, enforce_biometric: e.target.value === '' ? null : e.target.value === 'true' })}
                                        className="px-2 py-1 border border-slate-300 rounded text-sm"
                                    >
                                        <option value="">Biometric (Use Policy)</option>
                                        <option value="true">Require Biometric</option>
                                        <option value="false">Allow Without Biometric</option>
                                    </select>
                                </label>

                                <label className="flex items-center gap-3">
                                    <select
                                        value={profileForm.allow_remote_clock_in === null ? '' : profileForm.allow_remote_clock_in ? 'true' : 'false'}
                                        onChange={(e) => setProfileForm({ ...profileForm, allow_remote_clock_in: e.target.value === '' ? null : e.target.value === 'true' })}
                                        className="px-2 py-1 border border-slate-300 rounded text-sm"
                                    >
                                        <option value="">Remote Clock (Use Policy)</option>
                                        <option value="true">Allow Remote</option>
                                        <option value="false">Block Remote</option>
                                    </select>
                                </label>

                                <label className="flex items-center gap-3">
                                    <select
                                        value={profileForm.allow_geolocation_clock_in === null ? '' : profileForm.allow_geolocation_clock_in ? 'true' : 'false'}
                                        onChange={(e) => setProfileForm({ ...profileForm, allow_geolocation_clock_in: e.target.value === '' ? null : e.target.value === 'true' })}
                                        className="px-2 py-1 border border-slate-300 rounded text-sm"
                                    >
                                        <option value="">Geolocation Clock (Use Policy)</option>
                                        <option value="true">Allow Geolocation</option>
                                        <option value="false">Block Geolocation</option>
                                    </select>
                                </label>

                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={profileForm.is_active}
                                        onChange={(e) => setProfileForm({ ...profileForm, is_active: e.target.checked })}
                                        className="rounded"
                                    />
                                    <span>Active</span>
                                </label>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveProfile}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Save Profile
                                </button>
                                <button
                                    onClick={() => setShowProfileForm(false)}
                                    className="px-4 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AttendancePolicySettings;
