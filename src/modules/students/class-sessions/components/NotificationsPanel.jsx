import React from 'react';
import { Bell, AlertTriangle, Clock, Info } from 'lucide-react';

const NotificationsPanel = () => {
    const alerts = [
        { id: 1, type: 'warning', text: 'Grade 5 West English session started 10m late.', time: '20m ago' },
        { id: 2, type: 'error', text: 'Grade 8 South Computer Studies session was cancelled.', time: '1h ago' },
        { id: 3, type: 'info', text: 'Daily attendance average is above 95% today.', time: '2h ago' },
    ];

    const getIcon = (type) => {
        switch (type) {
            case 'warning': return <Clock size={16} className="text-orange-500" />;
            case 'error': return <AlertTriangle size={16} className="text-red-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm h-full">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <Bell size={18} className="text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">Alerts & Notifications</h3>
            </div>
            <div className="p-4 space-y-3">
                {alerts.map((alert) => (
                    <div key={alert.id} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="mt-0.5">{getIcon(alert.type)}</div>
                        <div>
                            <p className="text-sm text-gray-800 leading-snug">{alert.text}</p>
                            <span className="text-xs text-gray-400 mt-1 block">{alert.time}</span>
                        </div>
                    </div>
                ))}

                {alerts.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No new alerts today.
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;
