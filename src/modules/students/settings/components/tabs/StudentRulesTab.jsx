import React, { useState, useEffect } from 'react';
import { Settings, UserCheck, ArrowUpCircle, ClipboardList } from 'lucide-react';
import AdmissionNumberSetup from '../AdmissionNumberSetup';
import studentSettingsService from '../../../../../services/studentSettingsService';
import { toast } from 'react-toastify';

const StudentRulesTab = () => {
    const [activeSection, setActiveSection] = useState('admission');

    const sections = [
        { id: 'admission', label: 'Admission Settings', icon: Settings },
        { id: 'status', label: 'Student Statuses', icon: UserCheck },
        { id: 'promotion', label: 'Promotion Rules', icon: ArrowUpCircle },
        { id: 'demographics', label: 'Demographics', icon: ClipboardList },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Local Sidebar */}
            <div className="w-full lg:w-64 flex-shrink-0">
                <div className="bg-gray-50 rounded-2xl p-2 space-y-1 border border-gray-200">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeSection === section.id
                                ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                }`}
                        >
                            <section.icon size={18} />
                            {section.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
                {activeSection === 'admission' && <AdmissionNumberSetup />}
                {activeSection === 'status' && <StatusSetup />}
                {activeSection === 'promotion' && <PromotionSetup />}
                {activeSection === 'demographics' && <DemographicsSetup />}
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
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">Student Lifecycle Statuses</h3>
            <div className="grid gap-4">
                {statuses.map(s => (
                    <div key={s.id} className="p-4 bg-white border rounded-xl flex items-center justify-between">
                        <div>
                            <p className="font-bold">{s.name}</p>
                            <p className="text-xs text-gray-500">{s.is_active_state ? 'Allows class assignment' : 'Restricts assignment'}</p>
                        </div>
                        <button
                            onClick={() => toggleStatus(s)}
                            className={`btn btn-sm fw-bold rounded-pill ${s.is_enabled ? 'btn-success text-white' : 'btn-danger text-white'}`}>
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
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">Promotion & Progression Rules</h3>
            <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl border flex items-center justify-between">
                    <div>
                        <p className="font-medium">Promotion Method</p>
                        <p className="text-sm text-gray-500">How students move to the next grade</p>
                    </div>
                    <select
                        value={config.promotion_method}
                        onChange={(e) => handleUpdate({ promotion_method: e.target.value })}
                        className="bg-white border rounded-lg px-3 py-1.5 text-sm"
                    >
                        <option value="manual">Manual Approval</option>
                        <option value="automatic">Automatic Progression</option>
                    </select>
                </div>
                <div className="p-4 border rounded-xl flex items-center justify-between">
                    <p className="font-medium">Allow Mid-year Promotion</p>
                    <input
                        type="checkbox"
                        checked={config.allow_mid_year}
                        onChange={(e) => handleUpdate({ allow_mid_year: e.target.checked })}
                        className="w-5 h-5 accent-indigo-600"
                    />
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
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">Mandatory Registration Fields</h3>
            <div className="overflow-hidden border rounded-xl">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4">Field Name</th>
                            <th className="p-4">Enabled</th>
                            <th className="p-4">Required</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {fields.map(f => (
                            <tr key={f.id}>
                                <td className="p-4 font-medium">{f.field_name}</td>
                                <td className="p-4"><input type="checkbox" checked={f.is_enabled} onChange={() => toggleField(f, 'is_enabled')} /></td>
                                <td className="p-4"><input type="checkbox" checked={f.is_required} onChange={() => toggleField(f, 'is_required')} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentRulesTab;

