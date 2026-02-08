import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2, Download } from 'lucide-react';
import { studentManagementService } from '../../../../services/studentManagementService';
import { toast } from 'react-toastify';

const BulkImportModal = ({ onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('upload'); // upload, validating, preview, importing, success
    const [validationResult, setValidationResult] = useState(null);
    const [importResult, setImportResult] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setValidationResult(null);
            setStep('upload');
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const blob = await studentManagementService.downloadImportTemplate();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Student_Import_Template.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download failed", error);
            toast.error("Failed to download template");
        }
    };

    const handleValidate = async () => {
        if (!file) return;
        setLoading(true);
        setStep('validating');
        try {
            const result = await studentManagementService.importStudents(file, true); // dryRun=true
            setValidationResult(result);
            setStep('preview');
        } catch (error) {
            console.error("Validation failed", error);
            toast.error(error.response?.data?.error || "Validation failed");
            setStep('upload');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!file) return;
        setLoading(true);
        setStep('importing');
        try {
            const result = await studentManagementService.importStudents(file, false); // dryRun=false
            setImportResult(result);
            setStep('success');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Import failed", error);
            toast.error(error.response?.data?.error || "Import failed");
            setStep('preview'); // Go back to preview/validation view
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Import Students</h2>
                        <p className="text-sm text-gray-500">Bulk upload student records via Excel</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Step 1: Upload */}
                    {step === 'upload' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3 text-blue-700">
                                <AlertCircle className="shrink-0 mt-0.5" size={20} />
                                <div className="text-sm">
                                    <p className="font-semibold mb-1">Instructions:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Download the official template using the button below.</li>
                                        <li>Fill in the required fields marked with an asterisk (*).</li>
                                        <li>Use the dropdowns provided in the template for valid data.</li>
                                        <li>Do not modify the header row.</li>
                                    </ul>
                                </div>
                            </div>

                            <button
                                onClick={handleDownloadTemplate}
                                className="flex items-center gap-2 text-indigo-600 font-medium hover:underline"
                            >
                                <Download size={18} /> Download Excel Template
                            </button>

                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    accept=".xlsx"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <Upload className="text-gray-400 mb-4" size={48} />
                                {file ? (
                                    <>
                                        <p className="text-lg font-medium text-gray-900 mb-1">{file.name}</p>
                                        <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                        <p className="text-xs text-green-600 mt-2 font-medium">Click to change file</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-lg font-medium text-gray-900 mb-1">Click or drag file to upload</p>
                                        <p className="text-sm text-gray-500">Only .xlsx files are allowed</p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Validation/Preview */}
                    {(step === 'preview' || step === 'validating' || step === 'importing') && validationResult && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-500">Total Rows</p>
                                    <p className="text-2xl font-bold text-gray-900">{validationResult.total_rows}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <p className="text-sm text-green-600">Valid Rows</p>
                                    <p className="text-2xl font-bold text-green-700">{validationResult.valid_rows.length}</p>
                                </div>
                                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                    <p className="text-sm text-red-600">Rows with Errors</p>
                                    <p className="text-2xl font-bold text-red-700">{validationResult.errors.length}</p>
                                </div>
                            </div>

                            {validationResult.errors.length > 0 ? (
                                <div className="bg-red-50 border border-red-100 rounded-lg overflow-hidden">
                                    <div className="p-4 border-b border-red-100 bg-red-100/50">
                                        <h3 className="font-semibold text-red-800 flex items-center gap-2">
                                            <AlertCircle size={18} /> Errors Found
                                        </h3>
                                        <p className="text-xs text-red-600 mt-1">Please correct these errors in your file and upload again.</p>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-red-700 uppercase bg-red-100/50 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-2">Row</th>
                                                    <th className="px-4 py-2">Issues</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-red-100">
                                                {validationResult.errors.map((err, i) => (
                                                    <tr key={i} className="bg-white">
                                                        <td className="px-4 py-2 font-mono text-gray-600">#{err.row}</td>
                                                        <td className="px-4 py-2 text-red-600">
                                                            <ul className="list-disc list-inside">
                                                                {err.errors.map((msg, j) => (
                                                                    <li key={j}>{msg}</li>
                                                                ))}
                                                            </ul>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex gap-3 text-green-800 items-start">
                                    <CheckCircle className="shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="font-semibold">Validation Successful!</p>
                                        <p className="text-sm mt-1">Your file is ready to be imported. This will create new student records and user accounts.</p>
                                    </div>
                                </div>
                            )}

                            {/* Preview Table */}
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">Preview (First 10 Rows)</h3>
                                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">First Name</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Name</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Adm No</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {validationResult.preview.map((row, i) => (
                                                <tr key={i} className={row.status === 'Error' ? 'bg-red-50' : 'bg-white'}>
                                                    <td className="px-4 py-2 text-sm text-gray-900">{row.first_name}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">{row.last_name}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-500">{row.adm_no}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-500">{row.gender}</td>
                                                    <td className="px-4 py-2">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${row.status === 'Error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Success */}
                    {step === 'success' && importResult && (
                        <div className="flex flex-col items-center justify-center py-10">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="text-green-600" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Complete!</h2>
                            <p className="text-gray-500 mb-6 text-center max-w-md">
                                {importResult.message}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Loading Overlay */}
                    {loading && (
                        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                            <Loader2 className="animate-spin text-indigo-600 mb-2" size={32} />
                            <p className="text-gray-600 font-medium">
                                {step === 'validating' ? 'Validating file...' : 'Importing records...'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {step !== 'success' && (
                    <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        {step === 'upload' && (
                            <button
                                onClick={handleValidate}
                                disabled={!file || loading}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading && <Loader2 className="animate-spin" size={16} />}
                                Validate File
                            </button>
                        )}

                        {(step === 'preview' || step === 'validating') && validationResult?.errors.length === 0 && (
                            <button
                                onClick={handleImport}
                                disabled={loading}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading && <Loader2 className="animate-spin" size={16} />}
                                Confirm Import
                            </button>
                        )}

                        {/* Allow re-upload if errors */}
                        {(step === 'preview') && validationResult?.errors.length > 0 && (
                            <button
                                onClick={() => setStep('upload')}
                                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                            >
                                Upload Adjusted File
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulkImportModal;

