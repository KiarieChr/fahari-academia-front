import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, User, BookOpen, School, Phone, Users, Download, 
    Check, X, ChevronRight, ChevronLeft, Sparkles, AlertCircle, 
    FileText, Briefcase, Mail, MapPin, Globe, CheckCircle2,
    Activity, Building, Award, UserCheck, AlertTriangle, Shield
} from 'lucide-react';
import LazyImage from '../../../../components/common/LazyImage';
import { toast } from 'react-toastify';
import { institutionService } from '../../../../services/institutionService';
import { documentService } from '../../../../services/documentService';

const DETAIL_STEPS = [
    { id: 1, title: 'Personal', label: 'Identity & Bio', icon: User },
    { id: 2, title: 'Academic', label: 'Intent & Score', icon: BookOpen },
    { id: 3, title: 'Guardian', label: 'Contacts & Family', icon: Users },
    { id: 4, title: 'Decision', label: 'Status & Actions', icon: Check }
];

const ApplicationDetailsModal = ({ app, onClose, onAdmit, onStatusChange }) => {
    const [institution, setInstitution] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Internal state to support smooth exit animations for AnimatePresence
    const [activeApp, setActiveApp] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [activeStep, setActiveStep] = useState(1);

    useEffect(() => {
        if (app) {
            setActiveApp(app);
            setIsOpen(true);
            setActiveStep(1); // Reset to first step when a new application is opened
        } else {
            setIsOpen(false);
        }
    }, [app]);

    useEffect(() => {
        if (activeApp) {
            institutionService.getProfile()
                .then(res => setInstitution(res.data || res))
                .catch(() => {});
        }
    }, [activeApp]);

    const handleDownload = async (docType) => {
        if (!activeApp) return;
        try {
            setIsGenerating(true);
            await documentService.generateAndDownload(docType, activeApp, institution || {});
        } catch (err) {
            toast.error('Failed to generate document');
        } finally {
            setIsGenerating(false);
        }
    };

    const triggerStatusChange = (newStatus) => {
        if (!activeApp) return;
        if (onStatusChange) {
            onStatusChange(activeApp, newStatus);
        } else {
            // Fallback if prop not provided
            toast.warn("Status change not configured on parent table.");
        }
    };

    const getStatusStyle = (status) => {
        const lower = (status || '').toLowerCase();
        switch (lower) {
            case 'accepted':
            case 'admitted':
                return { bg: 'rgba(16, 185, 129, 0.08)', text: 'rgb(16, 185, 129)', border: 'rgba(16, 185, 129, 0.15)', name: 'Accepted' };
            case 'rejected':
                return { bg: 'rgba(244, 63, 94, 0.08)', text: 'rgb(244, 63, 94)', border: 'rgba(244, 63, 94, 0.15)', name: 'Rejected' };
            case 'interview':
                return { bg: 'rgba(245, 158, 11, 0.08)', text: 'rgb(245, 158, 11)', border: 'rgba(245, 158, 11, 0.15)', name: 'Interview Scheduled' };
            case 'waitlist':
                return { bg: 'rgba(139, 92, 246, 0.08)', text: 'rgb(139, 92, 246)', border: 'rgba(139, 92, 246, 0.15)', name: 'Waitlisted' };
            default:
                return { bg: 'rgba(99, 102, 241, 0.08)', text: 'rgb(99, 102, 241)', border: 'rgba(99, 102, 241, 0.15)', name: 'Pending Review' };
        }
    };

    const getInitials = (name) => {
        if (!name) return 'A';
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    return (
        <AnimatePresence onExitComplete={() => {
            if (!isOpen) setActiveApp(null);
        }}>
            {isOpen && activeApp && (
                <div className="fixed inset-0 z-[8000] flex justify-end overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[7999] bg-slate-950/40 backdrop-blur-[2px] transition-opacity cursor-pointer"
                    />

                    {/* Off-canvas Drawer Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                        style={{ 
                            background: 'var(--card-bg)', 
                            borderColor: 'var(--border-color-light)'
                        }}
                        className="relative z-[8000] h-full w-full max-w-[500px] border-l shadow-[0_0_60px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden"
                    >
                        {/* 1. Header (Sticky) */}
                        <div 
                            style={{ borderColor: 'var(--border-color-light)' }} 
                            className="p-5 border-b flex flex-col gap-4 sticky top-0 z-25 bg-[inherit]"
                        >
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <span 
                                            className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider"
                                            style={{
                                                background: 'var(--bg-light)',
                                                color: 'var(--text-muted)'
                                            }}
                                        >
                                            Ref: #{activeApp.id}
                                        </span>
                                        <span 
                                            className="text-[9px] font-bold uppercase tracking-widest"
                                            style={{ color: 'var(--text-muted)' }}
                                        >
                                            Applied {new Date(activeApp.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 
                                        style={{ color: 'var(--text-main)' }} 
                                        className="text-lg font-black tracking-tight"
                                    >
                                        {activeApp.student_name}
                                    </h3>
                                </div>
                                <button 
                                    onClick={onClose}
                                    style={{ color: 'var(--text-muted)' }}
                                    className="p-2 rounded-xl hover:bg-[var(--bg-light)] hover:text-[var(--text-main)] transition-all cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Brief summary details card */}
                            <div 
                                style={{ 
                                    background: 'var(--bg-light)', 
                                    borderColor: 'var(--border-color-light)' 
                                }}
                                className="p-3.5 rounded-2xl border flex items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-3.5">
                                    {activeApp.passport_photo ? (
                                        <LazyImage
                                            src={activeApp.passport_photo}
                                            alt={activeApp.student_name}
                                            aspectRatio="aspect-square"
                                            className="w-12 h-12 rounded-xl object-cover border"
                                            style={{ borderColor: 'var(--border-color-light)' }}
                                        />
                                    ) : (
                                        <div 
                                            style={{ 
                                                background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(63, 81, 181, 0.05) 100%)',
                                                borderColor: 'var(--border-color-light)',
                                                color: 'var(--primary-color)'
                                            }}
                                            className="w-12 h-12 rounded-xl border flex items-center justify-center font-black text-sm"
                                        >
                                            {getInitials(activeApp.student_name)}
                                        </div>
                                    )}
                                    <div className="space-y-0.5">
                                        <p 
                                            className="text-[9px] font-black uppercase tracking-widest mb-0.5" 
                                            style={{ color: 'var(--text-muted)' }}
                                        >
                                            Grade & Intake
                                        </p>
                                        <p 
                                            className="text-xs font-bold" 
                                            style={{ color: 'var(--text-main)' }}
                                        >
                                            {activeApp.grade_name || 'N/A'} • {activeApp.intake_name || 'Active Intake'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div>
                                    <span 
                                        style={{
                                            background: getStatusStyle(activeApp.application_status).bg,
                                            color: getStatusStyle(activeApp.application_status).text,
                                            borderColor: getStatusStyle(activeApp.application_status).border
                                        }}
                                        className="inline-flex items-center px-3 py-1 border rounded-full text-[9px] font-black uppercase tracking-wider"
                                    >
                                        {getStatusStyle(activeApp.application_status).name}
                                    </span>
                                </div>
                            </div>

                            {/* Steps Ribbon Navigation */}
                            <div className="flex justify-between items-center relative px-2.5 mt-1">
                                {DETAIL_STEPS.map((s) => {
                                    const Icon = s.icon;
                                    const isCompleted = activeStep > s.id;
                                    const isActive = activeStep === s.id;
                                    
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => setActiveStep(s.id)}
                                            className="flex flex-col items-center flex-1 z-10 focus:outline-none transition-transform active:scale-95 cursor-pointer"
                                        >
                                            <div
                                                style={{
                                                    background: isActive ? 'var(--primary-color)' : isCompleted ? 'var(--primary-light)' : 'var(--card-bg)',
                                                    borderColor: isActive ? 'var(--primary-color)' : isCompleted ? 'var(--primary-color)' : 'var(--border-color-light)',
                                                    color: isActive ? '#fff' : isCompleted ? 'var(--primary-color)' : 'var(--text-muted)',
                                                    boxShadow: isActive ? '0 0 0 3px var(--primary-light, rgba(79, 70, 229, 0.15))' : 'none'
                                                }}
                                                className="w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 mb-1"
                                            >
                                                {isCompleted ? <Check size={14} className="stroke-[3]" /> : <Icon size={13} />}
                                            </div>
                                            <span 
                                                style={{ 
                                                    color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                                                    fontWeight: isActive ? '900' : '500'
                                                }}
                                                className="text-[9px] uppercase tracking-wider"
                                            >
                                                {s.title}
                                            </span>
                                        </button>
                                    );
                                })}

                                {/* Background connection bar */}
                                <div 
                                    style={{ background: 'var(--border-color-light)' }}
                                    className="absolute top-4 left-7 right-7 h-0.5 -z-10"
                                />
                                <div
                                    style={{ 
                                        width: `${((activeStep - 1) / (DETAIL_STEPS.length - 1)) * (100 - 15)}%`,
                                        background: 'var(--primary-color)'
                                    }}
                                    className="absolute top-4 left-7 h-0.5 -z-10 transition-all duration-300"
                                />
                            </div>
                        </div>

                        {/* 2. Scrollable Body Content */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
                            
                            {/* Step 1: Personal Info Content */}
                            {activeStep === 1 && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-5"
                                >
                                    <div className="flex items-center gap-2 px-1">
                                        <User size={13} style={{ color: 'var(--primary-color)' }} />
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                                            Bio Profile Information
                                        </h4>
                                    </div>

                                    <div 
                                        style={{ borderColor: 'var(--border-color-light)', background: 'var(--bg-light)' }} 
                                        className="border rounded-2xl p-4 grid grid-cols-2 gap-4"
                                    >
                                        <div className="col-span-2 flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-color-light)' }}>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Full Student Name</p>
                                                <p className="text-sm font-black" style={{ color: 'var(--text-main)' }}>
                                                    {activeApp.first_name} {activeApp.middle_name || ''} {activeApp.last_name}
                                                </p>
                                            </div>
                                            {activeApp.gender && (
                                                <span 
                                                    className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide border"
                                                    style={{ 
                                                        background: 'var(--card-bg)', 
                                                        borderColor: 'var(--border-color-light)',
                                                        color: 'var(--text-secondary)'
                                                    }}
                                                >
                                                    {activeApp.gender === 'M' ? '♂ Boy' : activeApp.gender === 'F' ? '♀ Girl' : activeApp.gender}
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>Birth Date</p>
                                            <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                                                {activeApp.dob || activeApp.date_of_birth || 'Not specified'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>Birth Cert No.</p>
                                            <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                                                {activeApp.birth_certificate_number || 'N/A'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>Nationality</p>
                                            <p className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                                                <Globe size={11} style={{ color: 'var(--text-muted)' }} /> {activeApp.nationality || 'Kenyan'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>Religion</p>
                                            <p className="text-xs font-bold capitalize" style={{ color: 'var(--text-main)' }}>
                                                {activeApp.religion || 'Not Specified'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 px-1">
                                        <MapPin size={13} style={{ color: 'var(--primary-color)' }} />
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                                            Residency & Address
                                        </h4>
                                    </div>

                                    <div 
                                        style={{ borderColor: 'var(--border-color-light)', background: 'var(--bg-light)' }} 
                                        className="border rounded-2xl p-4 grid grid-cols-2 gap-4"
                                    >
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>County</p>
                                            <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>{activeApp.county || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>Sub-County</p>
                                            <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>{activeApp.sub_county || 'N/A'}</p>
                                        </div>
                                        <div className="col-span-2 border-t pt-2" style={{ borderColor: 'var(--border-color-light)' }}>
                                            <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>Home Address</p>
                                            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                                {activeApp.home_address || 'No physical address specified'}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Academic Info Content */}
                            {activeStep === 2 && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-5"
                                >
                                    <div className="flex items-center gap-2 px-1">
                                        <BookOpen size={13} style={{ color: 'var(--primary-color)' }} />
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                                            Enrollment Intentions
                                        </h4>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div 
                                            style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}
                                            className="p-4 rounded-2xl border flex flex-col gap-1"
                                        >
                                            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Curriculum</p>
                                            <p className="text-sm font-black" style={{ color: 'var(--primary-color)' }}>
                                                {activeApp.curriculum_name || 'Standard'}
                                            </p>
                                        </div>

                                        <div 
                                            style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}
                                            className="p-4 rounded-2xl border flex flex-col gap-1"
                                        >
                                            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Target Campus</p>
                                            <p className="text-sm font-black" style={{ color: 'var(--text-main)' }}>
                                                {activeApp.campus_name || activeApp.campus || 'Main Campus'}
                                            </p>
                                        </div>
                                    </div>

                                    <div 
                                        style={{ borderColor: 'var(--border-color-light)', background: 'var(--bg-light)' }} 
                                        className="border rounded-2xl p-4 space-y-4"
                                    >
                                        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-color-light)' }}>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Previous School</p>
                                                <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                                                    {activeApp.previous_school || activeApp.previous_school_name || 'None Specified'}
                                                </p>
                                            </div>
                                            
                                            <span 
                                                style={{
                                                    background: activeApp.is_transfer ? 'rgba(59, 130, 246, 0.08)' : 'rgba(100, 116, 139, 0.08)',
                                                    color: activeApp.is_transfer ? 'rgb(59, 130, 246)' : 'var(--text-muted)',
                                                    borderColor: activeApp.is_transfer ? 'rgba(59, 130, 246, 0.15)' : 'var(--border-color-light)'
                                                }}
                                                className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide border"
                                            >
                                                {activeApp.is_transfer ? '🔄 Transfer Student' : '🏫 First Entry'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {activeApp.score && (
                                                <div>
                                                    <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>Assessment Score</p>
                                                    <p className="text-xl font-black tabular-nums text-emerald-500">{activeApp.score}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>Referral Source</p>
                                                <p className="text-xs font-bold capitalize" style={{ color: 'var(--text-main)' }}>
                                                    {activeApp.referral_source ? activeApp.referral_source.replace('_', ' ') : 'Walk-In'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Guardian Details Content */}
                            {activeStep === 3 && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-5"
                                >
                                    <div className="flex items-center gap-2 px-1">
                                        <Users size={13} style={{ color: 'var(--primary-color)' }} />
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                                            Primary Guardian Details
                                        </h4>
                                    </div>

                                    <div 
                                        style={{ borderColor: 'var(--border-color-light)', background: 'var(--bg-light)' }} 
                                        className="border rounded-2xl p-4 space-y-3.5"
                                    >
                                        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-color-light)' }}>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Parent/Guardian Name</p>
                                                <p className="text-sm font-black" style={{ color: 'var(--text-main)' }}>{activeApp.guardian_name || 'N/A'}</p>
                                            </div>
                                            <span 
                                                className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide border"
                                                style={{ 
                                                    background: 'var(--card-bg)', 
                                                    borderColor: 'var(--border-color-light)',
                                                    color: 'var(--text-secondary)'
                                                }}
                                            >
                                                Relationship: {activeApp.guardian_relationship || 'Parent'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-0.5">
                                                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Phone Line</p>
                                                <a 
                                                    href={`tel:${activeApp.phone_number || activeApp.guardian_phone}`}
                                                    style={{ color: 'var(--primary-color)' }}
                                                    className="text-xs font-bold flex items-center gap-1.5 hover:underline"
                                                >
                                                    <Phone size={11} /> {activeApp.phone_number || activeApp.guardian_phone || 'N/A'}
                                                </a>
                                            </div>

                                            <div className="space-y-0.5">
                                                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Email Address</p>
                                                <a 
                                                    href={`mailto:${activeApp.email || activeApp.guardian_email}`}
                                                    style={{ color: 'var(--primary-color)' }}
                                                    className="text-xs font-bold flex items-center gap-1.5 hover:underline truncate"
                                                >
                                                    <Mail size={11} /> {activeApp.email || activeApp.guardian_email || 'N/A'}
                                                </a>
                                            </div>

                                            {activeApp.guardian_id_number && (
                                                <div className="space-y-0.5">
                                                    <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>ID / Passport No.</p>
                                                    <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>{activeApp.guardian_id_number}</p>
                                                </div>
                                            )}

                                            {activeApp.guardian_occupation && (
                                                <div className="space-y-0.5">
                                                    <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Occupation</p>
                                                    <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>{activeApp.guardian_occupation}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Secondary / Emergency Contacts (Collapsible logic or quick card) */}
                                    {(activeApp.emergency_contact_name || activeApp.guardian2_name) && (
                                        <>
                                            <div className="flex items-center gap-2 px-1">
                                                <AlertCircle size={13} style={{ color: 'var(--primary-color)' }} />
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                                                    Secondary & Emergency Contacts
                                                </h4>
                                            </div>

                                            <div 
                                                style={{ borderColor: 'var(--border-color-light)', background: 'var(--bg-light)' }} 
                                                className="border rounded-2xl p-4 grid grid-cols-2 gap-4"
                                            >
                                                {activeApp.guardian2_name && (
                                                    <div className="col-span-2 pb-2 border-b" style={{ borderColor: 'var(--border-color-light)' }}>
                                                        <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>Secondary Guardian</p>
                                                        <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                                                            {activeApp.guardian2_name} ({activeApp.guardian2_relationship || 'Co-guardian'})
                                                        </p>
                                                        {activeApp.guardian2_phone && (
                                                            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Phone: {activeApp.guardian2_phone}</p>
                                                        )}
                                                    </div>
                                                )}

                                                {activeApp.emergency_contact_name && (
                                                    <div className="col-span-2">
                                                        <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5 text-red-500" style={{ color: 'var(--text-muted)' }}>Emergency Contact</p>
                                                        <p className="text-xs font-black" style={{ color: 'var(--text-main)' }}>
                                                            🚨 {activeApp.emergency_contact_name} ({activeApp.emergency_contact_relationship || 'Relation'})
                                                        </p>
                                                        <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--primary-color)' }}>
                                                            📞 {activeApp.emergency_contact_phone}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}

                            {/* Step 4: Decisions & Remarks Content */}
                            {activeStep === 4 && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-5"
                                >
                                    <div className="flex items-center gap-2 px-1">
                                        <Briefcase size={13} style={{ color: 'var(--primary-color)' }} />
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                                            Administrative Remarks
                                        </h4>
                                    </div>

                                    <div 
                                        style={{ borderColor: 'var(--border-color-light)', background: 'var(--bg-light)' }} 
                                        className="border rounded-2xl p-4 flex flex-col gap-2"
                                    >
                                        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Review Notes & Remarks</p>
                                        <p 
                                            style={{ color: activeApp.remarks || activeApp.review_notes ? 'var(--text-main)' : 'var(--text-muted)' }}
                                            className="text-xs italic font-medium leading-relaxed"
                                        >
                                            "{activeApp.remarks || activeApp.review_notes || 'No review remarks or administrative notes recorded for this applicant file yet.'}"
                                        </p>
                                    </div>

                                    {/* Action items & document downloads */}
                                    <div className="flex items-center gap-2 px-1">
                                        <FileText size={13} style={{ color: 'var(--primary-color)' }} />
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                                            Document Downloads
                                        </h4>
                                    </div>

                                    <div 
                                        style={{ borderColor: 'var(--border-color-light)', background: 'var(--bg-light)' }} 
                                        className="border rounded-2xl p-4 space-y-4"
                                    >
                                        {activeApp.application_status === 'accepted' ? (
                                            <div className="flex flex-col gap-2">
                                                <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Available Documents</p>
                                                
                                                <button 
                                                    onClick={() => handleDownload('offer_letter')}
                                                    disabled={isGenerating}
                                                    style={{ background: 'var(--primary-light)', color: 'var(--primary-color)' }}
                                                    className="w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-sm border border-indigo-100/10"
                                                >
                                                    <Download size={14} /> 
                                                    {isGenerating ? 'Generating Offer...' : 'Download Official Offer Letter'}
                                                </button>

                                                <button 
                                                    onClick={() => handleDownload('admission_letter')}
                                                    disabled={isGenerating}
                                                    style={{ background: 'var(--primary-light)', color: 'var(--primary-color)' }}
                                                    className="w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-sm border border-indigo-100/10"
                                                >
                                                    <Download size={14} /> 
                                                    {isGenerating ? 'Generating Letter...' : 'Download Admission Letter'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-100/50 border border-slate-200/50 text-[10px]" style={{ borderColor: 'var(--border-color-light)', background: 'var(--card-bg)' }}>
                                                <AlertCircle size={16} className="text-slate-400 shrink-0" />
                                                <p className="font-bold mb-0" style={{ color: 'var(--text-muted)' }}>
                                                    Documents such as the Offer Letter and Admission Letter will automatically generate once this application is moved to the "Accepted" status.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action hub options panel */}
                                    <div className="flex items-center gap-2 px-1 pt-2">
                                        <Award size={13} style={{ color: 'var(--primary-color)' }} />
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                                            Status Flow Transitions
                                        </h4>
                                    </div>

                                    <div 
                                        style={{ borderColor: 'var(--border-color-light)', background: 'var(--bg-light)' }} 
                                        className="border rounded-2xl p-4 flex flex-col gap-2.5"
                                    >
                                        <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Move Applicant File To:</p>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            {activeApp.application_status !== 'pending' && (
                                                <button
                                                    onClick={() => triggerStatusChange('pending')}
                                                    style={{ color: 'var(--text-main)', borderColor: 'var(--border-color-light)' }}
                                                    className="py-2 px-3 border rounded-xl text-[10px] font-black uppercase tracking-wider bg-[var(--card-bg)] hover:bg-[var(--bg-light)] transition-all cursor-pointer text-center"
                                                >
                                                    Move to Pending
                                                </button>
                                            )}

                                            {activeApp.application_status !== 'interview' && (
                                                <button
                                                    onClick={() => triggerStatusChange('interview')}
                                                    className="py-2 px-3 border rounded-xl text-[10px] font-black uppercase tracking-wider bg-[var(--card-bg)] hover:bg-amber-500/10 hover:border-amber-500/30 text-amber-600 transition-all cursor-pointer text-center"
                                                    style={{ borderColor: 'var(--border-color-light)' }}
                                                >
                                                    Schedule Interview
                                                </button>
                                            )}

                                            {activeApp.application_status !== 'waitlist' && (
                                                <button
                                                    onClick={() => triggerStatusChange('waitlist')}
                                                    className="py-2 px-3 border rounded-xl text-[10px] font-black uppercase tracking-wider bg-[var(--card-bg)] hover:bg-purple-500/10 hover:border-purple-500/30 text-purple-600 transition-all cursor-pointer text-center"
                                                    style={{ borderColor: 'var(--border-color-light)' }}
                                                >
                                                    Place on Waitlist
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                        </div>

                        {/* 3. Sticky Footer Actions */}
                        <div 
                            style={{ 
                                borderColor: 'var(--border-color-light)',
                                background: 'var(--bg-light)'
                            }} 
                            className="p-5 border-t flex items-center justify-between gap-4 sticky bottom-0 z-25 bg-[inherit]"
                        >
                            {/* Navigation back and next */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setActiveStep(prev => Math.max(prev - 1, 1))}
                                    disabled={activeStep === 1}
                                    style={{ borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}
                                    className="p-2.5 border rounded-xl hover:bg-[var(--card-bg)] disabled:opacity-40 transition-all cursor-pointer bg-[var(--card-bg)]"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                
                                <button
                                    onClick={() => setActiveStep(prev => Math.min(prev + 1, 4))}
                                    disabled={activeStep === 4}
                                    style={{ borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}
                                    className="p-2.5 border rounded-xl hover:bg-[var(--card-bg)] disabled:opacity-40 transition-all cursor-pointer bg-[var(--card-bg)]"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            {/* Direct Admission decisions */}
                            <div className="flex items-center gap-2">
                                {activeApp.application_status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => triggerStatusChange('rejected')}
                                            className="px-4 py-2.5 border border-rose-200/50 hover:bg-rose-50 hover:border-rose-300 text-rose-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => onAdmit(activeApp)}
                                            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200/40 transition-all cursor-pointer flex items-center gap-1.5"
                                        >
                                            <Check size={14} className="stroke-[3]" /> Admit Now
                                        </button>
                                    </>
                                )}

                                {activeApp.application_status !== 'pending' && (
                                    <button
                                        onClick={onClose}
                                        style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color-light)' }}
                                        className="px-5 py-2.5 border rounded-xl text-xs font-bold hover:bg-[var(--card-bg)] transition-all cursor-pointer"
                                    >
                                        Close Details
                                    </button>
                                )}
                            </div>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ApplicationDetailsModal;
