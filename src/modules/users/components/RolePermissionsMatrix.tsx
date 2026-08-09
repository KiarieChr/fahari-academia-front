
import React from 'react';

const RolePermissionsMatrix = ({ selectedRole, permissionsByModule, onUpdatePermissions }) => {
    const handleTogglePermission = (permissionId) => {
        const currentPermissions = selectedRole.permissions;
        let newPermissions;
        if (currentPermissions.includes(permissionId)) {
            newPermissions = currentPermissions.filter(id => id !== permissionId);
        } else {
            newPermissions = [...currentPermissions, permissionId];
        }
        onUpdatePermissions(newPermissions);
    };

    const handleToggleModule = (moduleName, permissionIds) => {
        const currentPermissions = selectedRole.permissions;
        const allModuleSelected = permissionIds.every(id => currentPermissions.includes(id));

        let newPermissions;
        if (allModuleSelected) {
            // Deselect all
            newPermissions = currentPermissions.filter(id => !permissionIds.includes(id));
        } else {
            // Select all
            // Add ones that aren't already there
            const toAdd = permissionIds.filter(id => !currentPermissions.includes(id));
            newPermissions = [...currentPermissions, ...toAdd];
        }
        onUpdatePermissions(newPermissions);
    };

    return (
        <div className="permission-matrix">
            {Object.entries(permissionsByModule).map(([module, permissions]) => {
                const permissionIds = permissions.map(p => p.id);
                const allSelected = permissionIds.every(id => selectedRole.permissions.includes(id));
                const someSelected = permissionIds.some(id => selectedRole.permissions.includes(id));

                return (
                    <div key={module} className="permission-group mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                            <h6 className="mb-0 text-primary fw-bold">{module}</h6>
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={allSelected}
                                    ref={input => {
                                        if (input) {
                                            input.indeterminate = someSelected && !allSelected;
                                        }
                                    }}
                                    onChange={() => handleToggleModule(module, permissionIds)}
                                />
                                <label className="form-check-label small text-muted">Select All</label>
                            </div>
                        </div>

                        <div className="row g-3">
                            {permissions.map(permission => (
                                <div key={permission.id} className="col-md-6 col-lg-4">
                                    <div className={`permission-item border p-2 rounded h-100 ${selectedRole.permissions.includes(permission.id) ? 'bg-light border-primary' : ''}`}>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`perm-${permission.id}`}
                                                checked={selectedRole.permissions.includes(permission.id)}
                                                onChange={() => handleTogglePermission(permission.id)}
                                            />
                                            <label className="form-check-label w-100 cursor-pointer" htmlFor={`perm-${permission.id}`}>
                                                <div className="fw-medium">{permission.name}</div>
                                                <small className="text-muted d-block text-truncate" title={permission.description}>
                                                    {permission.description}
                                                </small>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default RolePermissionsMatrix;
