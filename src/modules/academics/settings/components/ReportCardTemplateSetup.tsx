import React from 'react';
import { LayoutTemplate, Settings2, FileText, CheckCircle } from 'lucide-react';

const ReportCardTemplateSetup = () => {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <LayoutTemplate size={20} className="text-indigo-600" />
                        Report Card Templates
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Configure layout, grading scales, and publishing rules for end-of-term reports.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Template 1 */}
                <div className="rounded-[24px] p-6 transition-all duration-300 bg-[#e0e5ec] shadow-[6px_6px_12px_#c3c8ce,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c3c8ce,-8px_-8px_16px_#ffffff]">
                    <div className="aspect-[3/4] bg-white/50 rounded-xl mb-4 border border-white/20 flex flex-col items-center justify-center text-gray-400">
                        <FileText size={48} className="mb-2 opacity-50" />
                        <span className="text-xs font-bold uppercase tracking-widest">Standard CBC</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-800">Primary (CBC)</h3>
                            <p className="text-xs text-gray-500">Meets Expectations Format</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#e0e5ec] shadow-[inset_2px_2px_4px_#c3c8ce,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-emerald-600">
                            <CheckCircle size={16} />
                        </div>
                    </div>
                </div>

                {/* Template 2 */}
                <div className="rounded-[24px] p-6 transition-all duration-300 bg-[#e0e5ec] shadow-[6px_6px_12px_#c3c8ce,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c3c8ce,-8px_-8px_16px_#ffffff]">
                    <div className="aspect-[3/4] bg-white/50 rounded-xl mb-4 border border-white/20 flex flex-col items-center justify-center text-gray-400">
                        <FileText size={48} className="mb-2 opacity-50" />
                        <span className="text-xs font-bold uppercase tracking-widest">High School 8-4-4</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-800">Secondary (8-4-4)</h3>
                            <p className="text-xs text-gray-500">A-E Grading Format</p>
                        </div>
                        <button className="text-xs font-bold text-indigo-600 uppercase tracking-wider hover:text-indigo-800 px-3 py-1 rounded-lg bg-[#e0e5ec] shadow-[2px_2px_4px_#c3c8ce,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#c3c8ce,inset_-2px_-2px_4px_#ffffff]">
                            Select
                        </button>
                    </div>
                </div>

                {/* Settings Block */}
                <div className="rounded-[24px] p-6 bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff] flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#e0e5ec] shadow-[4px_4px_8px_#c3c8ce,-4px_-4px_8px_#ffffff] flex items-center justify-center text-indigo-600">
                        <Settings2 size={24} />
                    </div>
                    <h3 className="font-bold text-gray-800">Global Settings</h3>
                    <p className="text-xs text-gray-500">Configure principal signatures, comment banks, and automated remarks.</p>
                    <button className="mt-2 px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 uppercase tracking-wider bg-[#e0e5ec] shadow-[4px_4px_8px_#c3c8ce,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#c3c8ce,inset_-2px_-2px_4px_#ffffff] transition-all">
                        Configure
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportCardTemplateSetup;
