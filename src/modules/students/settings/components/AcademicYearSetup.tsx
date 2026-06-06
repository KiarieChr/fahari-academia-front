import React, { useState, useEffect } from 'react';
import { Plus, Archive, CalendarDays, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import NewAcademicYearModal from './modals/NewAcademicYearModal';
import studentSettingsService from '../../../../services/studentSettingsService';

const AcademicYearSetup = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchYears = async () => {
        try {
            setLoading(true);
            const response = await studentSettingsService.getAcademicYears();
            setYears(response.results || response);
        } catch (error) {
            toast.error('Failed to fetch academic years');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchYears();
    }, []);

    const handleSetActive = async (id) => {
        if (confirm('Changing the active academic year will affect all current operations. Continue?')) {
            try {
                await studentSettingsService.updateAcademicYear(id, { is_current: true });
                toast.success('Academic year updated');
                fetchYears();
            } catch (error) {
                toast.error('Failed to update academic year');
            }
        }
    };

    const handleAddYear = async (newYear) => {
        try {
            await studentSettingsService.createAcademicYear(newYear);
            toast.success('Academic year created');
            fetchYears();
            setIsModalOpen(false);
        } catch (error) {
            toast.error('Failed to create academic year');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Academic Years...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-4  py-2 md:px-0">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Academic Years</h3>
                    <p className="text-sm text-gray-500">Manage school years and set current academic context</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2 rounded-pill shadow-sm"
                >
                    <Plus size={18} /> New Year
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-3">
                {years.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed">
                        No academic years configured.
                    </div>
                ) : (
                    years.map((year) => (
                        <div key={year.id} className={`p-6 bg-white border rounded-2xl transition-all hover:shadow-md ${year.is_current ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-gray-200'}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${year.is_current ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                                    <CalendarDays size={24} />
                                </div>
                                {year.is_current && (
                                    <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] uppercase font-bold tracking-wider rounded-lg shadow-sm">
                                        Current
                                    </span>
                                )}
                            </div>

                            <h4 className="text-xl font-bold text-gray-900 mb-1">{year.name}</h4>
                            <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                                <span>{year.start_date}</span>
                                <span className="text-gray-300">|</span>
                                <span>{year.end_date}</span>
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <span className={`text-xs font-semibold uppercase tracking-wider ${year.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                                    {year.status}
                                </span>
                                {!year.is_current && (
                                    <button
                                        onClick={() => handleSetActive(year.id)}
                                        className="btn btn-sm btn-outline-primary fw-bold"
                                    >
                                        Set Current
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <NewAcademicYearModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddYear}
            />
        </div>
    );
};

export default AcademicYearSetup;

