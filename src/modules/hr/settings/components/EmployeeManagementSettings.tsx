import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Building, Briefcase, MapPin, Banknote } from 'lucide-react';
import { api } from '../../../../services/api';
import { toast } from 'react-toastify';

const EmployeeManagementSettings = () => {
    const [activeTab, setActiveTab] = useState('departments');
    const [departments, setDepartments] = useState([]);
    const [jobTitles, setJobTitles] = useState([]);
    const [campuses, setCampuses] = useState([]);
    const [jobGrades, setJobGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        code: '',
        description: '',
        campus: '',
        department_type: 'academic',
        cost_center_code: '',
        job_grade: '',
        category: 'teaching',
        is_academic_rank: false,
        location: '',  // Add location for campus
        min_salary: '',
        max_salary: '',
        currency: 'KES',
        grade_level: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'departments') {
                const [deptRes, campusRes] = await Promise.all([
                    api.get('/workforce/api/departments/'),
                    api.get('/workforce/api/campuses/')
                ]);
                setDepartments(deptRes.results || deptRes || []);
                setCampuses(campusRes.results || campusRes || []);
            } else if (activeTab === 'campuses') {
                const res = await api.get('/workforce/api/campuses/');
                setCampuses(res.results || res || []);
            } else if (activeTab === 'job_grades') {
                const res = await api.get('/workforce/api/job-grades/');
                setJobGrades(res.results || res || []);
            } else {
                const [jobRes, gradeRes] = await Promise.all([
                    api.get('/workforce/api/job-titles/'),
                    api.get('/workforce/api/job-grades/')
                ]);
                setJobTitles(jobRes.results || jobRes || []);
                setJobGrades(gradeRes.results || gradeRes || []);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            let endpoint = '';
            if (activeTab === 'departments') endpoint = `/workforce/api/departments/${id}/`;
            else if (activeTab === 'campuses') endpoint = `/workforce/api/campuses/${id}/`;
            else if (activeTab === 'job_grades') endpoint = `/workforce/api/job-grades/${id}/`;
            else endpoint = `/workforce/api/job-titles/${id}/`;

            await api.delete(endpoint);
            toast.success('Deleted successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (activeTab === 'departments') {
                await api.post('/workforce/api/departments/', {
                    name: newItem.name,
                    code: newItem.code,
                    description: newItem.description,
                    campus: newItem.campus,
                    department_type: newItem.department_type,
                    cost_center_code: newItem.cost_center_code || newItem.code
                });
            } else if (activeTab === 'campuses') {
                await api.post('/workforce/api/campuses/', {
                    name: newItem.name,
                    code: newItem.code,
                    location: newItem.location,
                    cost_center_code: newItem.cost_center_code || newItem.code
                });
            } else if (activeTab === 'job_grades') {
                await api.post('/workforce/api/job-grades/', {
                    name: newItem.name,
                    code: newItem.code,
                    min_salary: newItem.min_salary,
                    max_salary: newItem.max_salary,
                    currency: newItem.currency,
                    grade_level: newItem.grade_level,
                    category: newItem.category
                });
            } else {
                await api.post('/workforce/api/job-titles/', {
                    title: newItem.name,
                    code: newItem.code,
                    description: newItem.description,
                    job_grade: newItem.job_grade,
                    category: newItem.category,
                    is_academic_rank: newItem.is_academic_rank
                });
            }

            toast.success('Created successfully');
            setShowAddModal(false);
            setNewItem({
                name: '', code: '', description: '',
                campus: '', department_type: 'academic', cost_center_code: '',
                job_grade: '', category: 'teaching', location: '', is_academic_rank: false,
                min_salary: '', max_salary: '', currency: 'KES', grade_level: ''
            });
            fetchData();
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data) {
                const data = error.response.data;
                let message = 'Failed to create item';

                // Handle DRF validation errors (object of arrays)
                if (typeof data === 'object' && !Array.isArray(data)) {
                    const messages = Object.entries(data).map(([key, value]) => {
                        const errorMsg = Array.isArray(value) ? value[0] : value;
                        return `${key}: ${errorMsg}`;
                    });
                    if (messages.length > 0) {
                        message = messages.join('\n');
                    }
                } else if (data.message) {
                    message = data.message;
                }

                toast.error(message);
            } else {
                toast.error('Failed to create item');
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab('departments')}
                    className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'departments'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                >
                    <Building size={16} />
                    Departments
                </button>
                <button
                    onClick={() => setActiveTab('campuses')}
                    className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'campuses'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                >
                    <MapPin size={16} />
                    Campuses
                </button>
                <button
                    onClick={() => setActiveTab('job_grades')}
                    className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'job_grades'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                >
                    <Banknote size={16} />
                    Job Grades
                </button>
                <button
                    onClick={() => setActiveTab('job_titles')}
                    className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'job_titles'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                >
                    <Briefcase size={16} />
                    Job Titles
                </button>
            </div>

            {/* Content */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                    {(() => {
                        switch (activeTab) {
                            case 'departments': return 'Departments List';
                            case 'campuses': return 'Campuses List';
                            case 'job_grades': return 'Job Grades List';
                            case 'job_titles': return 'Job Titles List';
                            default: return 'List';
                        }
                    })()}
                </h3>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm btn btn-primary"
                >
                    <Plus size={16} />
                    Add {(() => {
                        switch (activeTab) {
                            case 'departments': return 'Department';
                            case 'campuses': return 'Campus';
                            case 'job_grades': return 'Job Grade';
                            case 'job_titles': return 'Job Title';
                            default: return 'Item';
                        }
                    })()}
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name / Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Code</th>
                                {activeTab === 'campuses' && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                                )}
                                {activeTab === 'job_grades' && (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Salary Range</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Level</th>
                                    </>
                                )}
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {(() => {
                                switch (activeTab) {
                                    case 'departments': return departments;
                                    case 'campuses': return campuses;
                                    case 'job_grades': return jobGrades;
                                    case 'job_titles': return jobTitles;
                                    default: return [];
                                }
                            })().map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                                        {item.name || item.title}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                        {item.code}
                                    </td>
                                    {activeTab === 'campuses' && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                            {item.location}
                                        </td>
                                    )}
                                    {activeTab === 'job_grades' && (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                {item.currency} {parseFloat(item.min_salary).toLocaleString()} - {parseFloat(item.max_salary).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                {item.grade_level}
                                            </td>
                                        </>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-600 hover:text-red-900 dark:hover:text-red-400 ml-4"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {(() => {
                                const list = activeTab === 'departments' ? departments
                                    : activeTab === 'campuses' ? campuses
                                        : activeTab === 'job_grades' ? jobGrades
                                            : jobTitles;
                                return list.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500 text-sm">
                                            No items found. Click "Add" to create one.
                                        </td>
                                    </tr>
                                );
                            })()}
                        </tbody>
                    </table>
                </div>
            )
            }

            {/* Add Modal */}
            {
                showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                Add {(() => {
                                    switch (activeTab) {
                                        case 'departments': return 'Department';
                                        case 'campuses': return 'Campus';
                                        case 'job_grades': return 'Job Grade';
                                        case 'job_titles': return 'Job Title';
                                        default: return 'Item';
                                    }
                                })()}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Name / Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Code *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
                                        value={newItem.code}
                                        onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                                    />
                                </div>

                                {activeTab === 'departments' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Campus *
                                            </label>
                                            <select
                                                required
                                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
                                                value={newItem.campus}
                                                onChange={(e) => setNewItem({ ...newItem, campus: e.target.value })}
                                            >
                                                <option value="">Select Campus</option>
                                                {campuses.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Department Type *
                                            </label>
                                            <select
                                                required
                                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
                                                value={newItem.department_type}
                                                onChange={(e) => setNewItem({ ...newItem, department_type: e.target.value })}
                                            >
                                                <option value="academic">Academic</option>
                                                <option value="administrative">Administrative</option>
                                                <option value="support">Support Services</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Cost Center Code
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Defaults to department code if empty"
                                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
                                                value={newItem.cost_center_code}
                                                onChange={(e) => setNewItem({ ...newItem, cost_center_code: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}

                                {activeTab === 'campuses' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Location *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
                                                value={newItem.location}
                                                onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Cost Center Code
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Defaults to code if empty"
                                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
                                                value={newItem.cost_center_code}
                                                onChange={(e) => setNewItem({ ...newItem, cost_center_code: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}

                                {activeTab === 'job_grades' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                    Min Salary
                                                </label>
                                                <input
                                                    type="number"
                                                    required
                                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
                                                    value={newItem.min_salary}
                                                    onChange={(e) => setNewItem({ ...newItem, min_salary: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                    Max Salary
                                                </label>
                                                <input
                                                    type="number"
                                                    required
                                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
                                                    value={newItem.max_salary}
                                                    onChange={(e) => setNewItem({ ...newItem, max_salary: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                    Currency
                                                </label>
                                                <select
                                                    required
                                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
                                                    value={newItem.currency}
                                                    onChange={(e) => setNewItem({ ...newItem, currency: e.target.value })}
                                                >
                                                    <option value="KES">KES</option>
                                                    <option value="USD">USD</option>
                                                    <option value="EUR">EUR</option>
                                                    <option value="GBP">GBP</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                    Grade Level
                                                </label>
                                                <input
                                                    type="number"
                                                    required
                                                    placeholder="e.g. 1"
                                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
                                                    value={newItem.grade_level}
                                                    onChange={(e) => setNewItem({ ...newItem, grade_level: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Category *
                                            </label>
                                            <select
                                                required
                                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
                                                value={newItem.category}
                                                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                            >
                                                <option value="teaching">Teaching Staff</option>
                                                <option value="non_teaching">Non-Teaching Staff</option>
                                                <option value="management">Management</option>
                                                <option value="executive">Executive</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'job_titles' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Job Grade *
                                            </label>
                                            <select
                                                required
                                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
                                                value={newItem.job_grade}
                                                onChange={(e) => setNewItem({ ...newItem, job_grade: e.target.value })}
                                            >
                                                <option value="">Select Job Grade</option>
                                                {jobGrades.map(g => (
                                                    <option key={g.id} value={g.id}>{g.name} ({g.code})</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Category *
                                            </label>
                                            <select
                                                required
                                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
                                                value={newItem.category}
                                                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                            >
                                                <option value="teaching">Teaching Staff</option>
                                                <option value="non_teaching">Non-Teaching Staff</option>
                                                <option value="contract">Contract Staff</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="is_academic_rank"
                                                className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                                                checked={newItem.is_academic_rank}
                                                onChange={(e) => setNewItem({ ...newItem, is_academic_rank: e.target.checked })}
                                            />
                                            <label htmlFor="is_academic_rank" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Is Academic Rank?
                                            </label>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
                                        rows="3"
                                        value={newItem.description}
                                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors btn btn-outline"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors btn btn-primary"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default EmployeeManagementSettings;

