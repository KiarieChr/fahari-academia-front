import React, { useState, useEffect, useCallback } from 'react';
import {
  GitBranch, DollarSign, MessageSquare, FileText, Save,
  CheckCircle, XCircle, AlertTriangle, ToggleLeft, ToggleRight,
  Plus, Trash2, ChevronRight, Loader2, Info
} from 'lucide-react';
import { studentManagementService } from '../../../../../services/studentManagementService';
import { toast } from 'react-toastify';

/* ─────────────────────────────────────────────────────────────────────────────
   Reusable Toggle Switch
───────────────────────────────────────────────────────────────────────────── */
const ToggleSwitch = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${
      checked ? 'bg-indigo-600' : 'bg-gray-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
      checked ? 'translate-x-6' : 'translate-x-1'
    }`} />
  </button>
);

/* ─────────────────────────────────────────────────────────────────────────────
   Stage Card
───────────────────────────────────────────────────────────────────────────── */
const StageCard = ({ icon: Icon, color, title, description, enabled, onToggle, children }) => (
  <div className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${
    enabled
      ? 'border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-white shadow-sm shadow-indigo-100'
      : 'border-gray-100 bg-white'
  }`}>
    {enabled && (
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-indigo-400 rounded-l-2xl" />
    )}
    <div className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 p-2.5 rounded-xl ${enabled ? `bg-${color}-100 text-${color}-600` : 'bg-gray-100 text-gray-400'}`}>
            <Icon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
              {enabled && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{description}</p>
          </div>
        </div>
        <ToggleSwitch checked={enabled} onChange={onToggle} />
      </div>
      {enabled && children && (
        <div className="mt-4 pt-4 border-t border-indigo-100/60 space-y-3">
          {children}
        </div>
      )}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   Pipeline Preview
───────────────────────────────────────────────────────────────────────────── */
const PipelinePreview = ({ stages }) => {
  const allStages = [
    { key: 'enquiry', label: 'Enquiry', color: 'purple' },
    { key: 'application', label: 'Application', color: 'blue', always: true },
    { key: 'fee_payment', label: 'Fee Payment', color: 'yellow' },
    { key: 'interview', label: 'Interview', color: 'orange' },
    { key: 'reporting', label: 'Reporting', color: 'teal' },
    { key: 'admission', label: 'Admission', color: 'green', always: true },
  ];

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {allStages.map((s, i) => {
        const active = s.always || stages.includes(s.key);
        return (
          <React.Fragment key={s.key}>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              active
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-300 line-through'
            }`}>
              {active ? <CheckCircle size={11} /> : <XCircle size={11} />}
              {s.label}
            </div>
            {i < allStages.length - 1 && (
              <ChevronRight size={12} className={active ? 'text-indigo-400' : 'text-gray-200'} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Document Checklist Manager
───────────────────────────────────────────────────────────────────────────── */
const DocumentChecklistEditor = ({ items, onChange }) => {
  const [newItem, setNewItem] = useState('');

  const add = () => {
    const trimmed = newItem.trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
      setNewItem('');
    }
  };

  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-gray-600">Required Documents Checklist</label>
      <div className="space-y-1.5 max-h-40 overflow-y-auto">
        {items.map((doc, idx) => (
          <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 group">
            <FileText size={12} className="text-gray-400 flex-shrink-0" />
            <span className="flex-1 text-xs text-gray-700">{doc}</span>
            <button onClick={() => remove(idx)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-gray-400 italic px-1">No documents added yet. Add from the field below.</p>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="e.g. Birth Certificate"
          className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 bg-white"
        />
        <button
          onClick={add}
          className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={12} /> Add
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────────────────────── */
const AdmissionWorkflowTab = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await studentManagementService.getWorkflowConfig();
      setConfig(data);
    } catch (e) {
      toast.error('Failed to load workflow configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const update = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const save = async () => {
    try {
      setSaving(true);
      await studentManagementService.updateWorkflowConfig(config);
      setDirty(false);
      toast.success('Admission workflow settings saved successfully');
    } catch (e) {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const activeStages = config ? [
    config.require_enquiry && 'enquiry',
    'application',
    config.require_application_fee && 'fee_payment',
    config.require_interview && 'interview',
    config.require_reporting && 'reporting',
    'admission',
  ].filter(Boolean) : ['application', 'admission'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
        <span className="ml-3 text-sm text-gray-400">Loading workflow configuration…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-800">Admissions Workflow</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure which stages are required before a student can be formally admitted.
            Toggles are instantly reflected in the admissions pipeline.
          </p>
        </div>
        {dirty && (
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        )}
      </div>

      {/* Pipeline Preview */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
        <p className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-400 mb-3">
          Current Pipeline
        </p>
        <PipelinePreview stages={activeStages} />
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
        <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-700">
          All toggles default to <strong>OFF</strong>. Existing schools are unaffected until you enable a stage.
          The <strong>Application</strong> and <strong>Admission</strong> stages are always required.
        </p>
      </div>

      {/* Stage Cards */}
      <div className="space-y-3">
        <StageCard
          icon={MessageSquare}
          color="purple"
          title="Enquiry Stage"
          description="Require a logged enquiry before an application can be created. Helps track and convert prospective students."
          enabled={config?.require_enquiry}
          onToggle={(v) => update('require_enquiry', v)}
        />

        <StageCard
          icon={DollarSign}
          color="yellow"
          title="Application / Registration Fee"
          description="Charge a fee that must be paid (or waived) before the application proceeds to review."
          enabled={config?.require_application_fee}
          onToggle={(v) => update('require_application_fee', v)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Fee Label</label>
              <input
                type="text"
                value={config?.application_fee_label || ''}
                onChange={e => update('application_fee_label', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
                placeholder="Application Registration Fee"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                Amount ({config?.application_fee_currency || 'KES'})
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={config?.application_fee_amount || ''}
                  onChange={e => update('application_fee_amount', e.target.value)}
                  className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
                  placeholder="0.00"
                  min="0"
                />
                <input
                  type="text"
                  value={config?.application_fee_currency || 'KES'}
                  onChange={e => update('application_fee_currency', e.target.value)}
                  className="w-16 text-xs px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 text-center"
                  maxLength={5}
                />
              </div>
            </div>
          </div>
        </StageCard>

        <StageCard
          icon={GitBranch}
          color="orange"
          title="Interview Stage"
          description="Require an interview to be scheduled and passed before the applicant can be admitted."
          enabled={config?.require_interview}
          onToggle={(v) => update('require_interview', v)}
        >
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Interview Label</label>
              <input
                type="text"
                value={config?.interview_label || ''}
                onChange={e => update('interview_label', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
                placeholder="Interview"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
              <div>
                <p className="text-xs font-medium text-gray-700">Allow Applicant Self-Scheduling</p>
                <p className="text-[0.65rem] text-gray-400">Applicants can pick their own interview slot</p>
              </div>
              <ToggleSwitch
                checked={config?.allow_self_schedule || false}
                onChange={v => update('allow_self_schedule', v)}
              />
            </div>
          </div>
        </StageCard>

        <StageCard
          icon={FileText}
          color="teal"
          title="Reporting Day"
          description="Require the student to physically report to school with documents before formal admission."
          enabled={config?.require_reporting}
          onToggle={(v) => update('require_reporting', v)}
        >
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Reporting Stage Label</label>
              <input
                type="text"
                value={config?.reporting_label || ''}
                onChange={e => update('reporting_label', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
                placeholder="Reporting & Document Submission"
              />
            </div>
            <DocumentChecklistEditor
              items={config?.document_checklist || []}
              onChange={v => update('document_checklist', v)}
            />
          </div>
        </StageCard>
      </div>

      {/* Save */}
      {dirty && (
        <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" />
            <span className="text-xs text-amber-700 font-medium">You have unsaved changes</span>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdmissionWorkflowTab;
