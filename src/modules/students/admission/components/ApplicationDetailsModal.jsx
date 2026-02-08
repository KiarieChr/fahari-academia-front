import React from 'react';
import { X, Calendar, User, BookOpen, School, Phone, Users, FileText } from 'lucide-react';

const ApplicationDetailsModal = ({ app, onClose }) => {
    if (!app) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <User className="text-indigo-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{app.first_name} {app.last_name}</h2>
                            <p className="text-sm text-gray-500">Application #: {app.id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    {/* Status Badge */}
                    <div className="mb-6 flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="text-sm text-gray-500">Current Status</div>
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
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-gray-500 text-xs">Full Name</span>
                                    <span className="font-medium text-gray-900">{app.first_name} {app.last_name}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-xs">Gender</span>
                                    <span className="font-medium text-gray-900">{app.gender || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-xs">Date of Birth</span>
                                    <span className="font-medium text-gray-900">{app.dob || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-xs">Application Date</span>
                                    <span className="font-medium text-gray-900 flex items-center gap-1">
                                        <Calendar size={12} className="text-gray-400" /> {new Date(app.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Academic Info */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <BookOpen size={14} /> Academic Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-gray-500 text-xs">Applied Class</span>
                                    <span className="font-medium text-gray-900">{app.grade_name || '-'}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-xs">Curriculum</span>
                                    <span className="font-medium text-gray-900">{app.curriculum_name || 'N/A'}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="block text-gray-500 text-xs">Previous School</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <School size={14} className="text-gray-400" />
                                        <span className="font-medium text-gray-900">{app.previous_school || 'Not Specified'}</span>
                                    </div>
                                </div>
                                {app.score && (
                                    <div>
                                        <span className="block text-gray-500 text-xs">Entry Score</span>
                                        <span className="font-medium text-gray-900 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs">{app.score}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Guardian Info */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Users size={14} /> Guardian Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="col-span-2">
                                    <span className="block text-gray-500 text-xs">Primary Guardian</span>
                                    <span className="font-medium text-gray-900">{app.guardian_name || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-xs">Phone Number</span>
                                    <span className="font-medium text-gray-900 flex items-center gap-1">
                                        <Phone size={12} className="text-gray-400" /> {app.guardian_phone || 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-xs">Email</span>
                                    <span className="font-medium text-gray-900">{app.guardian_email || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetailsModal;
