import React, { useState, useEffect } from 'react';
import { Save, User, BookOpen } from 'lucide-react';
import { studentManagementService } from '../../../../services/studentManagementService';
import studentSettingsService from '../../../../services/studentSettingsService';
import { toast } from 'react-toastify';
import Modal from '../../../../components/common/Modal';

const StudentEditModal = ({ isOpen, onClose, studentId, onSuccess }) => {
    const [activeTab, setActiveTab] = useState('details');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [student, setStudent] = useState(null);
    const [intakes, setIntakes] = useState([]);
    const [classes, setClasses] = useState([]);
    const [streams, setStreams] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [curricula, setCurricula] = useState([]);
    const [curriculumLevels, setCurriculumLevels] = useState([]);

    const [formData, setFormData] = useState({
        intake: '',
        grade_id: '',
        stream_id: '',
        academic_year_id: '',
        curriculum_id: '',
        curriculum_level_id: '',
        status: ''
    });

    useEffect(() => {
        if (isOpen && studentId) {
            fetchData();
        }
    }, [isOpen, studentId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentData, intakesData, classesData, streamsData, yearsData, curricData, levelsData] = await Promise.all([
                studentManagementService.getAdmission(studentId),
                studentSettingsService.getIntakes(),
                studentSettingsService.getClasses(),
                studentSettingsService.getStreams(),
                studentSettingsService.getAcademicYears(),
                studentSettingsService.getCurricula(),
                studentSettingsService.getCurriculumLevels()
            ]);

            setStudent(studentData);
            setIntakes(intakesData.results || intakesData || []);
            setClasses(classesData.results || classesData || []);
            setStreams(streamsData.results || streamsData || []);
            const allYears = yearsData.results || yearsData || [];
            setAcademicYears(allYears);
            setCurricula(curricData.results || curricData || []);
            setCurriculumLevels(levelsData.results || levelsData || []);

            const getId = (val) => {
                if (!val) return '';
                if (typeof val === 'object' && val.id) return val.id;
                return val;
            };

            setFormData({
                intake: getId(studentData.intake),
                grade_id: getId(studentData.class_id || studentData.grade),
                stream_id: getId(studentData.stream_id || studentData.stream),
                academic_year_id: getId(studentData.academic_year) || (allYears.find(y => y.is_current)?.id || ''),
                curriculum_id: getId(studentData.curriculum),
                curriculum_level_id: getId(studentData.curriculum_level),
                status: studentData.status || 'active'
            });
        } catch (error) {
            console.error('Error fetching student data:', error);
            toast.error('Failed to load student information');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Convert empty strings to null for integer fields to avoid 400 errors
            const cleanedData = { ...formData };
            ['grade_id', 'stream_id', 'academic_year_id', 'curriculum_id', 'curriculum_level_id', 'intake'].forEach(key => {
                if (cleanedData[key] === '' || cleanedData[key] === undefined) {
                    cleanedData[key] = null;
                }
            });
            await studentManagementService.updateAdmission(studentId, cleanedData);
            toast.success('Student updated successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error updating student:', error);
            toast.error(error.response?.data?.message || 'Failed to update student');
        } finally {
            setSaving(false);
        }
    };

    const handleRepeat = async () => {
        if (!window.confirm('Mark this student as a repeater? This will create a new enrollment record for the current year.')) return;

        try {
            setSaving(true);
            await studentSettingsService.repeatStudent({ student_id: student.student_id });
            toast.success('Student marked as repeater');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error marking student as repeater:', error);
            toast.error('Failed to mark as repeater');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={student ? `Edit ${student.student_name}` : 'Edit Student'}
            size="lg"
            accentColor="bg-indigo-600"
            footer={
                <div className="flex justify-end gap-3 w-full">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl font-extrabold uppercase tracking-widest text-[11px] text-slate-500 bg-[#f8f9fa] shadow-[4px_4px_10px_#e5e7eb,-4px_-4px_10px_#ffffff] hover:shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] transition-all border border-white cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="px-4 py-2 rounded-xl font-extrabold uppercase tracking-widest text-[11px] text-white bg-indigo-600 shadow-[4px_4px_10px_#e5e7eb,-4px_-4px_10px_#ffffff] hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer border border-indigo-500"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            }
        >
            <div className="flex flex-col h-full bg-[#f8f9fa] rounded-2xl p-2">
                {/* Tabs */}
                <div className="flex gap-4 mb-6 px-2">
                    <button
                        className={`py-2 px-5 rounded-xl text-[11px] font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 border ${
                            activeTab === 'details'
                            ? 'bg-[#f8f9fa] text-indigo-600 shadow-[inset_3px_3px_8px_#e5e7eb,inset_-3px_-3px_8px_#ffffff] border-white'
                            : 'bg-[#f8f9fa] text-slate-500 shadow-[4px_4px_10px_#e5e7eb,-4px_-4px_10px_#ffffff] hover:shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] border-white'
                        }`}
                        onClick={() => setActiveTab('details')}
                    >
                        <User className="w-3.5 h-3.5" />
                        Details
                    </button>
                    <button
                        className={`py-2 px-5 rounded-xl text-[11px] font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 border ${
                            activeTab === 'enrollment'
                            ? 'bg-[#f8f9fa] text-indigo-600 shadow-[inset_3px_3px_8px_#e5e7eb,inset_-3px_-3px_8px_#ffffff] border-white'
                            : 'bg-[#f8f9fa] text-slate-500 shadow-[4px_4px_10px_#e5e7eb,-4px_-4px_10px_#ffffff] hover:shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] border-white'
                        }`}
                        onClick={() => setActiveTab('enrollment')}
                    >
                        <BookOpen className="w-3.5 h-3.5" />
                        Enrollment
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-100 border-t-indigo-600"></div>
                        <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Records...</p>
                    </div>
                ) : (
                    <div className="px-2">
                        {activeTab === 'details' && student && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 pl-2">Admission Number</label>
                                        <input
                                            type="text"
                                            value={student.admission_number || 'N/A'}
                                            disabled
                                            className="w-full px-4 py-3 bg-gray-50/80 rounded-2xl shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] border border-white/40 text-sm font-bold text-slate-400 cursor-not-allowed outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 pl-2">Student Name</label>
                                        <input
                                            type="text"
                                            value={student.student_name || ''}
                                            disabled
                                            className="w-full px-4 py-3 bg-gray-50/80 rounded-2xl shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] border border-white/40 text-sm font-bold text-slate-400 cursor-not-allowed outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 pl-2">Admission Date</label>
                                        <input
                                            type="text"
                                            value={student.admission_date || ''}
                                            disabled
                                            className="w-full px-4 py-3 bg-gray-50/80 rounded-2xl shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] border border-white/40 text-sm font-bold text-slate-400 cursor-not-allowed outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 pl-2">Status</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-[#f8f9fa] rounded-2xl shadow-[inset_3px_3px_8px_#e5e7eb,inset_-3px_-3px_8px_#ffffff] border border-white focus:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] outline-none text-sm font-black text-slate-700 cursor-pointer transition-all"
                                        >
                                            <option value="active">Active</option>
                                            <option value="withdrawn">Withdrawn</option>
                                            <option value="transferred">Transferred</option>
                                            <option value="graduated">Graduated</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'enrollment' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 pl-2">Academic Year</label>
                                        <select
                                            name="academic_year_id"
                                            value={formData.academic_year_id}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-[#f8f9fa] rounded-2xl shadow-[inset_3px_3px_8px_#e5e7eb,inset_-3px_-3px_8px_#ffffff] border border-white focus:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] outline-none text-sm font-black text-slate-700 cursor-pointer transition-all"
                                        >
                                            <option value="">Select Academic Year</option>
                                            {academicYears.map(year => (
                                                <option key={year.id} value={year.id}>
                                                    {year.name}{year.is_current ? ' (Current)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 pl-2">Intake/Cohort</label>
                                        <select
                                            name="intake"
                                            value={formData.intake}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-[#f8f9fa] rounded-2xl shadow-[inset_3px_3px_8px_#e5e7eb,inset_-3px_-3px_8px_#ffffff] border border-white focus:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] outline-none text-sm font-black text-slate-700 cursor-pointer transition-all"
                                        >
                                            <option value="">Select Intake</option>
                                            {intakes.map(intake => (
                                                <option key={intake.id} value={intake.id}>
                                                    {intake.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 pl-2">Curriculum</label>
                                        <select
                                            name="curriculum_id"
                                            value={formData.curriculum_id}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-[#f8f9fa] rounded-2xl shadow-[inset_3px_3px_8px_#e5e7eb,inset_-3px_-3px_8px_#ffffff] border border-white focus:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] outline-none text-sm font-black text-slate-700 cursor-pointer transition-all"
                                        >
                                            <option value="">Select Curriculum</option>
                                            {curricula.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name || c.code}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 pl-2">Curriculum Level</label>
                                        <select
                                            name="curriculum_level_id"
                                            value={formData.curriculum_level_id}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-[#f8f9fa] rounded-2xl shadow-[inset_3px_3px_8px_#e5e7eb,inset_-3px_-3px_8px_#ffffff] border border-white focus:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] outline-none text-sm font-black text-slate-700 cursor-pointer transition-all"
                                        >
                                            <option value="">Select Level</option>
                                            {curriculumLevels
                                                .filter(l => !formData.curriculum_id || l.curriculum === parseInt(formData.curriculum_id))
                                                .map(level => (
                                                    <option key={level.id} value={level.id}>
                                                        {level.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 pl-2">Class/Grade</label>
                                        <select
                                            name="grade_id"
                                            value={formData.grade_id}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-[#f8f9fa] rounded-2xl shadow-[inset_3px_3px_8px_#e5e7eb,inset_-3px_-3px_8px_#ffffff] border border-white focus:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] outline-none text-sm font-black text-slate-700 cursor-pointer transition-all"
                                        >
                                            <option value="">Select Class</option>
                                            {classes
                                                .filter(cls => !formData.curriculum_id || cls.curriculum === parseInt(formData.curriculum_id))
                                                .filter(cls => !formData.curriculum_level_id || cls.curriculum_level === parseInt(formData.curriculum_level_id))
                                                .map(cls => (
                                                    <option key={cls.id} value={cls.id}>
                                                        {cls.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 pl-2">Stream</label>
                                        <select
                                            name="stream_id"
                                            value={formData.stream_id}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-[#f8f9fa] rounded-2xl shadow-[inset_3px_3px_8px_#e5e7eb,inset_-3px_-3px_8px_#ffffff] border border-white focus:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] outline-none text-sm font-black text-slate-700 cursor-pointer transition-all"
                                        >
                                            <option value="">Select Stream</option>
                                            {streams.filter(s => s.grade === parseInt(formData.grade_id) || s.grade_id === parseInt(formData.grade_id)).map(stream => (
                                                <option key={stream.id} value={stream.id}>
                                                    {stream.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-6 mt-4 border-t border-slate-200/50">
                                    <button
                                        onClick={handleRepeat}
                                        disabled={saving}
                                        className="px-6 py-3 rounded-xl font-extrabold uppercase tracking-widest text-[11px] text-amber-600 bg-amber-50 shadow-[4px_4px_10px_#e5e7eb,-4px_-4px_10px_#ffffff] hover:shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] transition-all border border-amber-100 cursor-pointer w-full sm:w-auto"
                                    >
                                        Mark as Repeater
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default StudentEditModal;
