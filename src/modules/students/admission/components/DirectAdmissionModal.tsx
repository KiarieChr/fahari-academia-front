import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Check, Search, Sparkles, BookOpen, User, Calendar, 
    Building, Phone, Mail, FileText, Users, CheckCircle2, 
    DollarSign, Award, Info, Lock, Printer, Copy, AlertCircle,
    ChevronRight, ChevronLeft, Save, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-toastify';
import { studentManagementService } from '../../../../services/studentManagementService';

const DirectAdmissionModal = ({ isOpen, onClose, apps = [] }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // List of pending applicants (not accepted/already admitted)
    const pendingApplicants = apps.filter(app => app.application_status !== 'accepted');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAppId, setSelectedAppId] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);

    // Step 2: Fee Processing
    const [feeStatus, setFeeStatus] = useState('exempt'); // 'paid', 'waived', 'exempt'
    const [paymentMethod, setPaymentMethod] = useState('mpesa'); // 'cash', 'mpesa', 'bank_transfer'
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [receiptNumber, setReceiptNumber] = useState('');
    const [paymentReference, setPaymentReference] = useState('');
    const [feeNotes, setFeeNotes] = useState('');
    const [waiverReason, setWaiverReason] = useState('');

    // Step 3: Stream & Sibling Placement
    const [streams, setStreams] = useState([]);
    const [streamId, setStreamId] = useState('');
    const [linkSiblingParent, setLinkSiblingParent] = useState(false);
    const [existingParentId, setExistingParentId] = useState('');
    const [parentSearchQuery, setParentSearchQuery] = useState('');
    const [parentsList, setParentsList] = useState([]);
    const [checkingParent, setCheckingParent] = useState(false);

    // Step 4: Outcome Credentials
    const [credentials, setCredentials] = useState(null);

    // Filter applicants based on search
    const filteredApplicants = pendingApplicants.filter(app => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        const name = (app.student_name || '').toLowerCase();
        const guardian = (app.guardian_name || '').toLowerCase();
        const id = String(app.id);
        return name.includes(query) || guardian.includes(query) || id.includes(query);
    });

    // Handle applicant selection
    const handleSelectApplicant = async (appId) => {
        setSelectedAppId(appId);
        const app = pendingApplicants.find(a => Number(a.id) === Number(appId));
        setSelectedApp(app);
        setStreamId('');
        setStreams([]);
        
        if (app && app.applying_for_grade) {
            try {
                const res = await studentManagementService.getStreams(app.applying_for_grade);
                const streamList = res.results || res || [];
                setStreams(streamList);
            } catch (err) {
                console.error("Failed to load streams for grade:", err);
            }
        }
    };

    // Check sibling parent account based on email
    useEffect(() => {
        const checkParentAccount = async () => {
            if (linkSiblingParent && selectedApp?.guardian_email && selectedApp.guardian_email !== 'N/A') {
                try {
                    setCheckingParent(true);
                    const res = await studentManagementService.checkGuardianEmail(selectedApp.guardian_email);
                    if (res.exists) {
                        setExistingParentId(res.parent_user_id || '');
                        toast.info(`Found existing parent account for: "${res.parent_name}"`);
                    } else {
                        setExistingParentId('');
                    }
                } catch (err) {
                    console.warn("Sibling email check failed:", err);
                } finally {
                    setCheckingParent(false);
                }
            }
        };
        checkParentAccount();
    }, [linkSiblingParent, selectedApp]);

    // Copy credentials to clipboard
    const handleCopy = (text, label) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    // Sequential Admission Submission Flow
    const handleAdmitExecute = async () => {
        if (!selectedAppId) {
            toast.error("Please select an applicant first");
            return;
        }

        setSubmitting(true);
        const toastId = toast.loading('Executing direct admission flow...');

        try {
            // 1. Process Fee Payment or Waiver first (if specified)
            if (feeStatus === 'paid') {
                if (!receiptNumber.trim()) {
                    toast.error("Finance Receipt Number is required to mark as paid", { id: toastId });
                    setSubmitting(false);
                    setStep(2);
                    return;
                }
                
                await studentManagementService.recordFeePayment(selectedAppId, {
                    payment_method: paymentMethod,
                    payment_date: paymentDate,
                    receipt_number: receiptNumber.trim(),
                    payment_reference: paymentReference.trim(),
                    notes: feeNotes.trim()
                });
                toast.info("Application fee payment recorded successfully.");
            } else if (feeStatus === 'waived') {
                if (!waiverReason.trim()) {
                    toast.error("Waiver reason is required to waive the fee", { id: toastId });
                    setSubmitting(false);
                    setStep(2);
                    return;
                }

                await studentManagementService.waiveFee(selectedAppId, {
                    waiver_reason: waiverReason.trim()
                });
                toast.info("Application fee waiver recorded successfully.");
            }

            // 2. Process Student Admission
            const admissionPayload = {};
            if (streamId) {
                admissionPayload.stream_id = streamId;
            }
            if (linkSiblingParent && existingParentId) {
                admissionPayload.existing_parent_user_id = existingParentId;
            }

            const response = await studentManagementService.admitApplicant(selectedAppId, admissionPayload);
            
            toast.success('Applicant Admitted Successfully!', { id: toastId });
            setCredentials(response.data || response);
            setStep(4); // Move to Credentials Screen!
        } catch (error) {
            console.error("Admissions execution error:", error);
            const errMsg = error.response?.data?.error || 'Admissions execution failed. Verify academic intakes are active.';
            toast.error(errMsg, { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        setSelectedAppId('');
        setSelectedApp(null);
        setFeeStatus('exempt');
        setReceiptNumber('');
        setPaymentReference('');
        setWaiverReason('');
        setStreamId('');
        setLinkSiblingParent(false);
        setExistingParentId('');
        setCredentials(null);
        onClose();
    };

    const inputClasses = "w-full px-4 py-2.5 border rounded-xl outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 font-medium shadow-sm text-sm";

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9000] flex items-center justify-center overflow-hidden p-4">
                {/* Overlay Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={submitting ? undefined : handleClose}
                    className="fixed inset-0 bg-slate-950/45 backdrop-blur-[3px] cursor-pointer"
                />

                {/* Dialog Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    style={{ 
                        background: 'var(--card-bg)', 
                        borderColor: 'var(--border-color-light)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}
                    className="relative w-full max-w-[620px] rounded-[28px] border overflow-hidden flex flex-col max-h-[90vh] z-10 text-left"
                >
                    {/* Header Banner */}
                    <div 
                        className="px-6 py-5 border-b flex items-center justify-between sticky top-0 bg-[inherit]"
                        style={{ borderColor: 'var(--border-color-light)' }}
                    >
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <span 
                                    className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600"
                                    style={{ background: 'var(--primary-light)', color: 'var(--primary-color)' }}
                                >
                                    Admissions Tool
                                </span>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Direct Process</span>
                            </div>
                            <h3 className="text-base font-black tracking-tight text-slate-800 dark:text-slate-100">
                                Direct Student Admission & Fee Processing
                            </h3>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={submitting}
                            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
                        >
                            <X size={15} />
                        </button>
                    </div>

                    {/* Step ribbon indicator */}
                    {step < 4 && (
                        <div className="px-6 py-3 border-b flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30" style={{ borderColor: 'var(--border-color-light)' }}>
                            <div className="flex items-center gap-3">
                                {[1, 2, 3].map(s => (
                                    <div key={s} className="flex items-center gap-2">
                                        <div 
                                            style={{
                                                background: step === s ? 'var(--primary-color)' : step > s ? 'var(--primary-light)' : 'var(--bg-light)',
                                                color: step === s ? '#fff' : step > s ? 'var(--primary-color)' : 'var(--text-muted)',
                                                borderColor: step >= s ? 'var(--primary-color)' : 'var(--border-color-light)'
                                            }}
                                            className="w-5 h-5 rounded-full border text-[10px] font-extrabold flex items-center justify-center"
                                        >
                                            {step > s ? <Check size={10} className="stroke-[3]" /> : s}
                                        </div>
                                        <span 
                                            className="text-[10px] font-black uppercase tracking-wider"
                                            style={{ color: step === s ? 'var(--text-main)' : 'var(--text-muted)' }}
                                        >
                                            {s === 1 ? 'Applicant' : s === 2 ? 'Fee' : 'Placement'}
                                        </span>
                                        {s < 3 && <span className="text-slate-300 dark:text-slate-700 font-bold">/</span>}
                                    </div>
                                ))}
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step {step} of 3</span>
                        </div>
                    )}

                    {/* Scrollable Content View */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                        
                        {/* STEP 1: Applicant Selection */}
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                <div className="p-4 rounded-2xl border" style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}>
                                    <h4 className="text-xs font-black flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                                        <User size={13} style={{ color: 'var(--primary-color)' }} /> Select Target Applicant
                                    </h4>
                                    <p className="text-[11px] mt-0.5 mb-0" style={{ color: 'var(--text-secondary)' }}>
                                        Pick a pending, waitlisted, or review applicant to bypass the formal email pipelines and trigger immediate admission.
                                    </p>
                                </div>

                                {/* Search and Filter Area */}
                                <div className="relative group">
                                    <Search className="absolute left-3.5 top-3 text-slate-400" size={14} />
                                    <input 
                                        type="text" 
                                        placeholder="Search by student or guardian name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                                        className={`${inputClasses} pl-10`}
                                    />
                                </div>

                                {/* List Box */}
                                <div 
                                    className="border rounded-2xl max-h-[220px] overflow-y-auto divide-y"
                                    style={{ borderColor: 'var(--border-color-light)', background: 'var(--card-bg)' }}
                                >
                                    {filteredApplicants.length === 0 ? (
                                        <div className="p-8 text-center text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>
                                            No pending applicants found.
                                        </div>
                                    ) : (
                                        filteredApplicants.map(app => (
                                            <label 
                                                key={app.id} 
                                                className={`flex items-center justify-between p-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 cursor-pointer select-none transition-colors ${
                                                    Number(selectedAppId) === Number(app.id) ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        type="radio" 
                                                        name="applicantSelect"
                                                        value={app.id}
                                                        checked={Number(selectedAppId) === Number(app.id)}
                                                        onChange={() => handleSelectApplicant(app.id)}
                                                        className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                                    />
                                                    <div className="text-left">
                                                        <p className="text-xs font-black text-slate-800 dark:text-slate-100">
                                                            {app.student_name}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                                            Grade: <span className="font-bold">{app.grade_name || 'N/A'}</span> • Parent: <span className="font-semibold">{app.guardian_name || 'N/A'}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <span 
                                                    className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border"
                                                    style={{
                                                        background: 'var(--bg-light)',
                                                        borderColor: 'var(--border-color-light)',
                                                        color: app.application_status === 'interview' ? 'var(--primary-color)' : 'var(--text-secondary)'
                                                    }}
                                                >
                                                    {app.application_status}
                                                </span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Application Fee Options */}
                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                <div className="p-4 rounded-2xl border" style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}>
                                    <h4 className="text-xs font-black flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                                        <DollarSign size={14} style={{ color: 'var(--primary-color)' }} /> Application Fee Recording
                                    </h4>
                                    <p className="text-[11px] mt-0.5 mb-0" style={{ color: 'var(--text-secondary)' }}>
                                        Define how the application fee should be logged. Recording payments will automatically update the applicant's ledger records.
                                    </p>
                                </div>

                                {/* Radios Grid */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'exempt', title: 'Exempt / Skip', desc: 'Already paid or exempt', icon: ShieldCheck, color: 'slate' },
                                        { id: 'paid', title: 'Mark as Paid', desc: 'Record transaction details', icon: CheckCircle2, color: 'indigo' },
                                        { id: 'waived', title: 'Waive Fee', desc: 'Bypass payment obligation', icon: Award, color: 'amber' }
                                    ].map(opt => {
                                        const Icon = opt.icon;
                                        const isActive = feeStatus === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setFeeStatus(opt.id)}
                                                style={{
                                                    background: isActive ? 'var(--card-bg)' : 'var(--bg-light)',
                                                    borderColor: isActive ? 'var(--primary-color)' : 'var(--border-color-light)'
                                                }}
                                                className="p-4 border-2 rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                                            >
                                                <div 
                                                    style={{
                                                        background: isActive ? 'var(--primary-light)' : 'var(--card-bg)',
                                                        color: isActive ? 'var(--primary-color)' : 'var(--text-muted)'
                                                    }}
                                                    className="w-8 h-8 rounded-full flex items-center justify-center border"
                                                >
                                                    <Icon size={14} />
                                                </div>
                                                <div>
                                                    <span className="text-[11px] font-black block" style={{ color: 'var(--text-main)' }}>{opt.title}</span>
                                                    <span className="text-[9px] text-slate-400 block mt-0.5 leading-tight">{opt.desc}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Conditional Paid Forms */}
                                {feeStatus === 'paid' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -5 }} 
                                        animate={{ opacity: 1, y: 0 }} 
                                        className="p-4 border rounded-2xl space-y-4"
                                        style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}
                                    >
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-500 mb-1">Payment Method</label>
                                                <select
                                                    value={paymentMethod}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                                                    className={`${inputClasses} cursor-pointer`}
                                                >
                                                    <option value="mpesa">M-Pesa</option>
                                                    <option value="cash">Cash Payment</option>
                                                    <option value="bank_transfer">Bank Transfer</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-500 mb-1">Payment Date</label>
                                                <input 
                                                    type="date"
                                                    value={paymentDate}
                                                    onChange={(e) => setPaymentDate(e.target.value)}
                                                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                                                    className={inputClasses}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                                    Finance Fee Receipt No <span className="text-red-500">*</span>
                                                </label>
                                                <input 
                                                    type="text"
                                                    placeholder="REC-100234"
                                                    value={receiptNumber}
                                                    onChange={(e) => setReceiptNumber(e.target.value)}
                                                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                                                    className={inputClasses}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-500 mb-1">M-Pesa / Bank Ref Code</label>
                                                <input 
                                                    type="text"
                                                    placeholder="QED4819DF"
                                                    value={paymentReference}
                                                    onChange={(e) => setPaymentReference(e.target.value)}
                                                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                                                    className={inputClasses}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 mb-1">Transaction Notes</label>
                                            <textarea 
                                                rows={2}
                                                placeholder="Enter fee ledger comments..."
                                                value={feeNotes}
                                                onChange={(e) => setFeeNotes(e.target.value)}
                                                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                                                className={`${inputClasses} resize-none min-h-[50px]`}
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {/* Conditional Waive Forms */}
                                {feeStatus === 'waived' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -5 }} 
                                        animate={{ opacity: 1, y: 0 }} 
                                        className="p-4 border rounded-2xl space-y-1.5"
                                        style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}
                                    >
                                        <label className="block text-[11px] font-bold text-slate-500">Waiver Reason <span className="text-red-500">*</span></label>
                                        <textarea 
                                            rows={2}
                                            placeholder="Enter authorization reason (e.g. Sibling scholarship, staff child)..."
                                            value={waiverReason}
                                            onChange={(e) => setWaiverReason(e.target.value)}
                                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                                            className={`${inputClasses} resize-none min-h-[70px]`}
                                        />
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {/* STEP 3: Academics Stream & Sibling Placement */}
                        {step === 3 && (
                            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                <div className="p-4 rounded-2xl border" style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}>
                                    <h4 className="text-xs font-black flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                                        <Building size={14} style={{ color: 'var(--primary-color)' }} /> Stream & Sibling Assignment
                                    </h4>
                                    <p className="text-[11px] mt-0.5 mb-0" style={{ color: 'var(--text-secondary)' }}>
                                        Configure stream placements and optional parent linkage. These can be adjusted later if needed.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Class Stream (Optional)</label>
                                        <select
                                            value={streamId}
                                            onChange={(e) => setStreamId(e.target.value)}
                                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                                            className={`${inputClasses} cursor-pointer`}
                                        >
                                            <option value="">-- No Stream Assigned (Unassigned) --</option>
                                            {streams.map(str => (
                                                <option key={str.id} value={str.id}>{str.name} (Capacity: {str.enrolled_count || 0}/{str.capacity})</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Sibling parent linkage toggle */}
                                    <div 
                                        className="col-span-2 p-4 border rounded-2xl flex items-center gap-3 cursor-pointer select-none"
                                        style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}
                                        onClick={() => setLinkSiblingParent(!linkSiblingParent)}
                                    >
                                        <div 
                                            style={{ background: linkSiblingParent ? 'var(--primary-color)' : 'var(--border-color-light)' }}
                                            className="w-10 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center"
                                        >
                                            <div 
                                                style={{ transform: linkSiblingParent ? 'translateX(20px)' : 'none' }}
                                                className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-xs font-black block" style={{ color: 'var(--text-main)' }}>Link Sibling (Reuse Existing Parent)</span>
                                            <span className="text-[10px] text-slate-400 block mt-0.5">Check if this student has siblings enrolled under a shared guardian account.</span>
                                        </div>
                                    </div>

                                    {/* Sibling Link ID Search (Optional) */}
                                    {linkSiblingParent && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }} 
                                            animate={{ opacity: 1, height: 'auto' }} 
                                            className="col-span-2 space-y-1.5 text-xs text-left"
                                        >
                                            <label className="block text-[11px] font-bold text-slate-500">Existing Parent Account ID</label>
                                            {checkingParent ? (
                                                <div className="flex items-center gap-2 py-2 px-3 border rounded-xl" style={{ borderColor: 'var(--border-color-light)' }}>
                                                    <div className="w-4 h-4 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
                                                    <span className="text-[10px] font-bold text-slate-400">Checking email database...</span>
                                                </div>
                                            ) : (
                                                <input 
                                                    type="text"
                                                    placeholder="Enter Sibling's Parent Account User ID..."
                                                    value={existingParentId}
                                                    onChange={(e) => setExistingParentId(e.target.value)}
                                                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                                                    className={inputClasses}
                                                />
                                            )}
                                            <p className="text-[10px] text-slate-400 m-0">Leave blank to search automatically or create a brand new parent portal profile (`P[Admission_Number]`).</p>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: Success Outcomes Credentials */}
                        {step === 4 && credentials && (
                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-center py-4">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center shadow-sm">
                                        <CheckCircle2 size={24} className="stroke-[2.5]" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-black text-slate-800 dark:text-slate-100">Student Admitted Successfully!</h4>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Portal access credentials have been initialized and sent to the guardian's email.</p>
                                    </div>
                                </div>

                                {/* Credentials Card Grid */}
                                <div 
                                    className="border rounded-2xl p-5 divide-y text-left text-xs font-semibold space-y-4"
                                    style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}
                                >
                                    {/* 1. Student Info */}
                                    <div className="pb-3.5 flex justify-between items-center">
                                        <div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Admission Record</span>
                                            <p className="text-xs font-black text-slate-800 dark:text-slate-100">
                                                {selectedApp?.student_name}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Admission Number</span>
                                            <span className="inline-block px-2.5 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-black rounded-lg text-xs">
                                                {credentials.admission_number}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 2. Student Portal Login */}
                                    <div className="py-3.5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><User size={10} /> Student Portal Account</span>
                                            <div className="flex gap-1.5">
                                                <button 
                                                    onClick={() => handleCopy(credentials.username, 'Student Username')}
                                                    className="p-1 text-slate-400 hover:text-indigo-500 rounded-md transition-colors"
                                                    title="Copy Username"
                                                >
                                                    <Copy size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-[11px]">
                                            <div className="p-2.5 bg-white dark:bg-slate-950 border rounded-xl flex flex-col gap-0.5" style={{ borderColor: 'var(--border-color-light)' }}>
                                                <span className="text-[9px] text-slate-400 font-bold">Username</span>
                                                <span className="font-extrabold text-slate-800 dark:text-slate-100 font-mono">{credentials.username}</span>
                                            </div>
                                            <div className="p-2.5 bg-white dark:bg-slate-950 border rounded-xl flex flex-col gap-0.5" style={{ borderColor: 'var(--border-color-light)' }}>
                                                <span className="text-[9px] text-slate-400 font-bold">Default Password</span>
                                                <span className="font-extrabold text-slate-800 dark:text-slate-100 font-mono">{credentials.password}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Parent Portal Login */}
                                    <div className="pt-3.5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Users size={10} /> Parent Portal Account</span>
                                            <div className="flex gap-1.5">
                                                <button 
                                                    onClick={() => handleCopy(credentials.parent_username, 'Parent Username')}
                                                    className="p-1 text-slate-400 hover:text-indigo-500 rounded-md transition-colors"
                                                    title="Copy Username"
                                                >
                                                    <Copy size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-[11px]">
                                            <div className="p-2.5 bg-white dark:bg-slate-950 border rounded-xl flex flex-col gap-0.5" style={{ borderColor: 'var(--border-color-light)' }}>
                                                <span className="text-[9px] text-slate-400 font-bold">Username</span>
                                                <span className="font-extrabold text-slate-800 dark:text-slate-100 font-mono">{credentials.parent_username}</span>
                                            </div>
                                            <div className="p-2.5 bg-white dark:bg-slate-950 border rounded-xl flex flex-col gap-0.5" style={{ borderColor: 'var(--border-color-light)' }}>
                                                <span className="text-[9px] text-slate-400 font-bold">Default Password</span>
                                                <span className="font-extrabold text-slate-800 dark:text-slate-100 font-mono">
                                                    {credentials.parent_password || credentials.parent_username || 'Sibling Associated'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-xl border flex gap-3 text-xs leading-relaxed text-left" style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}>
                                    <Info size={16} className="shrink-0 text-slate-400" />
                                    <p className="m-0 text-slate-500 font-medium">
                                        The student has been auto-enrolled into the active academic year's class session. You can now track their attendance, invoice fee charges, and generate grade sheets.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                    </div>

                    {/* Footer Actions */}
                    <div 
                        className="px-6 py-4 border-t flex items-center justify-between sticky bottom-0 bg-[inherit]"
                        style={{ borderColor: 'var(--border-color-light)' }}
                    >
                        {/* Step nav arrows */}
                        <div>
                            {step < 4 ? (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        disabled={step === 1 || submitting}
                                        onClick={() => setStep(step - 1)}
                                        style={{ borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}
                                        className="px-4 py-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                                    >
                                        <ChevronLeft size={14} /> Back
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    style={{ borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}
                                    className="px-4 py-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Printer size={14} /> Print Credentials
                                </button>
                            )}
                        </div>

                        {/* CTA submission buttons */}
                        <div>
                            {step < 3 ? (
                                <button
                                    type="button"
                                    disabled={step === 1 && !selectedAppId}
                                    onClick={() => setStep(step + 1)}
                                    style={{ background: 'var(--primary-color)' }}
                                    className="px-5 py-2 text-white font-bold rounded-xl text-xs shadow-md hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                                >
                                    Next <ChevronRight size={14} />
                                </button>
                            ) : step === 3 ? (
                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={handleAdmitExecute}
                                    style={{ background: 'var(--primary-color)' }}
                                    className="px-5 py-2.5 text-white font-bold rounded-xl text-xs shadow-md hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Processing Admittance...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={14} />
                                            <span>Execute Admission</span>
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    style={{ background: 'var(--primary-color)' }}
                                    className="px-6 py-2.5 text-white font-bold rounded-xl text-xs shadow-md hover:opacity-90 transition-all cursor-pointer"
                                >
                                    Close & Refresh Registry
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DirectAdmissionModal;
