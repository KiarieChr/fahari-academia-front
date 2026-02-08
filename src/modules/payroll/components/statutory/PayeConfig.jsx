import React, { useState } from 'react';
import { Edit2, Plus, Info } from 'lucide-react';
import EditTaxRatesModal from './modals/EditTaxRatesModal';

const PayeConfig = () => {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [bands, setBands] = useState([
        { id: 1, lower: 0, upper: 24000, rate: 10 },
        { id: 2, lower: 24001, upper: 32333, rate: 25 },
        { id: 3, lower: 32334, upper: 500000, rate: 30 },
        { id: 4, lower: 500001, upper: 800000, rate: 32.5 },
        { id: 5, lower: 800001, upper: 'Infinity', rate: 35 },
    ]);

    const [reliefs, setReliefs] = useState({
        personal: 2400,
        insuranceRate: 15,
        insuranceMax: 5000,
        ahlRate: 15,
        ahlMax: 9000
    });

    const handleSave = (newBands, newReliefs) => {
        setBands(newBands);
        setReliefs(newReliefs);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">PAYE Tax Bands</h3>
                    <p className="text-sm text-gray-500">Effective Date: 01 Jan 2026</p>
                </div>
                <button
                    onClick={() => setIsEditOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                    <Edit2 size={14} /> Edit Rates
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tax Bands Table */}
                <div className="lg:col-span-2">
                    <table className="w-full text-sm text-left border border-gray-100 rounded-lg overflow-hidden">
                        <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-600">
                            <tr>
                                <th className="px-4 py-3">Band</th>
                                <th className="px-4 py-3">Taxable Income Range (KES)</th>
                                <th className="px-4 py-3 text-right">Rate (%)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {bands.map((band, index) => (
                                <tr key={band.id}>
                                    <td className="px-4 py-3 font-medium text-gray-900">Band {index + 1}</td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {new Intl.NumberFormat().format(band.lower)} - {band.upper === 'Infinity' ? 'Above' : new Intl.NumberFormat().format(band.upper)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-gray-800">{band.rate}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Additional Settings */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Info size={16} className="text-blue-500" /> Key Limits & Relief
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Personal Relief (Monthly)</label>
                            <input type="text" value={`KES ${new Intl.NumberFormat().format(reliefs.personal)}`} disabled className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm font-bold text-gray-800" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Insurance Relief</label>
                            <input type="text" value={`${reliefs.insuranceRate}% (Max KES ${new Intl.NumberFormat().format(reliefs.insuranceMax)})`} disabled className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm font-bold text-gray-800" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Affordable Housing Relief</label>
                            <input type="text" value={`${reliefs.ahlRate}% (Max KES ${new Intl.NumberFormat().format(reliefs.ahlMax)})`} disabled className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm font-bold text-gray-800" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <EditTaxRatesModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                currentBands={bands}
                currentReliefs={reliefs}
                onSave={handleSave}
            />
        </div>
    );
};

export default PayeConfig;
