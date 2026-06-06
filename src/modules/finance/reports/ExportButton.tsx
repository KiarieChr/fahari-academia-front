import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { exportReport } from './exportUtils';

/**
 * Reusable export dropdown button for all finance report components.
 * Props:
 *   title      — report title string
 *   subtitle   — optional subtitle
 *   headers    — array of column header strings
 *   getRows    — () => array-of-arrays matching headers
 *   filename   — base filename (no extension)
 */
const ExportButton = ({ title, subtitle = '', headers, getRows, filename = 'report' }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handle = (format) => {
        setOpen(false);
        exportReport({ format, title, subtitle, headers, rows: getRows(), filename });
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
                <Download size={14} /> Export <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden">
                    {[
                        { fmt: 'pdf', icon: FileText, label: 'PDF / Print' },
                        { fmt: 'excel', icon: FileSpreadsheet, label: 'Excel (CSV)' },
                        { fmt: 'rtf', icon: FileText, label: 'RTF Document' },
                    ].map(({ fmt, icon: Icon, label }) => (
                        <button
                            key={fmt}
                            onClick={() => handle(fmt)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Icon size={14} /> {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExportButton;
