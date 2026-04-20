import React from 'react';

const TimetableFilters = ({ classSessions, selectedClassSession, onClassSessionChange }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">
                    Class Session
                </label>
                <select
                    value={selectedClassSession?.id || ''}
                    onChange={(e) => {
                        const session = classSessions.find(s => s.id === Number(e.target.value));
                        if (session) onClassSessionChange(session);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                >
                    <option value="" disabled>Select a class...</option>
                    {classSessions.map(session => (
                        <option key={session.id} value={session.id}>{session.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default TimetableFilters;
