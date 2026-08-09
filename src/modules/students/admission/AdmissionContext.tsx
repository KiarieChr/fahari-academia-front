import React, { createContext, useContext, useState } from 'react';

const AdmissionContext = createContext(null);

/**
 * Provides modal-trigger callbacks to all child pages under AdmissionBookDashboard.
 * Child pages can call openNewApplicant() / openImport() to trigger the shared header modals.
 */
export const AdmissionProvider = ({ children, onNewApplicant, onImport }) => (
    <AdmissionContext.Provider value={{ openNewApplicant: onNewApplicant, openImport: onImport }}>
        {children}
    </AdmissionContext.Provider>
);

export const useAdmission = () => {
    const ctx = useContext(AdmissionContext);
    if (!ctx) throw new Error('useAdmission must be used inside AdmissionProvider');
    return ctx;
};
