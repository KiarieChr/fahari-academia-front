import React from 'react';
import { Calendar, Clock, User, BookOpen, CheckCircle, XCircle, FileText } from 'lucide-react';
import Modal from '../../../../../components/common/Modal';

const SessionDetailsModal = ({ isOpen, onClose, session }) => {
    if (!session) return null;

    return (
        <Modal
            isOpen={isOpen && !!session}
            onClose={onClose}
            title="Session Details"
            subtitle="Review past class session information."
            size="lg"
            accentColor="bg-indigo-500"
            footer={
                <Modal.SubmitButton onClick={onClose}>Close Details</Modal.SubmitButton>
            }
        >
            {/* Status Banner */}
            <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 ${session.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                {session.status === 'Completed' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                <div>
                    <h3 className="font-bold text-sm uppercase tracking-wide">{session.status}</h3>
                    <p className="text-sm opacity-90">
                        {session.status === 'Completed'
                            ? 'Session was conducted successfully.'
                            : 'Session was cancelled or not marked as complete.'}
                    </p>
                </div>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Date</span>
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                        <Calendar size={16} className="text-indigo-500" />
                        {session.date}
                    </div>
                </div>
                <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Time / Duration</span>
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                        <Clock size={16} className="text-indigo-500" />
                        {session.duration}
                    </div>
                </div>
                <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Teacher</span>
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                        <User size={16} className="text-indigo-500" />
                        {session.teacher}
                    </div>
                </div>
                <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Subject</span>
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                        <BookOpen size={16} className="text-indigo-500" />
                        {session.subject}
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Attendance Summary */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <User size={18} className="text-gray-500" /> Attendance Summary
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Attendance Rate</span>
                            <span className="font-bold text-gray-900">{session.attendance}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                            <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: session.status === 'Cancelled' ? '0%' : session.attendance }}
                            ></div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="bg-white p-2 rounded border border-gray-100">
                                <span className="block text-green-600 font-bold text-lg">22</span>
                                <span className="text-gray-400">Present</span>
                            </div>
                            <div className="bg-white p-2 rounded border border-gray-100">
                                <span className="block text-red-500 font-bold text-lg">2</span>
                                <span className="text-gray-400">Absent</span>
                            </div>
                            <div className="bg-white p-2 rounded border border-gray-100">
                                <span className="block text-orange-500 font-bold text-lg">1</span>
                                <span className="text-gray-400">Late</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lesson Logs */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText size={18} className="text-gray-500" /> Lesson Logs
                    </h4>
                    <div className="space-y-3">
                        <div>
                            <span className="text-xs font-semibold text-gray-400 block">Topic Covered</span>
                            <p className="text-sm text-gray-800">Introduction to Algebra: Variables and Constants</p>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-gray-400 block">Teacher Remarks</span>
                            <p className="text-sm text-gray-600 italic">"Class was interactive. Students grasped the concept of variables well. Need to revisit constants next lesson."</p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default SessionDetailsModal;
