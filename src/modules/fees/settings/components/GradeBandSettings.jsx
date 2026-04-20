import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Spinner, Table, Modal, Badge } from 'react-bootstrap';
import { Plus, Edit2, Trash2, Layers } from 'lucide-react';
import { templateService } from '../../fee-templates/templateService';
import studentSettingsService from '../../../../services/studentSettingsService';
import { toast } from 'react-toastify';

const GradeBandSettings = () => {
    const [bands, setBands] = useState([]);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', grades: [], is_active: true });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [bandData, gradeData] = await Promise.all([
                templateService.getGradeBands(),
                studentSettingsService.getClasses(),
            ]);
            setBands(bandData.results || bandData);
            setGrades(gradeData.results || gradeData);
        } catch (err) {
            toast.error('Failed to load grade bands');
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ name: '', description: '', grades: [], is_active: true });
        setShowModal(true);
    };

    const openEdit = (band) => {
        setEditing(band);
        setForm({
            name: band.name,
            description: band.description || '',
            grades: band.grades?.map(g => (typeof g === 'object' ? g.id : g)) || [],
            is_active: band.is_active,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            toast.warn('Band name is required');
            return;
        }
        if (form.grades.length === 0) {
            toast.warn('Select at least one grade');
            return;
        }
        try {
            setSaving(true);
            if (editing) {
                await templateService.updateGradeBand(editing.id, form);
                toast.success('Grade band updated');
            } else {
                await templateService.createGradeBand(form);
                toast.success('Grade band created');
            }
            setShowModal(false);
            await loadData();
        } catch (err) {
            const detail = err?.response?.data?.name?.[0] || err?.message || 'Save failed';
            toast.error(detail);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (band) => {
        if (!window.confirm(`Delete grade band "${band.name}"? This cannot be undone.`)) return;
        try {
            await templateService.deleteGradeBand(band.id);
            toast.success('Grade band deleted');
            await loadData();
        } catch (err) {
            toast.error('Cannot delete — band may be in use by templates');
        }
    };

    const toggleGrade = (gradeId) => {
        setForm(prev => ({
            ...prev,
            grades: prev.grades.includes(gradeId)
                ? prev.grades.filter(id => id !== gradeId)
                : [...prev.grades, gradeId],
        }));
    };

    // Find which grades are already assigned to other bands (not this one)
    const assignedGrades = new Set();
    bands.forEach(b => {
        if (editing && b.id === editing.id) return;
        (b.grades || []).forEach(g => {
            assignedGrades.add(typeof g === 'object' ? g.id : g);
        });
    });

    if (loading) {
        return <div className="p-4 text-center"><Spinner animation="border" variant="primary" /></div>;
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h6 className="fw-bold mb-1">Grade Bands</h6>
                    <p className="text-muted small mb-0">
                        Group grades that share the same fee structure (e.g. "Lower Primary", "Junior Secondary").
                        Used by the Grade-Band Fee Template billing pipeline.
                    </p>
                </div>
                <Button variant="primary" size="sm" className="d-flex align-items-center gap-1" onClick={openCreate}>
                    <Plus size={16} /> New Band
                </Button>
            </div>

            {bands.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <Layers size={40} className="mb-2 opacity-50" />
                    <p>No grade bands configured yet.</p>
                    <Button variant="outline-primary" size="sm" onClick={openCreate}>Create First Band</Button>
                </div>
            ) : (
                <Table hover responsive className="align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Band Name</th>
                            <th>Grades</th>
                            <th>Description</th>
                            <th className="text-center">Status</th>
                            <th className="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bands.map(band => (
                            <tr key={band.id}>
                                <td className="fw-medium">{band.name}</td>
                                <td>
                                    <div className="d-flex flex-wrap gap-1">
                                        {(band.grade_names || []).map((name, i) => (
                                            <Badge key={i} bg="light" text="dark" className="border">{name}</Badge>
                                        ))}
                                        {(!band.grade_names || band.grade_names.length === 0) && (
                                            <span className="text-muted small">No grades</span>
                                        )}
                                    </div>
                                </td>
                                <td className="text-muted small">{band.description || '—'}</td>
                                <td className="text-center">
                                    <Badge bg={band.is_active ? 'success' : 'secondary'}>
                                        {band.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </td>
                                <td className="text-end">
                                    <Button variant="link" size="sm" className="text-primary p-1" onClick={() => openEdit(band)} title="Edit">
                                        <Edit2 size={15} />
                                    </Button>
                                    <Button variant="link" size="sm" className="text-danger p-1" onClick={() => handleDelete(band)} title="Delete">
                                        <Trash2 size={15} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Create / Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fs-5">{editing ? 'Edit Grade Band' : 'New Grade Band'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-medium">Band Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g. Lower Primary, Junior Secondary"
                            value={form.name}
                            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-medium">Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="Optional description"
                            value={form.description}
                            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-medium">Assign Grades</Form.Label>
                        <p className="text-muted small mb-2">Select grades belonging to this band. Greyed-out grades are already in another band.</p>
                        <div className="border rounded p-2" style={{ maxHeight: 220, overflowY: 'auto' }}>
                            {grades.map(g => {
                                const taken = assignedGrades.has(g.id);
                                const checked = form.grades.includes(g.id);
                                return (
                                    <Form.Check
                                        key={g.id}
                                        type="checkbox"
                                        id={`grade-${g.id}`}
                                        label={
                                            <span className={taken ? 'text-muted' : ''}>
                                                {g.name} {taken && <small>(in another band)</small>}
                                            </span>
                                        }
                                        checked={checked}
                                        disabled={taken && !checked}
                                        onChange={() => toggleGrade(g.id)}
                                        className="mb-1"
                                    />
                                );
                            })}
                        </div>
                    </Form.Group>

                    <Form.Check
                        type="switch"
                        id="band-active"
                        label="Active"
                        checked={form.is_active}
                        onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default GradeBandSettings;
