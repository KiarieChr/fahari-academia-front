import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Edit2, Check, X, Eye, EyeOff, Save, RefreshCw, AlertCircle, Bot } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../../../services/apiClient';

interface AnthropicKey {
    id: number;
    name: string;
    api_key: string;
    is_active: boolean;
    created_at: string;
}

const AiApiSettings: React.FC = () => {
    const [keys, setKeys] = useState<AnthropicKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '', api_key: '', is_active: true });
    const [showKey, setShowKey] = useState<Record<number, boolean>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchKeys = async () => {
            setLoading(true);
            try {
                const response = await api.get('/api/intelligence/anthropic-keys/');
                // Assuming response could be paginated {results: []} or directly an array
                const data = response.results || response || [];
                setKeys(data);
            } catch (error) {
                console.error("Failed to load API keys:", error);
                toast.error('Failed to load API keys');
            } finally {
                setLoading(false);
            }
        };
        fetchKeys();
    }, []);

    const toggleShowKey = (id: number) => {
        setShowKey(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSave = async () => {
        if (!formData.name || !formData.api_key) {
            toast.error('Name and API Key are required');
            return;
        }

        setSaving(true);
        try {
            if (editingId) {
                const response = await api.put(`/api/intelligence/anthropic-keys/${editingId}/`, formData);
                setKeys(keys.map(k => k.id === editingId ? response : k));
                toast.success('API Key updated successfully');
            } else {
                const response = await api.post('/api/intelligence/anthropic-keys/', formData);
                setKeys([response, ...keys]);
                toast.success('API Key added successfully');
            }
            
            setIsAdding(false);
            setEditingId(null);
            setFormData({ name: '', api_key: '', is_active: true });
        } catch (error) {
            console.error("Failed to save API key:", error);
            toast.error('Failed to save API key');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this key?')) return;
        
        try {
            await api.delete(`/api/intelligence/anthropic-keys/${id}/`);
            setKeys(keys.filter(k => k.id !== id));
            toast.success('API Key deleted successfully');
        } catch (error) {
            console.error("Failed to delete API key:", error);
            toast.error('Failed to delete API key');
        }
    };

    const startEdit = (key: AnthropicKey) => {
        setEditingId(key.id);
        setFormData({ name: key.name, api_key: key.api_key, is_active: key.is_active });
        setIsAdding(true);
    };

    const cancelEdit = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({ name: '', api_key: '', is_active: true });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                <p className="text-gray-500 font-medium animate-pulse">Loading AI Configurations...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                        <Bot className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Anthropic AI Integration</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage API keys for Fahari Intelligence features (Claude 3 models).
                        </p>
                    </div>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-indigo-200 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Key
                    </button>
                )}
            </div>

            {/* Alert info */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p>
                    <strong>Security Notice:</strong> These keys have direct access to your Anthropic billing account. 
                    Only Super Admins can view or modify these settings. Ensure you use restricted keys where possible.
                </p>
            </div>

            {/* Form Section */}
            {isAdding && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 space-y-5 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">
                            {editingId ? 'Edit API Key' : 'Add New API Key'}
                        </h3>
                        <button onClick={cancelEdit} className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Key Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Production Claude 3 Opus"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">API Key</label>
                            <input
                                type="text"
                                value={formData.api_key}
                                onChange={e => setFormData({ ...formData, api_key: e.target.value })}
                                placeholder="sk-ant-..."
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={formData.is_active}
                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-700">Set as Active Key</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            onClick={cancelEdit}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all disabled:opacity-70"
                        >
                            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? 'Saving...' : 'Save Key'}
                        </button>
                    </div>
                </div>
            )}

            {/* Keys List */}
            <div className="grid grid-cols-1 gap-4">
                {keys.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                        <Key className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-gray-900 font-medium mb-1">No API Keys configured</h3>
                        <p className="text-gray-500 text-sm">Add your first Anthropic API key to enable AI features.</p>
                    </div>
                ) : (
                    keys.map(key => (
                        <div 
                            key={key.id} 
                            className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-2.5 rounded-xl mt-0.5 ${key.is_active ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <Key className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-bold text-gray-900">{key.name}</h4>
                                        {key.is_active ? (
                                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full border border-gray-200">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <code className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg font-mono">
                                            {showKey[key.id] ? key.api_key : 'sk-ant-........................'}
                                        </code>
                                        <button 
                                            onClick={() => toggleShowKey(key.id)}
                                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title={showKey[key.id] ? "Hide Key" : "Show Key"}
                                        >
                                            {showKey[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Added on {new Date(key.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => startEdit(key)}
                                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                                    title="Edit Key"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(key.id)}
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                    title="Delete Key"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AiApiSettings;
