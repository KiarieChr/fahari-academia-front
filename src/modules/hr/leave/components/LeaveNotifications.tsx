import React from 'react';
import { Bell, CheckCircle, Clock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LeaveNotifications = ({ notifications, isOpen, onClose }) => {
    if (!isOpen) return null;

    const getIcon = (title) => {
        if (title.includes('Approved')) return <CheckCircle className="text-green-500" size={16} />;
        if (title.includes('Request')) return <Clock className="text-blue-500" size={16} />;
        return <Info className="text-gray-500" size={16} />;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
            >
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">Mark all as read</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">No new notifications</div>
                    ) : (
                        notifications.map((notif) => (
                            <div key={notif.id} className={`p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer ${!notif.read ? 'bg-blue-50/50' : ''}`}>
                                <div className="flex gap-3">
                                    <div className="mt-0.5">{getIcon(notif.title)}</div>
                                    <div>
                                        <h4 className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{notif.title}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                        <span className="text-[10px] text-gray-400 mt-1 block">{notif.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                    <button className="text-xs font-medium text-gray-600 hover:text-gray-900">View all notifications</button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LeaveNotifications;
