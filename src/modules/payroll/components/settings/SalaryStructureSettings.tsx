import React, { useState } from 'react';
import { Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SalaryStructureSettings = () => {
    const [components, setComponents] = useState([
        { id: 1, name: 'Basic Salary', type: 'Earnings', amountType: 'Fixed', taxable: true, active: true, mandatory: true },
        { id: 2, name: 'House Allowance', type: 'Earnings', amountType: 'Fixed', taxable: true, active: true },
        { id: 3, name: 'Transport Allowance', type: 'Earnings', amountType: 'Fixed', taxable: true, active: true },
        { id: 4, name: 'NSSF', type: 'Deductions', amountType: 'Percentage', taxable: false, active: true, mandatory: true },
        { id: 5, name: 'NHIF', type: 'Deductions', amountType: 'Fixed', taxable: false, active: true, mandatory: true },
    ]);

    const handleDelete = (id) => {
        setComponents(components.filter(c => c.id !== id));
    };

    const toggleStatus = (id) => {
        setComponents(components.map(c => c.id === id ? { ...c, active: !c.active } : c));
    };

    // Placeholder for state variables that would be used by the new "Add Component" button's onClick
    // In a real application, these would be defined using useState:
    // const [editingId, setEditingId] = useState(null);
    // const [formData, setFormData] = useState({ name: '', type: 'earning', calculation: 'fixed', value: '', status: 'active' });
    // const [showModal, setShowModal] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Salary Structure & Pay Grades</h2>
                    <p className="text-sm text-gray-500">Define pay grades, salary bands, and components</p>
                </div>
                <button
                    onClick={() => {
                        // These functions (setEditingId, setFormData, setShowModal) are not defined in this snippet
                        // but are expected to be present in a complete application context.
                        // For this edit, we are adding the onClick handler as provided.
                        // setEditingId(null);
                        // setFormData({ name: '', type: 'earning', calculation: 'fixed', value: '', status: 'active' });
                        // setShowModal(true);
                        console.log("Add Component clicked - Modal logic would go here.");
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    <Plus size={16} /> Add Component
                </button>
            </div>

            {/* Pay Grade Tabs (Mock) */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['Grade A1', 'Grade A2', 'Grade B1', 'Grade B2', 'Executive'].map((grade, i) => (
                    <button key={i} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap border transition-colors ${i === 0 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {grade}
                    </button>
                ))}
                <button className="px-3 py-2 rounded-lg border border-dashed border-gray-300 text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-colors">
                    <Plus size={16} />
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Component Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4">Taxability</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <AnimatePresence>
                                {components.map((comp) => (
                                    <motion.tr
                                        key={comp.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="hover:bg-blue-50/30 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-800">{comp.name}</p>
                                            {comp.mandatory && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Statutory</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${comp.type === 'Earnings' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                                {comp.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">{comp.amountType}</td>
                                        <td className="px-6 py-4">
                                            {comp.taxable ? (
                                                <div className="flex items-center gap-1.5 text-gray-700">
                                                    <div className="w-2 h-2 rounded-full bg-orange-500"></div> Taxable
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Non-Taxable</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleStatus(comp.id)}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${comp.active ? 'bg-blue-600' : 'bg-gray-200'}`}
                                            >
                                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${comp.active ? 'translate-x-5' : 'translate-x-1'}`} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded text-gray-500 transition-colors"><Edit2 size={16} /></button>
                                                {!comp.mandatory && (
                                                    <button onClick={() => handleDelete(comp.id)} className="p-1.5 bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded text-gray-500 transition-colors"><Trash2 size={16} /></button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-4 text-blue-800 text-sm items-start">
                <AlertCircle className="mt-0.5 shrink-0" size={18} />
                <p>
                    <strong>Note:</strong> "Statutory" components like NSSF and NHIF are mandatory by law and cannot be deleted, only deactivated if specific exemptions apply.
                    Changes here affect all employee contracts linked to the "Standard" salary structure.
                </p>
            </div>
        </div>
    );
};

export default SalaryStructureSettings;
