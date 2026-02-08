
import React from 'react';
import { MoreVertical, Edit2, Trash2, Copy, Shield } from 'lucide-react';

const RolesTable = ({
    roles,
    selectedRole,
    onSelectRole,
    onEditRole,
    onDeleteRole,
    onCloneRole
}) => {
    return (
        <div className="list-group list-group-flush">
            {roles.map(role => (
                <div
                    key={role.id}
                    className={`list-group-item list-group-item-action ${selectedRole?.id === role.id ? 'active' : ''}`}
                    onClick={() => onSelectRole(role)}
                    style={{ cursor: 'pointer', borderLeft: selectedRole?.id === role.id ? '4px solid #fff' : 'none' }}
                >
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center overflow-hidden">
                            <div className="avatar-sm me-3 flex-shrink-0 bg-light text-primary">
                                <Shield size={16} />
                            </div>
                            <div className="text-truncate">
                                <h6 className="mb-0 text-truncate">{role.name}</h6>
                                <small className={selectedRole?.id === role.id ? 'text-white-50' : 'text-muted'}>
                                    {role.userCount} users
                                </small>
                            </div>
                        </div>

                        <div className="dropdown" onClick={e => e.stopPropagation()}>
                            <button
                                className={`btn btn-sm btn-link ${selectedRole?.id === role.id ? 'text-white' : 'text-muted'}`}
                                data-bs-toggle="dropdown"
                            >
                                <MoreVertical size={16} />
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow">
                                <li>
                                    <button className="dropdown-item" onClick={() => onEditRole(role)}>
                                        <Edit2 size={14} className="me-2" /> Edit Role
                                    </button>
                                </li>
                                <li>
                                    <button className="dropdown-item" onClick={() => onCloneRole(role)}>
                                        <Copy size={14} className="me-2" /> Duplcate
                                    </button>
                                </li>
                                {!role.isSystemRole && (
                                    <>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <button className="dropdown-item text-danger" onClick={() => onDeleteRole(role.id)}>
                                                <Trash2 size={14} className="me-2" /> Delete
                                            </button>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RolesTable;
