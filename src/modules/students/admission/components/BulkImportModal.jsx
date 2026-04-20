import React, { useState, useCallback } from 'react';
import { Upload, AlertCircle, CheckCircle, Loader2, Download } from 'lucide-react';
import { studentManagementService } from '../../../../services/studentManagementService';
import { toast } from 'react-toastify';
import Modal from '../../../../components/common/Modal';

const CHUNK_SIZE = 50;

const BulkImportModal = ({ onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('upload'); // upload, validating, preview, importing, success
    const [validationResult, setValidationResult] = useState(null);
    const [importResult, setImportResult] = useState(null);
    const [importId, setImportId] = useState(null);
    const [progress, setProgress] = useState({ processed: 0, total: 0 });

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
            const result = await studentManagementService.importStudents(file, true);
            setValidationResult(result);
            if (result.import_id) setImportId(result.import_id);
            setStep('preview');
        } catch (error) {
            console.error("Validation failed", error);
            toast.error(error?.data?.error || error?.message || "Validation failed");
            setStep('upload');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = useCallback(async () => {
        if (!importId) {
            toast.error("No import session found. Please re-validate the file.");
            return;
        }

        setLoading(true);
        setStep('importing');
        const total = validationResult.valid_rows.length;
        setProgress({ processed: 0, total });

        let offset = 0;
        let totalCreated = 0;

        try {
            while (offset < total) {
                const result = await studentManagementService.processImportChunk(
                    importId, offset, CHUNK_SIZE
                );
                totalCreated += result.chunk_created;
                offset = result.processed;
                setProgress({ processed: result.processed, total: result.total });

                if (result.complete) break;
            }

            setImportResult({ created_count: totalCreated });
            setStep('success');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Import failed", error);
            const msg = error?.data?.error || error?.message || "Import failed. Please try again.";
            toast.error(msg);
            // Show how far we got
            setImportResult({ created_count: totalCreated, failed: true });
            setStep(totalCreated > 0 ? 'partial' : 'preview');
        } finally {
            setLoading(false);
        }
    }, [importId, validationResult, onSuccess]);

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Import Students"
            size="xl"
            footer={
                step !== 'success' && (
                    <>
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

                        {(step === 'preview') && validationResult?.errors.length > 0 && (
                            <button
                                onClick={() => setStep('upload')}
                                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                            >
                                Upload Adjusted File
                            </button>
                        )}
                    </>
                )
            }
        >
            <div className="flex-1">
                {/* Step 1: Upload */}
                {step === 'upload' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
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

                        <div className="group border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept=".xlsx"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="text-gray-400 group-hover:text-indigo-500 mb-4 transition-colors" size={48} />
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
                {(step === 'preview' || step === 'validating') && validationResult && (
                    <div className="space-y-6 animate-in fade-in duration-300">
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
                                    <p className="text-sm mt-1">Your file is ready to be imported.</p>
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
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Adm No</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {validationResult.preview.map((row, i) => (
                                            <tr key={i} className={row.status === 'Error' ? 'bg-red-50' : 'bg-white'}>
                                                <td className="px-4 py-2 text-sm text-gray-900">{row.first_name} {row.last_name}</td>
                                                <td className="px-4 py-2 text-sm text-gray-500">{row.adm_no}</td>
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

                {/* Step 3: Importing — Progress Bar */}
                {step === 'importing' && (
                    <div className="space-y-6 animate-in fade-in duration-300 py-8">
                        <div className="text-center mb-6">
                            <Loader2 className="animate-spin text-indigo-600 mx-auto mb-3" size={36} />
                            <h3 className="text-lg font-semibold text-gray-900">Importing Students...</h3>
                            <p className="text-sm text-gray-500 mt-1">Please don't close this window</p>
                        </div>

                        <div className="max-w-md mx-auto space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-medium text-gray-900">
                                    {progress.processed} / {progress.total} students
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${progress.total ? (progress.processed / progress.total) * 100 : 0}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 text-center">
                                Batch {Math.ceil(progress.processed / CHUNK_SIZE) || 1} of {Math.ceil(progress.total / CHUNK_SIZE)}
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 4: Partial Success (some chunks committed, then failure) */}
                {step === 'partial' && importResult && (
                    <div className="flex flex-col items-center justify-center py-10 animate-in fade-in duration-300">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="text-amber-600" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Partially Imported</h2>
                        <p className="text-gray-500 mb-2 text-center max-w-md">
                            {importResult.created_count} students were imported before an error occurred.
                        </p>
                        <p className="text-sm text-amber-600 mb-6 text-center max-w-md">
                            The remaining students were not imported. You can adjust your file and re-upload to import the rest.
                        </p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                        >
                            Close
                        </button>
                    </div>
                )}

                {/* Step 5: Full Success */}
                {step === 'success' && importResult && (
                    <div className="flex flex-col items-center justify-center py-10 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="text-green-600" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Complete!</h2>
                        <p className="text-gray-500 mb-6 text-center max-w-md">
                            Successfully imported {importResult.created_count} students.
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

                {/* Loading Overlay — only for validation step */}
                {loading && step === 'validating' && (
                    <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                        <Loader2 className="animate-spin text-indigo-600 mb-2" size={32} />
                        <p className="text-gray-600 font-medium">Validating file...</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default BulkImportModal;
