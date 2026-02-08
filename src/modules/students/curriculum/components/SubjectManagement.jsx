import React, { useState } from 'react';
import { Plus, Search, Filter, Book, Hash, Calendar, GraduationCap } from 'lucide-react';
import EditSubjectModal from './modals/EditSubjectModal';

const SubjectManagement = () => {
    const [subjects, setSubjects] = useState([
        { id: 1, name: 'Mathematics', code: 'MAT101', area: 'Sciences', classes: 'All', type: 'Compulsory' },
        { id: 2, name: 'English', code: 'ENG101', area: 'Languages', classes: 'All', type: 'Compulsory' },
        { id: 3, name: 'Kiswahili', code: 'KIS101', area: 'Languages', classes: 'All', type: 'Compulsory' },
        { id: 4, name: 'Science & Tech', code: 'SCI200', area: 'Sciences', classes: 'Grade 4 - 6', type: 'Compulsory' },
        { id: 5, name: 'Computer Studies', code: 'CS300', area: 'Technical', classes: 'Form 1 - 4', type: 'Optional' },
        { id: 6, name: 'French', code: 'FRE400', area: 'Languages', classes: 'Form 1 - 4', type: 'Optional' },
    ]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);

    const handleEdit = (subject) => {
        setEditingSubject(subject);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = (updatedSubject) => {
        setSubjects(subjects.map(s =>
            s.id === updatedSubject.id ? updatedSubject : s
        ));
        setIsEditModalOpen(false);
        setEditingSubject(null);
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-2 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search subjects..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-2 text-sm">
                        <Filter size={16} /> Filter
                    </button>
                </div>
                <div className="flex gap-2">
                </div>
            </div>

            {/* Grid Layout for Subjects */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((sub) => (
                    <div key={sub.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-300 transition-colors group cursor-pointer relative overflow-hidden">

                        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 -mr-6 -mt-6 ${sub.area === 'Sciences' ? 'bg-blue-500' :
                            sub.area === 'Languages' ? 'bg-green-500' :
                                'bg-orange-500'
                            }`}></div>

                        <div className="flex justify-between items-start mb-3 relative">
                            <div className="p-2.5 bg-gray-50 rounded-lg text-gray-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <Book size={20} />
                            </div>
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${sub.type === 'Compulsory'
                                ? 'bg-gray-100 text-gray-600 border-gray-200'
                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                }`}>
                                {sub.type}
                            </span>
                        </div>

                        <div className="mb-3 relative">
                            <h4 className="font-bold text-gray-900 text-lg leading-tight">{sub.name}</h4>
                            <p className="text-xs text-indigo-600 font-mono mt-1">{sub.code}</p>
                        </div>

                        <div className="space-y-2 text-sm text-gray-500 relative">
                            <div className="flex items-center gap-2">
                                <GraduationCap size={14} className="text-gray-400" />
                                <span>{sub.area}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Hash size={14} className="text-gray-400" />
                                <span>{sub.classes}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-gray-400" />
                                <span>5 Lessons / Week</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2 relative">
                            <button
                                onClick={() => handleEdit(sub)}
                                className="text-xs font-semibold text-gray-500 hover:text-indigo-600 px-2 py-1 hover:bg-gray-50 rounded"
                            >
                                Edit
                            </button>
                            <button className="text-xs font-semibold text-gray-500 hover:text-red-600 px-2 py-1 hover:bg-gray-50 rounded">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <EditSubjectModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                subject={editingSubject}
                onSave={handleSaveEdit}
            />
        </div>
    );
};

export default SubjectManagement;
