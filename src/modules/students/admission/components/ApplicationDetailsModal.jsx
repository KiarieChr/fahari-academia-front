import React from 'react';
import { Calendar, User, BookOpen, School, Phone, Users } from 'lucide-react';
import Modal from '../../../../components/common/Modal';

const ApplicationDetailsModal = ({ app, onClose }) => {
    if (!app) return null;

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                        <User className="text-indigo-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{app.first_name} {app.last_name}</h2>
                        <p className="text-sm text-gray-500 font-normal">Application #: {app.id}</p>
                    </div>
                </div>
            }
            size="lg"
            footer={
                <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors">
                    Close
                </button>
            }
        >
            <div className="space-y-6">
                {/* Status Badge */}
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="text-sm text-gray-600 font-medium">Current Application Status</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${app.application_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        app.application_status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {app.application_status}
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Personal Info */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <User size={14} /> Personal Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                            <div>
                                <span className="block text-gray-500 text-xs mb-0.5">Full Name</span>
                                <span className="font-medium text-gray-900">{app.first_name} {app.last_name}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 text-xs mb-0.5">Gender</span>
                                <span className="font-medium text-gray-900">{app.gender || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 text-xs mb-0.5">Date of Birth</span>
                                <span className="font-medium text-gray-900">{app.dob || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 text-xs mb-0.5">Application Date</span>
                                <span className="font-medium text-gray-900 flex items-center gap-1">
                                    <Calendar size={12} className="text-gray-400" /> {new Date(app.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Academic Info */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <BookOpen size={14} /> Academic Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                            <div>
                                <span className="block text-gray-500 text-xs mb-0.5">Applied Class</span>
                                <span className="font-medium text-gray-900">{app.grade_name || '-'}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 text-xs mb-0.5">Curriculum</span>
                                <span className="font-medium text-gray-900">{app.curriculum_name || 'N/A'}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="block text-gray-500 text-xs mb-0.5">Previous School</span>
                                <div className="flex items-center gap-2">
                                    <School size={14} className="text-gray-400" />
                                    <span className="font-medium text-gray-900">{app.previous_school || 'Not Specified'}</span>
                                </div>
                            </div>
                            {app.score && (
                                <div>
                                    <span className="block text-gray-500 text-xs mb-0.5">Entry Score</span>
                                    <span className="font-medium text-gray-900 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs inline-block border border-indigo-100">{app.score}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Guardian Info */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Users size={14} /> Guardian Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                            <div className="col-span-2">
                                <span className="block text-gray-500 text-xs mb-0.5">Primary Guardian</span>
                                <span className="font-medium text-gray-900">{app.guardian_name || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 text-xs mb-0.5">Phone Number</span>
                                <span className="font-medium text-gray-900 flex items-center gap-1">
                                    <Phone size={12} className="text-gray-400" /> {app.guardian_phone || 'N/A'}
                                </span>
                            </div>
                            <div>
                                <span className="block text-gray-500 text-xs mb-0.5">Email</span>
                                <span className="font-medium text-gray-900">{app.guardian_email || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ApplicationDetailsModal;
