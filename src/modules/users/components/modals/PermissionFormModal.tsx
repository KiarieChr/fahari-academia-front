
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const PermissionFormModal = ({ show, onHide, onCreate, modules, permissionTypes }) => {
    const [formData, setFormData] = useState({
        name: '',
        module: modules[0] || 'General',
        type: permissionTypes[0] || 'read',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(formData);
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Create New Permission</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <Form.Label>Module</Form.Label>
                            <Form.Select
                                value={formData.module}
                                onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                            >
                                {modules.map(m => <option key={m} value={m}>{m}</option>)}
                            </Form.Select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Label>Type</Form.Label>
                            <Form.Select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                {permissionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </Form.Select>
                        </div>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>Permission Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g. Can View Reports"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Cancel</Button>
                    <Button variant="primary" type="submit">Create Permission</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default PermissionFormModal;
