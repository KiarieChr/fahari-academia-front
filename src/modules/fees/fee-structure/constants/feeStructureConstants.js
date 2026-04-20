// Fee Structure UI constants — dropdown options and label/color mappings.
// These are frontend-only presentation concerns, not backend data.

export const FEE_CATEGORIES = [
    { id: 'TUITION', name: 'Tuition', color: 'primary' },
    { id: 'BOARDING', name: 'Boarding', color: 'success' },
    { id: 'TRANSPORT', name: 'Transport', color: 'info' },
    { id: 'EXAMS', name: 'Exams', color: 'warning' },
    { id: 'LUNCH', name: 'Lunch', color: 'secondary' },
    { id: 'ACTIVITIES', name: 'Activities', color: 'primary' },
    { id: 'LIBRARY', name: 'Library', color: 'info' },
    { id: 'LAB', name: 'Laboratory', color: 'danger' },
    { id: 'MEDICAL', name: 'Medical', color: 'success' },
    { id: 'SPORTS', name: 'Sports', color: 'warning' },
    { id: 'TECHNOLOGY', name: 'Technology', color: 'primary' },
    { id: 'OTHER', name: 'Other', color: 'secondary' },
];

export const FEE_STRUCTURE_STATUSES = ['Draft', 'Active', 'Archived'];

export const BILLING_FREQUENCIES = ['Once', 'Termly', 'Annual'];

export const APPLIES_TO_OPTIONS = ['All Students', 'Boarders Only', 'Day Scholars Only', 'Optional'];

/**
 * Compute summary stats from live fee structure data.
 * Replaces the old hardcoded feeStructureSummary mock.
 */
export function computeFeeStructureSummary(feeStructures, feeItems) {
    const active = feeStructures.filter(s => s.status === 'Active');
    const draft = feeStructures.filter(s => s.status === 'Draft');
    const archived = feeStructures.filter(s => s.status === 'Archived');

    const uniqueClasses = new Set(feeStructures.map(s => s.classId));

    // Unique account IDs across all items
    const linkedAccounts = new Set(feeItems.map(i => i.accountId).filter(Boolean));

    // Items missing an account mapping
    const missingMappings = feeItems.filter(i => !i.accountId).length;

    // Most recently modified structure
    const sorted = [...feeStructures].sort(
        (a, b) => new Date(b.raw?.updated_at || 0) - new Date(a.raw?.updated_at || 0)
    );
    const lastUpdated = sorted[0]?.raw?.updated_at || new Date().toISOString();

    return {
        totalStructures: feeStructures.length,
        activeStructures: active.length,
        draftStructures: draft.length,
        archivedStructures: archived.length,
        classesConfigured: uniqueClasses.size,
        totalLinkedAccounts: linkedAccounts.size,
        missingMappings,
        lastUpdated,
        structuresNeedingReview: draft.length,
    };
}
