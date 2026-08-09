import React from 'react';

const ConfirmDialog = ({ show, title, message, confirmText, confirmVariant, onConfirm, onCancel, children }) => {
    if (!show) return null;
    
    return (
        <div className="confirm-dialog-backdrop" onClick={(e) => e.target === e.currentTarget && onCancel()}>
            <div className="confirm-dialog">
                <div className="confirm-dialog-header">
                    <h6 className="mb-0">{title}</h6>
                </div>
                <div className="confirm-dialog-body">
                    {message && <p className="mb-0">{message}</p>}
                    {children}
                </div>
                <div className="confirm-dialog-footer">
                    <button className="btn btn-secondary btn-sm" onClick={onCancel}>Cancel</button>
                    <button className={`btn btn-${confirmVariant || 'primary'} btn-sm`} onClick={onConfirm}>
                        {confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
            <style>{`
                .confirm-dialog-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1060;
                }
                .confirm-dialog {
                    background: white;
                    border-radius: 8px;
                    width: 100%;
                    max-width: 400px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                }
                .confirm-dialog-header {
                    padding: 1rem;
                    border-bottom: 1px solid #e9ecef;
                }
                .confirm-dialog-body {
                    padding: 1rem;
                }
                .confirm-dialog-footer {
                    padding: 0.75rem 1rem;
                    border-top: 1px solid #e9ecef;
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.5rem;
                }
            `}</style>
        </div>
    );
};

export default ConfirmDialog;
