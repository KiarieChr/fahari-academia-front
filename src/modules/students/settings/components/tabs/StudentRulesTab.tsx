import React, { useState, useEffect } from 'react';
import { Settings, UserCheck, ArrowUpCircle, ClipboardList, GraduationCap } from 'lucide-react';
import AdmissionNumberSetup from '../AdmissionNumberSetup';
import studentSettingsService from '../../../../../services/studentSettingsService';
import SystemConfig from '../../../../settings/components/SystemConfig';
import { toast } from 'react-toastify';

const neoCardClass = 'bg-[#f8f9fa] rounded-3xl shadow-[6px_6px_16px_#e5e7eb,-6px_-6px_16px_#ffffff] border border-white p-6 space-y-6';
const inputClass = 'w-full px-4 py-3 bg-gray-50/80 rounded-xl shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] border border-white/40 focus:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] focus:border-indigo-200 outline-none text-sm transition-all text-slate-700 placeholder-slate-400';

const StudentRulesTab = () => {
    const [activeSection, setActiveSection] = useState('admission');

    const sections = [
        { id: 'admission', label: 'Admission Settings', icon: Settings },
        { id: 'status', label: 'Student Statuses', icon: UserCheck },
        { id: 'promotion', label: 'Promotion Rules', icon: ArrowUpCircle },
        { id: 'demographics', label: 'Demographics', icon: ClipboardList },
        { id: 'grading-admissions', label: 'Grading & Admissions', icon: GraduationCap },
    ];

    return (
        <div className="space-y-8">
            {/* Horizontal Tabs */}
            <div className="w-full overflow-x-auto pb-4">
                <div className="flex items-center gap-3 bg-[#f8f9fa] rounded-[2rem] shadow-[inset_4px_4px_10px_#e5e7eb,inset_-4px_-4px_10px_#ffffff] border border-white/50 p-2 min-w-max">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-3xl text-sm font-bold transition-all whitespace-nowrap ${activeSection === section.id
                                ? 'bg-white shadow-[4px_4px_10px_#e5e7eb,-4px_-4px_10px_#ffffff] text-indigo-700 border border-white/80'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-gray-50/40 border border-transparent'
                                }`}
                        >
                            <section.icon size={18} className={activeSection === section.id ? 'text-indigo-500' : 'text-slate-400'} />
                            {section.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="w-full">
                <div className="animate-in fade-in duration-300">
                    {activeSection === 'admission' && <AdmissionNumberSetup />}
                    {activeSection === 'status' && <StatusSetup />}
                    {activeSection === 'promotion' && <PromotionSetup />}
                    {activeSection === 'demographics' && <DemographicsSetup />}
                    {activeSection === 'grading-admissions' && <SystemConfig filterGroups={['grading', 'admissions']} />}
                </div>
            </div>
        </div>
    );
};

const StatusSetup = () => {
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStatuses = async () => {
        try {
            const res = await studentSettingsService.getStudentStatuses();
            setStatuses(res.results || res);
        } catch (e) { toast.error("Failed to load statuses"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchStatuses(); }, []);

    const toggleStatus = async (status) => {
        try {
            await studentSettingsService.updateStudentStatus(status.id, { is_enabled: !status.is_enabled });
            toast.success("Status updated");
            fetchStatuses();
        } catch (e) { toast.error("Update failed"); }
    }

    return (
        <div className={neoCardClass}>
            <h3 className="text-lg font-bold text-slate-800 drop-shadow-sm">Student Lifecycle Statuses</h3>
            <div className="grid gap-4">
                {statuses.map(s => (
                    <div key={s.id} className="p-5 bg-gray-50/50 rounded-2xl shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] border border-white flex items-center justify-between transition-all">
                        <div>
                            <p className="font-extrabold text-slate-700">{s.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5 font-medium">{s.is_active_state ? 'Allows class assignment' : 'Restricts assignment'}</p>
                        </div>
                        <button
                            onClick={() => toggleStatus(s)}
                            className={`px-4 py-2 text-xs font-bold rounded-xl shadow-[3px_3px_8px_#e5e7eb,-3px_-3px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] transition-all border border-white/50 ${s.is_enabled ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}>
                            {s.is_enabled ? 'Enabled' : 'Disabled'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PromotionSetup = () => {
    const [config, setConfig] = useState(null);

    useEffect(() => {
        studentSettingsService.getPromotionRules().then(res => setConfig(res.results || res));
    }, []);

    const handleUpdate = async (data) => {
        try {
            await studentSettingsService.updatePromotionRule(1, data);
            toast.success("Rules updated");
            setConfig({ ...config, ...data });
        } catch (e) { toast.error("Update failed"); }
    }

    if (!config) return null;

    return (
        <div className={neoCardClass}>
            <h3 className="text-lg font-bold text-slate-800 drop-shadow-sm">Promotion & Progression Rules</h3>
            <div className="space-y-5">
                <div className="p-5 bg-gray-50/50 rounded-2xl shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] border border-white flex items-center justify-between">
                    <div>
                        <p className="font-extrabold text-slate-700">Promotion Method</p>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">How students move to the next grade</p>
                    </div>
                    <select
                        value={config.promotion_method}
                        onChange={(e) => handleUpdate({ promotion_method: e.target.value })}
                        className="bg-[#f8f9fa] shadow-[3px_3px_8px_#e5e7eb,-3px_-3px_8px_#ffffff] border border-white rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none"
                    >
                        <option value="manual">Manual Approval</option>
                        <option value="automatic">Automatic Progression</option>
                    </select>
                </div>
                <div className="p-5 bg-gray-50/50 rounded-2xl shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] border border-white flex items-center justify-between">
                    <p className="font-extrabold text-slate-700">Allow Mid-year Promotion</p>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={config.allow_mid_year}
                            onChange={(e) => handleUpdate({ allow_mid_year: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)]"></div>
                    </label>
                </div>
            </div>
        </div>
    );
};

const DemographicsSetup = () => {
    const [fields, setFields] = useState([]);

    useEffect(() => {
        studentSettingsService.getDemographicConfig().then(res => setFields(res.results || res));
    }, []);

    const toggleField = async (field, key) => {
        try {
            await studentSettingsService.updateDemographicConfig(field.id, { [key]: !field[key] });
            toast.success("Config updated");
            setFields(fields.map(f => f.id === field.id ? { ...f, [key]: !f[key] } : f));
        } catch (e) { toast.error("Update failed"); }
    }

    return (
        <div className={neoCardClass}>
            <h3 className="text-lg font-bold text-slate-800 drop-shadow-sm">Mandatory Registration Fields</h3>
            <div className="overflow-hidden border border-white shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] rounded-2xl bg-gray-50/50">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-[#f8f9fa] shadow-[2px_2px_5px_#e5e7eb,-2px_-2px_5px_#ffffff]">
                        <tr>
                            <th className="p-4 font-extrabold text-slate-700">Field Name</th>
                            <th className="p-4 font-extrabold text-slate-700">Enabled</th>
                            <th className="p-4 font-extrabold text-slate-700">Required</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/50">
                        {fields.map(f => (
                            <tr key={f.id} className="hover:bg-white/40 transition-colors">
                                <td className="p-4 font-bold text-slate-700">{f.field_name}</td>
                                <td className="p-4">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={f.is_enabled} onChange={() => toggleField(f, 'is_enabled')} className="sr-only peer" />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)]"></div>
                                    </label>
                                </td>
                                <td className="p-4">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={f.is_required} onChange={() => toggleField(f, 'is_required')} className="sr-only peer" />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)]"></div>
                                    </label>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentRulesTab;

