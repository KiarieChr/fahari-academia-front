import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Edit, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import DashboardLayout from '../../dashboard/DashboardLayout';
import { api } from '../../services/api';

const AdmissionFeeConfig = () => {
    const [templates, setTemplates] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editingTemplate, setEditingTemplate] = useState(null);
    const [templateForm, setTemplateForm] = useState({ name: 'Standard Admission Fees', is_active: true, items: [] });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [templatesRes, accountsRes] = await Promise.all([
                api.get('/api/finance/admission-fee-templates/'),
                api.get('/api/finance/accounts/?type=INCOME&is_student_related=True')
            ]);
            setTemplates(templatesRes.results || templatesRes || []);
            setAccounts(accountsRes.results || accountsRes || []);
        } catch (error) {
            toast.error('Failed to load data');
        }
        setLoading(false);
    };

    const handleAddItem = () => {
        setTemplateForm({
            ...templateForm,
            items: [...templateForm.items, { id: null, account: '', name: '', amount: 0, is_refundable: false }]
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = [...templateForm.items];
        newItems.splice(index, 1);
        setTemplateForm({ ...templateForm, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...templateForm.items];
        newItems[index][field] = value;
        setTemplateForm({ ...templateForm, items: newItems });
    };

    const handleSave = async () => {
        if (!templateForm.name) {
            toast.error('Template name is required');
            return;
        }

        // Validate items
        for (const item of templateForm.items) {
            if (!item.account || !item.name || item.amount <= 0) {
                toast.error('All fee items must have an account, name, and amount greater than 0');
                return;
            }
        }

        try {
            let savedTemplate;
            if (editingTemplate) {
                const res = await api.patch(`/api/finance/admission-fee-templates/${editingTemplate.id}/`, {
                    name: templateForm.name,
                    is_active: templateForm.is_active
                });
                savedTemplate = res;
            } else {
                const res = await api.post('/api/finance/admission-fee-templates/', {
                    name: templateForm.name,
                    is_active: templateForm.is_active
                });
                savedTemplate = res;
            }

            // Sync items (Delete old items, create new ones) - simplified approach
            // In a real app we'd do smart diffing or backend nested serialization
            if (editingTemplate) {
                for (const oldItem of editingTemplate.items) {
                    await api.delete(`/api/finance/admission-fee-items/${oldItem.id}/`);
                }
            }
            
            for (const item of templateForm.items) {
                await api.post('/api/finance/admission-fee-items/', {
                    template: savedTemplate.id,
                    account: item.account,
                    name: item.name,
                    amount: item.amount,
                    is_refundable: item.is_refundable
                });
            }

            toast.success('Template saved successfully');
            setEditingTemplate(null);
            setTemplateForm({ name: 'Standard Admission Fees', is_active: true, items: [] });
            fetchData();
        } catch (error) {
            toast.error('Failed to save template');
        }
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setTemplateForm({
            name: template.name,
            is_active: template.is_active,
            items: template.items.map(i => ({ ...i }))
        });
    };

    return (
        <DashboardLayout role="finance">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Admission Fee Templates</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* List */}
                    <div className="md:col-span-1 bg-white p-4 rounded-xl shadow border border-gray-100">
                        <h2 className="text-lg font-semibold mb-4">Templates</h2>
                        {loading ? <p>Loading...</p> : (
                            <ul className="space-y-2">
                                {templates.map(t => (
                                    <li key={t.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded border cursor-pointer" onClick={() => handleEdit(t)}>
                                        <div>
                                            <div className="font-medium">{t.name}</div>
                                            <div className="text-sm text-gray-500">{t.items.length} items</div>
                                        </div>
                                        <button className="text-blue-600 hover:text-blue-800"><Edit size={16}/></button>
                                    </li>
                                ))}
                                {templates.length === 0 && <p className="text-gray-500">No templates found.</p>}
                            </ul>
                        )}
                        <button 
                            onClick={() => { setEditingTemplate(null); setTemplateForm({ name: 'Standard Admission Fees', is_active: true, items: [] }); }}
                            className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-medium"
                        >
                            Create New Template
                        </button>
                    </div>

                    {/* Editor */}
                    <div className="md:col-span-2 bg-white p-4 rounded-xl shadow border border-gray-100">
                        <h2 className="text-lg font-semibold mb-4">{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                            <input 
                                type="text" 
                                value={templateForm.name} 
                                onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                                className="w-full border rounded-md px-3 py-2"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="flex items-center space-x-2">
                                <input 
                                    type="checkbox" 
                                    checked={templateForm.is_active} 
                                    onChange={(e) => setTemplateForm({...templateForm, is_active: e.target.checked})}
                                />
                                <span>Active</span>
                            </label>
                        </div>

                        <div className="mb-4 flex justify-between items-center">
                            <h3 className="font-medium text-gray-800">Fee Items</h3>
                            <button onClick={handleAddItem} className="flex items-center space-x-1 text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100">
                                <Plus size={16} />
                                <span>Add Item</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            {templateForm.items.map((item, idx) => (
                                <div key={idx} className="flex space-x-2 items-start border p-3 rounded bg-gray-50">
                                    <div className="flex-1 space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Votehead / Account</label>
                                                <select 
                                                    value={item.account} 
                                                    onChange={(e) => handleItemChange(idx, 'account', e.target.value)}
                                                    className="w-full border rounded text-sm p-1"
                                                >
                                                    <option value="">Select Account</option>
                                                    {accounts.map(acc => (
                                                        <option key={acc.id} value={acc.id}>{acc.name} ({acc.code})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Item Name (e.g. ID Card)</label>
                                                <input 
                                                    type="text" 
                                                    value={item.name} 
                                                    onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                                    className="w-full border rounded text-sm p-1"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Amount (KES)</label>
                                                <input 
                                                    type="number" 
                                                    value={item.amount} 
                                                    onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                                                    className="w-full border rounded text-sm p-1"
                                                />
                                            </div>
                                            <div className="flex items-center pt-5">
                                                <label className="flex items-center space-x-2 text-sm text-gray-700">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={item.is_refundable}
                                                        onChange={(e) => handleItemChange(idx, 'is_refundable', e.target.checked)}
                                                    />
                                                    <span>Refundable</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700 p-2 mt-1">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            {templateForm.items.length === 0 && (
                                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded border border-dashed">
                                    No fee items added. Click 'Add Item' to build the template.
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button onClick={handleSave} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors">
                                <Save size={18} />
                                <span>Save Template</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdmissionFeeConfig;
