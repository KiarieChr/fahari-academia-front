import React from 'react';
import { Calendar, Filter } from 'lucide-react';

const DashboardFilter = () => {
    return (
        <div className="flex flex-wrap gap-4 items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mr-2">
                <Filter size={18} />
                <span>Filters:</span>
            </div>

            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Calendar size={16} />
                </div>
                <select className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option>January 2026</option>
                    <option>December 2025</option>
                    <option>November 2025</option>
                </select>
            </div>

            <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">All Departments</option>
                <option value="teaching">Teaching Staff</option>
                <option value="non-teaching">Non-Teaching Staff</option>
                <option value="admin">Administration</option>
            </select>

            <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
            </select>

            <div className="ml-auto">
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer">Reset Filters</button>
            </div>
        </div>
    );
};

export default DashboardFilter;
