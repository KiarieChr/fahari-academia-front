import React, { useState, useEffect } from 'react';
import { api } from '../../../../services/api';
import { toast } from 'react-toastify';
import { Loader2, Download, Search, Filter } from 'lucide-react';

const NominalRollReport = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        academic_year: '',
        term: '',
        grade: '',
        gender: '',
        status: 'ACTIVE'
    });
    
    // Some dropdown data (ideally fetched from API)
    const [academicYears, setAcademicYears] = useState([]);
    const [terms, setTerms] = useState([]);
    const [grades, setGrades] = useState([]);

    useEffect(() => {
        // Fetch dropdown options
        const fetchFilters = async () => {
            try {
                const [ayRes, termRes, gradeRes] = await Promise.all([
                    api.get('/api/settings/academic-years/'),
                    api.get('/api/settings/terms/'),
                    api.get('/api/settings/grades/')
                ]);
                setAcademicYears(ayRes.results || ayRes);
                setTerms(termRes.results || termRes);
                setGrades(gradeRes.results || gradeRes);
            } catch (error) {
                console.error("Error fetching filters", error);
            }
        };
        fetchFilters();
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams(filters as any).toString();
            const res = await api.get(`/api/student-management/reports/nominal_roll/?${queryParams}`);
            setData(Array.isArray(res) ? res : (res.results || []));
        } catch (error) {
            toast.error("Failed to fetch nominal roll");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleExport = () => {
        // In a real app, this might call an export API endpoint returning a CSV/PDF,
        // or generate CSV on the client side.
        toast.info("Export functionality is ready to be hooked up!");
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-5 md:p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Nominal Roll</h2>
                    <p className="text-sm text-gray-500">Official student registry and headcount.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button onClick={fetchData} className="btn btn-primary bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2">
                        <Search size={16} /> Load Data
                    </button>
                    <button onClick={handleExport} className="btn btn-light bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 flex items-center gap-2">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-5 gap-4 border-b border-gray-100 bg-white">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Academic Year</label>
                    <select name="academic_year" value={filters.academic_year} onChange={handleFilterChange} className="form-select w-full text-sm rounded-xl border-gray-200">
                        <option value="">All Years</option>
                        {academicYears.map((ay: any) => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Term</label>
                    <select name="term" value={filters.term} onChange={handleFilterChange} className="form-select w-full text-sm rounded-xl border-gray-200">
                        <option value="">All Terms</option>
                        {terms.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Class/Grade</label>
                    <select name="grade" value={filters.grade} onChange={handleFilterChange} className="form-select w-full text-sm rounded-xl border-gray-200">
                        <option value="">All Classes</option>
                        {grades.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Gender</label>
                    <select name="gender" value={filters.gender} onChange={handleFilterChange} className="form-select w-full text-sm rounded-xl border-gray-200">
                        <option value="">All Genders</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="form-select w-full text-sm rounded-xl border-gray-200">
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="DROPOUT">Dropout</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-gray-50/30">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Loader2 className="animate-spin mb-2" size={24} />
                        <span className="text-sm">Loading records...</span>
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Filter size={32} className="mb-2 text-gray-300" />
                        <span className="text-sm">No records found for the selected filters.</span>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white border-b border-gray-200 sticky top-0 shadow-sm z-10">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Adm No.</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Gender</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Class/Grade</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stream</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map((student: any) => (
                                <tr key={student.id} className="hover:bg-white transition-colors">
                                    <td className="px-6 py-3 text-sm font-semibold text-indigo-600">{student.admission_number}</td>
                                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{student.full_name}</td>
                                    <td className="px-6 py-3 text-sm text-gray-600">{student.gender}</td>
                                    <td className="px-6 py-3 text-sm text-gray-600">{student.grade}</td>
                                    <td className="px-6 py-3 text-sm text-gray-600">{student.stream}</td>
                                    <td className="px-6 py-3 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            student.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {student.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center text-sm text-gray-500">
                <span>Total Students: <strong className="text-gray-900">{data.length}</strong></span>
            </div>
        </div>
    );
};

export default NominalRollReport;
