
import React, { useState } from 'react';
import { Settings, Globe, GitMerge, ShieldCheck, Box } from 'lucide-react';
import GlobalSettings from './GlobalSettings';
import WorkflowSettings from './WorkflowSettings';

const ProcurementSettings = () => {
    const [activeSection, setActiveSection] = useState('global');

    const MENU_ITEMS = [
        { id: 'global', label: 'General & Budget', icon: Globe },
        { id: 'workflows', label: 'Approval Workflows', icon: GitMerge },
        { id: 'compliance', label: 'Compliance & E-GP', icon: ShieldCheck }, // Placeholder
        { id: 'inventory', label: 'Inventory Rules', icon: Box }, // Placeholder
    ];

    return (
        <div className="flex flex-col md:flex-row gap-6 min-h-[600px]">
            {/* Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Settings size={18} /> Configuration
                        </h3>
                    </div>
                    <div className="p-2 space-y-1">
                        {MENU_ITEMS.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeSection === item.id
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1">
                {activeSection === 'global' && <GlobalSettings />}
                {activeSection === 'workflows' && <WorkflowSettings />}

                {/* Placeholders for future sections */}
                {(activeSection === 'compliance' || activeSection === 'inventory') && (
                    <div className="bg-white p-12 text-center rounded-xl border border-gray-200 border-dashed">
                        <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4 text-gray-400">
                            <Settings size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800">Configuration Module</h3>
                        <p className="text-gray-500 mt-2">This section is currently under development.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProcurementSettings;
