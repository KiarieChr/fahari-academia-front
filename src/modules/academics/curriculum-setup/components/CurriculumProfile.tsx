import React from 'react';
import { Book, Calendar, Info } from 'lucide-react';
import { educationSystems } from '../data/curriculumData';

const CurriculumProfile = ({ profile, setProfile, isReadOnly }) => {
    const handleChange = (field, value) => {
        if (isReadOnly) return;
        setProfile({ ...profile, [field]: value });
    };

    return (
        <div className="neo-card p-3 animate-in fade-in duration-500 mb-3">
            <h3 className="text-lg font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Book size={20} className="text-indigo-500" />
                Curriculum Profile
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-1">
                <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-2">Curriculum Name</label>
                    <input
                        type="text"
                        className="neo-input w-full transition-all disabled:opacity-60"
                        placeholder="e.g. 2026 CBC Standard"
                        value={profile.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        disabled={isReadOnly}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-2">Academic Year</label>
                    <div className="relative">
                        <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            className="neo-input w-full  pr-4 transition-all disabled:opacity-60"
                            style={{paddingLeft:'2.0rem'}}
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
                    <label className="block text-sm font-semibold text-gray-500 mb-2">Education System</label>
                    <select
                        className="neo-input w-full transition-all disabled:opacity-60"
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
                    <label className="block text-sm font-semibold text-gray-500 mb-2">Description</label>
                    <input
                        type="text"
                        className="neo-input w-full transition-all disabled:opacity-60"
                        placeholder="Optional notes..."
                        value={profile.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        disabled={isReadOnly}
                    />
                </div>
            </div>

            <div className="mt-3 flex items-start gap-2 text-xs neo-text-accent neo-pressed p-2 font-medium">
                <Info size={16} className="shrink-0 mt-0.5" />
                <p>Ensure the correct Academic Year and System are selected. Once activated, these core settings cannot be changed without creating a new version.</p>
            </div>
        </div>
    );
};

export default CurriculumProfile;
