import React, { useState, useEffect } from 'react';
import { X, User, DollarSign, Check, AlertCircle } from 'lucide-react';
import { api } from '../../../../services/api';

const StudentAdmissionModal = ({ isOpen, onClose, onConfirm, applicant, parentInfo, loading }) => {
    const [useExistingParent, setUseExistingParent] = useState(parentInfo ? true : false);
    const [applyAdmissionFees, setApplyAdmissionFees] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [loadingTemplates, setLoadingTemplates] = useState(false);

    useEffect(() => {
        if (isOpen && applyAdmissionFees && templates.length === 0) {
            setLoadingTemplates(true);
            api.get('/api/finance/admission-fee-templates/')
                .then(res => {
                    const data = res.results || res || [];
                    setTemplates(data);
                    if (data.length > 0) {
                        setSelectedTemplateId(data[0].id);
                    }
                })
                .catch(err => console.error("Failed to load templates", err))
                .finally(() => setLoadingTemplates(false));
        }
    }, [isOpen, applyAdmissionFees]);

    useEffect(() => {
        setUseExistingParent(parentInfo ? true : false);
    }, [parentInfo]);

    if (!isOpen || !applicant) return null;

    const handleConfirm = () => {
        const extraData = {};
        
        if (parentInfo) {
            if (useExistingParent) {
                extraData.existing_parent_user_id = parentInfo.existing_parent.id;
            }
        }

        if (applyAdmissionFees) {
            extraData.apply_admission_fees = true;
            extraData.admission_fee_template_id = selectedTemplateId;
        }

        onConfirm(extraData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-color-light)' }}>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <Check size={20} className="text-green-500" />
                        Confirm Admission
                    </h3>
                    <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            You are about to admit <strong>{applicant.student_name}</strong> into <strong>{applicant.applying_for_grade?.name || applicant.grade_name || 'the system'}</strong>.
                        </p>
                    </div>

                    {/* Parent Resolution (if email exists) */}
                    {parentInfo && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30 space-y-3">
                            <div className="flex gap-3">
                                <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
                                <div>
                                    <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Existing Parent Found</h4>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        An account with email <strong>{applicant.guardian_email}</strong> already exists for {parentInfo.existing_parent.first_name} {parentInfo.existing_parent.last_name}.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="space-y-2 mt-3">
                                <label className="flex items-center gap-2 p-2 rounded hover:bg-blue-100/50 cursor-pointer transition-colors">
                                    <input 
                                        type="radio" 
                                        name="parent_action" 
                                        checked={useExistingParent}
                                        onChange={() => setUseExistingParent(true)}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Link student to this existing parent</span>
                                </label>
                                <label className="flex items-center gap-2 p-2 rounded hover:bg-blue-100/50 cursor-pointer transition-colors">
                                    <input 
                                        type="radio" 
                                        name="parent_action" 
                                        checked={!useExistingParent}
                                        onChange={() => setUseExistingParent(false)}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Create a separate new parent account</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Admission Fees Toggle */}
                    <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl border border-gray-200 dark:border-slate-600 space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <div className="pt-0.5">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    checked={applyAdmissionFees}
                                    onChange={(e) => setApplyAdmissionFees(e.target.checked)}
                                />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                                    <DollarSign size={16} className="text-indigo-500" />
                                    Generate Admission Fee Invoice
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Automatically bill the student for admission-related fees based on a standard template.
                                </p>
                            </div>
                        </label>

                        {applyAdmissionFees && (
                            <div className="mt-3 pl-7">
                                {loadingTemplates ? (
                                    <p className="text-xs text-gray-500">Loading templates...</p>
                                ) : templates.length > 0 ? (
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Select Template</label>
                                        <select 
                                            value={selectedTemplateId}
                                            onChange={(e) => setSelectedTemplateId(e.target.value)}
                                            className="w-full text-sm p-2 border rounded-lg bg-white dark:bg-slate-800 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            {templates.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <p className="text-xs text-red-500 bg-red-50 p-2 rounded">No active admission fee templates found in Finance settings.</p>
                                )}
                            </div>
                        )}
                    </div>

                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-750 border-t flex justify-end gap-3" style={{ borderColor: 'var(--border-color-light)' }}>
                    <button 
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={loading || (applyAdmissionFees && templates.length === 0)}
                        className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <Check size={16} /> Finalize Admission
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentAdmissionModal;
