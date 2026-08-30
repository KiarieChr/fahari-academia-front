import React, { useState } from 'react';
import { Eye, Download, FileText, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import ReportCardPreview from './ReportCardPreview';
import { examService } from '../../../../services/examService';

const StudentReportsTable = ({ curriculum, results, loading }) => {
    const [selectedTermResultData, setSelectedTermResultData] = useState(null);
    const [loadingReport, setLoadingReport] = useState(false);

    const getStatusColor = (isPublished) => {
        if (isPublished) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    };

    const handleViewReport = async (termResultId) => {
        try {
            setLoadingReport(true);
            const data = await examService.getTermResult(termResultId);
            setSelectedTermResultData(data);
        } catch (err) {
            toast.error('Failed to load report details');
        } finally {
            setLoadingReport(false);
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Student Academic Summary</h3>
                        <p className="text-sm text-slate-500">
                            {results.length} students {loading && <span className="animate-pulse ml-2 text-blue-500">Loading...</span>}
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    {loading && results.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                            <Loader2 size={32} className="animate-spin mb-4 text-blue-500" />
                            <p>Loading student results...</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                            <FileText size={48} className="mb-4 opacity-50" />
                            <p className="font-bold text-lg">No Results Found</p>
                            <p className="text-sm">Select a Class Session to load and compute reports.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Student Info</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Rank</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Total Score</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                                        {curriculum === 'CBC' ? 'Performance' : 'Avg. Score'}
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {results.map((r) => (
                                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${curriculum === 'CBC' ? 'bg-teal-500' : 'bg-indigo-500'}`}>
                                                    {r.student_name ? r.student_name.charAt(0) : '?'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white">{r.student_name}</div>
                                                    <div className="text-xs text-slate-500">{r.admission_number}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-600 dark:text-slate-400">
                                                {r.class_rank ? `${r.class_rank} / ${r.total_in_class}` : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                                            {r.total_marks}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 dark:text-white">
                                                {curriculum === 'CBC' ? r.overall_grade : `${r.average_mark}%`}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {curriculum === 'CBC' ? 'Performance Level' : `Grade: ${r.overall_grade}`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(r.is_published)}`}>
                                                {r.is_published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewReport(r.id)}
                                                    disabled={loadingReport}
                                                    className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-${curriculum === 'CBC' ? 'teal' : 'indigo'}-600 transition-colors disabled:opacity-50`}
                                                    title="View Report"
                                                >
                                                    {loadingReport ? <Loader2 size={18} className="animate-spin" /> : <Eye size={18} />}
                                                </button>
                                                <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 transition-colors" title="Download PDF">
                                                    <Download size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {selectedTermResultData && (
                <ReportCardPreview
                    isOpen={!!selectedTermResultData}
                    onClose={() => setSelectedTermResultData(null)}
                    termResultData={selectedTermResultData}
                    curriculum={curriculum}
                />
            )}
        </>
    );
};

export default StudentReportsTable;
