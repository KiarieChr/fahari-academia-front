import React, { useState } from 'react';

const CustomerImportForm = ({ onImport, disabled }) => {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileName(selectedFile.name);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (file) {
            onImport(file);
        }
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-body">
                <h6 className="card-title mb-3">Import Customer Receipts</h6>
                
                <div className="alert alert-warning mb-4">
                    <strong className="d-block mb-2">📋 File Requirements:</strong>
                    <ul className="mb-0 ps-3">
                        <li>CSV or Excel format (.csv, .xlsx, .xls)</li>
                        <li>
                            <strong>Required columns:</strong> 
                            <code className="ms-1">receipt_type, amount_received, payment_method_id, received_date, payer_name</code>
                        </li>
                        <li>For student receipts: <code>student_id, fee_category, term_id, academic_year_id</code></li>
                        <li>Date format: YYYY-MM-DD</li>
                        <li>Status: DRAFT or POSTED</li>
                    </ul>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="receiptFile" className="form-label fw-semibold">
                            Choose File
                        </label>
                        <div className="input-group">
                            <input
                                type="file"
                                className="form-control"
                                id="receiptFile"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileChange}
                                disabled={disabled}
                                required
                            />
                        </div>
                        <div className="form-text">
                            {fileName ? `Selected: ${fileName}` : 'No file chosen'}
                        </div>
                    </div>

                    <div className="d-grid gap-2">
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={!file || disabled}
                        >
                            {disabled ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Importing...
                                </>
                            ) : (
                                'Start Import'
                            )}
                        </button>
                        
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => window.open('/api/fees/receipts/import-template/', '_blank')}
                            disabled={disabled}
                        >
                            Download Template
                        </button>
                    </div>
                </form>

                <div className="mt-4 pt-3 border-top">
                    <h6 className="text-muted mb-2">Sample CSV Format:</h6>
                    <div className="bg-light p-3 rounded small">
                        <pre className="mb-0">
{`receipt_type,amount_received,payment_method_id,received_date,payer_name,student_id,fee_category,term_id,academic_year_id,status,reference,notes
STUDENT_FEE,5000.00,1,2024-01-15,John Doe,STD-001,TUITION,1,1,POSTED,FEE-001,Term 1 fee
STUDENT_NON_FEE,2500.00,2,2024-01-16,Jane Smith,STD-002,LIBRARY_FINE,,,DRAFT,NON-001,Library fine
GENERAL,10000.00,3,2024-01-17,ABC Corp,,,,,POSTED,GEN-001,Consultation fee
SPONSOR,7500.00,1,2024-01-18,XYZ Foundation,STD-003,,,,DRAFT,SPN-001,Scholarship`}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerImportForm;