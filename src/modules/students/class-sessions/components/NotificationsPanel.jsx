import React, { useMemo } from 'react';
import { Bell, AlertTriangle, Clock, Info, CheckCircle } from 'lucide-react';

// Build alert objects from live todayPlanned array
const buildAlerts = (todayPlanned) => {
    const alerts = [];
    todayPlanned.forEach((pl, idx) => {
        switch (pl.status) {
            case 'cancelled':
                alerts.push({
                    id: `cancelled-${pl.id ?? idx}`,
                    type: 'error',
                    text: `${pl.class_session_name ?? 'Session'} — ${pl.subject_name ?? ''} was cancelled.`,
                    time: pl.scheduled_start_time ?? '',
                });
                break;
            case 'missed':
                alerts.push({
                    id: `missed-${pl.id ?? idx}`,
                    type: 'warning',
                    text: `${pl.class_session_name ?? 'Session'} — ${pl.subject_name ?? ''} was missed.`,
                    time: pl.scheduled_start_time ?? '',
                });
                break;
            case 'completed':
                alerts.push({
                    id: `done-${pl.id ?? idx}`,
                    type: 'success',
                    text: `${pl.class_session_name ?? 'Session'} — ${pl.subject_name ?? ''} completed.`,
                    time: pl.scheduled_start_time ?? '',
                });
                break;
            default:
                break;
        }
    });
    return alerts;
};

const getIcon = (type) => {
    switch (type) {
        case 'warning': return <Clock size={16} className="text-orange-500" />;
        case 'error':   return <AlertTriangle size={16} className="text-red-500" />;
        case 'success': return <CheckCircle size={16} className="text-green-500" />;
        default:        return <Info size={16} className="text-blue-500" />;
    }
};

const formatTime = (t) => (!t ? '' : t.slice(0, 5));

const NotificationsPanel = ({ todayPlanned = [] }) => {
    const alerts = useMemo(() => buildAlerts(todayPlanned), [todayPlanned]);

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm h-full">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <Bell size={18} className="text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">Alerts &amp; Notifications</h3>
                {alerts.length > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center w-5 h-5 text-[10px]
                                     font-bold bg-red-500 text-white rounded-full">
                        {alerts.length}
                    </span>
                )}
            </div>
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                {alerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        {todayPlanned.length > 0 ? 'All sessions are on track today.' : 'No planned sessions found for today.'}
                    </div>
                ) : (
                    alerts.map((alert) => (
                        <div key={alert.id} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="mt-0.5 shrink-0">{getIcon(alert.type)}</div>
                            <div>
                                <p className="text-sm text-gray-800 leading-snug">{alert.text}</p>
                                {alert.time && (
                                    <span className="text-xs text-gray-400 mt-1 block">{formatTime(alert.time)}</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;
