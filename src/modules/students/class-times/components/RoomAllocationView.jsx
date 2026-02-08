import React from 'react';
import { LayoutTemplate, Users } from 'lucide-react';

const RoomAllocationView = ({ rooms }) => {
    if (!rooms) return <div className="p-4 text-center text-gray-500">No room data available</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {rooms.map((room) => (
                    <div key={room.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                <LayoutTemplate size={20} />
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${room.status === 'Full' ? 'bg-red-100 text-red-700' :
                                    room.status === 'Available' ? 'bg-green-100 text-green-700' :
                                        'bg-slate-100 text-slate-600'
                                }`}>
                                {room.status}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{room.name}</h3>

                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                            <Users size={14} />
                            <span>Capacity: {room.capacity}</span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                                <span>Utilization</span>
                                <span>{Math.round((room.assigned / 45) * 100)}%</span> {/* Assuming 45 total slots */}
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${room.status === 'Full' ? 'bg-red-500' : 'bg-blue-500'
                                        }`}
                                    style={{ width: `${(room.assigned / 45) * 100}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{room.assigned} slots assigned</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RoomAllocationView;
