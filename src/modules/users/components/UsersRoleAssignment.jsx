
import React, { useState } from 'react';
import { X, Plus, Search } from 'lucide-react';

const UsersRoleAssignment = ({ users, roles, onAssignRole }) => {
    const [userSearch, setUserSearch] = useState('');

    const getUserName = (user) => user.name || user.full_name || user.username || 'Unknown User';
    const getUserEmail = (user) => user.email || '';
    const getUserRoles = (user) => user.groups || user.roles || [];

    const filteredUsers = users.filter(user => {
        const name = getUserName(user).toLowerCase();
        const email = getUserEmail(user).toLowerCase();
        const search = userSearch.toLowerCase();
        return name.includes(search) || email.includes(search);
    });

    return (
        <div>
            <div className="input-group mb-3">
                <span className="input-group-text bg-light border-end-0">
                    <Search size={16} />
                </span>
                <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Find user..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                />
            </div>

            <div className="users-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {filteredUsers.map(user => {
                    const userName = getUserName(user);
                    const userEmail = getUserEmail(user);
                    const userRoles = getUserRoles(user);

                    return (
                        <div key={user.id} className="d-flex align-items-center justify-content-between p-2 border-bottom">
                            <div className="d-flex align-items-center">
                                <div className="avatar-sm me-2 bg-primary text-white d-flex align-items-center justify-content-center rounded-circle" style={{ width: 32, height: 32 }}>
                                    {user.avatar || userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-weight-bold small">{userName}</div>
                                    <div className="text-muted small" style={{ fontSize: '0.7rem' }}>{userEmail}</div>
                                </div>
                            </div>

                            <div className="d-flex flex-wrap gap-1 justify-content-end" style={{ maxWidth: '40%' }}>
                                {userRoles.map(roleId => {
                                    // Handle both ID list and Object list if backend changes
                                    const id = typeof roleId === 'object' ? roleId.id : roleId;
                                    const role = roles.find(r => r.id === id);

                                    return role ? (
                                        <span
                                            key={id}
                                            className="badge bg-light text-dark border d-flex align-items-center"
                                            title={role.name}
                                        >
                                            {role.name.substring(0, 8)}...
                                            <X
                                                size={12}
                                                className="ms-1 cursor-pointer"
                                                onClick={() => onAssignRole(user.id, id, false)}
                                            />
                                        </span>
                                    ) : null;
                                })}
                                <div className="dropdown">
                                    <button
                                        className="btn btn-xs btn-outline-primary p-0 rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: '24px', height: '24px' }}
                                        data-bs-toggle="dropdown"
                                    >
                                        <Plus size={14} />
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end shadow" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        {roles.filter(r => !userRoles.includes(r.id) && !userRoles.some(ur => (typeof ur === 'object' ? ur.id : ur) === r.id)).map(role => (
                                            <li key={role.id}>
                                                <button
                                                    className="dropdown-item small"
                                                    onClick={() => onAssignRole(user.id, role.id, true)}
                                                >
                                                    {role.name}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filteredUsers.length === 0 && (
                    <div className="text-center text-muted py-3">
                        <small>No users found</small>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersRoleAssignment;
