import React, { useState } from 'react';
import { FileText, Settings, Download, Save } from 'lucide-react';

const CustomReportBuilder = () => {
    const [selectedFields, setSelectedFields] = useState([]);

    const toggleField = (field) => {
        if (selectedFields.includes(field)) {
            setSelectedFields(selectedFields.filter(f => f !== field));
        } else {
            setSelectedFields([...selectedFields, field]);
        }
    };

    const fields = [
        'Student Name', 'Admission No', 'Class', 'Stream', 'Gender', 'DOB',
        'Guardian Name', 'Phone Number', 'Email', 'Address',
        'Attendance %', 'Mean Score', 'Discipline Count', 'Fee Balance'
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                            <Settings size={20} className="text-blue-600" /> Report Configuration
                        </h3>
                        <p className="text-sm text-slate-500">Select fields to include in your custom report.</p>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Data Fields</label>
                        <div className="grid grid-cols-2 gap-2">
                            {fields.map(field => (
                                <label key={field} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer hover:text-blue-600 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={selectedFields.includes(field)}
                                        onChange={() => toggleField(field)}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    {field}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Format</label>
                        <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                            <option>CSV (Excel)</option>
                            <option>PDF Document</option>
                            <option>Print View</option>
                        </select>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        <button className="w-full py-2 bg-blue-600 text-black rounded-lg font-medium shadow-lg shadow-blue-200 dark:shadow-blue-900/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                            <FileText size={18} /> Generate Report
                        </button>
                        <button className="w-full py-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2">
                            <Save size={18} /> Save Template
                        </button>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 dark:text-white">Preview</h3>
                        <span className="text-xs text-slate-400 italic">Sample data shown</span>
                    </div>
                    <div className="flex-1 p-6 flex items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 min-h-[400px]">
                        {selectedFields.length > 0 ? (
                            <div className="w-full h-full overflow-auto">
                                <table className="w-full text-sm text-left opacity-60">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                                        <tr>
                                            {selectedFields.map(f => <th key={f} className="px-4 py-2">{f}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <tr key={i}>
                                                {selectedFields.map(f => <td key={f} className="px-4 py-2">--</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center">
                                <FileText size={48} className="mx-auto mb-2 opacity-20" />
                                <p>Select fields to generate a preview</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomReportBuilder;
