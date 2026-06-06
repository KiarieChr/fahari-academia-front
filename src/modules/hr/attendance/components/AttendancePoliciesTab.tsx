import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Shield, MapPin, Fingerprint } from 'lucide-react';
import { hrService } from '../../../../services/hrService';
import { toast } from 'react-toastify';

const AttendancePoliciesTab = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPolicies = async () => {
        try {
            setLoading(true);
            const res = await hrService.getAttendancePolicies();
            setPolicies(res.results || res.data || []);
        } catch (error) {
            toast.error('Failed to load attendance policies');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Attendance Policies</h3>
                    <p className="text-sm text-slate-500">Configure clocking rules and geofencing</p>
                </div>
                <button className="btn btn-primary d-flex align-items-center gap-2">
                    <Plus size={18} /> Add Policy
                </button>
            </div>

            {loading ? (
                <div className="py-12 text-center text-slate-400">Loading policies...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {policies.map((policy) => (
                        <div key={policy.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{policy.name}</h4>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                            policy.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {policy.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="text-slate-400 hover:text-blue-600"><Edit2 size={16} /></button>
                                    <button className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            
                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Late Grace Period:</span>
                                    <span className="font-medium text-slate-700">{policy.grace_period_minutes} mins</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Half Day Threshold:</span>
                                    <span className="font-medium text-slate-700">{policy.half_day_threshold_hours} hrs</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Overtime Trigger:</span>
                                    <span className="font-medium text-slate-700">{policy.overtime_threshold_hours} hrs/day</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex gap-2 flex-wrap">
                                {policy.requires_biometric && (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold">
                                        <Fingerprint size={14} /> Biometric Required
                                    </span>
                                )}
                                {policy.require_on_site_geofence && (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-semibold">
                                        <MapPin size={14} /> Geofence: {policy.default_geofence_radius_meters}m
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    {policies.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                            No attendance policies configured.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AttendancePoliciesTab;
