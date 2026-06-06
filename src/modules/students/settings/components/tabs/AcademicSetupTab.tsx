import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, CheckCircle, XCircle, Search, CalendarDays } from 'lucide-react';
import { toast } from 'react-toastify';
import studentSettingsService from '../../../../../services/studentSettingsService';
import DateInput from '../../../../../components/common/DateInput';
import Modal from '../../../../../components/common/Modal';
import { inputClass, labelClass } from '../../../../../components/ui/FormField';
import NewAcademicYearModal from '../modals/NewAcademicYearModal';

const AcademicSetupTab = () => {
    const [years, setYears] = useState([]);
    const [terms, setTerms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYearId, setSelectedYearId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [isYearModalOpen, setIsYearModalOpen] = useState(false);
    const [isTermModalOpen, setIsTermModalOpen] = useState(false);
    const [editingTerm, setEditingTerm] = useState(null);
    const [termFormData, setTermFormData] = useState({
        name: '',
        academic_year: '',
        order: 1,
        start_date: '',
        end_date: '',
        is_current: false,
        status: 'active'
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [yearsRes, termsRes] = await Promise.all([
                studentSettingsService.getAcademicYears(),
                studentSettingsService.getTerms()
            ]);
            const fetchedYears = yearsRes.results || yearsRes;
            setYears(fetchedYears);
            setTerms(termsRes.results || termsRes);
            
            if (fetchedYears.length > 0 && !selectedYearId) {
                // Select current year or first year
                const current = fetchedYears.find(y => y.is_current);
                if (current) setSelectedYearId(current.id.toString());
                else setSelectedYearId(fetchedYears[0].id.toString());
            }
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Year Actions
    const handleSetActiveYear = async (id) => {
        if (confirm('Changing the active academic year will affect all current operations. Continue?')) {
            try {
                await studentSettingsService.updateAcademicYear(id, { is_current: true });
                toast.success('Academic year updated');
                fetchData();
            } catch (error) {
                toast.error('Failed to update academic year');
            }
        }
    };

    const handleAddYear = async (newYear) => {
        try {
            await studentSettingsService.createAcademicYear(newYear);
            toast.success('Academic year created');
            fetchData();
            setIsYearModalOpen(false);
        } catch (error) {
            toast.error('Failed to create academic year');
        }
    };

    // Term Actions
    const handleSaveTerm = async (e) => {
        e.preventDefault();
        try {
            if (editingTerm) {
                await studentSettingsService.updateTerm(editingTerm.id, termFormData);
                toast.success('Term updated successfully');
            } else {
                await studentSettingsService.createTerm(termFormData);
                toast.success('Term added successfully');
            }
            setIsTermModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to save term');
        }
    };

    const handleEditTerm = (term) => {
        setEditingTerm(term);
        setTermFormData({
            ...term,
            academic_year: term.academic_year
        });
        setIsTermModalOpen(true);
    };

    const handleDeleteTerm = async (id) => {
        if (confirm('Are you sure you want to delete this term?')) {
            try {
                await studentSettingsService.deleteTerm(id);
                toast.success('Term deleted');
                fetchData();
            } catch (error) {
                toast.error('Delete failed');
            }
        }
    };

    // Filtering
    const filteredYears = years.filter(y => 
        y.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeYear = years.find(y => y.id.toString() === selectedYearId);
    const activeYearTerms = terms.filter(t => t.academic_year.toString() === selectedYearId);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading Academic Setup...</div>;

    return (
        <div className="flex flex-col md:flex-row gap-6 items-start w-full">
            <style>{`
                .setup-sidebar-custom { width: 100%; flex-shrink: 0; }
                .setup-main-custom { flex: 1 1 0%; min-width: 0; width: 100%; }
                @media (min-width: 768px) {
                    .setup-sidebar-custom { width: 300px; }
                }
                @media (min-width: 1024px) {
                    .setup-sidebar-custom { width: 340px; }
                }
            `}</style>
            
            {/* LEFT SIDEBAR: Academic Years */}
            <div className="setup-sidebar-custom bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col max-h-[800px]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-800">Academic Years</h3>
                    <button
                        onClick={() => setIsYearModalOpen(true)}
                        className="btn btn-sm btn-primary p-1.5 rounded-lg shadow-sm"
                        title="New Academic Year"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                <div className="relative mb-4 shrink-0">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search years..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className={`${inputClass} pl-9 text-xs bg-white`}
                    />
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar space-y-2 pr-1">
                    {filteredYears.length === 0 ? (
                        <div className="text-center text-xs text-slate-400 py-8">No academic years found</div>
                    ) : (
                        filteredYears.map(year => {
                            const isSelected = selectedYearId === year.id.toString();
                            return (
                                <div
                                    key={year.id}
                                    onClick={() => setSelectedYearId(year.id.toString())}
                                    className={`flex flex-col gap-2 p-3 rounded-xl cursor-pointer transition-all border ${isSelected
                                        ? 'bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-500/10'
                                        : 'bg-transparent border-transparent hover:bg-slate-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${year.is_current ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                                            <CalendarDays size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                                                    {year.name}
                                                </p>
                                                {year.is_current && (
                                                    <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[9px] uppercase font-bold tracking-wider rounded shadow-sm shrink-0">
                                                        Current
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">
                                                {year.start_date} - {year.end_date}
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <div className="shrink-0 text-indigo-500">
                                                <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                                            </div>
                                        )}
                                    </div>
                                    {!year.is_current && isSelected && (
                                        <div className="flex justify-end pt-2 border-t border-slate-100">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleSetActiveYear(year.id); }}
                                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded"
                                            >
                                                Set as Current
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* RIGHT PANEL: Terms View */}
            <div className="setup-main-custom flex flex-col bg-white border border-slate-100 shadow-sm rounded-2xl min-h-[400px]">
                {!activeYear ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-20 px-6">
                        <CalendarDays size={48} className="mb-4 text-slate-200" />
                        <h4 className="text-sm font-bold text-slate-600">Select an academic year</h4>
                        <p className="text-xs mt-2 text-center max-w-sm">Select an academic year from the list on the left to view and manage its terms.</p>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30 rounded-t-2xl">
                            <div>
                                <h3 className="text-lg font-black text-slate-800">{activeYear.name} Terms</h3>
                                <p className="text-xs text-slate-400 font-medium mt-1">Manage academic terms and semesters for this year</p>
                            </div>

                            <button
                                onClick={() => {
                                    setEditingTerm(null);
                                    setTermFormData({ name: '', academic_year: activeYear.id, order: activeYearTerms.length + 1, start_date: '', end_date: '', is_current: false, status: 'active' });
                                    setIsTermModalOpen(true);
                                }}
                                className="group flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all active:scale-95 text-xs font-bold border border-indigo-200"
                            >
                                <Plus size={14} className="group-hover:scale-110 transition-transform" />
                                <span>Add Term</span>
                            </button>
                        </div>

                        <div className="p-6 flex-1 bg-white rounded-b-2xl">
                            {activeYearTerms.length === 0 ? (
                                <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                                    <h4 className="text-sm font-bold text-slate-600 mb-1">No terms found</h4>
                                    <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">There are no terms configured for the academic year {activeYear.name}.</p>
                                    <button
                                        onClick={() => {
                                            setEditingTerm(null);
                                            setTermFormData({ name: '', academic_year: activeYear.id, order: 1, start_date: '', end_date: '', is_current: false, status: 'active' });
                                            setIsTermModalOpen(true);
                                        }}
                                        className="btn btn-sm btn-primary"
                                    >
                                        Create First Term
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {activeYearTerms.map((term) => (
                                        <div key={term.id} className={`p-4 rounded-xl border relative transition-all group ${term.is_current ? 'bg-indigo-50/50 border-indigo-200 ring-1 ring-indigo-500/20 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-sm font-bold text-slate-800">{term.name}</h4>
                                                    {term.is_current && (
                                                        <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] uppercase font-bold tracking-wider rounded">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEditTerm(term)} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button onClick={() => handleDeleteTerm(term.id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 text-xs">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Duration</span>
                                                    <span className="text-slate-600 font-medium">{term.start_date} <span className="text-slate-300">to</span> {term.end_date}</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-slate-100/60 flex items-center justify-between">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${term.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {term.status === 'active' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                                    {term.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <NewAcademicYearModal
                isOpen={isYearModalOpen}
                onClose={() => setIsYearModalOpen(false)}
                onSave={handleAddYear}
            />

            {isTermModalOpen && (
                <Modal
                    isOpen={isTermModalOpen}
                    onClose={() => setIsTermModalOpen(false)}
                    title={editingTerm ? 'Edit Term' : 'Add New Term'}
                    subtitle={`Configure term for ${activeYear?.name}`}
                    icon={<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600"><Calendar size={20} /></div>}
                    footer={
                        <>
                            <Modal.CancelButton onClick={() => setIsTermModalOpen(false)} />
                            <Modal.SubmitButton onClick={handleSaveTerm}>
                                {editingTerm ? 'Update Term' : 'Create Term'}
                            </Modal.SubmitButton>
                        </>
                    }
                >
                    <form onSubmit={handleSaveTerm} className="space-y-5">
                        <div>
                            <label className={labelClass}>Term Name</label>
                            <input
                                type="text"
                                required
                                className={inputClass}
                                placeholder="e.g. Term 1"
                                value={termFormData.name}
                                onChange={e => setTermFormData({ ...termFormData, name: e.target.value })}
                            />
                        </div>
                        
                        {/* Hidden Academic Year input since it's locked to the active year */}
                        <input type="hidden" value={termFormData.academic_year} />
                        
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass}>Start Date</label>
                                <DateInput
                                    required
                                    value={termFormData.start_date}
                                    onChange={dateStr => setTermFormData(prev => ({ ...prev, start_date: dateStr }))}
                                    placeholder="Start Date"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>End Date</label>
                                <DateInput
                                    required
                                    value={termFormData.end_date}
                                    onChange={dateStr => setTermFormData(prev => ({ ...prev, end_date: dateStr }))}
                                    placeholder="End Date"
                                    minDate={termFormData.start_date}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={termFormData.is_current}
                                    onChange={e => setTermFormData({ ...termFormData, is_current: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                <span className="ml-3 text-sm font-medium text-slate-700">Set as Current Term</span>
                            </label>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default AcademicSetupTab;
