import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Heart, Shield, Calendar,
    GraduationCap, Building2, Save, Loader2, Edit3,
} from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import { portalService } from './portalService';
import { toast } from 'react-toastify';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const inputClass =
    'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all';

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
            <Icon size={15} className="text-gray-400" />
        </div>
        <div className="min-w-0">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="text-sm text-gray-800 mt-0.5">{value || '—'}</p>
        </div>
    </div>
);

const MyProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        home_address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relationship: '',
    });

    useEffect(() => {
        const load = async () => {
            try {
                const data = await portalService.getProfile();
                setProfile(data);
                setForm({
                    home_address: data.home_address || '',
                    emergency_contact_name: data.emergency_contact_name || '',
                    emergency_contact_phone: data.emergency_contact_phone || '',
                    emergency_contact_relationship: data.emergency_contact_relationship || '',
                });
            } catch {
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const data = await portalService.updateProfile(form);
            setProfile(data);
            setEditing(false);
            toast.success('Profile updated');
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <StudentLayout title="My Profile">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-indigo-500" size={32} />
                </div>
            </StudentLayout>
        );
    }

    if (!profile) {
        return (
            <StudentLayout title="My Profile">
                <div className="text-center py-20 text-gray-400">
                    <User size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No student profile found</p>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout title="My Profile">
            <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }}
                className="space-y-6 p-1 max-w-4xl">
                {/* Header card */}
                <motion.div variants={itemVariants}
                    className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold shrink-0">
                        {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </div>
                    <div className="text-center sm:text-left">
                        <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                        <p className="text-indigo-200 text-sm mt-1">
                            {profile.admission_number} • {profile.current_grade_name || 'No grade'} {profile.current_stream_name || ''}
                        </p>
                        <p className="text-indigo-200 text-xs mt-0.5">
                            {profile.campus_name || ''} • Admitted {profile.admission_date || '—'}
                        </p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Info (read-only) */}
                    <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <User size={18} className="text-indigo-500" /> Personal Information
                        </h3>
                        <InfoRow icon={Mail} label="Email" value={profile.email} />
                        <InfoRow icon={Phone} label="Phone" value={profile.phone} />
                        <InfoRow icon={Calendar} label="Date of Birth" value={profile.date_of_birth} />
                        <InfoRow icon={User} label="Gender" value={profile.gender} />
                        <InfoRow icon={User} label="Nationality" value={profile.nationality} />
                        <InfoRow icon={User} label="Religion" value={profile.religion} />
                    </motion.div>

                    {/* Academic (read-only) */}
                    <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <GraduationCap size={18} className="text-purple-500" /> Academic Details
                        </h3>
                        <InfoRow icon={GraduationCap} label="Grade" value={profile.current_grade_name} />
                        <InfoRow icon={User} label="Stream" value={profile.current_stream_name} />
                        <InfoRow icon={Calendar} label="Academic Year" value={profile.current_academic_year_name} />
                        <InfoRow icon={Calendar} label="Term" value={profile.current_term_name} />
                        <InfoRow icon={Building2} label="Campus" value={profile.campus_name} />
                        <InfoRow icon={Shield} label="Status" value={profile.status} />
                    </motion.div>

                    {/* Medical (read-only) */}
                    <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Heart size={18} className="text-red-500" /> Medical Information
                        </h3>
                        <InfoRow icon={Heart} label="Blood Group" value={profile.blood_group} />
                        <InfoRow icon={Heart} label="Medical Conditions" value={profile.medical_conditions} />
                        <InfoRow icon={Heart} label="Allergies" value={profile.allergies} />
                        <InfoRow icon={Heart} label="Special Needs" value={profile.special_needs} />
                    </motion.div>

                    {/* Editable: Address & Emergency Contact */}
                    <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <MapPin size={18} className="text-amber-500" /> Contact & Emergency
                            </h3>
                            {!editing && (
                                <button onClick={() => setEditing(true)}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                                    <Edit3 size={13} /> Edit
                                </button>
                            )}
                        </div>

                        {editing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Home Address</label>
                                    <textarea className={inputClass} rows={2} value={form.home_address}
                                        onChange={e => setForm(p => ({ ...p, home_address: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Emergency Contact Name</label>
                                    <input className={inputClass} value={form.emergency_contact_name}
                                        onChange={e => setForm(p => ({ ...p, emergency_contact_name: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Emergency Contact Phone</label>
                                    <input className={inputClass} value={form.emergency_contact_phone}
                                        onChange={e => setForm(p => ({ ...p, emergency_contact_phone: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Relationship</label>
                                    <input className={inputClass} value={form.emergency_contact_relationship}
                                        onChange={e => setForm(p => ({ ...p, emergency_contact_relationship: e.target.value }))} />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button onClick={handleSave} disabled={saving}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                        Save
                                    </button>
                                    <button onClick={() => setEditing(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <InfoRow icon={MapPin} label="Home Address" value={profile.home_address} />
                                <InfoRow icon={Phone} label="Emergency Contact" value={profile.emergency_contact_name} />
                                <InfoRow icon={Phone} label="Emergency Phone" value={profile.emergency_contact_phone} />
                                <InfoRow icon={User} label="Relationship" value={profile.emergency_contact_relationship} />
                            </>
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </StudentLayout>
    );
};

export default MyProfile;
