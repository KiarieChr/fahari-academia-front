import React from 'react';
import { X, Play, Save, Clock, BookOpen, User } from 'lucide-react';

const StartSessionModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Start Class Session</h2>
                        <p className="text-sm text-gray-500">Initialize a new lesson for a class.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <form className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Class</label>
                            <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white">
                                <option>Select Class...</option>
                                <option>Grade 4 East</option>
                                <option>Grade 5 West</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Subject</label>
                            <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white">
                                <option>Select Subject...</option>
                                <option>Mathematics</option>
                                <option>English</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Lesson Topic</label>
                        <div className="relative">
                            <BookOpen size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm placeholder:text-gray-300"
                                placeholder="e.g. Introduction to Algebra"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Teacher</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                <input
                                    type="text"
                                    defaultValue="Current User"
                                    readOnly
                                    className="w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-50 text-gray-500 outline-none text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Duration</label>
                            <div className="relative">
                                <Clock size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                <input
                                    type="text"
                                    defaultValue="40 Mins"
                                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Notes / Remarks</label>
                        <textarea
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[80px]"
                            placeholder="Optional notes for this session..."
                        ></textarea>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                        <button
                            type="button"
                            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center gap-2"
                        >
                            <Save size={16} /> Save Draft
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 bg-indigo-600 text-black rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm shadow-indigo-200 flex items-center gap-2"
                        >
                            <Play size={16} /> Start Session
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StartSessionModal;
