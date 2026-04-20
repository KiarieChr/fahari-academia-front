import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, Search, Loader2, Layers, RefreshCw, Copy,
    Filter, AlertCircle, CheckCircle2, ClipboardCheck, Zap,
} from 'lucide-react';
import { toast } from 'react-toastify';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import Modal from '../../../components/common/Modal';
import FeeTemplateCard from './components/FeeTemplateCard';
import ApplyTemplateWizard from './components/ApplyTemplateWizard';
import { templateService } from './templateService';
import studentSettingsService from '../../../services/studentSettingsService';

/* ────────────────────────────────────────────────────── */
/*  Helpers                                               */
/* ────────────────────────────────────────────────────── */
const inputClass =
    'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all';
const selectClass = inputClass;

const fmtCurrency = (v) =>
    new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0,
    }).format(v ?? 0);

/* ────────────────────────────────────────────────────── */
/*  Page Component                                        */
/* ────────────────────────────────────────────────────── */
const FeeTemplateDashboard = () => {
    // ── Data ────────────────────────────
    const [templates, setTemplates] = useState([]);
    const [voteHeads, setVoteHeads] = useState([]);
    const [gradeBands, setGradeBands] = useState([]);
    const [grades, setGrades] = useState([]);
    const [years, setYears] = useState([]);
    const [terms, setTerms] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Filters ─────────────────────────
    const [filterYear, setFilterYear] = useState('');
    const [filterTerm, setFilterTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [search, setSearch] = useState('');

    // ── Template Modal ──────────────────
    const [templateModalOpen, setTemplateModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [templateForm, setTemplateForm] = useState({
        name: '', grade_band: '', grades: [], term: '', academic_year: '', status: 'DRAFT',
    });
    const [lineItems, setLineItems] = useState([]);
    const [saving, setSaving] = useState(false);

    // ── Clone Modal ─────────────────────
    const [cloneModalOpen, setCloneModalOpen] = useState(false);
    const [cloneSource, setCloneSource] = useState(null);
    const [cloneForm, setCloneForm] = useState({
        target_term: '', target_year: '', pct_increase: 0,
    });

    // ── Rollover Modal ──────────────────
    const [rolloverModalOpen, setRolloverModalOpen] = useState(false);
    const [rolloverForm, setRolloverForm] = useState({
        from_year: '', to_year: '', pct_increase: 0, dry_run: true,
    });
    const [rolloverPreview, setRolloverPreview] = useState(null);

    // ── Readiness ───────────────────────
    const [readinessModalOpen, setReadinessModalOpen] = useState(false);
    const [readiness, setReadiness] = useState(null);
    const [readinessLoading, setReadinessLoading] = useState(false);

    // ── Apply Wizard ────────────────────
    const [applyWizardOpen, setApplyWizardOpen] = useState(false);
    const [applyWizardTemplate, setApplyWizardTemplate] = useState(null);

    const openApplyWizard = (tpl = null) => {
        setApplyWizardTemplate(tpl);
        setApplyWizardOpen(true);
    };

    /* ── Fetch helpers ─────────────────── */
    const fetchTemplates = useCallback(async () => {
        try {
            const params = {};
            if (filterYear) params.academic_year = filterYear;
            if (filterTerm) params.term = filterTerm;
            if (filterStatus) params.status = filterStatus;
            if (search) params.search = search;
            const res = await templateService.getTemplates(params);
            setTemplates(Array.isArray(res) ? res : res.results || []);
        } catch {
            toast.error('Failed to load templates');
        }
    }, [filterYear, filterTerm, filterStatus, search]);

    const fetchLookups = useCallback(async () => {
        try {
            const [vhRes, gbRes, grRes, yrRes, tmRes] = await Promise.all([
                templateService.getVoteHeads(),
                templateService.getGradeBands(),
                studentSettingsService.getClasses(),
                studentSettingsService.getAcademicYears(),
                studentSettingsService.getTerms(),
            ]);
            let vhList = Array.isArray(vhRes) ? vhRes : vhRes.results || [];

            // Auto-create vote heads from student-related accounts if none exist
            if (vhList.length === 0) {
                try {
                    const autoRes = await templateService.autoCreateVoteHeads();
                    if (autoRes.created_count > 0) {
                        const refreshed = await templateService.getVoteHeads();
                        vhList = Array.isArray(refreshed) ? refreshed : refreshed.results || [];
                        toast.success(`Created ${autoRes.created_count} vote head(s) from accounts`);
                    }
                } catch {
                    // Ignore — user can create manually
                }
            }

            setVoteHeads(vhList);
            setGradeBands(Array.isArray(gbRes) ? gbRes : gbRes.results || []);
            setGrades(Array.isArray(grRes) ? grRes : grRes.results || []);
            setYears(Array.isArray(yrRes) ? yrRes : yrRes.results || []);
            setTerms(Array.isArray(tmRes) ? tmRes : tmRes.results || []);
        } catch {
            toast.error('Failed to load lookup data');
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchTemplates(), fetchLookups()]);
            setLoading(false);
        };
        init();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    /* ── Template CRUD ─────────────────── */
    const openCreateModal = () => {
        setEditingTemplate(null);
        setTemplateForm({ name: '', grade_band: '', grades: [], term: '', academic_year: '', status: 'DRAFT' });
        setLineItems([]);
        setTemplateModalOpen(true);
    };

    const openEditModal = (tpl) => {
        setEditingTemplate(tpl);
        setTemplateForm({
            name: tpl.name,
            grade_band: tpl.grade_band || '',
            grades: (tpl.covered_grades || []).map(g => g.id),
            term: tpl.term || '',
            academic_year: tpl.academic_year || '',
            status: tpl.status,
        });
        setLineItems(
            (tpl.line_items || []).map(li => ({
                id: li.id,
                vote_head: li.vote_head,
                amount: li.amount,
                is_mandatory: li.is_mandatory,
                applies_to: li.applies_to || 'ALL',
                priority: li.priority || 0,
            }))
        );
        setTemplateModalOpen(true);
    };

    const handleSaveTemplate = async (e) => {
        e.preventDefault();
        if (!templateForm.name || !templateForm.term || !templateForm.academic_year) {
            toast.warning('Name, term and year are required');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name: templateForm.name,
                grade_band: templateForm.grade_band || null,
                grades: templateForm.grades,
                term: templateForm.term,
                academic_year: templateForm.academic_year,
                status: templateForm.status,
                line_items: lineItems.map(li => ({
                    vote_head: li.vote_head,
                    amount: li.amount,
                    is_mandatory: li.is_mandatory,
                    applies_to: li.applies_to || 'ALL',
                    priority: li.priority || 0,
                })),
            };

            if (editingTemplate) {
                await templateService.updateTemplate(editingTemplate.id, payload);
                toast.success('Template updated');
            } else {
                await templateService.createTemplate(payload);
                toast.success('Template created');
            }
            setTemplateModalOpen(false);
            fetchTemplates();
        } catch (err) {
            toast.error(err?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    /* ── Quick actions ─────────────────── */
    const handleActivate = async (id) => {
        try {
            await templateService.activateTemplate(id);
            toast.success('Template activated');
            fetchTemplates();
        } catch (err) {
            toast.error(err?.message || 'Activation failed');
        }
    };

    const handleDeactivate = async (id) => {
        try {
            await templateService.deactivateTemplate(id);
            toast.success('Template deactivated');
            fetchTemplates();
        } catch (err) {
            toast.error(err?.message || 'Deactivation failed');
        }
    };

    /* ── Clone ─────────────────────────── */
    const openCloneModal = (tpl) => {
        setCloneSource(tpl);
        setCloneForm({ target_term: tpl.term || '', target_year: tpl.academic_year || '', pct_increase: 0 });
        setCloneModalOpen(true);
    };

    const handleClone = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await templateService.cloneTemplate(cloneSource.id, {
                target_term: cloneForm.target_term || undefined,
                target_year: cloneForm.target_year || undefined,
                pct_increase: Number(cloneForm.pct_increase) || 0,
            });
            toast.success('Template cloned');
            setCloneModalOpen(false);
            fetchTemplates();
        } catch (err) {
            toast.error(err?.message || 'Clone failed');
        } finally {
            setSaving(false);
        }
    };

    /* ── Rollover ──────────────────────── */
    const handleRollover = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await templateService.rollover({
                from_year: rolloverForm.from_year,
                to_year: rolloverForm.to_year,
                pct_increase: Number(rolloverForm.pct_increase) || 0,
                dry_run: rolloverForm.dry_run,
            });
            if (rolloverForm.dry_run) {
                setRolloverPreview(res);
                toast.info(`Dry run: ${res.templates_created ?? '?'} templates would be created`);
            } else {
                toast.success(`Rollover complete — ${res.templates_created ?? '?'} templates created`);
                setRolloverModalOpen(false);
                setRolloverPreview(null);
                fetchTemplates();
            }
        } catch (err) {
            toast.error(err?.message || 'Rollover failed');
        } finally {
            setSaving(false);
        }
    };

    /* ── Readiness check ───────────────── */
    const runReadinessCheck = async () => {
        if (!filterTerm || !filterYear) {
            toast.warning('Select a term and year to run readiness check');
            return;
        }
        setReadinessLoading(true);
        setReadinessModalOpen(true);
        try {
            const res = await templateService.readinessCheck({ term: filterTerm, academic_year: filterYear });
            setReadiness(res);
        } catch {
            toast.error('Readiness check failed');
        } finally {
            setReadinessLoading(false);
        }
    };

    /* ── Line item helpers ─────────────── */
    const addLineItem = () => {
        setLineItems(prev => [
            ...prev,
            { vote_head: '', amount: '', is_mandatory: true, applies_to: 'ALL', priority: prev.length },
        ]);
    };

    const updateLineItem = (idx, field, value) => {
        setLineItems(prev => prev.map((li, i) => (i === idx ? { ...li, [field]: value } : li)));
    };

    const removeLineItem = (idx) => {
        setLineItems(prev => prev.filter((_, i) => i !== idx));
    };

    const handleGradesChange = (gradeId) => {
        const id = Number(gradeId);
        setTemplateForm(prev => ({
            ...prev,
            grades: prev.grades.includes(id)
                ? prev.grades.filter(g => g !== id)
                : [...prev.grades, id],
        }));
    };

    /* ── Rendering ─────────────────────── */
    const activeCount = templates.filter(t => t.status === 'ACTIVE').length;
    const draftCount = templates.filter(t => t.status === 'DRAFT').length;

    return (
        <DashboardLayout title="Fee Templates">
            <div className="p-6 space-y-6">
                {/* ── Header ───────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Fee Templates</h1>
                        <p className="text-gray-500 text-sm">
                            Manage reusable fee configurations across grades and terms
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={openCreateModal}
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-all">
                            <Plus size={16} /> New Template
                        </button>
                        <button onClick={() => openApplyWizard()}
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 shadow-sm transition-all">
                            <Zap size={16} /> Apply to Structures
                        </button>
                        <button onClick={() => setRolloverModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                            <RefreshCw size={16} /> Year Rollover
                        </button>
                        <button onClick={runReadinessCheck}
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                            <ClipboardCheck size={16} /> Readiness Check
                        </button>
                    </div>
                </div>

                {/* ── Summary pills ────────────────────── */}
                <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                        <Layers size={13} /> {templates.length} Total
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                        <CheckCircle2 size={13} /> {activeCount} Active
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold">
                        <AlertCircle size={13} /> {draftCount} Draft
                    </span>
                </div>

                {/* ── Filters ──────────────────────────── */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 font-medium">
                        <Filter size={14} /> Filters
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search templates…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className={`${inputClass} pl-9`}
                            />
                        </div>
                        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className={selectClass}>
                            <option value="">All Years</option>
                            {years.map(y => (
                                <option key={y.id} value={y.id}>{y.name}</option>
                            ))}
                        </select>
                        <select value={filterTerm} onChange={e => setFilterTerm(e.target.value)} className={selectClass}>
                            <option value="">All Terms</option>
                            {terms.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={selectClass}>
                            <option value="">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="DRAFT">Draft</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* ── Template Grid ────────────────────── */}
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="animate-spin text-indigo-500" size={32} />
                    </div>
                ) : templates.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <Layers size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-1">No templates found</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            {search || filterYear || filterTerm || filterStatus
                                ? 'Try adjusting your filters'
                                : 'Create your first fee template to get started'}
                        </p>
                        {!search && !filterYear && !filterTerm && !filterStatus && (
                            <button onClick={openCreateModal}
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all">
                                <Plus size={16} /> Create Template
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {templates.map(tpl => (
                            <FeeTemplateCard
                                key={tpl.id}
                                template={tpl}
                                onActivate={handleActivate}
                                onDeactivate={handleDeactivate}
                                onClone={openCloneModal}
                                onEdit={openEditModal}
                                onApply={openApplyWizard}
                            />
                        ))}
                    </div>
                )}

                {/* ═══════════════════════════════════════ */}
                {/*  CREATE / EDIT TEMPLATE MODAL           */}
                {/* ═══════════════════════════════════════ */}
                <Modal
                    isOpen={templateModalOpen}
                    onClose={() => setTemplateModalOpen(false)}
                    title={editingTemplate ? 'Edit Template' : 'New Fee Template'}
                    subtitle="Configure template details and line items"
                    icon={Layers}
                    size="lg"
                    accentColor="bg-indigo-500"
                    footer={
                        <>
                            <Modal.CancelButton onClick={() => setTemplateModalOpen(false)} />
                            <Modal.SubmitButton
                                form="template-form"
                                loading={saving}
                                label={editingTemplate ? 'Update Template' : 'Create Template'}
                            />
                        </>
                    }
                >
                    <form id="template-form" onSubmit={handleSaveTemplate} className="space-y-6">
                        {/* Basic info */}
                        <Modal.Section title="Template Details" icon={Layers}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Template Name *</label>
                                    <input
                                        className={inputClass}
                                        value={templateForm.name}
                                        onChange={e => setTemplateForm(p => ({ ...p, name: e.target.value }))}
                                        placeholder="e.g. Standard Day Scholar — Term 1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Academic Year *</label>
                                    <select
                                        className={selectClass}
                                        value={templateForm.academic_year}
                                        onChange={e => setTemplateForm(p => ({ ...p, academic_year: e.target.value }))}
                                        required
                                    >
                                        <option value="">Select year</option>
                                        {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Term *</label>
                                    <select
                                        className={selectClass}
                                        value={templateForm.term}
                                        onChange={e => setTemplateForm(p => ({ ...p, term: e.target.value }))}
                                        required
                                    >
                                        <option value="">Select term</option>
                                        {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Grade Band (optional)</label>
                                    <select
                                        className={selectClass}
                                        value={templateForm.grade_band}
                                        onChange={e => setTemplateForm(p => ({ ...p, grade_band: e.target.value }))}
                                    >
                                        <option value="">None</option>
                                        {gradeBands.map(gb => <option key={gb.id} value={gb.id}>{gb.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                                    <select
                                        className={selectClass}
                                        value={templateForm.status}
                                        onChange={e => setTemplateForm(p => ({ ...p, status: e.target.value }))}
                                    >
                                        <option value="DRAFT">Draft</option>
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Grade multi-select */}
                            <div className="mt-4">
                                <label className="block text-xs font-semibold text-gray-500 mb-2">Covered Grades</label>
                                <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-xl bg-gray-50 max-h-32 overflow-y-auto">
                                    {grades.map(g => (
                                        <label key={g.id} className="inline-flex items-center gap-1.5 text-sm cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={templateForm.grades.includes(g.id)}
                                                onChange={() => handleGradesChange(g.id)}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-gray-700">{g.name}</span>
                                        </label>
                                    ))}
                                    {grades.length === 0 && <span className="text-gray-400 text-xs">No grades available</span>}
                                </div>
                            </div>
                        </Modal.Section>

                        {/* Line Items */}
                        <Modal.Section title="Line Items" icon={Layers}>
                            {voteHeads.length === 0 && (
                                <div className="flex items-center gap-2 p-3 mb-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                                    <AlertCircle size={16} />
                                    <span>No vote heads found.</span>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                const res = await templateService.autoCreateVoteHeads();
                                                if (res.created_count > 0) {
                                                    const refreshed = await templateService.getVoteHeads();
                                                    setVoteHeads(Array.isArray(refreshed) ? refreshed : refreshed.results || []);
                                                    toast.success(`Created ${res.created_count} vote head(s) from accounts`);
                                                } else {
                                                    toast.info('No student-related accounts found to create vote heads from');
                                                }
                                            } catch {
                                                toast.error('Failed to sync vote heads');
                                            }
                                        }}
                                        className="underline font-medium hover:text-amber-900"
                                    >
                                        Sync from Accounts
                                    </button>
                                </div>
                            )}
                            {lineItems.length === 0 ? (
                                <p className="text-sm text-gray-400">No line items yet. Click below to add one.</p>
                            ) : (
                                <div className="space-y-3">
                                    {lineItems.map((li, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-3">
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs text-gray-400 mb-0.5">Vote Head</label>
                                                    <select
                                                        className={selectClass}
                                                        value={li.vote_head}
                                                        onChange={e => updateLineItem(idx, 'vote_head', e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select…</option>
                                                        {voteHeads.map(vh => (
                                                            <option key={vh.id} value={vh.id}>
                                                                {vh.code} — {vh.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-400 mb-0.5">Amount (KES)</label>
                                                    <input
                                                        type="number"
                                                        className={inputClass}
                                                        value={li.amount}
                                                        onChange={e => updateLineItem(idx, 'amount', e.target.value)}
                                                        min="0"
                                                        step="0.01"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-400 mb-0.5">Applies To</label>
                                                    <select
                                                        className={selectClass}
                                                        value={li.applies_to || 'ALL'}
                                                        onChange={e => updateLineItem(idx, 'applies_to', e.target.value)}
                                                    >
                                                        <option value="ALL">All Students</option>
                                                        <option value="BOARDERS">Boarders Only</option>
                                                        <option value="DAY_SCHOLARS">Day Scholars Only</option>
                                                    </select>
                                                </div>
                                                <div className="flex items-end gap-3">
                                                    <label className="inline-flex items-center gap-1.5 text-sm cursor-pointer pb-2.5">
                                                        <input
                                                            type="checkbox"
                                                            checked={li.is_mandatory}
                                                            onChange={e => updateLineItem(idx, 'is_mandatory', e.target.checked)}
                                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <span className="text-gray-600">Mandatory</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeLineItem(idx)}
                                                className="mt-5 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={addLineItem}
                                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
                            >
                                <Plus size={14} /> Add Line Item
                            </button>

                            {lineItems.length > 0 && (
                                <div className="mt-3 text-right text-sm font-semibold text-gray-700">
                                    Total: {fmtCurrency(lineItems.reduce((s, li) => s + (Number(li.amount) || 0), 0))}
                                </div>
                            )}
                        </Modal.Section>
                    </form>
                </Modal>

                {/* ═══════════════════════════════════════ */}
                {/*  CLONE MODAL                            */}
                {/* ═══════════════════════════════════════ */}
                <Modal
                    isOpen={cloneModalOpen}
                    onClose={() => setCloneModalOpen(false)}
                    title="Clone Template"
                    subtitle={cloneSource ? `Cloning "${cloneSource.name}"` : ''}
                    icon={Copy}
                    size="sm"
                    accentColor="bg-blue-500"
                    footer={
                        <>
                            <Modal.CancelButton onClick={() => setCloneModalOpen(false)} />
                            <Modal.SubmitButton form="clone-form" loading={saving} label="Clone" />
                        </>
                    }
                >
                    <form id="clone-form" onSubmit={handleClone} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Target Year</label>
                            <select
                                className={selectClass}
                                value={cloneForm.target_year}
                                onChange={e => setCloneForm(p => ({ ...p, target_year: e.target.value }))}
                            >
                                <option value="">Same year</option>
                                {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Target Term</label>
                            <select
                                className={selectClass}
                                value={cloneForm.target_term}
                                onChange={e => setCloneForm(p => ({ ...p, target_term: e.target.value }))}
                            >
                                <option value="">Same term</option>
                                {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Price Increase (%)</label>
                            <input
                                type="number"
                                className={inputClass}
                                value={cloneForm.pct_increase}
                                onChange={e => setCloneForm(p => ({ ...p, pct_increase: e.target.value }))}
                                min="0"
                                step="0.1"
                            />
                            <p className="text-xs text-gray-400 mt-1">Enter 0 for exact copy</p>
                        </div>
                    </form>
                </Modal>

                {/* ═══════════════════════════════════════ */}
                {/*  ROLLOVER MODAL                         */}
                {/* ═══════════════════════════════════════ */}
                <Modal
                    isOpen={rolloverModalOpen}
                    onClose={() => { setRolloverModalOpen(false); setRolloverPreview(null); }}
                    title="Year Rollover"
                    subtitle="Clone all templates from one year to another"
                    icon={RefreshCw}
                    size="md"
                    accentColor="bg-emerald-500"
                    footer={
                        <>
                            <Modal.CancelButton onClick={() => { setRolloverModalOpen(false); setRolloverPreview(null); }} />
                            {rolloverPreview && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRolloverForm(p => ({ ...p, dry_run: false }));
                                        // submit the form programmatically
                                        document.getElementById('rollover-form')?.requestSubmit();
                                    }}
                                    className="inline-flex items-center gap-2 px-7 py-2.5 text-[13px] font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-sm transition-all"
                                >
                                    Confirm Rollover
                                </button>
                            )}
                            <Modal.SubmitButton
                                form="rollover-form"
                                loading={saving}
                                label={rolloverPreview ? 'Re-run Preview' : 'Preview Rollover'}
                                className="bg-gray-600 hover:bg-gray-700"
                            />
                        </>
                    }
                >
                    <form id="rollover-form" onSubmit={handleRollover} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">From Year *</label>
                                <select
                                    className={selectClass}
                                    value={rolloverForm.from_year}
                                    onChange={e => setRolloverForm(p => ({ ...p, from_year: e.target.value }))}
                                    required
                                >
                                    <option value="">Select…</option>
                                    {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">To Year *</label>
                                <select
                                    className={selectClass}
                                    value={rolloverForm.to_year}
                                    onChange={e => setRolloverForm(p => ({ ...p, to_year: e.target.value }))}
                                    required
                                >
                                    <option value="">Select…</option>
                                    {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Price Increase (%)</label>
                            <input
                                type="number"
                                className={inputClass}
                                value={rolloverForm.pct_increase}
                                onChange={e => setRolloverForm(p => ({ ...p, pct_increase: e.target.value }))}
                                min="0"
                                step="0.1"
                            />
                        </div>

                        {rolloverPreview && (
                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-sm space-y-1">
                                <p className="font-semibold text-emerald-800">Preview Results</p>
                                <p className="text-emerald-700">
                                    Templates to create: <strong>{rolloverPreview.templates_created ?? 0}</strong>
                                </p>
                                {rolloverPreview.details && (
                                    <ul className="list-disc list-inside text-emerald-600 text-xs mt-2">
                                        {rolloverPreview.details.map((d, i) => (
                                            <li key={i}>{d}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </form>
                </Modal>

                {/* ═══════════════════════════════════════ */}
                {/*  READINESS CHECK MODAL                  */}
                {/* ═══════════════════════════════════════ */}
                <Modal
                    isOpen={readinessModalOpen}
                    onClose={() => { setReadinessModalOpen(false); setReadiness(null); }}
                    title="Readiness Check"
                    subtitle="Coverage report for selected term & year"
                    icon={ClipboardCheck}
                    size="md"
                    accentColor="bg-amber-500"
                    footer={<Modal.CancelButton onClick={() => { setReadinessModalOpen(false); setReadiness(null); }}>Close</Modal.CancelButton>}
                >
                    {readinessLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-amber-500" size={28} />
                        </div>
                    ) : readiness ? (
                        <div className="space-y-4 text-sm">
                            <div className={`p-4 rounded-xl border ${readiness.ready ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                                <p className={`font-semibold ${readiness.ready ? 'text-green-800' : 'text-amber-800'}`}>
                                    {readiness.ready ? '✓ All grades covered' : '⚠ Some grades lack templates'}
                                </p>
                            </div>

                            {readiness.covered_grades?.length > 0 && (
                                <div>
                                    <p className="font-semibold text-gray-700 mb-1">Covered Grades</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {readiness.covered_grades.map((g, i) => (
                                            <span key={i} className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">{g}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {readiness.missing_grades?.length > 0 && (
                                <div>
                                    <p className="font-semibold text-gray-700 mb-1">Missing Grades</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {readiness.missing_grades.map((g, i) => (
                                            <span key={i} className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium">{g}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {readiness.templates?.length > 0 && (
                                <div>
                                    <p className="font-semibold text-gray-700 mb-1">Templates Found</p>
                                    <ul className="list-disc list-inside text-gray-600 text-xs space-y-0.5">
                                        {readiness.templates.map((t, i) => <li key={i}>{t}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-6">No data</p>
                    )}
                </Modal>

                {/* ═══════════════════════════════════════ */}
                {/*  APPLY TEMPLATE WIZARD                   */}
                {/* ═══════════════════════════════════════ */}
                <ApplyTemplateWizard
                    isOpen={applyWizardOpen}
                    onClose={() => setApplyWizardOpen(false)}
                    onSuccess={() => {
                        setApplyWizardOpen(false);
                        fetchTemplates();
                    }}
                    initialTemplate={applyWizardTemplate}
                />
            </div>
        </DashboardLayout>
    );
};

export default FeeTemplateDashboard;
