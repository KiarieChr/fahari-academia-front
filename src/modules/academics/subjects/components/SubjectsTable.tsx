import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, Edit, Trash2, Copy, Eye, CheckCircle, XCircle, ChevronDown, Book, Layers, Layout } from 'lucide-react';

const SubjectsTable = ({ subjects, curricula = [], curriculumLevels = [], learningAreas = [], onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterCurriculum, setFilterCurriculum] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [filterArea, setFilterArea] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filtered = subjects.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || s.category === filterCategory;
        const matchesCurriculum = !filterCurriculum || s.curriculum === parseInt(filterCurriculum);
        const matchesLevel = !filterLevel || s.curriculum_level === parseInt(filterLevel);
        const matchesArea = !filterArea || s.learning_area === parseInt(filterArea);
        
        return matchesSearch && matchesCategory && matchesCurriculum && matchesLevel && matchesArea;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterCategory, filterCurriculum, filterLevel, filterArea]);
    
    // When curriculum changes, clear dependent filters
    React.useEffect(() => {
        setFilterLevel('');
        setFilterArea('');
    }, [filterCurriculum]);

    const paginatedSubjects = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getStatusColor = (status) => {
        return status === 'Active' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-slate-500 bg-slate-100 dark:bg-slate-800';
    };
    
    // Compute available options for context-aware dropdowns
    const availableLevels = filterCurriculum 
        ? curriculumLevels.filter(l => l.curriculum === parseInt(filterCurriculum))
        : curriculumLevels;
        
    const availableAreas = filterCurriculum
        ? learningAreas.filter(a => a.curriculum === parseInt(filterCurriculum))
        : learningAreas;

    return (
        <div className="neo-card border-none overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-transparent">
                <div className="relative w-full md:w-72 lg:w-80 flex-shrink-0">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        style={{ paddingLeft: '30px'}}
                        placeholder="Search subjects..."
                        className="w-full pr-4 py-2 neo-pressed border-none rounded-xl text-sm focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-3 flex-1 justify-start md:justify-end">
                    {/* Curriculum Filter */}
                    <div className="relative min-w-[150px]">
                        <Book size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                            style={{ paddingLeft: '32px' }}
                            className="w-full pr-8 py-2 neo-pressed border-none rounded-xl text-sm focus:outline-none appearance-none font-medium text-slate-600 bg-transparent"
                            value={filterCurriculum}
                            onChange={(e) => setFilterCurriculum(e.target.value)}
                        >
                            <option value="">All Curriculums</option>
                            {curricula.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Curriculum Level Filter */}
                    <div className="relative min-w-[150px]">
                        <Layers size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                            style={{ paddingLeft: '32px' }}
                            className="w-full pr-8 py-2 neo-pressed border-none rounded-xl text-sm focus:outline-none appearance-none font-medium text-slate-600 bg-transparent"
                            value={filterLevel}
                            onChange={(e) => setFilterLevel(e.target.value)}
                        >
                            <option value="">All Levels</option>
                            {availableLevels.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Learning Area Filter */}
                    <div className="relative min-w-[160px]">
                        <Layout size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                            style={{ paddingLeft: '32px' }}
                            className="w-full pr-8 py-2 neo-pressed border-none rounded-xl text-sm focus:outline-none appearance-none font-medium text-slate-600 bg-transparent"
                            value={filterArea}
                            onChange={(e) => setFilterArea(e.target.value)}
                        >
                            <option value="">All Learning Areas</option>
                            {availableAreas.map(a => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Category Filter */}
                    <div className="relative min-w-[140px]">
                        <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                            style={{ paddingLeft: '32px' }}
                            className="w-full pr-8 py-2 neo-pressed border-none rounded-xl text-sm focus:outline-none appearance-none font-medium text-slate-600 bg-transparent"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            <option value="Core">Core</option>
                            <option value="Optional">Optional</option>
                            <option value="Elective">Elective</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-transparent text-xs uppercase text-slate-500 font-bold border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Curriculum</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {paginatedSubjects.length > 0 ? (
                            paginatedSubjects.map((subject) => (
                                <tr key={subject.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 dark:text-white">{subject.name}</span>
                                            <span className="text-xs font-mono text-slate-400">{subject.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${subject.category === 'Core' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                subject.category === 'Optional' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                    'bg-purple-50 text-purple-700 border-purple-100'
                                            }`}>
                                            {subject.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                                        {subject.curriculumName}
                                    </td>
                                    
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                        {subject.type}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold ${getStatusColor(subject.status)}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${subject.status === 'Active' ? 'bg-green-600' : 'bg-slate-500'}`}></span>
                                            {subject.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => onEdit(subject)}
                                                className="p-2 text-slate-500 hover:text-blue-600 neo-btn transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="p-2 text-slate-500 hover:text-blue-600 neo-btn transition-colors"
                                                title="Duplicate"
                                            >
                                                <Copy size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(subject.id)}
                                                className="p-2 text-slate-500 hover:text-red-600 neo-btn transition-colors"
                                                title="Delete/Deactivate"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search size={32} className="text-slate-300" />
                                        <p>No subjects found matching your filters.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-gray-100 bg-transparent flex justify-between items-center text-xs font-bold text-slate-500">
                <span>
                    Showing {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} subjects
                </span>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 neo-btn rounded-lg hover:text-slate-800 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">Previous</button>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-3 py-1 neo-btn rounded-lg hover:text-slate-800 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">Next</button>
                </div>
            </div>
        </div>
    );
};

export default SubjectsTable;
