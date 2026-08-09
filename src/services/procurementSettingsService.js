
// Mock Configuration Data
const DEFAULT_SETTINGS = {
    general: {
        financialYear: '2024-2025',
        currency: 'KES',
        taxEnabled: true,
        taxRate: 16,
        allowNegativeStock: false,
        autoGenerateCodes: true
    },
    workflows: {
        poApprovalLimit: 100000,
        requireGRNApproval: true,
        levels: [
            { role: 'Head of Department', limit: 50000 },
            { role: 'Procurement Officer', limit: 100000 },
            { role: 'Finance Manager', limit: 500000 },
            { role: 'Principal', limit: 1000000 }
        ]
    },
    thresholds: {
        rfqLimit: 500000,
        tenderLimit: 5000000,
        directProcurementLimit: 50000
    },
    inventory: {
        valuationMethod: 'FIFO',
        defaultStore: 'Main Store',
        lowStockThreshold: 10
    }
};

export const procurementSettingsService = {
    // Get all settings
    getSettings: async () => {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API
        // In a real app, this would fetch from DB. For now, we return defaults or stored mock.
        return DEFAULT_SETTINGS;
    },

    // Update specific section
    updateSettings: async (section, data) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        console.log(`Updated ${section} settings:`, data);
        // Simulate update
        return { success: true, message: 'Settings saved successfully' };
    },

    // Reset to defaults
    resetDefaults: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, settings: DEFAULT_SETTINGS };
    }
};
