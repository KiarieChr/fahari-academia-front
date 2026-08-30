import React from 'react';
import { BookOpen, Library, ArrowRight, LayoutTemplate } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LearningAreasSetup = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Library size={20} className="text-indigo-600" />
                        Learning Areas & Subjects
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Configure subjects, learning areas, and their mappings to specific curricula and grade levels.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Subjects Management */}
                <div className="rounded-[24px] p-6 transition-all duration-300 bg-[#e0e5ec] shadow-[6px_6px_12px_#c3c8ce,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c3c8ce,-8px_-8px_16px_#ffffff] flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center text-indigo-600">
                        <BookOpen size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">Subject Repository</h3>
                        <p className="text-xs text-gray-500 mt-2">Manage the master list of all subjects offered across all curricula tracks.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/dashboard/academics/subjects')}
                        className="mt-2 px-6 py-2.5 rounded-xl text-xs font-bold text-indigo-600 uppercase tracking-wider bg-[#e0e5ec] shadow-[4px_4px_8px_#c3c8ce,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#c3c8ce,inset_-2px_-2px_4px_#ffffff] transition-all flex items-center gap-2"
                    >
                        Go to Subjects <ArrowRight size={14} />
                    </button>
                </div>

                {/* Learning Areas */}
                <div className="rounded-[24px] p-6 transition-all duration-300 bg-[#e0e5ec] shadow-[6px_6px_12px_#c3c8ce,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c3c8ce,-8px_-8px_16px_#ffffff] flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center text-emerald-600">
                        <LayoutTemplate size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">Learning Areas</h3>
                        <p className="text-xs text-gray-500 mt-2">Group subjects into logical learning areas (e.g., Sciences, Humanities, Languages).</p>
                    </div>
                    <button className="mt-2 px-6 py-2.5 rounded-xl text-xs font-bold text-emerald-600 uppercase tracking-wider bg-[#e0e5ec] shadow-[4px_4px_8px_#c3c8ce,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#c3c8ce,inset_-2px_-2px_4px_#ffffff] transition-all">
                        Configure
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LearningAreasSetup;
