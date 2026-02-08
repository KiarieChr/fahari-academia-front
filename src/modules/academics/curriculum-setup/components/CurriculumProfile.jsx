import React from 'react';
import { Book, Calendar, Info } from 'lucide-react';
import { educationSystems } from '../data/curriculumData';

const CurriculumProfile = ({ profile, setProfile, isReadOnly }) => {
    const handleChange = (field, value) => {
        if (isReadOnly) return;
        setProfile({ ...profile, [field]: value });
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm animate-in fade-in duration-500">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Book size={20} className="text-blue-600" />
                Curriculum Profile
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Curriculum Name</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-60"
                        placeholder="e.g. 2026 CBC Standard"
                        value={profile.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        disabled={isReadOnly}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Academic Year</label>
                    <div className="relative">
                        <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-60"
                            value={profile.academicYear}
                            onChange={(e) => handleChange('academicYear', e.target.value)}
                            disabled={isReadOnly}
                        >
                            <option>2026</option>
                            <option>2025</option>
                            <option>2024</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Education System</label>
                    <select
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-60"
                        value={profile.system}
                        onChange={(e) => handleChange('system', e.target.value)}
                        disabled={isReadOnly}
                    >
                        <option value="">Select System</option>
                        {educationSystems.map(sys => (
                            <option key={sys.id} value={sys.id}>{sys.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Description</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-60"
                        placeholder="Optional notes..."
                        value={profile.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        disabled={isReadOnly}
                    />
                </div>
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                <Info size={16} className="shrink-0 mt-0.5" />
                <p>Ensure the correct Academic Year and System are selected. Once activated, these core settings cannot be changed without creating a new version.</p>
            </div>
        </div>
    );
};

export default CurriculumProfile;
