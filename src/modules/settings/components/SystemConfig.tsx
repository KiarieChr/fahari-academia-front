import React, { useState, useEffect, useCallback } from 'react';
import {
    CreditCard, Clock, Bell, GraduationCap, Lock, UserPlus, Settings,
    Save, RefreshCw, Eye, EyeOff, Check, AlertCircle, Info
} from 'lucide-react';
import { toast } from 'react-toastify';
import { institutionService } from '../../../services/institutionService';

const GROUP_CONFIG = {
    payments: {
        label: 'Payments & M-Pesa', icon: CreditCard, color: 'text-emerald-600',
        description: 'Configure M-Pesa Daraja API integration, payment reconciliation, and currency.',
    },
    timetable: {
        label: 'Timetable', icon: Clock, color: 'text-blue-600',
        description: 'Set period durations, break times, school hours, and scheduling format.',
    },
    notifications: {
        label: 'Notifications', icon: Bell, color: 'text-amber-600',
        description: 'SMS gateway, email SMTP settings, and automated notification triggers.',
    },
    grading: {
        label: 'Grading & Reports', icon: GraduationCap, color: 'text-purple-600',
        description: 'Grading scales, pass marks, report card format, and display preferences.',
    },
    security: {
        label: 'Security', icon: Lock, color: 'text-red-600',
        description: 'Session timeouts, password policies, MFA, and audit log retention.',
    },
    admissions: {
        label: 'Admissions', icon: UserPlus, color: 'text-indigo-600',
        description: 'Admission numbering, application requirements, and age restrictions.',
    },
    general: {
        label: 'General', icon: Settings, color: 'text-gray-600',
        description: 'General system-wide settings and preferences.',
    },
};

