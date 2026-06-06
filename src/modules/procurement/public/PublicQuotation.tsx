import React, { useState, useEffect } from 'react';
import { FileText, Send, CheckCircle, AlertCircle, Upload, Trash2 } from 'lucide-react';
import procurementApi from '../../../services/procurementApiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Public-facing quotation submission page.
 * Accessed via /quote/:token (no auth required).
 * The token is a UUID from the RFQSupplierInvitation.
 */
const PublicQuotation = () => {
    const token = window.location.pathname.split('/quote/')[1]?.replace(/\/$/, '');
    const [rfqData, setRfqData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        quotation_reference: '',
        delivery_period: '',
        payment_terms: '',
        validity_days: 30,
        notes: '',
        document: null,
    });
    const [lines, setLines] = useState([]);

    useEffect(() => {
        if (!token) {
            setError('Invalid quotation link');
            setLoading(false);
            return;
        }
        loadRFQ();
    }, []);

    const loadRFQ = async () => {
        try {
            const data = await procurementApi.publicQuote.getRFQ(token);
            setRfqData(data);
            if (data.already_submitted) {
                setSubmitted(true);
            }
            // Pre-fill lines from RFQ lines
            if (data.lines?.length) {
                setLines(data.lines.map(l => ({
                    rfq_line: l.id,
                    description: l.description,
                    quantity: Number(l.quantity),
                    unit_price: '',
                })));
            }
        } catch (err) {
            setError(err?.data?.detail || 'Invalid or expired quotation link');
        } finally {
            setLoading(false);
        }
    };

    const updateLine = (i, field, val) => {
        setLines(prev => {
            const copy = [...prev];
            copy[i] = { ...copy[i], [field]: val };
            return copy;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!lines.length || lines.some(l => !l.unit_price)) {
            return toast.error('Please enter unit prices for all items');
        }
        setSubmitting(true);
        try {
            await procurementApi.publicQuote.submit(token, {
                ...form,
                lines: lines.map(l => ({
                    rfq_line: l.rfq_line,
                    description: l.description,
                    quantity: l.quantity,
                    unit_price: l.unit_price,
                })),
            });
            setSubmitted(true);
            toast.success('Quotation submitted successfully!');
        } catch (err) {
            toast.error(err?.data?.detail || 'Failed to submit quotation');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500">Loading quotation request...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Link Error</h2>
                    <p className="text-gray-500">{error}</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Quotation Submitted</h2>
                    <p className="text-gray-500 mb-4">Thank you for your quotation. You will be notified of the outcome.</p>
                    {rfqData && (
                        <p className="text-sm text-gray-400">RFQ: {rfqData.rfq_number} — {rfqData.title}</p>
                    )}
                </div>
                <ToastContainer position="top-right" autoClose={3000} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <ToastContainer position="top-right" autoClose={3000} />
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-3">
                        <FileText size={28} className="text-blue-600" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Quotation Submission Portal</h1>
                            <p className="text-sm text-gray-500">Submit your quotation for the request below</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* RFQ Info */}
                <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-1">{rfqData.title}</h2>
                    <p className="text-sm text-gray-500 mb-3">RFQ Number: {rfqData.rfq_number}</p>
                    {rfqData.description && <p className="text-sm text-gray-600 mb-3">{rfqData.description}</p>}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm bg-gray-50 p-4 rounded-lg">
                        <div><span className="text-gray-500">Supplier:</span> <span className="font-medium">{rfqData.supplier_name}</span></div>
                        <div><span className="text-gray-500">Deadline:</span> <span className="font-medium text-red-600">{new Date(rfqData.deadline).toLocaleString()}</span></div>
                        <div><span className="text-gray-500">Items:</span> <span className="font-medium">{rfqData.lines?.length || 0}</span></div>
                    </div>
                    {rfqData.terms_and_conditions && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <h4 className="text-xs font-semibold text-blue-800 mb-1">Terms & Conditions</h4>
                            <p className="text-xs text-blue-700 whitespace-pre-wrap">{rfqData.terms_and_conditions}</p>
                        </div>
                    )}
                </div>

                {/* Quotation Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
                    <h3 className="text-lg font-bold text-gray-800">Your Quotation</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Your Reference Number</label>
                            <input className="w-full p-2 border rounded-lg" value={form.quotation_reference} onChange={e => setForm({ ...form, quotation_reference: e.target.value })} placeholder="e.g. QT-2025-001" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Delivery Period</label>
                            <input className="w-full p-2 border rounded-lg" value={form.delivery_period} onChange={e => setForm({ ...form, delivery_period: e.target.value })} placeholder="e.g. 14 working days" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Payment Terms</label>
                            <input className="w-full p-2 border rounded-lg" value={form.payment_terms} onChange={e => setForm({ ...form, payment_terms: e.target.value })} placeholder="e.g. 30 days after delivery" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Quotation Valid For (days)</label>
                            <input type="number" className="w-full p-2 border rounded-lg" value={form.validity_days} onChange={e => setForm({ ...form, validity_days: e.target.value })} min="1" />
                        </div>
                    </div>

                    {/* Item Pricing */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Item Pricing</h4>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-3 text-left font-semibold">Item</th>
                                        <th className="p-3 text-center font-semibold">Quantity</th>
                                        <th className="p-3 text-center font-semibold">Unit Price (KSh) *</th>
                                        <th className="p-3 text-right font-semibold">Line Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {lines.map((line, i) => (
                                        <tr key={i}>
                                            <td className="p-3">
                                                <span className="font-medium">{line.description}</span>
                                            </td>
                                            <td className="p-3 text-center text-gray-500">{line.quantity}</td>
                                            <td className="p-3 text-center">
                                                <input
                                                    type="number"
                                                    className="w-32 mx-auto p-2 border rounded text-center"
                                                    value={line.unit_price}
                                                    onChange={e => updateLine(i, 'unit_price', e.target.value)}
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                    required
                                                />
                                            </td>
                                            <td className="p-3 text-right font-bold">
                                                KSh {((Number(line.quantity) || 0) * (Number(line.unit_price) || 0)).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 font-bold">
                                    <tr>
                                        <td colSpan="3" className="p-3 text-right">Total (excl. VAT):</td>
                                        <td className="p-3 text-right">
                                            KSh {lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unit_price) || 0), 0).toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Notes & Document */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Additional Notes</label>
                        <textarea className="w-full p-2 border rounded-lg" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional terms, clarifications, or comments..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Attach Document (optional)</label>
                        <input type="file" className="w-full p-2 border rounded-lg" onChange={e => setForm({ ...form, document: e.target.files[0] })} accept=".pdf,.doc,.docx,.xls,.xlsx" />
                        <p className="text-xs text-gray-400 mt-1">PDF, Word, or Excel — max 10MB</p>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end pt-4 border-t">
                        <button type="submit" disabled={submitting} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-medium">
                            <Send size={18} />
                            {submitting ? 'Submitting...' : 'Submit Quotation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PublicQuotation;
