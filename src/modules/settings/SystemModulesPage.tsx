import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import { Layers, Save, CheckCircle2, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';
import institutionService from '../../services/institutionService';

const AVAILABLE_MODULES = [
    { id: 'academics', title: 'Academics & Grading', desc: 'Manage terms, exams, and grading' },
    { id: 'student_management', title: 'Student Management', desc: 'Admissions, records, and demographics' },
    { id: 'finance', title: 'Finance & Accounting', desc: 'GL, Income statement, Budgets' },
    { id: 'fees', title: 'Fees & Collections', desc: 'Student invoicing and receipting' },
    { id: 'hr', title: 'Human Resources', desc: 'Staff directory, payroll, and leave' },
    { id: 'procurement', title: 'Procurement', desc: 'Purchasing and supplier management' },
    { id: 'inventory', title: 'Inventory', desc: 'Stock management and requisitions' },
    { id: 'timetable', title: 'Timetabling', desc: 'Class scheduling and lesson tracking' },
    { id: 'communication', title: 'Communication (CRM)', desc: 'SMS, Emails, and messaging' },
];

const SystemModulesPage = () => {
    const [enabledModules, setEnabledModules] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await institutionService.getProfile();
            const data = res.data || res;
            setEnabledModules(data.enabled_modules || []);
        } catch (error) {
            toast.error("Failed to fetch institution profile");
        } finally {
            setLoading(false);
        }
    };

    const toggleModule = (moduleId: string) => {
        setEnabledModules(prev => 
            prev.includes(moduleId)
                ? prev.filter(m => m !== moduleId)
                : [...prev, moduleId]
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await institutionService.updateProfile({ enabled_modules: enabledModules });
            toast.success("System modules updated successfully. Refresh the page to apply changes.", { autoClose: 5000 });
        } catch (error) {
            toast.error("Failed to update system modules");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-full min-h-[500px]">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
                <div className="bg-[#f8f9fa] rounded-[30px] border border-white shadow-[6px_6px_16px_#e5e7eb,-6px_-6px_16px_#ffffff] p-8 space-y-8">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white shadow-[0_2px_5px_#e5e7eb] pb-6 mb-6">
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3 drop-shadow-sm">
                                <Layers className="text-indigo-600" size={28} />
                                System Modules
                            </h2>
                            <p className="text-sm font-bold text-slate-500 mt-2">
                                Activate or deactivate modules for your school. 
                                Disabling a module hides it from the sidebar for all users.
                            </p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#f8f9fa] text-indigo-700 rounded-xl text-sm font-extrabold tracking-wider cursor-pointer shadow-[4px_4px_10px_#e5e7eb,-4px_-4px_10px_#ffffff] hover:shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] transition-all border border-white disabled:opacity-50"
                        >
                            <Save size={18} /> {saving ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>

                    <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 flex gap-4 text-amber-800 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.02)] mb-8">
                        <ShieldAlert className="shrink-0 mt-0.5 text-amber-600" size={24} />
                        <div className="text-sm font-bold">
                            <p className="mb-1 text-amber-900 text-base">Superadmin Access Only</p>
                            <p className="opacity-80">
                                This page allows you to completely enable or disable core functionality across the ERP. 
                                Ensure you understand the impact before deactivating active modules.
                            </p>
                        </div>
                    </div>

                    {/* Modules Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {AVAILABLE_MODULES.map((module) => {
                            const isEnabled = enabledModules.includes(module.id);
                            
                            return (
                                <div 
                                    key={module.id}
                                    onClick={() => toggleModule(module.id)}
                                    className={`relative p-6 rounded-2xl cursor-pointer transition-all border border-white flex flex-col gap-3 ${
                                        isEnabled 
                                        ? 'bg-[#f8f9fa] shadow-[inset_4px_4px_10px_#e5e7eb,inset_-4px_-4px_10px_#ffffff] ring-1 ring-indigo-500/20' 
                                        : 'bg-[#f8f9fa] shadow-[6px_6px_16px_#e5e7eb,-6px_-6px_16px_#ffffff] hover:shadow-[3px_3px_8px_#e5e7eb,-3px_-3px_8px_#ffffff]'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <h3 className={`text-base font-extrabold ${isEnabled ? 'text-indigo-700' : 'text-slate-700'}`}>
                                            {module.title}
                                        </h3>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                            isEnabled ? 'text-indigo-600 bg-indigo-100' : 'text-slate-300 bg-slate-100 shadow-[inset_1px_1px_3px_#d1d5db]'
                                        }`}>
                                            {isEnabled && <CheckCircle2 size={16} strokeWidth={3} />}
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 flex-1">
                                        {module.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SystemModulesPage;
