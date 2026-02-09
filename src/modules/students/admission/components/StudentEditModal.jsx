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

    const [formData, setFormData] = useState({
        intake: '',
        grade_id: '',
        stream_id: '',
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
            const [studentData, intakesData, classesData, streamsData] = await Promise.all([
                studentManagementService.getAdmission(studentId),
                studentManagementService.getIntakes(),
                studentManagementService.getClasses(),
                studentManagementService.getStreams()
            ]);

            setStudent(studentData);
            setIntakes(intakesData.results || intakesData || []);
            setClasses(classesData.results || classesData || []);
            setStreams(streamsData.results || streamsData || []);

            const getId = (val) => {
                if (!val) return null;
                if (typeof val === 'object' && val.id) return val.id;
                return val;
            };

            setFormData({
                intake: getId(studentData.intake),
                grade_id: getId(studentData.class_id || studentData.grade),
                stream_id: getId(studentData.stream_id || studentData.stream),
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
            await studentManagementService.updateAdmission(studentId, formData);
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
                <>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </>
            }
        >
            <div className="flex flex-col h-full">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('details')}
                    >
                        <User className="w-4 h-4 inline mr-2" />
                        Details
                    </button>
                    <button
                        className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'enrollment' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('enrollment')}
                    >
                        <BookOpen className="w-4 h-4 inline mr-2" />
                        Enrollment
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p className="mt-2 text-sm text-gray-500">Loading...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'details' && student && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Admission Number</label>
                                        <input
                                            type="text"
                                            value={student.admission_number || 'N/A'}
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                                        <input
                                            type="text"
                                            value={student.student_name || ''}
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
                                        <input
                                            type="text"
                                            value={student.admission_date || ''}
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Intake/Cohort</label>
                                        <select
                                            name="intake"
                                            value={formData.intake}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Class/Grade</label>
                                        <select
                                            name="grade_id"
                                            value={formData.grade_id}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">Select Class</option>
                                            {classes.map(cls => (
                                                <option key={cls.id} value={cls.id}>
                                                    {cls.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stream</label>
                                        <select
                                            name="stream_id"
                                            value={formData.stream_id}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">Select Stream</option>
                                            {streams.filter(s => s.grade_id === parseInt(formData.grade_id)).map(stream => (
                                                <option key={stream.id} value={stream.id}>
                                                    {stream.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <button
                                        onClick={handleRepeat}
                                        disabled={saving}
                                        className="px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors w-full sm:w-auto"
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
