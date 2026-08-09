// src/modules/hr/StaffRegisterV2.jsx
// Modern Staff Register using enterprise UI component library
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Plus,
    Download,
    Upload,
    Mail,
    Phone,
    Building,
    Briefcase,
    Calendar,
    User,
    Edit,
    Trash2,
    Eye,
    Users,
    FileSpreadsheet,
    X,
    AlertCircle,
    FileText,
    Loader2,
    MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import DashboardLayout from '../../dashboard/DashboardLayout';
import StatCardMini from '../../dashboard/components/StatCardMini';
import '../../dashboard/dashboard.css';
import {
    DataTable,
    PageHeader,
    Avatar,
    Card,
    ConfirmDialog,
    EmptyState
} from '../../components/ui';
import { CardGridSkeleton } from '../../components/ui/LoadingSkeleton';

// Employee Form Modal Component
const EmployeeFormModal = ({
    isOpen,
    onClose,
    employee,
    departments,
    jobTitles,
    campuses,
    onSubmit
}) => {
    const [formData, setFormData] = useState({
        employee_no: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        official_email: '',
        personal_email: '',
        phone_primary: '',
        phone_secondary: '',
        date_of_birth: '',
        gender: 'male',
        marital_status: 'single',
        national_id: '',
        passport_number: '',
        employee_category: 'teaching',
        payroll_type: 'monthly',
        employment_status: 'active',
        hire_date: '',
        confirmation_date: '',
        termination_date: '',
        department_id: '',
        job_title_id: '',
        campus_id: '',
        employment_type: 'full_time',
        assignment_type: 'permanent',
        create_user_account: false
    });
    const [isShaking, setIsShaking] = useState(false);

    useEffect(() => {
        if (employee) {
            setFormData({
                employee_no: employee.employee_no || '',
                first_name: employee.first_name || '',
                middle_name: employee.middle_name || '',
                last_name: employee.last_name || '',
                official_email: employee.official_email || employee.email || '',
                personal_email: employee.personal_email || '',
                phone_primary: employee.phone_primary || employee.phone || '',
                phone_secondary: employee.phone_secondary || '',
                date_of_birth: employee.date_of_birth || '',
                gender: employee.gender || 'male',
                marital_status: employee.marital_status || 'single',
                national_id: employee.national_id || '',
                passport_number: employee.passport_number || '',
                employee_category: employee.employee_category || 'teaching',
                payroll_type: employee.payroll_type || 'monthly',
                employment_status: employee.employment_status || 'active',
                hire_date: employee.hire_date || '',
                confirmation_date: employee.confirmation_date || '',
                termination_date: employee.termination_date || '',
                department_id: employee.department?.id || employee.department_id || '',
                job_title_id: employee.job_title?.id || employee.job_title_id || '',
                campus_id: employee.campus?.id || employee.campus_id || employee.campus || '',
                employment_type: employee.employment_type || 'full_time',
                assignment_type: employee.assignment_type || 'permanent'
            });
        } else {
            setFormData({
                employee_no: '',
                first_name: '',
                middle_name: '',
                last_name: '',
                official_email: '',
                personal_email: '',
                phone_primary: '',
                phone_secondary: '',
                date_of_birth: '',
                gender: 'male',
                marital_status: 'single',
                national_id: '',
                passport_number: '',
                employee_category: 'teaching',
                payroll_type: 'monthly',
                employment_status: 'active',
                hire_date: '',
                confirmation_date: '',
                termination_date: '',
                department_id: '',
                job_title_id: '',
                campus_id: '',
                employment_type: 'full_time',
                assignment_type: 'permanent',
                create_user_account: false
            });
        }
    }, [employee, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData, employee?.id);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleOverlayClick}
            >
                <motion.div
                    className={`bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden ${isShaking ? 'animate-shake' : ''}`}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {employee ? 'Edit Employee' : 'Add New Employee'}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {employee ? 'Update employee information' : 'Enter employee details below'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Modal Body */}
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                            {/* Section: Basic Information */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={formData.employee_no}
                                            onChange={(e) => setFormData({ ...formData, employee_no: e.target.value })}
                                            required
                                            disabled={!!employee}
                                            placeholder="EMP001"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                            required
                                            placeholder="John"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={formData.middle_name}
                                            onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                                            placeholder="Michael"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={formData.last_name}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                            required
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Contact Information */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Contact Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Official Email *</label>
                                        <input
                                            type="email"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={formData.official_email}
                                            onChange={(e) => setFormData({ ...formData, official_email: e.target.value })}
                                            required
                                            placeholder="john.doe@company.com"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Personal Email</label>
                                        <input
                                            type="email"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={formData.personal_email}
                                            onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
                                            placeholder="john@personal.com"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Primary Phone *</label>
                                        <input
                                            type="tel"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={formData.phone_primary}
                                            onChange={(e) => setFormData({ ...formData, phone_primary: e.target.value })}
                                            required
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Phone</label>
                                        <input
                                            type="tel"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={formData.phone_secondary}
                                            onChange={(e) => setFormData({ ...formData, phone_secondary: e.target.value })}
                                            placeholder="+1 (555) 000-0001"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Personal Details */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Personal Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={formData.date_of_birth}
                                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            required
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={formData.marital_status}
                                            onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                                        >
                                            <option value="single">Single</option>
                                            <option value="married">Married</option>
                                            <option value="divorced">Divorced</option>
                                            <option value="widowed">Widowed</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">National ID *</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={formData.national_id}
                                            onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                                            required
                                            placeholder="ID Number"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Employment Information */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" />
                                    Employment Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={formData.department_id}
                                            onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(dept => (
                                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Campus</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={formData.campus_id}
                                            onChange={(e) => setFormData({ ...formData, campus_id: e.target.value })}
                                        >
                                            <option value="">Select Campus</option>
                                            {campuses.map(campus => (
                                                <option key={campus.id} value={campus.id}>{campus.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={formData.job_title_id}
                                            onChange={(e) => setFormData({ ...formData, job_title_id: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Job Title</option>
                                            {jobTitles.map(job => (
                                                <option key={job.id} value={job.id}>{job.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee Category *</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={formData.employee_category}
                                            onChange={(e) => setFormData({ ...formData, employee_category: e.target.value })}
                                            required
                                        >
                                            <option value="teaching">Teaching Staff</option>
                                            <option value="non_teaching">Non-Teaching Staff</option>
                                            <option value="contract">Contract Staff</option>
                                            <option value="casual">Casual Worker</option>
                                            <option value="visiting">Visiting Faculty</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type *</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={formData.employment_type}
                                            onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                                            required
                                        >
                                            <option value="full_time">Full-Time</option>
                                            <option value="part_time">Part-Time</option>
                                            <option value="visiting">Visiting</option>
                                            <option value="adjunct">Adjunct</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status *</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={formData.employment_status}
                                            onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}
                                            required
                                        >
                                            <option value="active">Active</option>
                                            <option value="probation">On Probation</option>
                                            <option value="suspended">Suspended</option>
                                            <option value="terminated">Terminated</option>
                                            <option value="resigned">Resigned</option>
                                            <option value="retired">Retired</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Payroll Type *</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={formData.payroll_type}
                                            onChange={(e) => setFormData({ ...formData, payroll_type: e.target.value })}
                                            required
                                        >
                                            <option value="monthly">Monthly</option>
                                            <option value="hourly">Hourly</option>
                                            <option value="contract">Contract</option>
                                            <option value="daily">Daily</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Dates */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Important Dates
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date *</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={formData.hire_date}
                                            onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={formData.confirmation_date}
                                            onChange={(e) => setFormData({ ...formData, confirmation_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Termination Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            value={formData.termination_date}
                                            onChange={(e) => setFormData({ ...formData, termination_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: User Account */}
                            {!employee && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.create_user_account}
                                            onChange={(e) => setFormData({ ...formData, create_user_account: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <div>
                                            <span className="text-sm font-semibold text-emerald-800">Create Login Account</span>
                                            <p className="text-xs text-emerald-600 mt-0.5">
                                                Automatically create a user account so this employee can log in. A temporary password will be generated.
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                                {employee ? 'Update Employee' : 'Add Employee'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Employee View Modal Component
const EmployeeViewModal = ({ isOpen, onClose, employee, onEdit }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (!isOpen || !employee) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Profile Header */}
                    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-4">
                            <Avatar
                                name={`${employee.first_name} ${employee.last_name}`}
                                size="xl"
                                className="ring-4 ring-white/30"
                            />
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    {employee.full_name || `${employee.first_name} ${employee.last_name}`}
                                </h2>
                                <p className="text-blue-100">{employee.job_title?.title || 'N/A'}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-sm text-blue-100 bg-white/20 px-2 py-1 rounded">
                                        {employee.employee_no || `EMP${String(employee.id).padStart(4, '0')}`}
                                    </span>
                                    <StatusBadge status={employee.employment_status} type="employment" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Body */}
                    <div className="p-8 overflow-y-auto max-h-[calc(90vh-250px)]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Information */}
                            <Card className="p-5">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-600" />
                                    Personal Information
                                </h3>
                                <div className="space-y-3">
                                    <InfoRow label="Date of Birth" value={formatDate(employee.date_of_birth)} />
                                    <InfoRow label="Gender" value={employee.gender?.charAt(0).toUpperCase() + employee.gender?.slice(1)} />
                                    <InfoRow label="Marital Status" value={employee.marital_status?.charAt(0).toUpperCase() + employee.marital_status?.slice(1)} />
                                    <InfoRow label="National ID" value={employee.national_id} />
                                    <InfoRow label="Passport" value={employee.passport_number} />
                                </div>
                            </Card>

                            {/* Contact Information */}
                            <Card className="p-5">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-600" />
                                    Contact Information
                                </h3>
                                <div className="space-y-3">
                                    <InfoRow label="Official Email" value={employee.official_email || employee.email} />
                                    <InfoRow label="Personal Email" value={employee.personal_email} />
                                    <InfoRow label="Primary Phone" value={employee.phone_primary || employee.phone} />
                                    <InfoRow label="Secondary Phone" value={employee.phone_secondary} />
                                </div>
                            </Card>

                            {/* Employment Details */}
                            <Card className="p-5">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-blue-600" />
                                    Employment Details
                                </h3>
                                <div className="space-y-3">
                                    <InfoRow label="Department" value={employee.department?.name} />
                                    <InfoRow label="Job Title" value={employee.job_title?.title} />
                                    <InfoRow label="Category" value={employee.employee_category?.replace('_', ' ')} />
                                    <InfoRow label="Employment Type" value={employee.employment_type?.replace('_', ' ')} />
                                    <InfoRow label="Payroll Type" value={employee.payroll_type} />
                                </div>
                            </Card>

                            {/* Important Dates */}
                            <Card className="p-5">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-600" />
                                    Important Dates
                                </h3>
                                <div className="space-y-3">
                                    <InfoRow label="Hire Date" value={formatDate(employee.hire_date)} />
                                    <InfoRow label="Confirmation Date" value={formatDate(employee.confirmation_date)} />
                                    {employee.termination_date && (
                                        <InfoRow label="Termination Date" value={formatDate(employee.termination_date)} />
                                    )}
                                    <InfoRow label="Created" value={formatDate(employee.created_at)} />
                                    <InfoRow label="Last Updated" value={formatDate(employee.updated_at)} />
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => {
                                onEdit(employee);
                                onClose();
                            }}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Employee
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Info Row Component for View Modal
const InfoRow = ({ label, value }) => (
    <div className="flex justify-between text-sm">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-900">{value || 'N/A'}</span>
    </div>
);

// Excel Upload Modal Component
const ExcelUploadModal = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [dragOver, setDragOver] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && isValidFile(droppedFile)) {
            setFile(droppedFile);
            setUploadResult(null);
        } else {
            toast.error('Please upload a valid Excel file (.xlsx, .xls)');
        }
    };

    const isValidFile = (file) => {
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/excel',
            'application/x-excel'
        ];
        const validExtensions = ['.xlsx', '.xls'];
        const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        return validTypes.includes(file.type) || validExtensions.includes(extension);
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && isValidFile(selectedFile)) {
            setFile(selectedFile);
            setUploadResult(null);
        } else if (selectedFile) {
            toast.error('Please upload a valid Excel file (.xlsx, .xls)');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file first');
            return;
        }

        setUploading(true);
        setUploadResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/workforce/api/employees/bulk-import/', formData);

            setUploadResult({
                success: true,
                message: response.message || 'Import completed successfully',
                imported: response.imported || 0,
                failed: response.failed || 0,
                errors: response.errors || []
            });

            toast.success(`Successfully imported ${response.imported || 0} employees`);

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Upload error:', error);
            const errData = error.response?.data;
            const errMsg = errData?.message || errData?.error || error.message || 'Upload failed';
            setUploadResult({
                success: false,
                message: errMsg,
                errors: errData?.errors || (errData?.error ? [errData.error] : [])
            });
            toast.error(errMsg);
        } finally {
            setUploading(false);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get('/workforce/api/employees/download-template/', {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'employee_import_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error('Failed to download template');
        }
    };

    const resetModal = () => {
        setFile(null);
        setUploadResult(null);
        setUploading(false);
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
            >
                <motion.div
                    className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Import Employees</h2>
                                <p className="text-sm text-gray-500">Upload an Excel file to bulk import</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4">
                        {/* Download Template Button */}
                        <button
                            onClick={handleDownloadTemplate}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Download Import Template
                        </button>

                        {/* Drop Zone */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragOver
                                ? 'border-green-500 bg-green-50'
                                : file
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                        >
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileSelect}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {file ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-center gap-2 text-green-600">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <p className="font-medium text-gray-900">{file.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                            setUploadResult(null);
                                        }}
                                        className="text-sm text-red-600 hover:text-red-700"
                                    >
                                        Remove file
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-center">
                                        <Upload className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600">
                                        <span className="font-medium text-green-600">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-sm text-gray-500">Excel files only (.xlsx, .xls)</p>
                                </div>
                            )}
                        </div>

                        {/* Upload Result */}
                        {uploadResult && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-lg ${uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    {uploadResult.success ? (
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                        <p className={`font-medium ${uploadResult.success ? 'text-green-800' : 'text-red-800'}`}>
                                            {uploadResult.message}
                                        </p>
                                        {uploadResult.success && (
                                            <p className="text-sm text-green-600 mt-1">
                                                Imported: {uploadResult.imported} | Failed: {uploadResult.failed}
                                            </p>
                                        )}
                                        {uploadResult.errors?.length > 0 && (
                                            <div className="mt-2 max-h-24 overflow-y-auto">
                                                {uploadResult.errors.slice(0, 5).map((error, index) => (
                                                    <p key={index} className="text-sm text-red-600">
                                                        • {error}
                                                    </p>
                                                ))}
                                                {uploadResult.errors.length > 5 && (
                                                    <p className="text-sm text-red-600">
                                                        ...and {uploadResult.errors.length - 5} more errors
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <Upload className="w-4 h-4" />
                                    </motion.div>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Upload & Import
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Main Staff Register Component
const StaffRegisterV2 = ({ noLayout = false }) => {
    // State
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [stats, setStats] = useState({
        total_employees: 0,
        teaching_staff: 0,
        non_teaching_staff: 0,
        on_leave: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        department: '',
        job_title: '',
        employment_status: '',
        employee_category: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [departments, setDepartments] = useState([]);
    const [jobTitles, setJobTitles] = useState([]);
    const [campuses, setCampuses] = useState([]);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, employee: null });
    const ITEMS_PER_PAGE = 50;

    // Fetch employees
    const fetchEmployees = useCallback(async () => {
        try {
            if (currentPage === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }
            const params = {
                page: currentPage,
                search: searchTerm,
                ...filters
            };

            Object.keys(params).forEach(key => {
                if (!params[key] || params[key] === '') delete params[key];
            });

            const response = await api.get('/workforce/api/employees/', { params });

            if (response.results) {
                setEmployees(prev => currentPage === 1 ? response.results : [...prev, ...response.results]);
                setTotalCount(response.count || 0);
                setTotalPages(Math.ceil((response.count || 0) / ITEMS_PER_PAGE));
            } else {
                setEmployees(Array.isArray(response) ? response : []);
                setTotalCount(Array.isArray(response) ? response.length : 0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast.error('Failed to load employees');
            if (currentPage === 1) setEmployees([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [currentPage, searchTerm, filters]);

    // Fetch stats
    const fetchStats = useCallback(async () => {
        try {
            const response = await api.get('/workforce/api/employees/statistics/');
            setStats(response);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, []);

    // Fetch departments
    const fetchDepartments = useCallback(async () => {
        try {
            const response = await api.get('/workforce/api/departments/');
            setDepartments(Array.isArray(response) ? response : response.results || []);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    }, []);

    // Fetch job titles
    const fetchJobTitles = useCallback(async () => {
        try {
            const response = await api.get('/workforce/api/job-titles/');
            setJobTitles(Array.isArray(response) ? response : response.results || []);
        } catch (error) {
            console.error('Error fetching job titles:', error);
        }
    }, []);

    // Fetch campuses
    const fetchCampuses = useCallback(async () => {
        try {
            const response = await api.get('/workforce/api/campuses/');
            setCampuses(Array.isArray(response) ? response : response.results || []);
        } catch (error) {
            console.error('Error fetching campuses:', error);
        }
    }, []);

    // Initial data fetch
    useEffect(() => {
        fetchDepartments();
        fetchJobTitles();
        fetchCampuses();
        fetchStats();
    }, [fetchDepartments, fetchJobTitles, fetchCampuses, fetchStats]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    // Handle search
    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        setCurrentPage(1);
    }, []);

    // Handle filter change
    const handleFilterChange = useCallback((filterKey, value) => {
        setFilters(prev => ({ ...prev, [filterKey]: value }));
        setCurrentPage(1);
    }, []);

    // Handle page change
    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    // Handle form submit
    const handleFormSubmit = async (formData, employeeId) => {
        try {
            const { create_user_account, ...employeeData } = formData;
            const payload = {
                ...employeeData,
                email: employeeData.official_email,
                phone: employeeData.phone_primary,
                employment_date: employeeData.hire_date,
                status: employeeData.employment_status
            };

            let createdEmployee;
            if (employeeId) {
                await api.put(`/workforce/api/employees/${employeeId}/`, payload);
                toast.success('Employee updated successfully');
            } else {
                createdEmployee = await api.post('/workforce/api/employees/', payload);
                toast.success('Employee added successfully');
            }

            // Create user account if toggled on (new employees only)
            if (create_user_account && !employeeId && createdEmployee?.id) {
                try {
                    const userResult = await api.post(`/workforce/api/employees/${createdEmployee.id}/create-user-account/`);
                    toast.success(
                        `Login account created — Username: ${userResult.username}, Password: ${userResult.password}`,
                        { autoClose: 15000 }
                    );
                } catch (userError) {
                    const msg = userError.data?.error || userError.message || 'Failed to create login account';
                    toast.warning(`Employee saved but: ${msg}`);
                }
            }

            setShowFormModal(false);
            setSelectedEmployee(null);
            fetchEmployees();
            fetchStats();
        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                Object.values(error.response?.data || {}).flat().join(', ') ||
                'Failed to save employee';
            toast.error(errorMessage);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!deleteConfirm.employee) return;

        try {
            await api.delete(`/workforce/api/employees/${deleteConfirm.employee.id}/`);
            toast.success('Employee deleted successfully');
            fetchEmployees();
            fetchStats();
        } catch (error) {
            toast.error('Failed to delete employee');
        } finally {
            setDeleteConfirm({ open: false, employee: null });
        }
    };

    // Handle export
    const handleExport = useCallback((format) => {
        toast.info(`Exporting as ${format}...`);
        // Implement export logic here
    }, []);

    // Handle inline edit save
    const handleInlineEditSave = async (id, key, value) => {
        try {
            const employee = employees.find(e => e.id === id);
            if (!employee) return;
            
            let payload = { ...employee };
            if (key === 'email') {
                payload.official_email = value;
                payload.email = value;
            } else if (key === 'phone') {
                payload.phone_primary = value;
                payload.phone = value;
            } else {
                payload[key] = value;
            }

            await api.put(`/workforce/api/employees/${id}/`, payload);
            toast.success('Employee updated');
            fetchEmployees();
        } catch (error) {
            toast.error('Failed to update employee');
        }
    };

    // Table columns definition
    const columns = useMemo(() => [
        {
            key: 'email',
            label: 'Employee',
            sortable: true,
            editable: true,
            render: (_, row) => (
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Avatar name={`${row.first_name || ''} ${row.last_name || ''}`} size="md" />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${row.employment_status === 'active' ? 'bg-emerald-500' :
                                row.employment_status === 'probation' ? 'bg-amber-500' :
                                    row.employment_status === 'suspended' ? 'bg-red-500' : 'bg-gray-400'
                            }`} />
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                            {row.full_name || `${row.first_name || ''} ${row.last_name || ''}`}
                        </p>
                        <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {row.email || row.official_email || ''}
                        </p>
                    </div>
                </div>
            )
        },
        {
            key: 'employee_no',
            label: 'Employee ID',
            sortable: true,
            editable: true,
            render: (_, row) => (
                <span className="inline-flex items-center font-mono text-sm font-medium text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                    {row.employee_no || `EMP${String(row.id || 0).padStart(4, '0')}`}
                </span>
            )
        },
        {
            key: 'phone',
            label: 'Phone No',
            sortable: true,
            editable: true,
            render: (_, row) => (
                <div className="flex items-center gap-2 text-sm">
                    <div className="p-1.5 bg-emerald-50 rounded">
                        <Phone className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="font-medium text-gray-700">{row.phone || row.phone_primary || 'N/A'}</span>
                </div>
            )
        },
        {
            key: 'department',
            label: 'Department',
            sortable: true,
            render: (_, row) => (
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-slate-100 rounded-lg">
                        <Building className="w-4 h-4 text-slate-600" />
                    </div>
                    <span className="font-medium text-gray-700">{row.department?.name || 'Unassigned'}</span>
                </div>
            )
        },
        {
            key: 'job_title',
            label: 'Job Title',
            sortable: true,
            render: (_, row) => (
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-700">{row.job_title?.title || 'Not Assigned'}</span>
                </div>
            )
        },
        {
            key: 'employment_type',
            label: 'Type',
            render: (_, row) => {
                const typeStyles = {
                    'full_time': 'bg-blue-50 text-blue-700 border-blue-200',
                    'part_time': 'bg-purple-50 text-purple-700 border-purple-200',
                    'contract': 'bg-orange-50 text-orange-700 border-orange-200',
                    'visiting': 'bg-cyan-50 text-cyan-700 border-cyan-200',
                };
                const type = row.employment_type || 'full_time';
                return (
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${typeStyles[type] || typeStyles.full_time}`}>
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                );
            }
        },
        {
            key: 'employment_status',
            label: 'Status',
            sortable: true,
            render: (_, row) => {
                const statusConfig = {
                    'active': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Active' },
                    'probation': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Probation' },
                    'suspended': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Suspended' },
                    'terminated': { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500', label: 'Terminated' },
                    'resigned': { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500', label: 'Resigned' },
                    'retired': { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500', label: 'Retired' },
                };
                const config = statusConfig[row.employment_status] || statusConfig.active;
                return (
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                        <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
                        {config.label}
                    </span>
                );
            }
        }
    ], []);

    // Filter definitions
    const filterDefs = useMemo(() => [
        {
            key: 'department',
            label: 'Department',
            options: [
                { value: '', label: 'All Departments' },
                ...departments.map(d => ({ value: d.id.toString(), label: d.name }))
            ]
        },
        {
            key: 'employment_status',
            label: 'Status',
            options: [
                { value: '', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'probation', label: 'On Probation' },
                { value: 'suspended', label: 'Suspended' },
                { value: 'terminated', label: 'Terminated' },
                { value: 'resigned', label: 'Resigned' },
                { value: 'retired', label: 'Retired' }
            ]
        },
        {
            key: 'employee_category',
            label: 'Category',
            options: [
                { value: '', label: 'All Categories' },
                { value: 'teaching', label: 'Teaching Staff' },
                { value: 'non_teaching', label: 'Non-Teaching' },
                { value: 'contract', label: 'Contract' },
                { value: 'casual', label: 'Casual' }
            ]
        }
    ], [departments]);

    // Row actions - returns JSX for action buttons
    const rowActions = useCallback((row) => (
        <div className="relative group z-20 flex justify-end">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <MoreHorizontal className="w-5 h-5" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all overflow-hidden origin-top-right">
                <button onClick={() => { setSelectedEmployee(row); setShowViewModal(true); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" /> View Profile
                </button>
                <button onClick={() => { setSelectedEmployee(row); setShowFormModal(true); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 flex items-center gap-2">
                    <Edit className="w-4 h-4 text-gray-400" /> Edit Details
                </button>
                <div className="h-px bg-gray-100"></div>
                <button onClick={() => setDeleteConfirm({ open: true, employee: row })} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-400" /> Delete
                </button>
            </div>
        </div>
    ), []);

    const content = (
        <div className="space-y-8 pb-8">
                {/* Page Header */}
                <PageHeader
                    title="Staff Register"
                    subtitle={`Managing ${totalCount} employee${totalCount !== 1 ? 's' : ''} across all departments`}
                    icon={Users}
                    actions={
                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowUploadModal(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25 font-medium"
                            >
                                <Upload className="w-4 h-4" />
                                Import Excel
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setSelectedEmployee(null);
                                    setShowFormModal(true);
                                }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Add Employee
                            </motion.button>
                        </div>
                    }
                />

                {/* Stats Cards */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, staggerChildren: 0.1 }}
                >
                    <motion.div 
                        className="mini-stat-card-premium relative overflow-hidden group cursor-pointer"
                        whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="card-top relative z-10">
                            <div className="stat-icon-glow" style={{ '--icon-color': '#1976d2', '--icon-bg': '#e3f2fd' }}>
                                <Users size={16} />
                            </div>
                            <span className="stat-label-modern">Total Employees</span>
                        </div>
                        <div className="card-bottom mt-2 relative z-10">
                            {loading ? (
                                <div className="h-8 flex items-center">
                                    <Loader2 className="animate-spin text-slate-300" size={20} />
                                </div>
                            ) : (
                                <div className="stat-value-large">{stats.total_employees}</div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div 
                        className="mini-stat-card-premium relative overflow-hidden group cursor-pointer"
                        whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="card-top relative z-10">
                            <div className="stat-icon-glow" style={{ '--icon-color': '#059669', '--icon-bg': '#d1fae5' }}>
                                <Briefcase size={16} />
                            </div>
                            <span className="stat-label-modern">Teaching Staff</span>
                        </div>
                        <div className="card-bottom mt-2 relative z-10">
                            {loading ? (
                                <div className="h-8 flex items-center">
                                    <Loader2 className="animate-spin text-slate-300" size={20} />
                                </div>
                            ) : (
                                <div className="stat-value-large">{stats.teaching_staff}</div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div 
                        className="mini-stat-card-premium relative overflow-hidden group cursor-pointer"
                        whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="card-top relative z-10">
                            <div className="stat-icon-glow" style={{ '--icon-color': '#ea580c', '--icon-bg': '#ffedd5' }}>
                                <Building size={16} />
                            </div>
                            <span className="stat-label-modern">Non-Teaching</span>
                        </div>
                        <div className="card-bottom mt-2 relative z-10">
                            {loading ? (
                                <div className="h-8 flex items-center">
                                    <Loader2 className="animate-spin text-slate-300" size={20} />
                                </div>
                            ) : (
                                <div className="stat-value-large">{stats.non_teaching_staff}</div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div 
                        className="mini-stat-card-premium relative overflow-hidden group cursor-pointer"
                        whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="card-top relative z-10">
                            <div className="stat-icon-glow" style={{ '--icon-color': '#9333ea', '--icon-bg': '#f3e8ff' }}>
                                <AlertCircle size={16} />
                            </div>
                            <span className="stat-label-modern">On Leave</span>
                        </div>
                        <div className="card-bottom mt-2 relative z-10">
                            {loading ? (
                                <div className="h-8 flex items-center">
                                    <Loader2 className="animate-spin text-slate-300" size={20} />
                                </div>
                            ) : (
                                <div className="stat-value-large">{stats.on_leave}</div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>

                {/* Data Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                >
                    <DataTable
                        columns={columns}
                        data={employees}
                        loading={loading}
                        loadingMore={loadingMore}
                        hasMore={currentPage < totalPages}
                        onLoadMore={() => {
                            if (currentPage < totalPages && !loading && !loadingMore) {
                                setCurrentPage(prev => prev + 1);
                            }
                        }}
                        pagination={{
                            currentPage,
                            totalPages,
                            totalCount,
                            pageSize: ITEMS_PER_PAGE
                        }}
                        onPageChange={handlePageChange}
                        onSearch={handleSearch}
                        searchPlaceholder="Search by name, ID, email, department..."
                        filters={filterDefs}
                        onFilter={handleFilterChange}
                        activeFilters={filters}
                        onExport={handleExport}
                        onEditSave={handleInlineEditSave}
                        exportFormats={['csv', 'excel', 'pdf']}
                        rowActions={rowActions}
                        hoverable={true}
                        striped={false}
                        emptyState={{
                            icon: Users,
                            title: 'No employees found',
                            description: 'Get started by adding your first employee or importing from an Excel file.',
                            action: {
                                label: 'Add First Employee',
                                onClick: () => {
                                    setSelectedEmployee(null);
                                    setShowFormModal(true);
                                }
                            }
                        }}
                    />
                </motion.div>

                {/* Modals */}
                <EmployeeFormModal
                    isOpen={showFormModal}
                    onClose={() => {
                        setShowFormModal(false);
                        setSelectedEmployee(null);
                    }}
                    employee={selectedEmployee}
                    departments={departments}
                    jobTitles={jobTitles}
                    campuses={campuses}
                    onSubmit={handleFormSubmit}
                />

                <EmployeeViewModal
                    isOpen={showViewModal}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedEmployee(null);
                    }}
                    employee={selectedEmployee}
                    onEdit={(emp) => {
                        setSelectedEmployee(emp);
                        setShowFormModal(true);
                    }}
                />

                <ExcelUploadModal
                    isOpen={showUploadModal}
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={() => {
                        fetchEmployees();
                        fetchStats();
                    }}
                />

                <ConfirmDialog
                    open={deleteConfirm.open}
                    onClose={() => setDeleteConfirm({ open: false, employee: null })}
                    onConfirm={handleDelete}
                    title="Delete Employee"
                    message={`Are you sure you want to delete ${deleteConfirm.employee?.full_name || deleteConfirm.employee?.first_name}? This action cannot be undone.`}
                    variant="danger"
                />
        </div>
    );

    if (noLayout) {
        return content;
    }

    return (
        <DashboardLayout title="Staff Register">
            {content}
        </DashboardLayout>
    );
};

export default StaffRegisterV2;
