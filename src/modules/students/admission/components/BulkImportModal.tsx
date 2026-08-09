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
                    <div className="flex justify-end gap-3 w-full">
                        <button
                            onClick={onClose}
                            style={{
                                background: 'var(--card-bg)',
                                borderColor: 'var(--border-color-light)',
                                color: 'var(--text-main)'
                            }}
                            className="px-6 py-2.5 border rounded-xl hover:opacity-90 active:scale-95 transition-all font-bold cursor-pointer"
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        {step === 'upload' && (
                            <button
                                onClick={handleValidate}
                                disabled={!file || loading}
                                style={{
                                    background: 'var(--primary-color)',
                                    color: '#fff'
                                }}
                                className="px-6 py-2.5 rounded-xl hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold flex items-center gap-2 cursor-pointer"
                            >
                                {loading && <Loader2 className="animate-spin" size={16} />}
                                Validate File
                            </button>
                        )}

                        {(step === 'preview' || step === 'validating') && validationResult?.errors.length === 0 && (
                            <button
                                onClick={handleImport}
                                disabled={loading}
                                style={{
                                    background: 'var(--primary-color)',
                                    color: '#fff'
                                }}
                                className="px-6 py-2.5 rounded-xl hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold flex items-center gap-2 cursor-pointer"
                            >
                                {loading && <Loader2 className="animate-spin" size={16} />}
                                Confirm Import
                            </button>
                        )}

                        {(step === 'preview') && validationResult?.errors.length > 0 && (
                            <button
                                onClick={() => setStep('upload')}
                                style={{
                                    background: 'var(--primary-color)',
                                    color: '#fff'
                                }}
                                className="px-6 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all font-bold cursor-pointer"
                            >
                                Upload Adjusted File
                            </button>
                        )}
                    </div>
                )
            }
        >
            <div className="flex-1 relative">
                {/* Step 1: Upload */}
                {step === 'upload' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div 
                            style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }} 
                            className="border p-4 rounded-xl flex gap-3"
                        >
                            <AlertCircle className="shrink-0 mt-0.5" style={{ color: 'var(--primary-color)' }} size={20} />
                            <div className="text-sm">
                                <p className="font-bold mb-1" style={{ color: 'var(--text-main)' }}>Instructions:</p>
                                <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--text-secondary)' }}>
                                    <li>Download the official template using the button below.</li>
                                    <li>Fill in the required fields marked with an asterisk (*).</li>
                                    <li>Use the dropdowns provided in the template for valid data.</li>
                                    <li>Do not modify the header row.</li>
                                </ul>
                            </div>
                        </div>

                        <button
                            onClick={handleDownloadTemplate}
                            style={{ color: 'var(--primary-color)' }}
                            className="flex items-center gap-2 font-bold hover:opacity-85 transition-all bg-transparent border-0 cursor-pointer"
                        >
                            <Download size={18} /> Download Excel Template
                        </button>

                        <div 
                            style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}
                            className="group border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center hover:opacity-95 transition-all cursor-pointer relative"
                        >
                            <input
                                type="file"
                                accept=".xlsx"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="mb-4 transition-colors" style={{ color: 'var(--text-muted)' }} size={48} />
                            {file ? (
                                <>
                                    <p className="text-lg font-bold mb-1" style={{ color: 'var(--text-main)' }}>{file.name}</p>
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(2)} KB</p>
                                    <p className="text-xs mt-2 font-bold" style={{ color: 'var(--primary-color)' }}>Click to change file</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-lg font-bold mb-1" style={{ color: 'var(--text-main)' }}>Click or drag file to upload</p>
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Only .xlsx files are allowed</p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Validation/Preview */}
                {(step === 'preview' || step === 'validating') && validationResult && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}>
                                <p className="text-xs uppercase font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Total Rows</p>
                                <p className="text-2xl font-black mb-0" style={{ color: 'var(--text-main)' }}>{validationResult.total_rows}</p>
                            </div>
                            <div className="p-4 rounded-xl border" style={{ background: 'rgba(16, 185, 129, 0.06)', borderColor: 'rgba(16, 185, 129, 0.15)' }}>
                                <p className="text-xs uppercase font-bold mb-1" style={{ color: 'rgb(16, 185, 129)' }}>Valid Rows</p>
                                <p className="text-2xl font-black mb-0" style={{ color: 'rgb(16, 185, 129)' }}>{validationResult.valid_rows.length}</p>
                            </div>
                            <div className="p-4 rounded-xl border" style={{ background: 'rgba(239, 68, 68, 0.06)', borderColor: 'rgba(239, 68, 68, 0.15)' }}>
                                <p className="text-xs uppercase font-bold mb-1" style={{ color: 'rgb(239, 68, 68)' }}>Rows with Errors</p>
                                <p className="text-2xl font-black mb-0" style={{ color: 'rgb(239, 68, 68)' }}>{validationResult.errors.length}</p>
                            </div>
                        </div>

                        {validationResult.errors.length > 0 ? (
                            <div className="rounded-xl border overflow-hidden" style={{ background: 'rgba(239, 68, 68, 0.03)', borderColor: 'rgba(239, 68, 68, 0.15)' }}>
                                <div className="p-4 border-b bg-red-50/50" style={{ borderColor: 'rgba(239, 68, 68, 0.15)' }}>
                                    <h3 className="font-bold flex items-center gap-2 mb-0" style={{ color: 'rgb(185, 28, 28)' }}>
                                        <AlertCircle size={18} /> Errors Found
                                    </h3>
                                    <p className="text-xs mt-1 mb-0" style={{ color: 'rgb(220, 38, 38)' }}>Please correct these errors in your file and upload again.</p>
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs uppercase sticky top-0" style={{ background: 'var(--bg-light)', color: 'var(--text-secondary)' }}>
                                            <tr>
                                                <th className="px-4 py-3">Row</th>
                                                <th className="px-4 py-3">Issues</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y" style={{ borderColor: 'var(--border-color-light)' }}>
                                            {validationResult.errors.map((err, i) => (
                                                <tr key={i} style={{ background: 'var(--card-bg)' }}>
                                                    <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-secondary)' }}>#{err.row}</td>
                                                    <td className="px-4 py-3" style={{ color: 'rgb(220, 38, 38)' }}>
                                                        <ul className="list-disc list-inside mb-0">
                                                            {err.errors.map((msg, j) => (
                                                                <li key={j} className="text-xs font-semibold">{msg}</li>
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
                            <div className="p-4 rounded-xl border flex gap-3 items-start" style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.2)', color: 'rgb(16, 185, 129)' }}>
                                <CheckCircle className="shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="font-bold mb-0">Validation Successful!</p>
                                    <p className="text-sm mt-1 mb-0">Your file is ready to be imported.</p>
                                </div>
                            </div>
                        )}

                        {/* Preview Table */}
                        <div>
                            <h3 className="text-md font-bold mb-2.5" style={{ color: 'var(--text-main)' }}>Preview (First 10 Rows)</h3>
                            <div className="overflow-x-auto border rounded-xl" style={{ borderColor: 'var(--border-color-light)' }}>
                                <table className="min-w-full divide-y" style={{ borderColor: 'var(--border-color-light)' }}>
                                    <thead style={{ background: 'var(--bg-light)' }}>
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Name</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Adm No</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y" style={{ borderColor: 'var(--border-color-light)', background: 'var(--card-bg)' }}>
                                        {validationResult.preview.map((row, i) => (
                                            <tr key={i} style={{ background: row.status === 'Error' ? 'rgba(239, 68, 68, 0.03)' : 'transparent' }}>
                                                <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{row.first_name} {row.last_name}</td>
                                                <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{row.adm_no || 'N/A'}</td>
                                                <td className="px-4 py-3">
                                                    <span 
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border"
                                                        style={{
                                                            background: row.status === 'Error' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                                            borderColor: row.status === 'Error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                            color: row.status === 'Error' ? 'rgb(220, 38, 38)' : 'rgb(16, 185, 129)'
                                                        }}
                                                    >
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
                            <Loader2 className="animate-spin mx-auto mb-3" style={{ color: 'var(--primary-color)' }} size={36} />
                            <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Importing Students...</h3>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Please don't close this window</p>
                        </div>

                        <div className="max-w-md mx-auto space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
                                <span className="font-bold" style={{ color: 'var(--text-main)' }}>
                                    {progress.processed} / {progress.total} students
                                </span>
                            </div>
                            <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: 'var(--border-color-light)' }}>
                                <div
                                    className="h-3 rounded-full transition-all duration-500 ease-out"
                                    style={{ 
                                        width: `${progress.total ? (progress.processed / progress.total) * 100 : 0}%`,
                                        background: 'var(--primary-color)' 
                                    }}
                                />
                            </div>
                            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                                Batch {Math.ceil(progress.processed / CHUNK_SIZE) || 1} of {Math.ceil(progress.total / CHUNK_SIZE)}
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 4: Partial Success */}
                {step === 'partial' && importResult && (
                    <div className="flex flex-col items-center justify-center py-10 animate-in fade-in duration-300">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                            <AlertCircle style={{ color: 'rgb(245, 158, 11)' }} size={32} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>Partially Imported</h2>
                        <p className="mb-2 text-center max-w-md" style={{ color: 'var(--text-secondary)' }}>
                            {importResult.created_count} students were imported before an error occurred.
                        </p>
                        <p className="text-sm mb-6 text-center max-w-md font-semibold" style={{ color: 'rgb(245, 158, 11)' }}>
                            The remaining students were not imported. You can adjust your file and re-upload to import the rest.
                        </p>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'var(--primary-color)',
                                color: '#fff'
                            }}
                            className="px-6 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all font-bold cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                )}

                {/* Step 5: Full Success */}
                {step === 'success' && importResult && (
                    <div className="flex flex-col items-center justify-center py-10 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                            <CheckCircle style={{ color: 'rgb(16, 185, 129)' }} size={32} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>Import Complete!</h2>
                        <p className="mb-6 text-center max-w-md" style={{ color: 'var(--text-secondary)' }}>
                            Successfully imported {importResult.created_count} students.
                        </p>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'var(--primary-color)',
                                color: '#fff'
                            }}
                            className="px-6 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all font-bold cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                )}

                {/* Loading Overlay */}
                {loading && step === 'validating' && (
                    <div 
                        style={{ background: 'var(--card-bg)', opacity: 0.9, backdropFilter: 'blur(4px)' }}
                        className="absolute inset-0 flex flex-col items-center justify-center z-10"
                    >
                        <Loader2 className="animate-spin mb-2" style={{ color: 'var(--primary-color)' }} size={32} />
                        <p className="font-bold" style={{ color: 'var(--text-main)' }}>Validating file...</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default BulkImportModal;
