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
                studentManagementService.getIntakes(),
                studentManagementService.getClasses(),
                studentManagementService.getStreams(),
                studentSettingsService.getAcademicYears(),
                studentManagementService.getCurriculums(),
                studentManagementService.getCurriculumLevels()
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
            footer={
                <div className="flex justify-end gap-3 w-full">
                    <button
                        onClick={onClose}
                        style={{
                            background: 'var(--card-bg)',
                            borderColor: 'var(--border-color-light)',
                            color: 'var(--text-main)'
                        }}
                        className="px-6 py-2.5 border rounded-xl hover:opacity-90 active:scale-95 transition-all font-bold cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        style={{
                            background: 'var(--primary-color)',
                            color: '#fff'
                        }}
                        className="px-6 py-2.5 rounded-xl hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all font-bold flex items-center gap-2 cursor-pointer"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            }
        >
            <div className="flex flex-col h-full">
                {/* Tabs */}
                <div className="flex mb-6" style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                    <button
                        style={{
                            borderBottom: activeTab === 'details' ? '2px solid var(--primary-color)' : '2px solid transparent',
                            color: activeTab === 'details' ? 'var(--primary-color)' : 'var(--text-secondary)'
                        }}
                        className="py-2.5 px-4 text-sm font-bold transition-all bg-transparent border-0 cursor-pointer flex items-center gap-2"
                        onClick={() => setActiveTab('details')}
                    >
                        <User className="w-4 h-4" />
                        Details
                    </button>
                    <button
                        style={{
                            borderBottom: activeTab === 'enrollment' ? '2px solid var(--primary-color)' : '2px solid transparent',
                            color: activeTab === 'enrollment' ? 'var(--primary-color)' : 'var(--text-secondary)'
                        }}
                        className="py-2.5 px-4 text-sm font-bold transition-all bg-transparent border-0 cursor-pointer flex items-center gap-2"
                        onClick={() => setActiveTab('enrollment')}
                    >
                        <BookOpen className="w-4 h-4" />
                        Enrollment
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: 'var(--primary-color)', borderTopColor: 'transparent' }}></div>
                        <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'details' && student && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-main)' }}>Admission Number</label>
                                        <input
                                            type="text"
                                            value={student.admission_number || 'N/A'}
                                            disabled
                                            style={{
                                                background: 'var(--bg-light)',
                                                borderColor: 'var(--border-color-light)',
                                                color: 'var(--text-secondary)',
                                                cursor: 'not-allowed'
                                            }}
                                            className="w-full px-3 py-2 border rounded-xl font-medium outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-main)' }}>Student Name</label>
                                        <input
                                            type="text"
                                            value={student.student_name || ''}
                                            disabled
                                            style={{
                                                background: 'var(--bg-light)',
                                                borderColor: 'var(--border-color-light)',
                                                color: 'var(--text-secondary)',
                                                cursor: 'not-allowed'
                                            }}
                                            className="w-full px-3 py-2 border rounded-xl font-medium outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-main)' }}>Admission Date</label>
                                        <input
                                            type="text"
                                            value={student.admission_date || ''}
                                            disabled
                                            style={{
                                                background: 'var(--bg-light)',
                                                borderColor: 'var(--border-color-light)',
                                                color: 'var(--text-secondary)',
                                                cursor: 'not-allowed'
                                            }}
                                            className="w-full px-3 py-2 border rounded-xl font-medium outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-main)' }}>Status</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            style={{
                                                background: 'var(--card-bg)',
                                                borderColor: 'var(--border-color-light)',
                                                color: 'var(--text-main)'
                                            }}
                                            className="w-full px-3 py-2 border rounded-xl font-medium outline-none cursor-pointer"
                                        >
                                            <option value="active" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Active</option>
                                            <option value="withdrawn" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Withdrawn</option>
                                            <option value="transferred" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Transferred</option>
                                            <option value="graduated" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Graduated</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'enrollment' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-main)' }}>Academic Year</label>
                                        <select
                                            name="academic_year_id"
                                            value={formData.academic_year_id}
                                            onChange={handleChange}
                                            style={{
                                                background: 'var(--card-bg)',
                                                borderColor: 'var(--border-color-light)',
                                                color: 'var(--text-main)'
                                            }}
                                            className="w-full px-3 py-2 border rounded-xl font-medium outline-none cursor-pointer"
                                        >
                                            <option value="" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Select Academic Year</option>
                                            {academicYears.map(year => (
                                                <option key={year.id} value={year.id} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>
                                                    {year.name}{year.is_current ? ' (Current)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-main)' }}>Intake/Cohort</label>
                                        <select
                                            name="intake"
                                            value={formData.intake}
                                            onChange={handleChange}
                                            style={{
                                                background: 'var(--card-bg)',
                                                borderColor: 'var(--border-color-light)',
                                                color: 'var(--text-main)'
                                            }}
                                            className="w-full px-3 py-2 border rounded-xl font-medium outline-none cursor-pointer"
                                        >
                                            <option value="" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Select Intake</option>
                                            {intakes.map(intake => (
                                                <option key={intake.id} value={intake.id} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>
                                                    {intake.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-main)' }}>Curriculum</label>
                                        <select
                                            name="curriculum_id"
                                            value={formData.curriculum_id}
                                            onChange={handleChange}
                                            style={{
                                                background: 'var(--card-bg)',
                                                borderColor: 'var(--border-color-light)',
                                                color: 'var(--text-main)'
                                            }}
                                            className="w-full px-3 py-2 border rounded-xl font-medium outline-none cursor-pointer"
                                        >
                                            <option value="" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Select Curriculum</option>
                                            {curricula.map(c => (
                                                <option key={c.id} value={c.id} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>
                                                    {c.name || c.code}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-main)' }}>Curriculum Level</label>
                                        <select
                                            name="curriculum_level_id"
                                            value={formData.curriculum_level_id}
                                            onChange={handleChange}
                                            style={{
                                                background: 'var(--card-bg)',
                                                borderColor: 'var(--border-color-light)',
                                                color: 'var(--text-main)'
                                            }}
                                            className="w-full px-3 py-2 border rounded-xl font-medium outline-none cursor-pointer"
                                        >
                                            <option value="" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Select Level</option>
                                            {curriculumLevels
                                                .filter(l => !formData.curriculum_id || l.curriculum === parseInt(formData.curriculum_id))
                                                .map(level => (
                                                    <option key={level.id} value={level.id} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>
                                                        {level.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-main)' }}>Class/Grade</label>
                                        <select
                                            name="grade_id"
                                            value={formData.grade_id}
                                            onChange={handleChange}
                                            style={{
                                                background: 'var(--card-bg)',
                                                borderColor: 'var(--border-color-light)',
                                                color: 'var(--text-main)'
                                            }}
                                            className="w-full px-3 py-2 border rounded-xl font-medium outline-none cursor-pointer"
                                        >
                                            <option value="" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Select Class</option>
                                            {classes
                                                .filter(cls => !formData.curriculum_id || cls.curriculum === parseInt(formData.curriculum_id))
                                                .map(cls => (
                                                    <option key={cls.id} value={cls.id} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>
                                                        {cls.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-main)' }}>Stream</label>
                                        <select
                                            name="stream_id"
                                            value={formData.stream_id}
                                            onChange={handleChange}
                                            style={{
                                                background: 'var(--card-bg)',
                                                borderColor: 'var(--border-color-light)',
                                                color: 'var(--text-main)'
                                            }}
                                            className="w-full px-3 py-2 border rounded-xl font-medium outline-none cursor-pointer"
                                        >
                                            <option value="" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Select Stream</option>
                                            {streams.filter(s => s.grade === parseInt(formData.grade_id) || s.grade_id === parseInt(formData.grade_id)).map(stream => (
                                                <option key={stream.id} value={stream.id} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>
                                                    {stream.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="border-t pt-4" style={{ borderColor: 'var(--border-color-light)' }}>
                                    <button
                                        onClick={handleRepeat}
                                        disabled={saving}
                                        style={{
                                            background: 'rgba(245, 158, 11, 0.08)',
                                            borderColor: 'rgba(245, 158, 11, 0.2)',
                                            color: 'rgb(217, 119, 6)'
                                        }}
                                        className="px-6 py-2.5 border rounded-xl hover:opacity-90 active:scale-95 transition-all font-bold w-full sm:w-auto cursor-pointer"
                                    >
                                        Mark as Repeater
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Modal>
    );
};

export default StudentEditModal;
