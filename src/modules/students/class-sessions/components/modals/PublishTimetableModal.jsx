import React, { useState } from 'react';
import { X, Check, Bell, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const PublishTimetableModal = ({ isOpen, onClose, timetableId }) => {
    const [publishData, setPublishData] = useState({
        publishDate: new Date().toISOString().split('T')[0],
        notifyTeachers: true,
        notifyStudents: true,
        notifyParents: false,
        message: 'The class timetable has been published. Please review the schedule and note any changes.'
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPublishData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePublish = () => {
        console.log('Publishing timetable:', publishData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Check size={20} className="text-green-600" />
                            Publish Timetable
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">Configure publication settings before going live</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Preview Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">Preview</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                            <div>
                                <span className="opacity-75">Class:</span>
                                <div className="font-medium">Grade 4 - East</div>
                            </div>
                            <div>
                                <span className="opacity-75">Term:</span>
                                <div className="font-medium">Term 1 2024</div>
                            </div>
                        </div>
                    </div>

                    {/* Publication Date */}
                    <div>
                        <label className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-2">
                            <Calendar size={16} className="text-indigo-600" />
                            Publication Date
                        </label>
                        <input
                            type="date"
                            name="publishDate"
                            value={publishData.publishDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">The timetable will be visible to users from this date</p>
                    </div>

                    {/* Notifications */}
                    <div>
                        <label className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                            <Bell size={16} className="text-indigo-600" />
                            Notifications
                        </label>
                        <div className="space-y-3">
                            <motion.label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    name="notifyTeachers"
                                    checked={publishData.notifyTeachers}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">Notify Teachers</div>
                                    <div className="text-xs text-gray-500">Send notification to all assigned teachers</div>
                                </div>
                            </motion.label>

                            <motion.label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    name="notifyStudents"
                                    checked={publishData.notifyStudents}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">Notify Students</div>
                                    <div className="text-xs text-gray-500">Send notification to all students in the class</div>
                                </div>
                            </motion.label>

                            <motion.label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    name="notifyParents"
                                    checked={publishData.notifyParents}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">Notify Parents</div>
                                    <div className="text-xs text-gray-500">Send notification via SMS/Email to parents</div>
                                </div>
                            </motion.label>
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="text-sm font-semibold text-gray-900 block mb-2">Notification Message (Optional)</label>
                        <textarea
                            name="message"
                            value={publishData.message}
                            onChange={handleInputChange}
                            placeholder="Custom message for notifications..."
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave empty for default message</p>
                    </div>

                    {/* Recipients Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <Users size={16} /> Recipients
                        </h4>
                        <div className="text-sm text-gray-600 space-y-1">
                            {publishData.notifyTeachers && <div>✓ 8 Teachers</div>}
                            {publishData.notifyStudents && <div>✓ 45 Students</div>}
                            {publishData.notifyParents && <div>✓ 45 Parents</div>}
                            {!publishData.notifyTeachers && !publishData.notifyStudents && !publishData.notifyParents && (
                                <div className="text-gray-400">No notifications will be sent</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePublish}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                    >
                        <Check size={18} /> Publish Now
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default PublishTimetableModal;
