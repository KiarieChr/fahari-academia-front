import React from 'react';
import { UserCheck, Users, AlertTriangle } from 'lucide-react';
import Modal from '../../../../components/common/Modal';

/**
 * Dialog shown when admitting a student whose guardian email
 * already belongs to an existing parent account.
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - parentInfo: { parent_user_id, parent_name, parent_email, parent_phone, linked_students }
 *  - onUseExisting: (parentUserId) => void   — link to existing parent
 *  - onCreateNew: () => void                 — create a brand-new parent account
 *  - loading: boolean
 */
const ExistingParentDialog = ({ isOpen, onClose, parentInfo, onUseExisting, onCreateNew, loading }) => {
    if (!parentInfo) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Existing Guardian Found"
            subtitle="A parent/guardian account with this email already exists in the system."
            icon={UserCheck}
            size="md"
            accentColor="bg-amber-500"
            footer={
                <div className="flex justify-end gap-3">
                    <Modal.CancelButton onClick={onClose}>Cancel</Modal.CancelButton>
                    <button
                        type="button"
                        onClick={onCreateNew}
                        disabled={loading}
                        style={{
                            background: 'var(--card-bg)',
                            borderColor: 'var(--border-color-light)',
                            color: 'var(--text-secondary)'
                        }}
                        className="px-5 py-2.5 text-[13px] font-semibold rounded-xl border hover:bg-slate-50 transition-all disabled:opacity-50 active:scale-[0.98] cursor-pointer"
                    >
                        Create New Account
                    </button>
                    <Modal.SubmitButton
                        onClick={() => onUseExisting(parentInfo.parent_user_id)}
                        loading={loading}
                    >
                        Link to Existing Parent
                    </Modal.SubmitButton>
                </div>
            }
        >
            <div className="space-y-5">
                {/* Warning banner */}
                <div 
                    style={{
                        background: 'rgba(245, 158, 11, 0.08)',
                        borderColor: 'rgba(245, 158, 11, 0.2)',
                    }}
                    className="flex items-start gap-3 p-4 border rounded-xl"
                >
                    <AlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={20} />
                    <p className="text-sm" style={{ color: '#b45309' }}>
                        The guardian email <strong>{parentInfo.parent_email}</strong> is already
                        associated with an existing parent account. You can link this student to
                        the existing account or create a separate one.
                    </p>
                </div>

                {/* Existing parent details */}
                <div 
                    style={{ background: 'var(--bg-light)', border: '1px solid var(--border-color-light)' }}
                    className="rounded-xl p-4 space-y-3"
                >
                    <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                        <Users size={16} style={{ color: 'var(--primary-color)' }} />
                        Existing Parent Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>Name</span>
                            <p className="font-medium" style={{ color: 'var(--text-main)' }}>{parentInfo.parent_name}</p>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>Email</span>
                            <p className="font-medium" style={{ color: 'var(--text-main)' }}>{parentInfo.parent_email}</p>
                        </div>
                        {parentInfo.parent_phone && (
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>Phone</span>
                                <p className="font-medium" style={{ color: 'var(--text-main)' }}>{parentInfo.parent_phone}</p>
                            </div>
                        )}
                        {parentInfo.linked_students?.length > 0 && (
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>Currently linked students</span>
                                <p className="font-medium" style={{ color: 'var(--text-main)' }}>
                                    {parentInfo.linked_students.join(', ')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Linking to the existing account lets the parent access all their children
                    from a single login. Creating a new account will generate separate credentials.
                </p>
            </div>
        </Modal>
    );
};

export default ExistingParentDialog;
