import React from 'react';
import { AlertTriangle, UserX, Clock, CreditCard } from 'lucide-react';

const AlertItem = ({ type, message, time }) => {
    let icon, colorClass;
    switch (type) {
        case 'warning':
            icon = AlertTriangle;
            colorClass = 'text-amber-500 bg-amber-50';
            break;
        case 'error':
            icon = UserX;
            colorClass = 'text-red-500 bg-red-50';
            break;
        case 'info':
            icon = Clock;
            colorClass = 'text-blue-500 bg-blue-50';
            break;
        default:
            icon = CreditCard;
            colorClass = 'text-gray-500 bg-gray-50';
    }

    const Icon = icon;

    return (
        <div className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border-b border-gray-50 last:border-0 border-l-4 border-l-transparent hover:border-l-blue-500">
            <div className={`p-2 rounded-lg h-fit ${colorClass}`}>
                <Icon size={16} />
            </div>
            <div>
                <p className="text-sm text-gray-700 font-medium">{message}</p>
                <p className="text-xs text-gray-400 mt-1">{time}</p>
            </div>
        </div>
    );
};

const NotificationCenter = () => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Alerts & Notifications</h3>
            <div className="space-y-1">
                <AlertItem type="warning" message="3 Payrolls pending final approval" time="2 hours ago" />
                <AlertItem type="error" message="Missing bank details for 5 new staff" time="5 hours ago" />
                <AlertItem type="info" message="Statutory NSSF rates updated" time="Yesterday" />
                <AlertItem type="warning" message="Contract ending for 2 staff members" time="2 days ago" />
            </div>
            <button className="w-full mt-4 py-2 text-sm text-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                View All Notifications
            </button>
        </div>
    );
};

export default NotificationCenter;
