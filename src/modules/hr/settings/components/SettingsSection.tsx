import React from 'react';
import { Save } from 'lucide-react';

const SettingsSection = ({ title, description, children }) => {
    return (
        <div className="chart-container-compact">
            <div className="chart-header-compact flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="settings-section-header-content">
                    <h2 className="settings-section-title text-base font-semibold text-slate-900">{title}</h2>
                    <p className="settings-section-description text-sm text-slate-500">{description}</p>
                </div>
                <div className="settings-section-actions flex items-center gap-2">
                    <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
                        Discard
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                        <Save className="settings-save-icon" size={16} />
                        Save Changes
                    </button>
                </div>
            </div>
            <div className="settings-section-body">
                {children}
            </div>
        </div>
    );
};

export default SettingsSection;