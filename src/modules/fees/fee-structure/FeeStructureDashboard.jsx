import React, { useState, useEffect } from 'react';
import { Plus, Check, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import FeeStructureSummaryCards from './components/FeeStructureSummaryCards';
import ClassTermSelector from './components/ClassTermSelector';
import FeeItemsTable from './components/FeeItemsTable';
import AddEditFeeItemModal from './components/AddEditFeeItemModal';
import CopyFeeStructureModal from './components/CopyFeeStructureModal';
import FeeImpactPreview from './components/FeeImpactPreview';
import ActivationConfirmModal from './components/ActivationConfirmModal';
import { api } from '../../../services/api';
import { toast } from 'react-toastify';

import {
    feeStructureSummary as initialSummary,
    feeCategories
} from './data/mockFeeStructureData';
import {
    calculateTotalTermFee,
    calculateMandatoryOptionalBreakdown,
    canEditFeeStructure,
    canActivateFeeStructure,
    copyFeeStructure
} from './utils/feeStructureUtils';



const FeeStructureDashboard = () => {
    const printRef = useRef();
    // Reference Data State
    const [refClasses, setRefClasses] = useState([]);
    const [refYears, setRefYears] = useState([]); // Names for UI
    const [refTerms, setRefTerms] = useState([]); // Names for UI (Filtered)
    const [rawYears, setRawYears] = useState([]); // Full Objects
    const [rawTerms, setRawTerms] = useState([]); // Full Objects
    const [incomeAccounts, setIncomeAccounts] = useState([]);

    // Selection State
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    // Data State
    const [feeStructures, setFeeStructures] = useState([]);
    const [feeItems, setFeeItems] = useState([]);
    const [currentStructure, setCurrentStructure] = useState(null);
    const [currentFeeItems, setCurrentFeeItems] = useState([]);
    const [selectedFeeItems, setSelectedFeeItems] = useState([]); // Bulk selection
    // Removed propagateToLevel - simplifies workflow, schools configure each class individually
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [showActivationModal, setShowActivationModal] = useState(false);
    const [editingFeeItem, setEditingFeeItem] = useState(null);

    // Initial Data Fetch
    useEffect(() => {
        const fetchRefData = async () => {
            try {
                const [classesRes, yearsRes, termsRes, accountsRes] = await Promise.all([
                    api.get('/api/settings/classes/'),
                    api.get('/api/settings/academic-years/'),
                    api.get('/api/settings/terms/'),
                    api.get('/api/finance/accounts/?type=INCOME')
                ]);

                // Helper to handle pagination
                const getItems = (res) => {
                    if (!res) return [];
                    return Array.isArray(res) ? res : (res.results || []);
                };

                const classesData = getItems(classesRes);
                const yearsData = getItems(yearsRes);
                const termsData = getItems(termsRes);
                const accountsData = getItems(accountsRes);

                // Map data to match UI expectations
                setRefClasses(classesData.map(c => ({ id: c.id, name: c.name, level: c.level || 'Primary' })));

                // Store Raw and UI Data
                setRawYears(yearsData);
                setRawTerms(termsData);

                const uniqueYearNames = [...new Set(yearsData.map(y => y.name))].filter(Boolean);
                setRefYears(uniqueYearNames);

                // Initial Term Load - Filter by first year if exists, else all unique
                if (uniqueYearNames.length > 0) {
                    const firstYear = yearsData.find(y => y.name === uniqueYearNames[0]);
                    if (firstYear) {
                        const relevantTerms = termsData
                            .filter(t => t.academic_year === firstYear.id)
                            .map(t => t.name);
                        setRefTerms([...new Set(relevantTerms)]);
                    } else {
                        setRefTerms([]);
                    }
                    setSelectedYear(uniqueYearNames[0]);
                } else {
                    setRefTerms([]);
                }

                setIncomeAccounts(accountsData);

            } catch (error) {
                console.error("Error fetching reference data", error);
                toast.error("Failed to load reference data");
            }
        };

        fetchRefData();
    }, []);

    // Filter Terms when Year Changes
    useEffect(() => {
        if (!selectedYear || rawYears.length === 0 || rawTerms.length === 0) return;

        const yearObj = rawYears.find(y => y.name === selectedYear);
        if (yearObj) {
            const filtered = rawTerms
                .filter(t => t.academic_year === yearObj.id)
                .map(t => t.name);
            setRefTerms([...new Set(filtered)]);

            // Clear selected term if it's no longer valid
            if (selectedTerm && !filtered.includes(selectedTerm)) {
                setSelectedTerm('');
            } else if (!selectedTerm && filtered.length > 0) {
                // Optional: Auto-select first term
                setSelectedTerm(filtered[0]);
            }
        }
    }, [selectedYear, rawYears, rawTerms]);

    // Fetch Fee Structures - extracted to component level for reuse
    const fetchStructures = async () => {
        if (!refClasses.length) return; // Wait for refs
        setLoading(true);
        try {
            const response = await api.get('/api/fees/fee-structures/');
            const structures = Array.isArray(response) ? response : (response.results || []);

            // Transform backend data to UI shape and extract items
            const uiStructures = [];
            let allItems = [];

            structures.forEach(s => {
                // Find class name from ref
                const cls = refClasses.find(c => c.id === s.grade);
                const yr = s.academic_year_details?.name;
                const tm = s.term_details?.name;

                const uiStruct = {
                    id: s.id,
                    classId: s.grade,
                    className: cls ? cls.name : 'Unknown',
                    academicYear: yr,
                    term: tm,
                    status: s.status === 'ACTIVE' ? 'Active' : s.status === 'DRAFT' ? 'Draft' : 'Archived',
                    version: 1, // Backend doesn't track version yet
                    billingStarted: false, // Backend assumption
                    studentCount: 0, // Backend doesn't verify yet
                    // Keep raw references for API calls
                    raw: s
                };
                uiStructures.push(uiStruct);

                // Extract items - using is_optional (mandatory = !is_optional)
                if (s.items) {
                    const structItems = s.items.map(item => ({
                        id: item.id,
                        structureId: s.id,
                        name: item.name,
                        category: item.category || 'TUITION',
                        accountId: item.account,
                        amount: parseFloat(item.amount),
                        is_optional: item.is_optional || false, // Backend field
                        mandatory: !item.is_optional, // Computed for UI compatibility
                        frequency: item.frequency === 'RECURRING' ? 'Termly' : 'One Time',
                        appliesTo: 'All Students',
                        status: 'Active',
                        order: item.priority
                    }));
                    allItems = [...allItems, ...structItems];
                }
            });

            setFeeStructures(uiStructures);
            setFeeItems(allItems);

        } catch (error) {
            console.error("Error fetching fee structures", error);
            // toast.error("Failed to load fee structures");
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch of Fee Structures
    useEffect(() => {
        fetchStructures();
    }, [refClasses]); // Re-run if refClasses load (needed for mapping names)

    // Update current structure when filters change
    useEffect(() => {
        if (selectedClass && selectedYear && selectedTerm) {
            const structure = feeStructures.find(
                s => s.classId == selectedClass && // Loose equality for ID types
                    s.academicYear === selectedYear &&
                    s.term === selectedTerm
            );
            setCurrentStructure(structure || null);

            if (structure) {
                const items = feeItems.filter(item => item.structureId === structure.id);
                setCurrentFeeItems(items);
            } else {
                setCurrentFeeItems([]);
            }
        } else {
            setCurrentStructure(null);
            setCurrentFeeItems([]);
        }
    }, [selectedClass, selectedYear, selectedTerm, feeStructures, feeItems]);

    // Calculate term total for summary cards
    const termTotal = currentFeeItems.length > 0
        ? {
            total: calculateTotalTermFee(currentFeeItems),
            ...calculateMandatoryOptionalBreakdown(currentFeeItems)
        }
        : { total: 0, mandatory: 0, optional: 0 };

    const projectedRevenue = termTotal.total * (currentStructure?.studentCount || 0);

    // Dynamic Validation Status
    const validationStatus = React.useMemo(() => {
        if (!currentStructure) return null;
        let errors = [];
        if (!currentFeeItems.some(i => i.mandatory)) errors.push("No mandatory fee items.");
        if (currentFeeItems.some(i => !i.accountId)) errors.push("Items missing account mapping.");
        return { isValid: errors.length === 0, errors };
    }, [currentStructure, currentFeeItems]);

    const handleClassChange = (classId) => {
        setSelectedClass(classId);
    };

    const handleAddItem = () => {
        setEditingFeeItem(null);
        setShowAddEditModal(true);
    };

    const handleEditItem = (item) => {
        setEditingFeeItem(item);
        setShowAddEditModal(true);
    };

    const handleDuplicateItem = (item) => {
        // ... (Client side only for now, logic complex to reimplement fully backend without endpoint)
        toast.error("Duplicate item not supported via API yet");
    };

    const handleDeleteItem = async (item) => {
        if (currentStructure && !canEditFeeStructure(currentStructure)) {
            alert('Cannot delete fee items from this structure.');
            return;
        }

        if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
            try {
                await api.delete(`/api/fees/fee-items/${item.id}/`);
                setFeeItems(feeItems.filter(fi => fi.id !== item.id));
                toast.success('Fee item deleted successfully!');
            } catch (error) {
                console.error(error);
                toast.error("Failed to delete item");
            }
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedFeeItems.length) return;
        if (confirm(`Delete ${selectedFeeItems.length} items?`)) {
            // Sequential delete for mock backend
            for (const id of selectedFeeItems) {
                await api.delete(`/api/fees/fee-items/${id}/`);
            }
            setFeeItems(prev => prev.filter(i => !selectedFeeItems.includes(i.id)));
            setSelectedFeeItems([]);
            toast.success("Bulk delete complete");
        }
    };

    const handleBulkUpdateStatus = async (makeOptional) => {
        if (!selectedFeeItems.length) return;
        // Update is_optional field (mandatory = !is_optional)
        const updates = feeItems.map(i =>
            selectedFeeItems.includes(i.id)
                ? { ...i, is_optional: makeOptional, mandatory: !makeOptional }
                : i
        );
        setFeeItems(updates);
        setSelectedFeeItems([]);
        toast.success(`Bulk update complete - items set to ${makeOptional ? 'Optional' : 'Mandatory'}`);
    };

    const handleInlineUpdate = async (item, newAmount) => {
        // Optimistic update
        setFeeItems(prev => prev.map(i => i.id === item.id ? { ...i, amount: parseFloat(newAmount) } : i));
        try {
            await api.patch(`/api/fees/fee-items/${item.id}/`, { amount: newAmount });
        } catch (e) {
            toast.error("Failed to update amount");
            // Revert? For now assume success or full refresh
        }
    };

    const handleSaveFeeItem = async (feeItemData) => {
        try {
            let structureId = currentStructure?.id;

            if (!structureId) {
                // Resolve IDs from Local Data instead of API search
                const yearObj = rawYears.find(y => y.name === selectedYear);
                const termObj = rawTerms.find(t => t.name === selectedTerm && t.academic_year === yearObj?.id);

                if (!yearObj || !termObj) {
                    toast.error("Could not resolve Academic Year or Term configuration.");
                    return;
                }

                const structRes = await api.post('/api/fees/fee-structures/', {
                    academic_year: yearObj.id,
                    term: termObj.id,
                    grade: selectedClass,
                    status: 'DRAFT',
                    currency: 'KES'
                });
                structureId = structRes.id;

                // Update local state
                const newStruct = { ...structRes, status: 'Draft', classId: selectedClass, academicYear: selectedYear, term: selectedTerm, items: [] };
                setFeeStructures([...feeStructures, newStruct]);
                setCurrentStructure(newStruct);
            }

            // Save Item - convert mandatory to is_optional for backend
            const payload = {
                structure: structureId,
                name: feeItemData.name,
                amount: feeItemData.amount,
                account: feeItemData.accountId || 1,
                is_optional: !feeItemData.mandatory, // Backend uses is_optional
                frequency: feeItemData.frequency === 'Termly' ? 'RECURRING' : 'ONE_TIME',
                priority: feeItemData.order || 1
            };

            if (editingFeeItem) {
                const res = await api.patch(`/api/fees/fee-items/${editingFeeItem.id}/`, payload);
                setFeeItems(feeItems.map(i => i.id === editingFeeItem.id ? {
                    ...i,
                    ...res,
                    name: res.name,
                    amount: parseFloat(res.amount),
                    is_optional: res.is_optional,
                    mandatory: !res.is_optional
                } : i));
                toast.success("Item updated");
            } else {
                const res = await api.post('/api/fees/fee-items/', payload);
                const newItem = {
                    id: res.id,
                    structureId: structureId,
                    name: res.name,
                    category: feeItemData.category,
                    accountId: res.account,
                    amount: parseFloat(res.amount),
                    is_optional: res.is_optional,
                    mandatory: !res.is_optional, // Computed for UI compatibility
                    frequency: res.frequency === 'RECURRING' ? 'Termly' : 'One Time',
                    status: 'Active',
                    order: res.priority,
                    appliesTo: 'All Students'
                };

                // Simplified: No propagation - each structure is configured individually
                // This is clearer for Kenyan schools that often have different fees per class
                setFeeItems(prev => [...prev, newItem]);
                toast.success("Item created");
            }
            setShowAddEditModal(false);

        } catch (error) {
            console.error(error);
            toast.error("Failed to save fee item. Ensure Account is valid.");
        }
    };

    const handleCopyStructure = async (copyConfig) => {
        // Use sourceStructureId from config (selected in modal) instead of currentStructure
        const sourceId = copyConfig.sourceStructureId;
        if (!sourceId) {
            toast.error("Please select a source structure to copy from.");
            return;
        }

        try {
            // Resolve Names to IDs
            const yearObj = rawYears.find(y => y.name === copyConfig.targetYear);
            const termObj = rawTerms.find(t => t.name === copyConfig.targetTerm && t.academic_year === yearObj?.id);

            if (!yearObj || !termObj) {
                toast.error("Invalid Target Year or Term selected.");
                return;
            }

            const payload = {
                target_grade_ids: copyConfig.targetClasses,
                target_academic_year: yearObj.id,
                target_term: termObj.id,
                percentage_increase: parseFloat(copyConfig.percentageIncrease) || 0
            };

            const response = await api.post(`/api/fees/fee-structures/${sourceId}/clone/`, payload);

            toast.success(response.detail || "Structure cloned successfully");

            // Refresh structures list
            fetchStructures();
            setShowCopyModal(false);

        } catch (error) {
            console.error(error);
            toast.error(error.message || "Copy failed");
        }
    };

    const handleInitiateActivation = () => {
        if (!currentStructure) return;
        const validation = canActivateFeeStructure(currentStructure, currentFeeItems, incomeAccounts);
        if (!validation.canActivate) {
            toast.error(`Cannot activate: ${validation.reason}`);
            return;
        }
        setShowActivationModal(true);
    };

    const handleActivateStructure = async () => {
        if (!currentStructure) return;

        // Validation already checked before modal open, but good to double check
        // ...

        try {
            await api.patch(`/api/fees/fee-structures/${currentStructure.id}/`, { status: 'ACTIVE' });
            setFeeStructures(prev => prev.map(s => s.id === currentStructure.id ? { ...s, status: 'Active' } : s));
            toast.success("Structure Activated");
            setShowActivationModal(false);
        } catch (e) {
            toast.error("Activation failed");
        }
    };

    const handleArchiveStructure = async () => {
        if (!currentStructure) return;
        try {
            await api.patch(`/api/fees/fee-structures/${currentStructure.id}/`, { status: 'INACTIVE' });
            setFeeStructures(prev => prev.map(s => s.id === currentStructure.id ? { ...s, status: 'Archived' } : s));
            toast.success("Structure Archived");
        } catch (e) {
            toast.error("Archive failed");
        }
    };

    const canEdit = currentStructure ? canEditFeeStructure(currentStructure) : true;

    // Pass dynamic data to selectors
    // NOTE: ClassTermSelector expects `classes` array, `academicYears` array etc.
    // We must pass our fetched fetched `refClasses` etc as props OR update the data file.
    // Since we can't change child components easily without editing them too, 
    // we should override the props they receive. 
    // But `ClassTermSelector.jsx` imports them directly from file. 
    // I MUST EDIT `ClassTermSelector.jsx` to accept props instead of import?
    // checking ClassTermSelector.jsx... "import { classes ... } from '../data/mock'"
    // It DOES NOT accept them as props currently. 
    // FIX: I will modify `ClassTermSelector.jsx` to assume if props are passed, use them.

    // BUT WAIT: The user said "not changing the ui". That usually means "don't change how it looks", logic changes are fine.
    // I will pass `classes={refClasses}`, `years={refYears}`, `terms={refTerms}` to `ClassTermSelector` 
    // AND I will have to edit `ClassTermSelector` to utilize them.

    const handleClickPrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Fee Structure - ${refClasses.find(c => c.id == selectedClass)?.name || selectedClass} - ${selectedTerm} ${selectedYear}`
    });

    const handleDownloadPDF = () => {
        if (!currentStructure) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text('FAHARI ACADEMY', 14, 22);

        doc.setFontSize(14);
        doc.text('Fee Structure', 14, 30);

        // Metadata
        doc.setFontSize(10);
        doc.setTextColor(100);
        const className = refClasses.find(c => c.id == selectedClass)?.name || selectedClass;
        doc.text(`Class: ${className}`, 14, 40);
        doc.text(`Term: ${selectedTerm} ${selectedYear}`, 14, 45);
        doc.text(`Status: ${currentStructure.status}`, 14, 50);

        // Table Data
        const tableColumn = ["Fee Item", "Category", "Frequency", "Type", "Amount (KES)"];
        const tableRows = [];

        currentFeeItems.forEach(item => {
            const categoryName = feeCategories.find(c => c.id === item.category)?.name || item.category;
            const feeData = [
                item.name,
                categoryName,
                item.frequency,
                item.mandatory ? 'Mandatory' : 'Optional',
                item.amount.toLocaleString('en-KE', { style: 'currency', currency: 'KES' }).replace('KES', '').trim()
            ];
            tableRows.push(feeData);
        });

        // Calculate Totals properly for display
        const mandatoryTotal = currentFeeItems.filter(i => i.mandatory).reduce((sum, item) => sum + item.amount, 0);
        const optionalTotal = currentFeeItems.filter(i => !i.mandatory).reduce((sum, item) => sum + item.amount, 0);

        // Add Table
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 60,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
            columnStyles: {
                4: { halign: 'right' }
            },
        });

        // Footer / Totals Summary
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(`Mandatory Fees Total:   KES ${mandatoryTotal.toLocaleString()}`, 14, finalY);
        doc.text(`Optional Fees Total:    KES ${optionalTotal.toLocaleString()}`, 14, finalY + 6);

        doc.setDrawColor(0);
        doc.line(14, finalY + 9, 80, finalY + 9);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Grand Total Term Fee:   KES ${termTotal.total.toLocaleString()}`, 14, finalY + 16);

        // Generated Date
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 280);

        doc.save(`FeeStructure_${className}_${selectedTerm}_${selectedYear}.pdf`);
    };

    return (
        <DashboardLayout title="Fee Structure">
            <div className="fee-structure-dashboard">
                {/* Header */}
                <div className="fee-section-header mb-4">
                    <div>
                        <h4 className="mb-1">Fee Structure Dashboard</h4>
                        <p className="text-muted mb-0">Configure class-based fee structures linked to Chart of Accounts</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <FeeStructureSummaryCards
                    summary={{
                        ...initialSummary,
                        projectedRevenue // Inject dynamic value
                    }}
                    selectedClass={refClasses.find(c => c.id == selectedClass)?.name}
                    selectedTerm={selectedTerm}
                    termTotal={termTotal}
                />

                {currentStructure && !validationStatus?.isValid && (
                    <div className="alert alert-warning d-flex align-items-center mt-3">
                        <span className="me-2">⚠️ Structure has issues:</span>
                        <span>{validationStatus?.errors.join(', ')}</span>
                    </div>
                )}

                {/* Class & Term Selector */}
                <ClassTermSelector
                    // Pass dynamic refs
                    classes={refClasses}
                    academicYears={refYears}
                    terms={refTerms}

                    selectedClass={selectedClass}
                    selectedYear={selectedYear}
                    selectedTerm={selectedTerm}
                    selectedStatus={selectedStatus}
                    onClassChange={handleClassChange}
                    onYearChange={setSelectedYear}
                    onTermChange={setSelectedTerm}
                    onStatusChange={setSelectedStatus}
                    onCopy={() => setShowCopyModal(true)}
                    onArchive={handleArchiveStructure}
                    onActivate={handleInitiateActivation}
                    currentStructure={currentStructure}
                // Removed propagateToLevel - simplified workflow
                />

                {/* Fee Impact Preview */}
                {currentFeeItems.length > 0 && (
                    <FeeImpactPreview
                        feeItems={currentFeeItems}
                        studentCount={currentStructure?.studentCount || 0}
                        previousYearItems={null}
                    />
                )}

                {/* Fee Items Table */}
                {/* Fee Items Content Area */}
                {!selectedClass ? (
                    // 1. No Class Selected
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center py-5">
                            <h5 className="text-muted">Select a Class to Begin</h5>
                            <p className="text-muted">Choose a class, academic year, and term to view or configure fee structure.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* 2. Class Selected, Check Data State */}
                        {currentFeeItems.length === 0 ? (
                            <div className="card border-0 shadow-sm">
                                <div className="card-body py-5">
                                    <div className="row justify-content-center text-center mb-4">
                                        <div className="col-md-8">
                                            <div className="mb-3">
                                                <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle p-3">
                                                    <Plus className="text-primary" size={32} />
                                                </div>
                                            </div>
                                            <h4>Configure Fee Structure</h4>
                                            <p className="text-muted">
                                                No fee items found for <strong>{refClasses.find(c => c.id == selectedClass)?.name}</strong> for {selectedTerm} {selectedYear}.
                                                How would you like to start?
                                            </p>
                                        </div>
                                    </div>

                                    <div className="row justify-content-center g-4">
                                        {/* Option A: Start from Scratch */}
                                        <div className="col-md-3">
                                            <button
                                                onClick={handleAddItem}
                                                className="card h-100 w-100 text-start btn btn-outline-light border-secondary-subtle p-3 hover-shadow transition-all"
                                                style={{ color: 'inherit' }}
                                            >
                                                <div className="d-flex align-items-center mb-3 text-primary">
                                                    <Plus size={24} />
                                                </div>
                                                <h6 className="fw-bold mb-2">Start from Scratch</h6>
                                                <p className="small text-muted mb-0">
                                                    Create a new draft and add fee items manually one by one.
                                                </p>
                                            </button>
                                        </div>

                                        {/* Option B: Copy Previous */}
                                        <div className="col-md-3">
                                            <button
                                                onClick={() => setShowCopyModal(true)}
                                                className="card h-100 w-100 text-start btn btn-outline-light border-secondary-subtle p-3 hover-shadow transition-all"
                                                style={{ color: 'inherit' }}
                                            >
                                                <div className="d-flex align-items-center mb-3 text-secondary">
                                                    <div className="position-relative">
                                                        <div className="border border-current rounded p-1" style={{ width: 20, height: 24 }}></div>
                                                        <div className="position-absolute bottom-0 end-0 bg-white rounded-circle">
                                                            <Plus size={14} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <h6 className="fw-bold mb-2">Copy Previous Term</h6>
                                                <p className="small text-muted mb-0">
                                                    Clone the structure from Term 1 or the previous academic year.
                                                </p>
                                            </button>
                                        </div>

                                        {/* Option C: Copy Parallel */}
                                        <div className="col-md-3">
                                            <button
                                                onClick={() => setShowCopyModal(true)}
                                                className="card h-100 w-100 text-start btn btn-outline-light border-secondary-subtle p-3 hover-shadow transition-all"
                                                style={{ color: 'inherit' }}
                                            >
                                                <div className="d-flex align-items-center mb-3 text-success">
                                                    <div className="d-flex" style={{ opacity: 0.7 }}>
                                                        <div className="border border-current rounded-circle p-1 me-1"></div>
                                                        <div className="border border-current rounded-circle p-1"></div>
                                                    </div>
                                                </div>
                                                <h6 className="fw-bold mb-2">Copy Parallel Class</h6>
                                                <p className="small text-muted mb-0">
                                                    Copy from another class in the same level (e.g. 4 East to 4 West).
                                                </p>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // 3. Data Exists - Show Table
                            <FeeItemsTable
                                feeItems={currentFeeItems}
                                onEdit={handleEditItem}
                                onDuplicate={handleDuplicateItem}
                                onDelete={handleDeleteItem}
                                canEdit={canEdit}
                                onAddItem={handleAddItem}
                                onPrint={handleClickPrint}
                                onDownloadPDF={handleDownloadPDF}
                                incomeAccounts={incomeAccounts}
                                feeCategories={feeCategories}
                                // New Props
                                selectedItems={selectedFeeItems}
                                onSelectItems={setSelectedFeeItems}
                                onBulkDelete={handleBulkDelete}
                                onBulkStatus={handleBulkUpdateStatus}
                                onInlineUpdate={handleInlineUpdate}
                            />
                        )}
                    </>
                )}

                {/* Modals */}
                <AddEditFeeItemModal
                    show={showAddEditModal}
                    onClose={() => {
                        setShowAddEditModal(false);
                        setEditingFeeItem(null);
                    }}
                    onSave={handleSaveFeeItem}
                    feeItem={editingFeeItem}
                    classId={selectedClass}
                    term={selectedTerm}
                    academicYear={selectedYear}
                    incomeAccounts={incomeAccounts}
                    feeCategories={feeCategories}
                />

                {/* Hidden Printable Section */}
                <div style={{ overflow: 'hidden', height: 0 }}>
                    <div ref={printRef} className="p-5 bg-white text-dark">
                        {/* Header */}
                        <div className="text-center mb-4">
                            <h2 className="fw-bold mb-1">FAHARI ACADEMY</h2>
                            <h5 className="text-uppercase text-muted">Fee Structure</h5>
                            <div className="border-bottom w-50 mx-auto my-3"></div>
                        </div>

                        {/* Info */}
                        <div className="d-flex justify-content-between mb-4">
                            <div>
                                <p className="mb-1"><strong>Class:</strong> {refClasses.find(c => c.id == selectedClass)?.name || selectedClass}</p>
                                <p className="mb-1"><strong>Term:</strong> {selectedTerm} {selectedYear}</p>
                            </div>
                            <div className="text-end">
                                <p className="mb-1"><strong>Generated:</strong> {new Date().toLocaleDateString()}</p>
                                <p className="mb-1"><strong>Status:</strong> {currentStructure?.status}</p>
                            </div>
                        </div>

                        {/* Table */}
                        <table className="table table-striped table-bordered">
                            <thead className="table-light">
                                <tr>
                                    <th>Fee Item</th>
                                    <th>Category</th>
                                    <th>Frequency</th>
                                    <th>Type</th>
                                    <th className="text-end">Amount (KES)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentFeeItems.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.name}</td>
                                        <td>{feeCategories.find(c => c.id === item.category)?.name || item.category}</td>
                                        <td>{item.frequency}</td>
                                        <td>{item.mandatory ? 'Mandatory' : 'Optional'}</td>
                                        <td className="text-end">{item.amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th colSpan="4" className="text-end">Mandatory Total:</th>
                                    <th className="text-end">{currentFeeItems.filter(i => i.mandatory).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</th>
                                </tr>
                                <tr>
                                    <th colSpan="4" className="text-end">Optional Total:</th>
                                    <th className="text-end">{currentFeeItems.filter(i => !i.mandatory).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</th>
                                </tr>
                                <tr className="fw-bold fs-5 border-top border-dark">
                                    <th colSpan="4" className="text-end">GRAND TOTAL:</th>
                                    <th className="text-end">{termTotal.total.toLocaleString()}</th>
                                </tr>
                            </tfoot>
                        </table>

                        <div className="mt-5 text-center text-muted small">
                            <p>This document is generated by the School Management System.</p>
                        </div>
                    </div>
                </div>

                <CopyFeeStructureModal
                    show={showCopyModal}
                    onClose={() => setShowCopyModal(false)}
                    onCopy={handleCopyStructure}
                    currentStructure={currentStructure}
                    currentFeeItems={currentFeeItems}
                    classes={refClasses}
                    academicYears={refYears}
                    terms={refTerms}
                    rawYears={rawYears}
                    rawTerms={rawTerms}
                />

                <ActivationConfirmModal
                    show={showActivationModal}
                    onClose={() => setShowActivationModal(false)}
                    onConfirm={handleActivateStructure}
                    structure={currentStructure}
                    feeItems={currentFeeItems}
                />
            </div>
        </DashboardLayout>
    );
};

export default FeeStructureDashboard;

