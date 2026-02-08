import React from 'react';

const TimetableFilters = ({
    selectedClass,
    onClassChange,
    selectedStream,
    onStreamChange,
    activeYear,
    onYearChange,
    activeTerm,
    onTermChange
}) => {
    const classes = ['Grade 4', 'Grade 5', 'Grade 6'];
    const streams = ['East', 'West', 'North', 'South'];
    const years = ['2023', '2024', '2025'];
    const terms = ['Term 1', 'Term 2', 'Term 3'];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">
                    Class Level
                </label>
                <select
                    value={selectedClass}
                    onChange={(e) => onClassChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                >
                    {classes.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">
                    Stream
                </label>
                <select
                    value={selectedStream}
                    onChange={(e) => onStreamChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                >
                    {streams.map(stream => (
                        <option key={stream} value={stream}>{stream}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">
                    Year
                </label>
                <select
                    value={activeYear}
                    onChange={(e) => onYearChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                >
                    {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">
                    Term
                </label>
                <select
                    value={activeTerm}
                    onChange={(e) => onTermChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                >
                    {terms.map(term => (
                        <option key={term} value={term}>{term}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default TimetableFilters;
