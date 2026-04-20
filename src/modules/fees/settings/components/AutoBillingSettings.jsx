import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Alert, Button, Spinner } from 'react-bootstrap';
import { api } from '../../../../services/api';
import { toast } from 'react-toastify';

const AutoBillingSettings = () => {
    const [settings, setSettings] = useState({
        auto_billing_enabled: false,
        billing_mode: 'STRUCTURE',
        default_billing_days: 14,
        // UI only fields (not in backend yet, handled locally for demo)
        prorated_billing: false,
        re_billing_protocol: 'void'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/finance/settings/');
            if (response.data) {
                setSettings(prev => ({
                    ...prev,
                    ...response.data
                }));
            }
        } catch (err) {
            console.error("Error fetching settings:", err);
            setError("Failed to load settings. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            // Only send backend fields
            const payload = {
                auto_billing_enabled: settings.auto_billing_enabled,
                billing_mode: settings.billing_mode,
                default_billing_days: settings.default_billing_days,
            };

            await api.post('/finance/settings/', payload);
            toast.success("Auto-billing settings saved successfully!");
        } catch (err) {
            console.error("Error saving settings:", err);
            toast.error("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-4 text-center"><Spinner animation="border" variant="primary" /></div>;
    }

    return (
        <div>
            {error && <Alert variant="danger">{error}</Alert>}

            <div className="mb-4">
                <Form.Check
                    type="switch"
                    id="auto-billing-toggle"
                    label={<span className="fw-bold">Enable Auto-Billing on Student Reporting</span>}
                    className="mb-2 fs-5"
                    checked={settings.auto_billing_enabled}
                    onChange={(e) => handleChange('auto_billing_enabled', e.target.checked)}
                />
                <p className="text-muted small ms-4">
                    When enabled, the system will automatically generate invoices for students as soon as their status changes to "Reported" for the new term.
                </p>
            </div>

            <hr className="my-4" />

            <h6 className="fw-bold mb-3">Billing Pipeline</h6>

            <Row className="mb-3">
                <Col md={8}>
                    <Form.Label className="fw-medium">Default Billing Mode</Form.Label>
                    <p className="text-muted small mb-0">Choose which fee pipeline to use when auto-generating invoices.</p>
                </Col>
                <Col md={4}>
                    <Form.Select
                        size="sm"
                        value={settings.billing_mode}
                        onChange={(e) => handleChange('billing_mode', e.target.value)}
                    >
                        <option value="STRUCTURE">Per-Grade Fee Structure (Legacy)</option>
                        <option value="TEMPLATE">Grade-Band Fee Template (Modern)</option>
                        <option value="AUTO">Auto (Template → Structure fallback)</option>
                    </Form.Select>
                </Col>
            </Row>

            {settings.billing_mode === 'STRUCTURE' && (
                <Alert variant="secondary" className="small">
                    <strong>Per-Grade Structure:</strong> Each grade has its own fee structure per term. 
                    Set up structures under <em>Fee Structures</em> before enabling auto-billing.
                </Alert>
            )}
            {settings.billing_mode === 'TEMPLATE' && (
                <Alert variant="info" className="small">
                    <strong>Grade-Band Template:</strong> Group grades into bands (e.g. "Lower Primary", "Junior Secondary") 
                    and assign one fee template per band. Set up grade bands and templates under <em>Fee Templates</em>.
                </Alert>
            )}
            {settings.billing_mode === 'AUTO' && (
                <Alert variant="warning" className="small">
                    <strong>Auto Mode:</strong> The system will first attempt to find a matching fee template for the student's grade band. 
                    If no template is found, it falls back to the legacy per-grade fee structure.
                </Alert>
            )}

            <hr className="my-4" />

            <h6 className="fw-bold mb-3">Billing Configuration</h6>

            <Row className="mb-3">
                <Col md={8}>
                    <Form.Label className="fw-medium">Pro-rated Billing</Form.Label>
                    <p className="text-muted small mb-0">Allow billing of partial fees for students joining mid-term.</p>
                </Col>
                <Col md={4} className="text-end">
                    <Form.Check
                        type="switch"
                        id="prorated-billing"
                        checked={settings.prorated_billing}
                        onChange={(e) => handleChange('prorated_billing', e.target.checked)}
                    />
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={8}>
                    <Form.Label className="fw-medium">Billing Delay (Grace Period)</Form.Label>
                    <p className="text-muted small mb-0">Number of days to wait after reporting before generating invoice.</p>
                </Col>
                <Col md={4}>
                    <Form.Select
                        size="sm"
                        value={settings.default_billing_days}
                        onChange={(e) => handleChange('default_billing_days', parseInt(e.target.value))}
                    >
                        <option value="0">Immediate</option>
                        <option value="1">24 Hours</option>
                        <option value="3">3 Days</option>
                        <option value="7">7 Days</option>
                        <option value="14">14 Days</option>
                        <option value="30">30 Days</option>
                    </Form.Select>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={8}>
                    <Form.Label className="fw-medium">Re-billing Protocol</Form.Label>
                    <p className="text-muted small mb-0">Action to take if a student changes class or intake after initial billing.</p>
                </Col>
                <Col md={4}>
                    <Form.Select
                        size="sm"
                        value={settings.re_billing_protocol || 'void'}
                        onChange={(e) => handleChange('re_billing_protocol', e.target.value)}
                    >
                        <option value="void">Void & Re-issue Invoice</option>
                        <option value="adjust">Create Adjustment Invoice</option>
                        <option value="manual">Flag for Manual Review</option>
                    </Form.Select>
                </Col>
            </Row>

            <Alert variant="info" className="mt-4">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Note:</strong> Auto-billing uses the "Default" fee structure for the student's assigned class. Ensure fee structures are approved before the term begins.
            </Alert>

            <div className="d-flex justify-content-end mt-4">
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Settings'}
                </Button>
            </div>
        </div>
    );
};

export default AutoBillingSettings;

