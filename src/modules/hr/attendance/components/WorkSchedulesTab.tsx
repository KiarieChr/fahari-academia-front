import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { hrService } from '../../../../services/hrService';
import { toast } from 'react-toastify';
import Modal from '../../../../components/common/Modal';
import { Offcanvas } from 'react-bootstrap';

const WorkSchedulesTab = () => {
    const [schedules, setSchedules] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        schedule_type: 'fixed',
        attendance_policy: '',
        standard_hours_per_day: 8,
        standard_hours_per_week: 40,
        work_days_per_week: 5,
        is_active: true
    });

    const fetchSchedules = async () => {
        try {
            setLoading(true);
            const [res, polRes] = await Promise.all([
                hrService.getWorkSchedules(),
                hrService.getAttendancePolicies()
            ]);
            setSchedules(res.results || res.data || []);
            setPolicies(polRes.results || polRes.data || []);
        } catch (error) {
            toast.error('Failed to load work schedules');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Work Schedules</h3>
                    <p className="text-sm text-slate-500">Manage standard working hours and schedules</p>
                </div>
                <button 
                    onClick={() => {
                        setEditingSchedule(null);
                        setFormData({
                            name: '',
                            schedule_type: 'fixed',
                            attendance_policy: policies.length > 0 ? policies[0].id : '',
                            standard_hours_per_day: 8,
                            standard_hours_per_week: 40,
                            work_days_per_week: 5,
                            is_active: true
                        });
                        setShowOffcanvas(true);
                    }}
                    className="btn btn-primary d-flex align-items-center gap-2"
                >
                    <Plus size={18} /> Add Schedule
                </button>
            </div>

            {loading ? (
                <div className="py-12 text-center text-slate-400">Loading schedules...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 text-sm text-slate-500">
                                <th className="py-4 font-semibold">Name & Type</th>
                                <th className="py-4 font-semibold">Work Hours</th>
                                <th className="py-4 font-semibold">Days / Week</th>
                                <th className="py-4 font-semibold">Status</th>
                                <th className="py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map((schedule) => (
                                <tr key={schedule.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                    <td className="py-4">
                                        <div className="font-semibold text-slate-800">{schedule.name}</div>
                                        <div className="text-xs text-slate-500 uppercase">{schedule.schedule_type}</div>
                                    </td>
                                    <td className="py-4">
                                        <div className="text-sm font-medium">{schedule.standard_hours_per_day} hrs/day</div>
                                        <div className="text-xs text-slate-500">{schedule.standard_hours_per_week} hrs/week</div>
                                    </td>
                                    <td className="py-4">
                                        <div className="text-sm text-slate-700">{schedule.work_days_per_week} days</div>
                                    </td>
                                    <td className="py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                            schedule.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {schedule.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right">
                                        <button 
                                            onClick={() => {
                                                setEditingSchedule(schedule.id);
                                                setFormData({
                                                    ...schedule,
                                                    attendance_policy: schedule.attendance_policy?.id || schedule.attendance_policy || ''
                                                });
                                                setShowOffcanvas(true);
                                            }}
                                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {schedules.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-slate-400">
                                        No work schedules found.
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
                        {editingSchedule ? 'Edit Schedule' : 'Create Schedule'}
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Schedule Name</label>
                            <input 
                                type="text" 
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                                value={formData.name || ''} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                placeholder="e.g. Standard 9 to 5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Schedule Type</label>
                            <select 
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                                value={formData.schedule_type || 'fixed'} 
                                onChange={e => setFormData({...formData, schedule_type: e.target.value})}
                            >
                                <option value="fixed">Fixed Schedule</option>
                                <option value="flexible">Flexible Schedule</option>
                                <option value="shift">Shift-Based</option>
                                <option value="teaching_timetable">Teaching Timetable</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Attendance Policy</label>
                            <select 
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                                value={formData.attendance_policy || ''} 
                                onChange={e => setFormData({...formData, attendance_policy: e.target.value})}
                            >
                                <option value="">Select Policy...</option>
                                {policies.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Hrs / Day</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                                    value={formData.standard_hours_per_day || ''} 
                                    onChange={e => setFormData({...formData, standard_hours_per_day: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Hrs / Week</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                                    value={formData.standard_hours_per_week || ''} 
                                    onChange={e => setFormData({...formData, standard_hours_per_week: e.target.value})} 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Days / Week</label>
                            <input 
                                type="number" 
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                                value={formData.work_days_per_week || ''} 
                                onChange={e => setFormData({...formData, work_days_per_week: e.target.value})} 
                            />
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <input 
                                type="checkbox" 
                                id="is_active"
                                checked={formData.is_active !== false}
                                onChange={e => setFormData({...formData, is_active: e.target.checked})} 
                            />
                            <label htmlFor="is_active" className="text-sm font-semibold text-slate-700">Active Schedule</label>
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
                            onClick={async () => {
                                try {
                                    if (editingSchedule) {
                                        await hrService.updateWorkSchedule(editingSchedule, formData);
                                        toast.success('Schedule updated');
                                    } else {
                                        await hrService.createWorkSchedule(formData);
                                        toast.success('Schedule created');
                                    }
                                    setShowOffcanvas(false);
                                    fetchSchedules();
                                } catch (e) {
                                    toast.error('Error saving schedule');
                                }
                            }}
                        >
                            Save Schedule
                        </button>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </div>
    );
};

export default WorkSchedulesTab;
