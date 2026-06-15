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
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { api } from '../../services/api'; // Your API service
import { toast } from 'react-toastify';
import DashboardLayout from '../../dashboard/DashboardLayout';
import './StaffRegister.css';
import '../../dashboard/dashboard.css';

const StaffRegister = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
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
    employment_status: 'active',
    employee_category: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
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
    employment_type: 'full_time',
    assignment_type: 'permanent'
  });

  const ITEMS_PER_PAGE = 10;

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        search: searchTerm,
        ...filters
      };
      
      // Remove empty filter values
      Object.keys(params).forEach(key => {
        if (!params[key] || params[key] === '') delete params[key];
      });
      
      const response = await api.get('/workforce/api/employees/', { params });
      
      // Handle both paginated and non-paginated responses
      if (response.results) {
        setEmployees(response.results);
        setTotalCount(response.count);
        setTotalPages(Math.ceil(response.count / ITEMS_PER_PAGE));
      } else if (Array.isArray(response)) {
        setEmployees(response);
        setTotalCount(response.length);
        setTotalPages(1);
      } else {
        setEmployees([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      toast.error('Failed to fetch employees');
      console.error('Error fetching employees:', error);
      setEmployees([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffStats = async () => {
    try {
      const response = await api.get('/workforce/api/employees/statistics/');
      if (response && response.total_employees) {
        setStats({
          total_employees: response.total_employees || 0,
          teaching_staff: response.teaching_staff || 0,
          non_teaching_staff: response.non_teaching_staff || 0,
          on_leave: response.on_leave || 0
        });
      } else {
        // Fallback if response doesn't have expected structure
        throw new Error('Invalid stats response');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback: Calculate stats from current data we have
      // Note: This uses totalCount (total in DB) but category counts from current page
      const teaching = employees.filter(emp => 
        emp.employee_category === 'teaching'
      ).length;
      
      const nonTeaching = employees.filter(emp => 
        emp.employee_category === 'non_teaching'
      ).length;
      
      const onLeave = employees.filter(emp => 
        emp.employment_status === 'on_leave' || 
        emp.leave_applications?.some(app => 
          app.status === 'approved' && 
          new Date(app.start_date) <= new Date() && 
          new Date(app.end_date) >= new Date()
        )
      ).length;
      
      // Use totalCount for total employees (from API), but calculate categories from current page
      setStats({
        total_employees: totalCount || employees.length || 0,
        teaching_staff: teaching,
        non_teaching_staff: nonTeaching,
        on_leave: onLeave
      });
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/workforce/api/departments/');
      setDepartments(response.results || response || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      toast.error('Failed to load departments');
    }
  };

  const fetchJobTitles = async () => {
    try {
      const response = await api.get('/workforce/api/job-titles/');
      setJobTitles(response.results || response || []);
    } catch (error) {
      console.error('Failed to fetch job titles:', error);
      toast.error('Failed to load job titles');
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchJobTitles();
  }, [currentPage, filters, searchTerm]);

  useEffect(() => {
    if (employees.length > 0) {
      fetchStaffStats();
    }
  }, [employees]);

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

  const handleEditEmployee = async (employee) => {
    try {
      // Fetch complete employee details
      const response = await api.get(`/workforce/api/employees/${employee.id}/`);
      const employeeData = response;
      
      // Get current job assignment
      const jobAssignment = employeeData.job_assignments?.find(
        assignment => assignment.is_primary_assignment === true
      );
      
      setFormData({
        employee_no: employeeData.employee_no,
        first_name: employeeData.first_name,
        middle_name: employeeData.middle_name || '',
        last_name: employeeData.last_name,
        official_email: employeeData.official_email,
        personal_email: employeeData.personal_email || '',
        phone_primary: employeeData.phone_primary,
        phone_secondary: employeeData.phone_secondary || '',
        date_of_birth: employeeData.date_of_birth,
        gender: employeeData.gender,
        marital_status: employeeData.marital_status || 'single',
        national_id: employeeData.national_id,
        passport_number: employeeData.passport_number || '',
        employee_category: employeeData.employee_category,
        payroll_type: employeeData.payroll_type,
        employment_status: employeeData.employment_status,
        hire_date: employeeData.hire_date,
        confirmation_date: employeeData.confirmation_date || '',
        termination_date: employeeData.termination_date || '',
        department_id: employeeData.department?.id || '',
        job_title_id: jobAssignment?.job_title?.id || '',
        employment_type: jobAssignment?.employment_type || 'full_time',
        assignment_type: jobAssignment?.assignment_type || 'permanent'
      });
      
      setSelectedEmployee(employeeData);
      setShowAddModal(true);
    } catch (error) {
      console.error('Error fetching employee details:', error);
      toast.error('Failed to load employee details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        email: formData.official_email, // Map to your serializer field
        phone: formData.phone_primary,
        employment_date: formData.hire_date,
        status: formData.employment_status
      };
      
      if (selectedEmployee?.id) {
        await api.put(`/workforce/api/employees/${selectedEmployee.id}/`, payload);
        toast.success('Employee updated successfully');
      } else {
        await api.post('/workforce/api/employees/', payload);
        toast.success('Employee added successfully');
      }
      
      setShowAddModal(false);
      fetchEmployees();
      resetForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          Object.values(error.response?.data || {})
                            .flat()
                            .join(', ') ||
                          'Failed to save employee';
      toast.error(errorMessage);
      console.error('Error saving employee:', error);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/workforce/api/employees/${employeeId}/`);
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } catch (error) {
        toast.error('Failed to delete employee');
        console.error('Error deleting employee:', error);
      }
    }
  };

  const resetForm = () => {
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
      employment_type: 'full_time',
      assignment_type: 'permanent'
    });
    setSelectedEmployee(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { 
        shadowColor: 'rgba(22, 101, 52, 0.2)', 
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle size={14} className="text-green-600" /> 
      },
      probation: { 
        shadowColor: 'rgba(245, 158, 11, 0.2)', 
        color: 'bg-yellow-100 text-yellow-800',
        icon: <Clock size={14} className="text-yellow-600" /> 
      },
      suspended: { 
        shadowColor: 'rgba(153, 27, 27, 0.2)', 
        color: 'bg-red-100 text-red-800',
        icon: <Clock size={14} className="text-red-600" /> 
      },
      terminated: { 
        shadowColor: 'rgba(153, 27, 27, 0.2)', 
        color: 'bg-red-100 text-red-800',
        icon: <XCircle size={14} className="text-red-600" /> 
      },
      resigned: { 
        shadowColor: 'rgba(100, 116, 139, 0.2)', 
        color: 'bg-gray-100 text-gray-800',
        icon: <XCircle size={14} className="text-gray-600" /> 
      },
      retired: { 
        shadowColor: 'rgba(100, 116, 139, 0.2)', 
        color: 'bg-gray-100 text-gray-800',
        icon: <CheckCircle size={14} className="text-gray-600" /> 
      }
    };

    const config = statusConfig[status] || statusConfig.active;

    return (
      <span 
        className={`status-badge ${config.color} px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1`}
        style={{ boxShadow: `0 4px 10px ${config.shadowColor}` }}
      >
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  const getEmploymentTypeColor = (type) => {
    const colors = {
      full_time: 'bg-blue-100 text-blue-800',
      part_time: 'bg-purple-100 text-purple-800',
      contract: 'bg-orange-100 text-orange-800',
      casual: 'bg-yellow-100 text-yellow-800',
      permanent: 'bg-green-100 text-green-800',
      temporary: 'bg-gray-100 text-gray-800',
      visiting: 'bg-indigo-100 text-indigo-800',
      adjunct: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      department: '',
      job_title: '',
      employment_status: 'active',
      employee_category: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <DashboardLayout title="Staff Register">
      <div className="staff-register">
        {/* Header */}
        <div className="register-header">
          <div>
            <h1 className="page-title">Staff Register</h1>
            <p className="page-subtitle">
              Managing {totalCount} employee{totalCount !== 1 ? 's' : ''}
            </p>
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
              placeholder="Search employees by name, ID, email, or national ID..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                ×
              </button>
            )}
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
                value={filters.job_title}
                onChange={(e) => handleFilterChange('job_title', e.target.value)}
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
                value={filters.employment_status}
                onChange={(e) => handleFilterChange('employment_status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="probation">On Probation</option>
                <option value="suspended">Suspended</option>
                <option value="terminated">Terminated</option>
                <option value="resigned">Resigned</option>
                <option value="retired">Retired</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select
                className="filter-select"
                value={filters.employee_category}
                onChange={(e) => handleFilterChange('employee_category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="teaching">Teaching Staff</option>
                <option value="non_teaching">Non-Teaching Staff</option>
                <option value="contract">Contract Staff</option>
                <option value="casual">Casual Worker</option>
                <option value="visiting">Visiting Faculty</option>
              </select>
            </div>

            <div className="filter-group">
              <button
                className="btn-clear-filters"
                onClick={clearFilters}
                title="Clear all filters"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="mini-stat-card-premium">
            <div className="card-top">
              <div className="stat-icon-glow" style={{ '--icon-color': '#1976d2', '--icon-bg': '#e3f2fd' }}>
                <User size={16} />
              </div>
              <span className="stat-label-modern">Total Staff</span>
            </div>
            <div className="card-bottom mt-2">
              <div className="stat-value-large">{stats.total_employees.toLocaleString()}</div>
            </div>
          </div>

          <div className="mini-stat-card-premium">
            <div className="card-top">
              <div className="stat-icon-glow" style={{ '--icon-color': '#059669', '--icon-bg': '#d1fae5' }}>
                <Briefcase size={16} />
              </div>
              <span className="stat-label-modern">Teaching Staff</span>
            </div>
            <div className="card-bottom mt-2">
              <div className="stat-value-large">{stats.teaching_staff.toLocaleString()}</div>
            </div>
          </div>

          <div className="mini-stat-card-premium">
            <div className="card-top">
              <div className="stat-icon-glow" style={{ '--icon-color': '#4f46e5', '--icon-bg': '#e0e7ff' }}>
                <Building size={16} />
              </div>
              <span className="stat-label-modern">Non-Teaching</span>
            </div>
            <div className="card-bottom mt-2">
              <div className="stat-value-large">{stats.non_teaching_staff.toLocaleString()}</div>
            </div>
          </div>

          <div className="mini-stat-card-premium">
            <div className="card-top">
              <div className="stat-icon-glow" style={{ '--icon-color': '#d97706', '--icon-bg': '#fef3c7' }}>
                <Calendar size={16} />
              </div>
              <span className="stat-label-modern">On Leave</span>
            </div>
            <div className="card-bottom mt-2">
              <div className="stat-value-large">{stats.on_leave.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="table-container">
          <div className="table-header">
            <div className="table-info">
              Showing {employees.length} of {totalCount} employee{totalCount !== 1 ? 's' : ''}
            </div>
            <div className="table-actions">
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>
          
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
                      <button
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => setShowAddModal(true)}
                      >
                        Add New Employee
                      </button>
                    </td>
                  </tr>
                ) : (
                  employees.map(employee => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td>
                        <div className="employee-info">
                          <div className="employee-avatar">
                            {employee.first_name?.[0]}{employee.last_name?.[0]}
                          </div>
                          <div>
                            <div className="employee-name">
                              {employee.full_name || `${employee.first_name} ${employee.last_name}`}
                            </div>
                            <div className="employee-email">{employee.email || employee.official_email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {employee.employee_no || `EMP${employee.id.toString().padStart(4, '0')}`}
                        </span>
                      </td>
                      <td>
                        <div className="department-info">
                          <Building size={14} className="text-gray-400" />
                          <span>{employee.department?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="job-title-info">
                          <Briefcase size={14} className="text-gray-400" />
                          <span>{employee.job_title?.title || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="contact-info">
                          <div className="contact-item">
                            <Phone size={12} />
                            <span>{employee.phone || employee.phone_primary || 'N/A'}</span>
                          </div>
                          <div className="contact-item">
                            <Mail size={12} />
                            <span>{employee.email || employee.official_email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded text-xs ${getEmploymentTypeColor(employee.employment_type)}`}>
                          {employee.employment_type?.replace('_', ' ').toUpperCase() || 'N/A'}
                        </span>
                      </td>
                      <td>{getStatusBadge(employee.employment_status)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn view-btn"
                            onClick={() => handleViewEmployee(employee)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleEditEmployee(employee)}
                            title="Edit Employee"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteEmployee(employee.id)}
                            title="Delete Employee"
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
          {employees.length > 0 && totalPages > 1 && (
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
                    {/* Employee ID */}
                    <div className="form-group">
                      <label className="form-label">Employee ID *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.employee_no}
                        onChange={(e) => setFormData({ ...formData, employee_no: e.target.value })}
                        required
                        disabled={!!selectedEmployee}
                      />
                    </div>

                    {/* Personal Information */}
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

                    {/* Contact Information */}
                    <div className="form-group">
                      <label className="form-label">Official Email *</label>
                      <input
                        type="email"
                        className="form-input"
                        value={formData.official_email}
                        onChange={(e) => setFormData({ ...formData, official_email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Personal Email</label>
                      <input
                        type="email"
                        className="form-input"
                        value={formData.personal_email}
                        onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Primary Phone *</label>
                      <input
                        type="tel"
                        className="form-input"
                        value={formData.phone_primary}
                        onChange={(e) => setFormData({ ...formData, phone_primary: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Secondary Phone</label>
                      <input
                        type="tel"
                        className="form-input"
                        value={formData.phone_secondary}
                        onChange={(e) => setFormData({ ...formData, phone_secondary: e.target.value })}
                      />
                    </div>

                    {/* Personal Details */}
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

                    {/* Identification */}
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
                      <label className="form-label">Passport Number</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.passport_number}
                        onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                      />
                    </div>

                    {/* Employment Details */}
                    <div className="form-group">
                      <label className="form-label">Employee Category *</label>
                      <select
                        className="form-input"
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
                      <label className="form-label">Payroll Type *</label>
                      <select
                        className="form-input"
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

                    <div className="form-group">
                      <label className="form-label">Employment Status *</label>
                      <select
                        className="form-input"
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

                    {/* Dates */}
                    <div className="form-group">
                      <label className="form-label">Hire Date *</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formData.hire_date}
                        onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Confirmation Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formData.confirmation_date}
                        onChange={(e) => setFormData({ ...formData, confirmation_date: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Termination Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formData.termination_date}
                        onChange={(e) => setFormData({ ...formData, termination_date: e.target.value })}
                      />
                    </div>

                    {/* Department and Job */}
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
                      <label className="form-label">Employment Type *</label>
                      <select
                        className="form-input"
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
                      <label className="form-label">Assignment Type</label>
                      <select
                        className="form-input"
                        value={formData.assignment_type}
                        onChange={(e) => setFormData({ ...formData, assignment_type: e.target.value })}
                      >
                        <option value="permanent">Permanent</option>
                        <option value="acting">Acting</option>
                        <option value="temporary">Temporary</option>
                        <option value="secondment">Secondment</option>
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
          <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
            <div className="modal-container view-modal" onClick={(e) => e.stopPropagation()}>
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
                      {selectedEmployee.full_name || `${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
                    </h3>
                    <p className="employee-profile-id">ID: {selectedEmployee.employee_no}</p>
                    {getStatusBadge(selectedEmployee.employment_status)}
                  </div>
                </div>

                <div className="employee-details-grid">
                  <div className="detail-section">
                    <h4 className="detail-section-title">Personal Information</h4>
                    <div className="detail-list">
                      <div className="detail-item">
                        <span className="detail-label">Date of Birth:</span>
                        <span className="detail-value">{formatDate(selectedEmployee.date_of_birth)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Gender:</span>
                        <span className="detail-value">{selectedEmployee.gender?.charAt(0).toUpperCase() + selectedEmployee.gender?.slice(1) || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Marital Status:</span>
                        <span className="detail-value">{selectedEmployee.marital_status?.charAt(0).toUpperCase() + selectedEmployee.marital_status?.slice(1) || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">National ID:</span>
                        <span className="detail-value">{selectedEmployee.national_id || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Passport:</span>
                        <span className="detail-value">{selectedEmployee.passport_number || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4 className="detail-section-title">Employment Details</h4>
                    <div className="detail-list">
                      <div className="detail-item">
                        <span className="detail-label">Category:</span>
                        <span className="detail-value">{selectedEmployee.employee_category?.replace('_', ' ').toUpperCase() || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Department:</span>
                        <span className="detail-value">{selectedEmployee.department?.name || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Job Title:</span>
                        <span className="detail-value">{selectedEmployee.job_title?.title || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Hire Date:</span>
                        <span className="detail-value">{formatDate(selectedEmployee.hire_date)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Employment Type:</span>
                        <span className="detail-value">
                          <span className={`px-2 py-1 rounded text-xs ${getEmploymentTypeColor(selectedEmployee.employment_type)}`}>
                            {selectedEmployee.employment_type?.replace('_', ' ').toUpperCase() || 'N/A'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4 className="detail-section-title">Contact Information</h4>
                    <div className="detail-list">
                      <div className="detail-item">
                        <span className="detail-label">Official Email:</span>
                        <span className="detail-value">{selectedEmployee.official_email || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Personal Email:</span>
                        <span className="detail-value">{selectedEmployee.personal_email || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Primary Phone:</span>
                        <span className="detail-value">{selectedEmployee.phone_primary || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Secondary Phone:</span>
                        <span className="detail-value">{selectedEmployee.phone_secondary || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4 className="detail-section-title">Additional Information</h4>
                    <div className="detail-list">
                      {selectedEmployee.created_at && (
                        <div className="detail-item">
                          <span className="detail-label">Created:</span>
                          <span className="detail-value">{formatDateTime(selectedEmployee.created_at)}</span>
                        </div>
                      )}
                      {selectedEmployee.updated_at && (
                        <div className="detail-item">
                          <span className="detail-label">Last Updated:</span>
                          <span className="detail-value">{formatDateTime(selectedEmployee.updated_at)}</span>
                        </div>
                      )}
                      {selectedEmployee.confirmation_date && (
                        <div className="detail-item">
                          <span className="detail-label">Confirmed:</span>
                          <span className="detail-value">{formatDate(selectedEmployee.confirmation_date)}</span>
                        </div>
                      )}
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