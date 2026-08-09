import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle, Layers, BookOpen, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { templateService } from '../templateService';
import studentSettingsService from '../../../../services/studentSettingsService';

/**
 * ApplyTemplateWizard
 * A 3-step modal that guides the user through:
 *   Step 1: Choose a Template
 *   Step 2: Choose Target Classes + Year/Term
 *   Step 3: Review & Confirm
 */
const ApplyTemplateWizard = ({ isOpen, onClose, onSuccess, initialTemplate = null }) => {
    const [step, setStep] = useState(1);
    const [applying, setApplying] = useState(false);
    const [result, setResult] = useState(null); // after apply

    // Step 1 data
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate);

    // Step 2 data
    const [classes, setClasses] = useState([]);
    const [years, setYears] = useState([]);
    const [terms, setTerms] = useState([]);
    const [selectedClasses, setSelectedClasses] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('');
    const [overwriteExisting, setOverwriteExisting] = useState(false);

    // Fetch on open
    useEffect(() => {
        if (!isOpen) return;
        setStep(initialTemplate ? 2 : 1);
        setSelectedTemplate(initialTemplate);
        setSelectedClasses([]);
        setResult(null);

        const fetchLookups = async () => {
            const [tplRes, clsRes, yrRes, tmRes] = await Promise.all([
                templateService.getTemplates({ status: 'ACTIVE' }),
                studentSettingsService.getClasses(),
                studentSettingsService.getAcademicYears(),
                studentSettingsService.getTerms(),
            ]);
            setTemplates(Array.isArray(tplRes) ? tplRes : (tplRes.results || []));
            setClasses(Array.isArray(clsRes) ? clsRes : (clsRes.results || []));
            setYears(Array.isArray(yrRes) ? yrRes : (yrRes.results || []));
            setTerms(Array.isArray(tmRes) ? tmRes : (tmRes.results || []));
        };

        fetchLookups().catch(() => toast.error('Failed to load lookup data'));
    }, [isOpen]);

    const toggleClass = (id) => {
        setSelectedClasses(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedClasses.length === classes.length) {
            setSelectedClasses([]);
        } else {
            setSelectedClasses(classes.map(c => c.id));
        }
    };

    const canProceedStep1 = !!selectedTemplate;
    const canProceedStep2 = selectedClasses.length > 0 && selectedYear && selectedTerm;

    const handleApply = async () => {
        if (!selectedTemplate || !canProceedStep2) return;
        setApplying(true);
        try {
            const res = await templateService.applyToStructures(selectedTemplate.id, {
                grade_ids: selectedClasses,
                academic_year: selectedYear,
                term: selectedTerm,
                overwrite_existing: overwriteExisting,
            });
            setResult(res);
            setStep(4); // success screen
            toast.success(`Template applied to ${selectedClasses.length} class(es) successfully!`);
            onSuccess && onSuccess();
        } catch (err) {
            toast.error(err?.message || 'Failed to apply template. Ensure the backend endpoint exists.');
        } finally {
            setApplying(false);
        }
    };

    if (!isOpen) return null;

    // ── Shared styling ────────────────────────────────────────────────────────
    const stepBadge = (n, label) => (
        <div className={`flex items-center gap-2 ${step >= n ? 'text-indigo-600 font-semibold' : 'text-gray-400'}`}>
            <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${step > n ? 'bg-indigo-600 text-white' : step === n ? 'bg-indigo-100 text-indigo-700 border border-indigo-400' : 'bg-gray-100 text-gray-400'}`}>
                {step > n ? <CheckCircle size={12} /> : n}
            </span>
            <span className="text-sm hidden sm:inline">{label}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Layers size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">Apply Fee Template</h2>
                            <p className="text-indigo-100 text-sm">Generate fee structures for classes from a template</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-4">
                    {stepBadge(1, 'Choose Template')}
                    <ChevronRight size={14} className="text-gray-300" />
                    {stepBadge(2, 'Select Classes')}
                    <ChevronRight size={14} className="text-gray-300" />
                    {stepBadge(3, 'Review & Apply')}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* ── STEP 1: Choose Template ─────────────────────── */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-1">Active Fee Templates</h3>
                                <p className="text-sm text-gray-500">Select the template whose fee items will be copied to your target classes.</p>
                            </div>
                            {templates.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <Layers size={40} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500 font-medium">No active templates found</p>
                                    <p className="text-gray-400 text-sm mt-1">Create and activate a template first</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {templates.map(tpl => (
                                        <button
                                            key={tpl.id}
                                            onClick={() => setSelectedTemplate(tpl)}
                                            className={`text-left p-4 border-2 rounded-xl transition-all ${
                                                selectedTemplate?.id === tpl.id
                                                    ? 'border-indigo-500 bg-indigo-50'
                                                    : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/40'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-800 truncate">{tpl.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {(tpl.line_items?.length || tpl.line_items_count || 0)} fee items
                                                        {tpl.total_amount ? ` · KES ${Number(tpl.total_amount).toLocaleString()}` : ''}
                                                    </p>
                                                    {(tpl.covered_grades?.length > 0) && (
                                                        <p className="text-xs text-indigo-600 mt-1">
                                                            Default: {tpl.covered_grades.map(g => g.name || g).join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                                {selectedTemplate?.id === tpl.id && (
                                                    <CheckCircle size={18} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── STEP 2: Select Classes + Year/Term ───────────── */}
                    {step === 2 && (
                        <div className="space-y-6">
                            {selectedTemplate && (
                                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                    <Layers size={18} className="text-indigo-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-indigo-800">Using: {selectedTemplate.name}</p>
                                        <p className="text-xs text-indigo-600">{(selectedTemplate.line_items?.length || 0)} fee items defined</p>
                                    </div>
                                </div>
                            )}

                            {/* Year & Term */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Academic Year *</label>
                                    <select
                                        value={selectedYear}
                                        onChange={e => setSelectedYear(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                                    >
                                        <option value="">Select year...</option>
                                        {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Term *</label>
                                    <select
                                        value={selectedTerm}
                                        onChange={e => setSelectedTerm(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                                    >
                                        <option value="">Select term...</option>
                                        {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Class Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-gray-700">Target Classes *</label>
                                    <button onClick={toggleAll} className="text-xs text-indigo-600 hover:underline font-medium">
                                        {selectedClasses.length === classes.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1">
                                    {classes.map(cls => (
                                        <button
                                            key={cls.id}
                                            onClick={() => toggleClass(cls.id)}
                                            className={`text-left px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                                selectedClasses.includes(cls.id)
                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                    : 'border-gray-200 text-gray-700 hover:border-indigo-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="truncate">{cls.name}</span>
                                                {selectedClasses.includes(cls.id) && <CheckCircle size={14} className="text-indigo-600 flex-shrink-0 ml-1" />}
                                            </div>
                                            {cls.level && <span className="text-xs text-gray-400">{cls.level}</span>}
                                        </button>
                                    ))}
                                </div>
                                {selectedClasses.length > 0 && (
                                    <p className="text-xs text-indigo-600 font-medium mt-2">{selectedClasses.length} class(es) selected</p>
                                )}
                            </div>

                            {/* Options */}
                            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                <input
                                    type="checkbox"
                                    id="overwrite"
                                    checked={overwriteExisting}
                                    onChange={e => setOverwriteExisting(e.target.checked)}
                                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                />
                                <label htmlFor="overwrite" className="text-sm text-amber-800 cursor-pointer">
                                    <strong>Overwrite existing</strong> draft structures (leave unchecked to skip classes that already have structures)
                                </label>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Review ──────────────────────────────── */}
                    {step === 3 && (
                        <div className="space-y-5">
                            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-3">
                                <h4 className="font-bold text-indigo-800 flex items-center gap-2">
                                    <BookOpen size={16} /> Review Before Applying
                                </h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-indigo-500 text-xs font-semibold uppercase">Template</p>
                                        <p className="font-semibold text-gray-800">{selectedTemplate?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-indigo-500 text-xs font-semibold uppercase">Fee Items</p>
                                        <p className="font-semibold text-gray-800">
                                            {selectedTemplate?.line_items?.length || 0} items
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-indigo-500 text-xs font-semibold uppercase">Academic Year</p>
                                        <p className="font-semibold text-gray-800">{years.find(y => y.id == selectedYear)?.name || selectedYear}</p>
                                    </div>
                                    <div>
                                        <p className="text-indigo-500 text-xs font-semibold uppercase">Term</p>
                                        <p className="font-semibold text-gray-800">{terms.find(t => t.id == selectedTerm)?.name || selectedTerm}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-indigo-500 text-xs font-semibold uppercase mb-1.5">Target Classes ({selectedClasses.length})</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedClasses.map(id => {
                                            const cls = classes.find(c => c.id === id);
                                            return cls ? (
                                                <span key={id} className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-lg font-medium">{cls.name}</span>
                                            ) : null;
                                        })}
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-indigo-200">
                                    <p className="text-xs text-indigo-600">
                                        {overwriteExisting
                                            ? '⚠️ Will overwrite existing DRAFT structures for selected classes'
                                            : '✓ Will skip classes that already have a structure for this term'
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                                <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-yellow-800">
                                    This will create <strong>DRAFT</strong> fee structures for each selected class. You can still edit items individually in the Fee Structure dashboard before activating.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 4: Success ─────────────────────────────── */}
                    {step === 4 && (
                        <div className="text-center py-10 space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle size={32} className="text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Template Applied!</h3>
                            <p className="text-gray-500 text-sm max-w-sm mx-auto">
                                Fee structures have been created as drafts for {selectedClasses.length} class(es). Go to Fee Structure to review and activate them.
                            </p>
                            {result && (
                                <div className="mx-auto max-w-sm p-4 bg-green-50 rounded-xl border border-green-200 text-sm text-left space-y-1">
                                    <p className="font-semibold text-green-800">Result Summary</p>
                                    <p className="text-green-700">Structures created: <strong>{result.created ?? selectedClasses.length}</strong></p>
                                    {result.skipped > 0 && <p className="text-amber-700">Skipped (already exist): <strong>{result.skipped}</strong></p>}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex items-center justify-between">
                    <div>
                        {step > 1 && step < 4 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                            >
                                <ChevronLeft size={15} /> Back
                            </button>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {step < 4 && (
                            <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                                Cancel
                            </button>
                        )}

                        {step === 1 && (
                            <button
                                onClick={() => setStep(2)}
                                disabled={!canProceedStep1}
                                className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Next <ChevronRight size={15} />
                            </button>
                        )}

                        {step === 2 && (
                            <button
                                onClick={() => setStep(3)}
                                disabled={!canProceedStep2}
                                className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Review <ChevronRight size={15} />
                            </button>
                        )}

                        {step === 3 && (
                            <button
                                onClick={handleApply}
                                disabled={applying}
                                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-60 transition-all shadow-sm"
                            >
                                {applying ? <RefreshCw size={15} className="animate-spin" /> : <Zap size={15} />}
                                {applying ? 'Applying...' : 'Apply Template'}
                            </button>
                        )}

                        {step === 4 && (
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all"
                            >
                                Done
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplyTemplateWizard;
