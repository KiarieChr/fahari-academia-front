import React from 'react';

const ActivityTimeline = ({ activities }) => {
    return (
        <div className="leave-card p-6 h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="activity-timeline relative pl-4 border-l border-gray-100 space-y-6">
                {activities.map((activity) => (
                    <div key={activity.id} className="relative pl-4 group">
                        {/* Timeline dot */}
                        <div className={`absolute -left-[21px] top-1 p-1 rounded-full bg-white border ${activity.color.replace('text-', 'border-')}`}>
                            <activity.icon size={12} className={activity.color} />
                        </div>

                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{activity.title}</span>
                            <p className="text-xs text-gray-500 mt-0.5">{activity.description}</p>
                            <span className="text-[10px] text-gray-400 mt-1">{activity.date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityTimeline;
