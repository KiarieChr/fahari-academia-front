
import React, { useState, useEffect } from 'react';
import { Shield, Lock } from 'lucide-react';
import { egpService } from '../../../../services/egpService';

const ComplianceLog = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        egpService.getAuditLogs().then(setLogs);
    }, []);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2 text-gray-700">
                <Shield size={20} className="text-indigo-600" />
                <h3 className="font-bold">Immutable Audit Trail</h3>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded ml-auto flex items-center gap-1">
                    <Lock size={10} /> Read Only
                </span>
            </div>

            <div className="divide-y divide-gray-100">
                {logs.map(log => (
                    <div key={log.id} className="egp-log-item p-4 hover:bg-gray-50 transition-colors flex gap-4 border-l-2 border-transparent">
                        <div className="min-w-[120px] text-xs text-gray-500 pt-1">
                            {log.date}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <span className="font-semibold text-gray-800 text-sm">{log.action}</span>
                                <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">{log.user}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ComplianceLog;
