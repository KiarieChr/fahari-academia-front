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
                        className="px-5 py-2.5 text-[13px] font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 active:scale-[0.98]"
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
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={20} />
                    <p className="text-sm text-amber-800">
                        The guardian email <strong>{parentInfo.parent_email}</strong> is already
                        associated with an existing parent account. You can link this student to
                        the existing account or create a separate one.
                    </p>
                </div>

                {/* Existing parent details */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Users size={16} className="text-indigo-500" />
                        Existing Parent Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span className="text-gray-500">Name</span>
                            <p className="font-medium text-gray-900">{parentInfo.parent_name}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Email</span>
                            <p className="font-medium text-gray-900">{parentInfo.parent_email}</p>
                        </div>
                        {parentInfo.parent_phone && (
                            <div>
                                <span className="text-gray-500">Phone</span>
                                <p className="font-medium text-gray-900">{parentInfo.parent_phone}</p>
                            </div>
                        )}
                        {parentInfo.linked_students?.length > 0 && (
                            <div>
                                <span className="text-gray-500">Currently linked students</span>
                                <p className="font-medium text-gray-900">
                                    {parentInfo.linked_students.join(', ')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-xs text-gray-500">
                    Linking to the existing account lets the parent access all their children
                    from a single login. Creating a new account will generate separate credentials.
                </p>
            </div>
        </Modal>
    );
};

export default ExistingParentDialog;
