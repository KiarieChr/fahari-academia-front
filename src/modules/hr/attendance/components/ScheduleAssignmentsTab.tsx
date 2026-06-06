import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, User, Search, Edit2 } from 'lucide-react';
import { Offcanvas } from 'react-bootstrap';
import { hrService } from '../../../../services/hrService';
import { toast } from 'react-toastify';

const ScheduleAssignmentsTab = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [formData, setFormData] = useState({
        employee: '',
        work_schedule: '',
        effective_from: '',
        effective_to: '',
        is_active: true
    });

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const res = await hrService.getEmployeeWorkSchedules({ search: searchTerm });
            setAssignments(res.results || res.data || []);
        } catch (error) {
            toast.error('Failed to load schedule assignments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAssignments();
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const empRes = await hrService.getEmployees({ limit: 100 });
                setEmployees(empRes.results || empRes.data || []);
                const schedRes = await hrService.getWorkSchedules({ limit: 100 });
                setSchedules(schedRes.results || schedRes.data || []);
            } catch (err) {
                console.error("Failed to load options", err);
            }
        };
        fetchOptions();
    }, []);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Schedule Assignments</h3>
                    <p className="text-sm text-slate-500">Assign work schedules to employees</p>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search employee..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                    <button 
                        className="btn btn-primary d-flex align-items-center gap-2 whitespace-nowrap"
                        onClick={() => {
                            setEditingAssignment(null);
                            setFormData({
                                employee: '',
                                work_schedule: '',
                                effective_from: new Date().toISOString().split('T')[0],
                                effective_to: '',
                                is_active: true
                            });
                            setShowOffcanvas(true);
                        }}
                    >
                        <Plus size={18} /> Assign Schedule
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-12 text-center text-slate-400">Loading assignments...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 text-sm text-slate-500">
                                <th className="py-4 font-semibold">Employee</th>
                                <th className="py-4 font-semibold">Work Schedule</th>
                                <th className="py-4 font-semibold">Effective Dates</th>
                                <th className="py-4 font-semibold">Status</th>
                                <th className="py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map((assignment) => (
                                <tr key={assignment.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                <User size={14} />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-800">
                                                    {assignment.employee_name || assignment.employee?.first_name + ' ' + assignment.employee?.last_name || `Emp #${assignment.employee}`}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {assignment.employee_no || assignment.employee?.employee_no}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-blue-500" />
                                            <span className="font-medium text-slate-700">
                                                {assignment.work_schedule_name || assignment.work_schedule?.name || `Schedule #${assignment.work_schedule}`}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="text-sm text-slate-700">{assignment.effective_from}</div>
                                        <div className="text-xs text-slate-400">{assignment.effective_to ? `Until ${assignment.effective_to}` : 'Ongoing'}</div>
                                    </td>
                                    <td className="py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                            assignment.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {assignment.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right">
                                        <button 
                                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                            onClick={() => {
                                                setEditingAssignment(assignment.id);
                                                setFormData({
                                                    employee: assignment.employee?.id || assignment.employee || '',
                                                    work_schedule: assignment.work_schedule?.id || assignment.work_schedule || '',
                                                    effective_from: assignment.effective_from || '',
                                                    effective_to: assignment.effective_to || '',
                                                    is_active: assignment.is_active !== false
                                                });
                                                setShowOffcanvas(true);
                                            }}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {assignments.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-slate-400">
                                        No schedule assignments found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title className="text-lg font-bold text-slate-800">
                        {editingAssignment ? 'Edit Assignment' : 'Assign Schedule'}
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Employee</label>
                            <select 
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                                value={formData.employee} 
                                onChange={e => setFormData({...formData, employee: e.target.value})}
                                disabled={!!editingAssignment}
                            >
                                <option value="">Select Employee...</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Work Schedule</label>
                            <select 
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                                value={formData.work_schedule} 
                                onChange={e => setFormData({...formData, work_schedule: e.target.value})}
                            >
                                <option value="">Select Schedule...</option>
                                {schedules.map(sch => (
                                    <option key={sch.id} value={sch.id}>{sch.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Effective From</label>
                                <input 
                                    type="date" 
                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                                    value={formData.effective_from} 
                                    onChange={e => setFormData({...formData, effective_from: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Effective To</label>
                                <input 
                                    type="date" 
                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                                    value={formData.effective_to} 
                                    onChange={e => setFormData({...formData, effective_to: e.target.value})} 
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <input 
                                type="checkbox" 
                                id="is_active_assignment"
                                checked={formData.is_active}
                                onChange={e => setFormData({...formData, is_active: e.target.checked})} 
                            />
                            <label htmlFor="is_active_assignment" className="text-sm font-semibold text-slate-700">Active Assignment</label>
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-slate-100 flex gap-2 justify-end">
                        <button 
                            className="px-4 py-2 text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            onClick={() => setShowOffcanvas(false)}
                        >
                            Cancel
                        </button>
                        <button 
                            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            disabled={!formData.employee || !formData.work_schedule || !formData.effective_from}
                            onClick={async () => {
                                try {
                                    const payload = { ...formData };
                                    if (!payload.effective_to) {
                                        payload.effective_to = null;
                                    }
                                    
                                    if (editingAssignment) {
                                        await hrService.updateEmployeeWorkSchedule(editingAssignment, payload);
                                        toast.success('Assignment updated');
                                    } else {
                                        await hrService.assignEmployeeWorkSchedule(payload);
                                        toast.success('Schedule assigned');
                                    }
                                    setShowOffcanvas(false);
                                    fetchAssignments();
                                } catch (e) {
                                    toast.error('Error saving assignment');
                                }
                            }}
                        >
                            Save Assignment
                        </button>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </div>
    );
};

export default ScheduleAssignmentsTab;
