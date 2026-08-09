import React, { useState } from 'react';
import { X, Calendar, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const RequestLeaveModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock submission
        toast.success("Leave request submitted successfully");
        onClose();
        setFormData({ leaveType: '', startDate: '', endDate: '', reason: '' });
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
                >
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <PenTool size={18} className="text-blue-600" /> Request Leave
                        </h3>
                        <button onClick={onClose} className="btn btn-light rounded-circle p-2 text-secondary">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="form-label fw-semibold text-secondary">Leave Type</label>
                            <select
                                className="form-select"
                                value={formData.leaveType}
                                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                                required
                            >
                                <option value="">Select type...</option>
                                <option value="Annual">Annual Leave</option>
                                <option value="Sick">Sick Leave</option>
                                <option value="Compassionate">Compassionate Leave</option>
                                <option value="Maternity/Paternity">Maternity/Paternity Leave</option>
                            </select>
                        </div>

                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label fw-semibold text-secondary">Start Date</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0">
                                        <Calendar size={16} className="text-secondary" />
                                    </span>
                                    <input
                                        type="date"
                                        className="form-control border-start-0 ps-0"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold text-secondary">End Date</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0">
                                        <Calendar size={16} className="text-secondary" />
                                    </span>
                                    <input
                                        type="date"
                                        className="form-control border-start-0 ps-0"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="form-label fw-semibold text-secondary">Reason</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                placeholder="Please provide a brief reason..."
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                required
                            ></textarea>
                        </div>

                        <div className="pt-3 d-flex gap-2 justify-content-end">
                            <button type="button" onClick={onClose} className="btn btn-outline-secondary">
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary px-4">
                                Submit Request
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RequestLeaveModal;