const SystemConfig = ({ filterGroups = null }) => {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeGroup, setActiveGroup] = useState(filterGroups ? filterGroups[0] : 'payments');
    const [editedValues, setEditedValues] = useState({});
    const [revealedSecrets, setRevealedSecrets] = useState({});

    const fetchConfigs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await institutionService.getSystemConfigs();
            setConfigs(data.results || data || []);
            setEditedValues({});
        } catch (error) {
            console.error('Error fetching configs:', error);
            toast.error('Failed to load system configuration');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConfigs();
    }, [fetchConfigs]);

    // Group configs by category
    const groupedConfigs = configs.reduce((acc, cfg) => {
        const group = cfg.group || 'general';
        if (!acc[group]) acc[group] = [];
        acc[group].push(cfg);
        return acc;
    }, {});

    // Available groups (only those with configs, filtered if prop provided)
    const availableGroups = Object.keys(GROUP_CONFIG).filter(g =>
        groupedConfigs[g]?.length > 0 && (!filterGroups || filterGroups.includes(g))
    );

    const handleValueChange = (key, value) => {
        setEditedValues(prev => ({ ...prev, [key]: value }));
    };

    const hasChanges = Object.keys(editedValues).length > 0;

    const handleSave = async () => {
        if (!hasChanges) return;
        setSaving(true);
        try {
            await institutionService.bulkUpdateConfigs(editedValues);
            toast.success('Configuration saved successfully');
            setEditedValues({});
            fetchConfigs();
        } catch (error) {
            console.error('Error saving configs:', error);
            toast.error('Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    const toggleSecret = (key) => {
        setRevealedSecrets(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const renderField = (config) => {
        const currentValue = editedValues[config.key] !== undefined
            ? editedValues[config.key]
            : config.value;
        const isEdited = editedValues[config.key] !== undefined;
        const isSecret = config.value_type === 'secret';
        const isRevealed = revealedSecrets[config.key];

        const baseInputClass = `w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm transition-all outline-none ${isEdited
            ? 'border-indigo-300 ring-2 ring-indigo-500/10'
            : 'border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10'
            } ${!config.is_editable ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'text-gray-900'}`;

        if (config.value_type === 'boolean') {
            const boolVal = String(currentValue).toLowerCase() === 'true';
            return (
                <button
                    onClick={() => config.is_editable && handleValueChange(config.key, String(!boolVal))}
                    disabled={!config.is_editable}
                    className="flex items-center gap-3 group"
                >
                    <div className={`relative w-11 h-6 rounded-full transition-all duration-200 ${boolVal ? 'bg-indigo-600' : 'bg-gray-200'} ${!config.is_editable ? 'opacity-50' : ''}`}>
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${boolVal ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                    </div>
                    <span className={`text-sm font-medium ${boolVal ? 'text-indigo-700' : 'text-gray-500'}`}>
                        {boolVal ? 'Enabled' : 'Disabled'}
                    </span>
                    {isEdited && <Check size={14} className="text-indigo-500" />}
                </button>
            );
        }

        if (config.value_type === 'json') {
            return (
                <div className="relative">
                    <textarea
                        value={currentValue}
                        onChange={(e) => config.is_editable && handleValueChange(config.key, e.target.value)}
                        disabled={!config.is_editable}
                        rows={3}
                        className={`${baseInputClass} font-mono text-xs resize-none`}
                    />
                    {isEdited && <Check size={14} className="absolute top-3 right-3 text-indigo-500" />}
                </div>
            );
        }

        if (isSecret) {
            return (
                <div className="relative">
                    <input
                        type={isRevealed ? 'text' : 'password'}
                        value={currentValue}
                        onChange={(e) => config.is_editable && handleValueChange(config.key, e.target.value)}
                        disabled={!config.is_editable}
                        className={`${baseInputClass} pr-10 font-mono`}
                        placeholder="Enter secret value..."
                    />
                    <button
                        onClick={() => toggleSecret(config.key)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {isRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                </div>
            );
        }

        if (config.value_type === 'integer' || config.value_type === 'float') {
            return (
                <div className="relative">
                    <input
                        type="number"
                        value={currentValue}
                        onChange={(e) => config.is_editable && handleValueChange(config.key, e.target.value)}
                        disabled={!config.is_editable}
                        className={baseInputClass}
                        step={config.value_type === 'float' ? '0.01' : '1'}
                    />
                    {isEdited && <Check size={14} className="absolute top-1/2 -translate-y-1/2 right-3 text-indigo-500" />}
                </div>
            );
        }

        // Default: string
        return (
            <div className="relative">
                <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => config.is_editable && handleValueChange(config.key, e.target.value)}
                    disabled={!config.is_editable}
                    className={baseInputClass}
                    placeholder={`Enter ${config.label.toLowerCase()}...`}
                />
                {isEdited && <Check size={14} className="absolute top-1/2 -translate-y-1/2 right-3 text-indigo-500" />}
            </div>
        );
    };

    const activeGroupConfig = GROUP_CONFIG[activeGroup] || GROUP_CONFIG.general;
    const ActiveIcon = activeGroupConfig.icon;
    const groupConfigs = groupedConfigs[activeGroup] || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Settings size={20} className="text-indigo-500" /> System Configuration
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Manage payments, timetabling, notifications, and system preferences.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {hasChanges && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg font-medium border border-amber-200">
                            {Object.keys(editedValues).length} unsaved change{Object.keys(editedValues).length > 1 ? 's' : ''}
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all ${hasChanges
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:w-56 flex-shrink-0">
                    <nav className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-3 space-y-0.5">
                            {availableGroups.map(groupKey => {
                                const cfg = GROUP_CONFIG[groupKey];
                                const Icon = cfg.icon;
                                const isActive = activeGroup === groupKey;
                                const groupEditCount = (groupedConfigs[groupKey] || [])
                                    .filter(c => editedValues[c.key] !== undefined).length;

                                return (
                                    <button
                                        key={groupKey}
                                        onClick={() => setActiveGroup(groupKey)}
                                        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all ${isActive
                                            ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon size={16} className={isActive ? 'text-indigo-500' : 'text-gray-400'} />
                                        <span className="flex-1 text-left truncate">{cfg.label}</span>
                                        {groupEditCount > 0 && (
                                            <span className="w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                {groupEditCount}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Mobile: horizontal scroll tabs */}
                    <div className="lg:hidden flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
                        {availableGroups.map(groupKey => {
                            const cfg = GROUP_CONFIG[groupKey];
                            const Icon = cfg.icon;
                            const isActive = activeGroup === groupKey;
                            return (
                                <button
                                    key={groupKey}
                                    onClick={() => setActiveGroup(groupKey)}
                                    className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${isActive
                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon size={13} /> {cfg.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Config Panel */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Group Header */}
                        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm`}>
                                    <ActiveIcon size={18} className={activeGroupConfig.color} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">{activeGroupConfig.label}</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">{activeGroupConfig.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Config Fields */}
                        {loading ? (
                            <div className="p-12 text-center">
                                <RefreshCw size={24} className="mx-auto text-indigo-400 animate-spin mb-3" />
                                <p className="text-sm text-gray-500">Loading configuration...</p>
                            </div>
                        ) : groupConfigs.length === 0 ? (
                            <div className="p-12 text-center">
                                <Settings size={32} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-sm text-gray-500">No configuration entries for this group.</p>
                                <p className="text-xs text-gray-400 mt-1">Run the "Seed System Configuration" command first.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {groupConfigs.map(config => (
                                    <div key={config.id} className="px-6 py-5 hover:bg-gray-50/30 transition-colors">
                                        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                                            <div className="lg:w-72 flex-shrink-0">
                                                <label className="text-sm font-semibold text-gray-800">
                                                    {config.label}
                                                </label>
                                                {config.description && (
                                                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{config.description}</p>
                                                )}
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                        {config.key}
                                                    </span>
                                                    {!config.is_editable && (
                                                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                            <Lock size={9} /> Read-only
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {renderField(config)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemConfig;
