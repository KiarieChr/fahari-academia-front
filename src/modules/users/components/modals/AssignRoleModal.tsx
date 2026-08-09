
import React, { useState } from 'react';
import { Modal, Button, Form, Badge } from 'react-bootstrap';
import { Search } from 'lucide-react';

const AssignRoleModal = ({ show, onHide, users, roles, selectedRole, onAssignRole }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const targetRole = selectedRole || roles[0];
    if (!targetRole) return null;

    const getUserName = (user) => user.name || user.full_name || user.username || 'Unknown User';
    const getUserEmail = (user) => user.email || '';
    const getUserRoles = (user) => user.groups || user.roles || [];

    const filteredUsers = users.filter(user => {
        const name = getUserName(user).toLowerCase();
        const email = getUserEmail(user).toLowerCase();
        const search = searchTerm.toLowerCase();
        return name.includes(search) || email.includes(search);
    });

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Assign Users to {targetRole.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ minHeight: '400px' }}>
                <p className="text-muted">Select users to assign to the <strong>{targetRole.name}</strong> role.</p>

                <div className="input-group mb-3">
                    <span className="input-group-text"><Search size={18} /></span>
                    <Form.Control
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="list-group border">
                    {filteredUsers.map(user => {
                        const userName = getUserName(user);
                        const userEmail = getUserEmail(user);
                        const userRoles = getUserRoles(user);

                        // Handle both ID list and Object list
                        const hasRole = userRoles.some(r => {
                            const roleId = typeof r === 'object' ? r.id : r;
                            return roleId === targetRole.id;
                        });

                        return (
                            <div key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <div className="avatar-sm me-3 d-flex align-items-center justify-content-center bg-secondary text-white rounded-circle" style={{ width: 32, height: 32 }}>
                                        {user.avatar || userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="fw-bold">{userName}</div>
                                        <small className="text-muted">{userEmail}</small>
                                    </div>
                                </div>
                                <Button
                                    variant={hasRole ? 'outline-danger' : 'outline-primary'}
                                    size="sm"
                                    onClick={() => onAssignRole(user.id, targetRole.id, !hasRole)}
                                >
                                    {hasRole ? 'Remove' : 'Assign'}
                                </Button>
                            </div>
                        );
                    })}
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-4 text-muted">No users found.</div>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AssignRoleModal;
