import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

const EditTaxRatesModal = ({ isOpen, onClose, currentBands, currentReliefs, onSave }) => {
    const [bands, setBands] = useState([]);
    const [reliefs, setReliefs] = useState({
        personal: 2400,
        insuranceRate: 15,
        insuranceMax: 5000,
        ahlRate: 15,
        ahlMax: 9000
    });

    useEffect(() => {
        if (isOpen) {
            setBands([...currentBands]);
            if (currentReliefs) setReliefs({ ...currentReliefs });
        }
    }, [isOpen, currentBands, currentReliefs]);

    const handleBandChange = (index, field, value) => {
        const newBands = [...bands];
        newBands[index][field] = value;
        setBands(newBands);
    };

    const addBand = () => {
        const lastUpper = bands.length > 0 ? bands[bands.length - 1].upper : 0;
        const newLower = lastUpper === 'Infinity' ? 0 : parseInt(lastUpper) + 1;
        setBands([...bands, { id: Date.now(), lower: newLower, upper: 0, rate: 0 }]);
    };

    const removeBand = (index) => {
        const newBands = bands.filter((_, i) => i !== index);
        setBands(newBands);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(bands, reliefs);
        toast.success('Tax Rates & Reliefs Updated Successfully');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Edit Tax Configuration</h2>
                        <p className="text-sm text-gray-500">Modify PAYE tax bands and statutory reliefs</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Tax Bands Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-bold text-gray-800">Tax Bands</h3>
                            <button type="button" onClick={addBand} className="text-xs font-bold text-black bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                                <Plus size={14} /> Add Band
                            </button>
                        </div>

                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">Band</th>
                                        <th className="px-4 py-3">Lower Limit</th>
                                        <th className="px-4 py-3">Upper Limit</th>
                                        <th className="px-4 py-3 w-32">Rate (%)</th>
                                        <th className="px-4 py-3 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {bands.map((band, index) => (
                                        <tr key={band.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 font-medium text-gray-900">Band {index + 1}</td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    value={band.lower}
                                                    onChange={(e) => handleBandChange(index, 'lower', e.target.value)}
                                                    className="w-full px-2 py-1.5 border rounded outline-none focus:border-indigo-500 text-sm bg-transparent"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={band.upper}
                                                    onChange={(e) => handleBandChange(index, 'upper', e.target.value)}
                                                    className="w-full px-2 py-1.5 border rounded outline-none focus:border-indigo-500 text-sm bg-transparent"
                                                    placeholder="Infinity"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={band.rate}
                                                        onChange={(e) => handleBandChange(index, 'rate', e.target.value)}
                                                        className="w-full pl-2 pr-6 py-1.5 border rounded outline-none focus:border-indigo-500 text-sm bg-transparent font-bold text-indigo-600"
                                                    />
                                                    <span className="absolute right-2 top-1.5 text-gray-400 text-xs font-medium">%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button type="button" onClick={() => removeBand(index)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Reliefs Section */}
                    <div>
                        <h3 className="text-base font-bold text-gray-800 mb-4">Statutory Reliefs</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Personal Relief */}
                            <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-3">
                                <h4 className="text-sm font-bold text-gray-700">Personal Relief</h4>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Monthly Amount (KES)</label>
                                    <input
                                        type="number"
                                        value={reliefs.personal}
                                        onChange={(e) => setReliefs({ ...reliefs, personal: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                                    />
                                </div>
                            </div>

                            {/* Insurance Relief */}
                            <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-3">
                                <h4 className="text-sm font-bold text-gray-700">Insurance Relief</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Rate (%)</label>
                                        <input
                                            type="number"
                                            value={reliefs.insuranceRate}
                                            onChange={(e) => setReliefs({ ...reliefs, insuranceRate: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Max Cap (KES)</label>
                                        <input
                                            type="number"
                                            value={reliefs.insuranceMax}
                                            onChange={(e) => setReliefs({ ...reliefs, insuranceMax: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* AHL Relief */}
                            <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-3">
                                <h4 className="text-sm font-bold text-gray-700">Housing Relief</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Rate (%)</label>
                                        <input
                                            type="number"
                                            value={reliefs.ahlRate}
                                            onChange={(e) => setReliefs({ ...reliefs, ahlRate: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Max Cap (KES)</label>
                                        <input
                                            type="number"
                                            value={reliefs.ahlMax}
                                            onChange={(e) => setReliefs({ ...reliefs, ahlMax: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm flex gap-3 items-start border border-amber-100">
                        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                        <p>
                            <strong>Caution:</strong> Modifying tax rates will trigger a recalculation for all unapproved payrolls in the current period.
                            Approved payrolls will remain unchanged. Ensure these rates match the latest Finance Act.
                        </p>
                    </div>

                </form>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-indigo-600 text-black rounded-xl hover:bg-indigo-700 text-sm font-bold shadow-sm shadow-indigo-200 flex items-center gap-2 transition-all"
                    >
                        <Save size={18} /> Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditTaxRatesModal;

