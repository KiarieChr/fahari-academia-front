import React from 'react';
import { Save } from 'lucide-react';

const SettingsSection = ({ title, description, children }) => {
    return (
        <div className="settings-section">
            <div className="settings-section-header">
                <div className="settings-section-header-content">
                    <h2 className="settings-section-title">{title}</h2>
                    <p className="settings-section-description">{description}</p>
                </div>
                <div className="settings-section-actions">
                    <button className="settings-cancel-btn">
                        Discard
                    </button>
                    <button className="settings-save-btn">
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