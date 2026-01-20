
// src/pages/hr/StaffRegister.jsx
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  Calendar,
  User,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import DashboardLayout from '../../dashboard/DashboardLayout';
import './StaffRegister.css';

const StaffRegister = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    jobTitle: '',
    status: 'active',
    category: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employee_no: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'male',
    marital_status: 'single',
    national_id: '',
    nationality: '',
    department_id: '',
    job_title_id: '',
    employment_date: '',
    employment_type: 'full_time',
    status: 'active'
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        search: searchTerm,
        ...filters
      };
      const response = await api.get('/api/hr/employees/', { params });
      setEmployees(response.data.results);
      setTotalPages(Math.ceil(response.data.count / 10));
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/api/hr/departments/');
      setDepartments(response.data);
    } catch (error) {
      console.error('Failed to fetch departments');
    }
  };

  const fetchJobTitles = async () => {
    try {
      const response = await api.get('/api/hr/job-titles/');
      setJobTitles(response.data);
    } catch (error) {
      console.error('Failed to fetch job titles');
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchJobTitles();
  }, [currentPage, filters, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const handleEditEmployee = (employee) => {
    setFormData({
      employee_no: employee.employee_no,
      first_name: employee.first_name,
      middle_name: employee.middle_name || '',
      last_name: employee.last_name,
      email: employee.email,
      phone: employee.phone,
      date_of_birth: employee.date_of_birth,
      gender: employee.gender,
      marital_status: employee.marital_status,
      national_id: employee.national_id,
      nationality: employee.nationality,
      department_id: employee.department?.id || '',
      job_title_id: employee.job_title?.id || '',
      employment_date: employee.employment_date,
      employment_type: employee.employment_type,
      status: employee.status
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedEmployee?.id) {
        await api.put(`/api/hr/employees/${selectedEmployee.id}/`, formData);
        toast.success('Employee updated successfully');
      } else {
        await api.post('/api/hr/employees/', formData);
        toast.success('Employee added successfully');
      }
      setShowAddModal(false);
      fetchEmployees();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save employee');
    }
  };

  const resetForm = () => {
    setFormData({
      employee_no: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      gender: 'male',
      marital_status: 'single',
      national_id: '',
      nationality: '',
      department_id: '',
      job_title_id: '',
      employment_date: '',
      employment_type: 'full_time',
      status: 'active'
    });
    setSelectedEmployee(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: <XCircle size={14} /> },
      suspended: { color: 'bg-red-100 text-red-800', icon: <Clock size={14} /> },
      terminated: { color: 'bg-red-100 text-red-800', icon: <XCircle size={14} /> }
    };

    const config = statusConfig[status] || statusConfig.inactive;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getEmploymentTypeColor = (type) => {
    const colors = {
      full_time: 'bg-blue-100 text-blue-800',
      part_time: 'bg-purple-100 text-purple-800',
      contract: 'bg-orange-100 text-orange-800',
      casual: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout title="Staff Register">
      <div className="staff-register">
        {/* Header */}
        <div className="register-header">

          <div>
            <h1 className="page-title">Staff Register</h1>
            <p className="page-subtitle">Manage employee records and information</p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={18} />
              Add Employee
            </button>
            <button className="btn btn-secondary">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="filters-section">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search employees by name, ID, or email..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>

          <div className="filter-grid">
            <div className="filter-group">
              <label className="filter-label">Department</label>
              <select
                className="filter-select"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Job Title</label>
              <select
                className="filter-select"
                value={filters.jobTitle}
                onChange={(e) => handleFilterChange('jobTitle', e.target.value)}
              >
                <option value="">All Job Titles</option>
                {jobTitles.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Status</label>
              <select
                className="filter-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select
                className="filter-select"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="teaching">Teaching Staff</option>
                <option value="non_teaching">Non-Teaching Staff</option>
                <option value="management">Management</option>
                <option value="support">Support Staff</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon bg-blue-100">
              <User className="text-blue-600" size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">145</h3>
              <p className="stat-label">Total Staff</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon bg-green-100">
              <Briefcase className="text-green-600" size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">98</h3>
              <p className="stat-label">Teaching Staff</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon bg-purple-100">
              <Building className="text-purple-600" size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">47</h3>
              <p className="stat-label">Non-Teaching</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon bg-orange-100">
              <Calendar className="text-orange-600" size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">12</h3>
              <p className="stat-label">On Leave</p>
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="table-container">
          <div className="table-responsive">
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Job Title</th>
                  <th>Contact</th>
                  <th>Employment Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8">
                      <div className="spinner"></div>
                      <p className="text-gray-500 mt-2">Loading employees...</p>
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8">
                      <div className="text-gray-400 mb-2">
                        <User size={48} className="mx-auto opacity-50" />
                      </div>
                      <p className="text-gray-500">No employees found</p>
                      <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  employees.map(employee => (
                    <tr key={employee.id}>
                      <td>
                        <div className="employee-info">
                          <div className="employee-avatar">
                            {employee.first_name?.[0]}{employee.last_name?.[0]}
                          </div>
                          <div>
                            <div className="employee-name">
                              {employee.first_name} {employee.last_name}
                            </div>
                            <div className="employee-email">{employee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-sm">{employee.employee_no}</span>
                      </td>
                      <td>
                        <div className="department-info">
                          <Building size={14} className="text-gray-400" />
                          <span>{employee.department?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td>{employee.job_title?.title || 'N/A'}</td>
                      <td>
                        <div className="contact-info">
                          <div className="contact-item">
                            <Phone size={12} />
                            <span>{employee.phone || 'N/A'}</span>
                          </div>
                          <div className="contact-item">
                            <Mail size={12} />
                            <span>{employee.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded text-xs ${getEmploymentTypeColor(employee.employment_type)}`}>
                          {employee.employment_type.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>{getStatusBadge(employee.status)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn view-btn"
                            onClick={() => handleViewEmployee(employee)}
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleEditEmployee(employee)}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => {/* Handle delete */ }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {employees.length > 0 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <div className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="page-dots">...</span>
                    <button
                      className={`page-number ${currentPage === totalPages ? 'active' : ''}`}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>

          )}
        </div>

        {/* Add/Edit Employee Modal */}
        {showAddModal && (
          <div
            className="modal-overlay"
            onClick={(e) => {
              if (e.target.className === 'modal-overlay') {
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 500);
              }
            }}
          >
            <div className={`modal-container ${isShaking ? 'shaking' : ''}`}>
              <div className="modal-header">
                <h2 className="modal-title">
                  {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
                </h2>
                <button
                  className="modal-close-btn"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Employee ID *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.employee_no}
                        onChange={(e) => setFormData({ ...formData, employee_no: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">First Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Middle Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.middle_name}
                        onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Last Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className="form-input"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone *</label>
                      <input
                        type="tel"
                        className="form-input"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Date of Birth *</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Gender *</label>
                      <select
                        className="form-input"
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
                      <label className="form-label">Marital Status</label>
                      <select
                        className="form-input"
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
                      <label className="form-label">National ID *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.national_id}
                        onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Nationality</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.nationality}
                        onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Department *</label>
                      <select
                        className="form-input"
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
                      <label className="form-label">Job Title *</label>
                      <select
                        className="form-input"
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
                      <label className="form-label">Employment Date *</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formData.employment_date}
                        onChange={(e) => setFormData({ ...formData, employment_date: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Employment Type *</label>
                      <select
                        className="form-input"
                        value={formData.employment_type}
                        onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                        required
                      >
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="casual">Casual</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select
                        className="form-input"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                        <option value="terminated">Terminated</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {selectedEmployee ? 'Update Employee' : 'Add Employee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Employee Modal */}
        {showViewModal && selectedEmployee && (
          <div className="modal-overlay">
            <div className="modal-container view-modal">
              <div className="modal-header">
                <h2 className="modal-title">Employee Details</h2>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowViewModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="employee-profile-header">
                  <div className="employee-profile-avatar">
                    {selectedEmployee.first_name?.[0]}{selectedEmployee.last_name?.[0]}
                  </div>
                  <div>
                    <h3 className="employee-profile-name">
                      {selectedEmployee.first_name} {selectedEmployee.middle_name} {selectedEmployee.last_name}
                    </h3>
                    <p className="employee-profile-id">ID: {selectedEmployee.employee_no}</p>
                    {getStatusBadge(selectedEmployee.status)}
                  </div>
                </div>

                <div className="employee-details-grid">
                  <div className="detail-section">
                    <h4 className="detail-section-title">Personal Information</h4>
                    <div className="detail-list">
                      <div className="detail-item">
                        <span className="detail-label">Date of Birth:</span>
                        <span className="detail-value">{selectedEmployee.date_of_birth}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Gender:</span>
                        <span className="detail-value">{selectedEmployee.gender}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Marital Status:</span>
                        <span className="detail-value">{selectedEmployee.marital_status}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">National ID:</span>
                        <span className="detail-value">{selectedEmployee.national_id}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Nationality:</span>
                        <span className="detail-value">{selectedEmployee.nationality}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4 className="detail-section-title">Employment Details</h4>
                    <div className="detail-list">
                      <div className="detail-item">
                        <span className="detail-label">Department:</span>
                        <span className="detail-value">{selectedEmployee.department?.name}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Job Title:</span>
                        <span className="detail-value">{selectedEmployee.job_title?.title}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Employment Date:</span>
                        <span className="detail-value">{selectedEmployee.employment_date}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Employment Type:</span>
                        <span className="detail-value">
                          <span className={`px-2 py-1 rounded text-xs ${getEmploymentTypeColor(selectedEmployee.employment_type)}`}>
                            {selectedEmployee.employment_type.replace('_', ' ').toUpperCase()}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4 className="detail-section-title">Contact Information</h4>
                    <div className="detail-list">
                      <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{selectedEmployee.email}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{selectedEmployee.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4 className="detail-section-title">Additional Information</h4>
                    <div className="detail-list">
                      <div className="detail-item">
                        <span className="detail-label">Created:</span>
                        <span className="detail-value">{selectedEmployee.created_at}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Last Updated:</span>
                        <span className="detail-value">{selectedEmployee.updated_at}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    handleEditEmployee(selectedEmployee);
                    setShowViewModal(false);
                  }}
                >
                  Edit Employee
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StaffRegister;