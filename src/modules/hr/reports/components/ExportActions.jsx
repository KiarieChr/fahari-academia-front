
import React from 'react';
import { Download, Printer, RefreshCw } from 'lucide-react';

const ExportActions = () => {
    return (
        <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                <RefreshCw size={16} />
                <span className="hidden sm:inline">Refresh</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                <Printer size={16} />
                <span className="hidden sm:inline">Print</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
            </button>
        </div>
    );
};

export default ExportActions;
