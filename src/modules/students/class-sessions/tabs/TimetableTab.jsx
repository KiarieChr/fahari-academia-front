import React, { useState } from 'react';
import { Plus, Edit2, Eye, Trash2, Upload, Download, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import TimetableStats from '../components/TimetableStats';
import TimetableGrid from '../components/TimetableGrid';
import TimetableFilters from '../components/TimetableFilters';
import CreateEditTimetableModal from '../components/modals/CreateEditTimetableModal';
import PublishTimetableModal from '../components/modals/PublishTimetableModal';

const TimetableTab = () => {
    const [activeYear, setActiveYear] = useState('2024');
    const [activeTerm, setActiveTerm] = useState('Term 1');
    const [selectedClass, setSelectedClass] = useState('Grade 4');
    const [selectedStream, setSelectedStream] = useState('East');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [timetables, setTimetables] = useState([
        {
            id: 1,
            class: 'Grade 4',
            stream: 'East',
            term: 'Term 1',
            year: '2024',
            status: 'published',
            publishedDate: '2023-01-15',
            createdBy: 'Admin',
            version: 1
        },
        {
            id: 2,
            class: 'Grade 4',
            stream: 'East',
            term: 'Term 2',
            year: '2024',
            status: 'draft',
            publishedDate: null,
            createdBy: 'Admin',
            version: 1
        }
    ]);

    const handleCreate = () => {
        setEditingId(null);
        setShowCreateModal(true);
    };

    const handleEdit = (id) => {
        setEditingId(id);
        setShowCreateModal(true);
    };

    const handlePublish = (id) => {
        setEditingId(id);
        setShowPublishModal(true);
    };

    const handleDelete = (id) => {
        setTimetables(timetables.filter(t => t.id !== id));
    };

    const handleClone = (id) => {
        const timetableToClone = timetables.find(t => t.id === id);
        if (timetableToClone) {
            const newTimetable = {
                ...timetableToClone,
                id: Math.max(...timetables.map(t => t.id)) + 1,
                status: 'draft',
                publishedDate: null,
                version: timetableToClone.version + 1
            };
            setTimetables([...timetables, newTimetable]);
        }
    };

    const stats = [
        { label: 'Total Timetables', value: timetables.length, color: 'bg-blue-100 text-blue-700' },
        { label: 'Published', value: timetables.filter(t => t.status === 'published').length, color: 'bg-green-100 text-green-700' },
        { label: 'Drafts', value: timetables.filter(t => t.status === 'draft').length, color: 'bg-yellow-100 text-yellow-700' }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        className={`${stat.color} rounded-lg p-6 shadow-sm border border-gray-200`}
                        whileHover={{ scale: 1.02 }}
                    >
                        <p className="text-sm font-medium opacity-75 mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Controls & Filters */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-3">Filter Timetables</h3>
                        <TimetableFilters 
                            selectedClass={selectedClass}
                            onClassChange={setSelectedClass}
                            selectedStream={selectedStream}
                            onStreamChange={setSelectedStream}
                            activeYear={activeYear}
                            onYearChange={setActiveYear}
                            activeTerm={activeTerm}
                            onTermChange={setActiveTerm}
                        />
                    </div>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium whitespace-nowrap"
                    >
                        <Plus size={18} /> Create New
                    </button>
                </div>
            </div>

            {/* Timetables List / Grid */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left font-semibold text-gray-700">Class/Stream</th>
                                <th className="px-6 py-4 text-left font-semibold text-gray-700">Term</th>
                                <th className="px-6 py-4 text-left font-semibold text-gray-700">Year</th>
                                <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-4 text-left font-semibold text-gray-700">Published Date</th>
                                <th className="px-6 py-4 text-left font-semibold text-gray-700">Version</th>
                                <th className="px-6 py-4 text-right font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {timetables.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        <p className="font-medium">No timetables found</p>
                                        <p className="text-xs">Create a new timetable to get started</p>
                                    </td>
                                </tr>
                            ) : (
                                timetables.map((timetable) => (
                                    <motion.tr
                                        key={timetable.id}
                                        whileHover={{ backgroundColor: '#f9fafb' }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {timetable.class} - {timetable.stream}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{timetable.term}</td>
                                        <td className="px-6 py-4 text-gray-600">{timetable.year}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                timetable.status === 'published'
                                                    ? 'bg-green-100 text-green-700'
                                                    : timetable.status === 'draft'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {timetable.status === 'published' && <Check size={12} />}
                                                {timetable.status.charAt(0).toUpperCase() + timetable.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {timetable.publishedDate ? new Date(timetable.publishedDate).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">v{timetable.version}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleEdit(timetable.id)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleClone(timetable.id)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                                                    title="Clone"
                                                >
                                                    <Copy size={16} />
                                                </motion.button>
                                                {timetable.status === 'draft' && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handlePublish(timetable.id)}
                                                        className="p-2 hover:bg-green-100 rounded-lg text-green-600 transition-colors"
                                                        title="Publish"
                                                    >
                                                        <Check size={16} />
                                                    </motion.button>
                                                )}
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleDelete(timetable.id)}
                                                    className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Selected Timetable */}
            {timetables.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {selectedClass} - {selectedStream} | {activeTerm} {activeYear}
                    </h3>
                    <TimetableGrid 
                        classLevel={selectedClass}
                        stream={selectedStream}
                        term={activeTerm}
                        year={activeYear}
                    />
                </div>
            )}

            {/* Modals */}
            {showCreateModal && (
                <CreateEditTimetableModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    editingId={editingId}
                />
            )}

            {showPublishModal && (
                <PublishTimetableModal
                    isOpen={showPublishModal}
                    onClose={() => setShowPublishModal(false)}
                    timetableId={editingId}
                />
            )}
        </motion.div>
    );
};

export default TimetableTab;
