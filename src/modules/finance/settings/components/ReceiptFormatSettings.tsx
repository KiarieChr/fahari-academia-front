import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Save, X, Printer, Eye, Palette, Building2, FileText, Image, ExternalLink } from 'lucide-react';
import { RECEIPT_TEMPLATES, TEMPLATE_INFO } from '../../../fees/receipt-book/templates/ReceiptTemplates';
import { institutionService } from '../../../../services/institutionService';

const HEADER_STYLES = [
    { value: 'LOGO_ONLY', label: 'Logo Only' },
    { value: 'COAT_ONLY', label: 'Coat of Arms Only' },
    { value: 'BOTH_SIDE', label: 'Logo Left, Coat Right' },
    { value: 'COAT_LEFT_LOGO_RIGHT', label: 'Coat Left, Logo Right' },
    { value: 'BOTH_CENTER', label: 'Both Centered' },
];

const PAPER_SIZES = [
    { value: 'A4', label: 'A4' },
    { value: 'LETTER', label: 'Letter' },
    { value: 'A5', label: 'A5' },
];

const SAMPLE_RECEIPT = {
    receipt_number: 'RCT-2026-0042',
    received_date: new Date().toISOString(),
    payer_name: 'John Kamau',
    student_name: 'Grace Kamau',
    admission_number: 'ADM/2024/0012',
    amount_received: 25000,
    payment_method: { name: 'M-Pesa' },
    reference: 'QKJ4R9SLPX',
    description: 'Term 2 School Fees',
    received_by: 'Finance Office',
    allocations: [
        { fee_category: 'Tuition Fee', amount: 18000 },
        { fee_category: 'Activity Fee', amount: 4000 },
        { fee_category: 'Exam Fee', amount: 3000 },
    ],
};

const ReceiptFormatSettings = ({ settings, onSave }) => {
    const [formData, setFormData] = useState(settings || {});
    const [logoPreview, setLogoPreview] = useState(null);
    const [coatPreview, setCoatPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [institutionProfile, setInstitutionProfile] = useState(null);
    const logoRef = useRef(null);
    const coatRef = useRef(null);

    React.useEffect(() => {
        if (settings) setFormData(settings);
    }, [settings]);

    useEffect(() => {
        institutionService.getProfile().then(setInstitutionProfile).catch(() => {});
    }, []);

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { alert('File must be under 2MB'); return; }
        setFormData(prev => ({ ...prev, [field]: file }));
        const url = URL.createObjectURL(file);
        if (field === 'receipt_logo') setLogoPreview(url);
        else setCoatPreview(url);
    };

    const clearFile = (field) => {
        setFormData(prev => ({ ...prev, [field]: null }));
        if (field === 'receipt_logo') { setLogoPreview(null); if (logoRef.current) logoRef.current.value = ''; }
        else { setCoatPreview(null); if (coatRef.current) coatRef.current.value = ''; }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(formData).forEach(([key, val]) => {
                if (val === null || val === undefined) return;
                if (key === 'receipt_logo' || key === 'receipt_coat_of_arms') {
                    if (val instanceof File) fd.append(key, val);
                } else {
                    fd.append(key, val);
                }
            });
            await onSave(fd);
        } finally {
            setSaving(false);
        }
    };

    const previewSettings = useMemo(() => {
        const s = { ...formData };
        if (logoPreview) s.receipt_logo = logoPreview;
        else if (typeof s.receipt_logo === 'string' && s.receipt_logo) { /* keep URL */ }
        if (coatPreview) s.receipt_coat_of_arms = coatPreview;
        return s;
    }, [formData, logoPreview, coatPreview]);

    const selectedFormat = formData.receipt_format || 'THERMAL_80MM';
    const SelectedTemplate = RECEIPT_TEMPLATES[selectedFormat] || RECEIPT_TEMPLATES.THERMAL_80MM;
    const logoSrc = logoPreview || (typeof formData.receipt_logo === 'string' ? formData.receipt_logo : null);
    const coatSrc = coatPreview || (typeof formData.receipt_coat_of_arms === 'string' ? formData.receipt_coat_of_arms : null);

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h6 className="fw-bold mb-1">Receipt Format & Appearance</h6>
                        <small className="text-muted">Configure receipt templates, branding, and print settings</small>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                            <Save size={14} className="me-1" /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {/* ─── Settings ─── */}
                <div className="row">
                    <div className="col-12">

                        {/* ── Template Selector ── */}
                        <div className="mb-4">
                            <label className="form-label fw-semibold d-flex align-items-center gap-1">
                                <FileText size={14} /> Receipt Template
                            </label>
                            <div className="row g-2">
                                {TEMPLATE_INFO.map(t => (
                                    <div className="col-6 col-md-4" key={t.key}>
                                        <div
                                            className={`card h-100 cursor-pointer ${selectedFormat === t.key ? 'border-primary bg-primary bg-opacity-10' : 'border'}`}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => setFormData(prev => ({ ...prev, receipt_format: t.key }))}
                                        >
                                            <div className="card-body p-2 text-center">
                                                <div className="fw-bold" style={{ fontSize: 12 }}>{t.name}</div>
                                                <div className="text-muted" style={{ fontSize: 10 }}>{t.desc}</div>
                                                <span className="badge bg-secondary mt-1" style={{ fontSize: 9 }}>{t.size}</span>
                                                {selectedFormat === t.key && (
                                                    <div className="text-primary mt-1" style={{ fontSize: 10 }}>✓ Selected</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Branding / Images ── */}
                        <div className="card bg-light border-0 mb-3">
                            <div className="card-body">
                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-1"><Image size={14} /> Branding</h6>
                                <div className="row g-3">
                                    {/* Logo */}
                                    <div className="col-md-6">
                                        <label className="form-label">Institution Logo</label>
                                        <div className="d-flex align-items-center gap-2">
                                            {logoSrc && <img src={logoSrc} alt="Logo" style={{ height: 40, objectFit: 'contain', borderRadius: 4, border: '1px solid #ddd' }} />}
                                            <input type="file" ref={logoRef} accept="image/*" className="form-control form-control-sm" onChange={e => handleFileChange(e, 'receipt_logo')} />
                                            {logoSrc && <button className="btn btn-sm btn-outline-danger" onClick={() => clearFile('receipt_logo')}><X size={12} /></button>}
                                        </div>
                                    </div>
                                    {/* Coat of Arms */}
                                    <div className="col-md-6">
                                        <label className="form-label">Coat of Arms</label>
                                        <div className="d-flex align-items-center gap-2">
                                            {coatSrc && <img src={coatSrc} alt="Coat" style={{ height: 40, objectFit: 'contain', borderRadius: 4, border: '1px solid #ddd' }} />}
                                            <input type="file" ref={coatRef} accept="image/*" className="form-control form-control-sm" onChange={e => handleFileChange(e, 'receipt_coat_of_arms')} />
                                            {coatSrc && <button className="btn btn-sm btn-outline-danger" onClick={() => clearFile('receipt_coat_of_arms')}><X size={12} /></button>}
                                        </div>
                                    </div>
                                    {/* Header Style */}
                                    <div className="col-md-6">
                                        <label className="form-label">Header Layout</label>
                                        <select className="form-select form-select-sm" name="receipt_header_style" value={formData.receipt_header_style || 'LOGO_ONLY'} onChange={handleChange}>
                                            {HEADER_STYLES.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Colors ── */}
                        <div className="card bg-light border-0 mb-3">
                            <div className="card-body">
                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-1"><Palette size={14} /> Colors</h6>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label">Primary Color</label>
                                        <div className="d-flex align-items-center gap-2">
                                            <input type="color" name="receipt_color_primary" value={formData.receipt_color_primary || '#1a56db'} onChange={handleChange} style={{ width: 36, height: 36, padding: 0, border: 'none', cursor: 'pointer' }} />
                                            <input type="text" className="form-control form-control-sm" name="receipt_color_primary" value={formData.receipt_color_primary || '#1a56db'} onChange={handleChange} style={{ maxWidth: 100 }} />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Secondary Color</label>
                                        <div className="d-flex align-items-center gap-2">
                                            <input type="color" name="receipt_color_secondary" value={formData.receipt_color_secondary || '#374151'} onChange={handleChange} style={{ width: 36, height: 36, padding: 0, border: 'none', cursor: 'pointer' }} />
                                            <input type="text" className="form-control form-control-sm" name="receipt_color_secondary" value={formData.receipt_color_secondary || '#374151'} onChange={handleChange} style={{ maxWidth: 100 }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Display Options ── */}
                        <div className="card bg-light border-0 mb-3">
                            <div className="card-body">
                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-1"><Printer size={14} /> Display & Print Options</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="form-check mb-2">
                                            <input type="checkbox" className="form-check-input" id="receipt_show_balance" name="receipt_show_balance" checked={formData.receipt_show_balance || false} onChange={handleChange} />
                                            <label className="form-check-label" htmlFor="receipt_show_balance">Show Balance After Payment</label>
                                        </div>
                                        <div className="form-check mb-2">
                                            <input type="checkbox" className="form-check-input" id="receipt_show_voteheads" name="receipt_show_voteheads" checked={formData.receipt_show_voteheads || false} onChange={handleChange} />
                                            <label className="form-check-label" htmlFor="receipt_show_voteheads">Show Voteheads Breakdown</label>
                                        </div>
                                        <div className="form-check mb-2">
                                            <input type="checkbox" className="form-check-input" id="receipt_show_qr_code" name="receipt_show_qr_code" checked={formData.receipt_show_qr_code !== false} onChange={handleChange} />
                                            <label className="form-check-label" htmlFor="receipt_show_qr_code">Show QR Code</label>
                                        </div>
                                        <div className="form-check mb-2">
                                            <input type="checkbox" className="form-check-input" id="receipt_show_student_photo" name="receipt_show_student_photo" checked={formData.receipt_show_student_photo || false} onChange={handleChange} />
                                            <label className="form-check-label" htmlFor="receipt_show_student_photo">Show Student Photo</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-check mb-2">
                                            <input type="checkbox" className="form-check-input" id="receipt_watermark_enabled" name="receipt_watermark_enabled" checked={formData.receipt_watermark_enabled || false} onChange={handleChange} />
                                            <label className="form-check-label" htmlFor="receipt_watermark_enabled">Watermark (Coat of Arms)</label>
                                        </div>
                                        <div className="form-check mb-2">
                                            <input type="checkbox" className="form-check-input" id="receipt_signature_enabled" name="receipt_signature_enabled" checked={formData.receipt_signature_enabled !== false} onChange={handleChange} />
                                            <label className="form-check-label" htmlFor="receipt_signature_enabled">Signature Area</label>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Print Copies</label>
                                        <select className="form-select form-select-sm" name="receipt_copies" value={formData.receipt_copies || 1} onChange={handleChange}>
                                            <option value={1}>1 — Original only</option>
                                            <option value={2}>2 — Original + Duplicate</option>
                                            <option value={3}>3 — Original + Duplicate + Office</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Paper Size (A4 templates)</label>
                                        <select className="form-select form-select-sm" name="receipt_paper_size" value={formData.receipt_paper_size || 'A4'} onChange={handleChange}>
                                            {PAPER_SIZES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Institution Info (from Institution Profile) ── */}
                        <div className="card bg-light border-0 mb-3">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="fw-bold mb-0 d-flex align-items-center gap-1"><Building2 size={14} /> Institution Details</h6>
                                    <a href="/dashboard/settings" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
                                        <ExternalLink size={12} /> Edit in Profile
                                    </a>
                                </div>
                                {institutionProfile ? (
                                    <div className="row g-2">
                                        <div className="col-md-4 d-flex align-items-center gap-2">
                                            {institutionProfile.logo && <img src={institutionProfile.logo} alt="Logo" style={{ height: 36, objectFit: 'contain', borderRadius: 4, border: '1px solid #ddd' }} />}
                                            <div>
                                                <div className="fw-bold" style={{ fontSize: 13 }}>{institutionProfile.name || '—'}</div>
                                                <div className="text-muted" style={{ fontSize: 10 }}>{institutionProfile.motto || ''}</div>
                                            </div>
                                        </div>
                                        <div className="col-md-4" style={{ fontSize: 12 }}>
                                            <div className="text-muted">Address</div>
                                            <div>{institutionProfile.address_line_1 || '—'}</div>
                                        </div>
                                        <div className="col-md-4" style={{ fontSize: 12 }}>
                                            <div className="text-muted">Contact</div>
                                            <div>{institutionProfile.phone || '—'} | {institutionProfile.email || '—'}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-muted" style={{ fontSize: 12 }}>Loading institution profile...</div>
                                )}
                                <div className="mt-2" style={{ fontSize: 11, color: '#6b7280' }}>
                                    Institution name, logo, and contact details are pulled from the Institution Profile. To change them, edit the profile.
                                </div>
                            </div>
                        </div>

                        {/* ── Footer Message ── */}
                        <div className="mb-3">
                            <label className="form-label">Footer Message</label>
                            <textarea className="form-control" rows="2" name="receipt_footer_message" value={formData.receipt_footer_message || ''} onChange={handleChange} placeholder="Thank you for your payment." />
                        </div>

                        {/* Save Button (bottom) */}
                        <button className="btn btn-primary w-100" onClick={handleSave} disabled={saving}>
                            <Save size={16} className="me-1" /> {saving ? 'Saving...' : 'Save Receipt Settings'}
                        </button>
                    </div>
                </div>

                {/* ─── Live Preview (full width, below settings) ─── */}
                <div className="mt-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-dark text-white py-2 d-flex justify-content-between align-items-center">
                            <span className="fw-bold d-flex align-items-center gap-2" style={{ fontSize: 14 }}>
                                <Eye size={16} /> Live Preview
                            </span>
                            <span className="badge bg-light text-dark" style={{ fontSize: 11 }}>
                                {TEMPLATE_INFO.find(t => t.key === selectedFormat)?.name || selectedFormat}
                            </span>
                        </div>
                        <div className="card-body p-3" style={{ background: '#e5e7eb', overflow: 'auto' }}>
                            <div className="d-flex justify-content-center">
                                <div style={{
                                    transform: selectedFormat.startsWith('THERMAL_') ? 'scale(1)' : 'scale(0.65)',
                                    transformOrigin: 'top center',
                                    maxWidth: '100%',
                                }}>
                                    <SelectedTemplate receipt={SAMPLE_RECEIPT} settings={previewSettings} institutionProfile={institutionProfile} copyLabel={Number(formData.receipt_copies) > 1 ? 'Original' : null} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReceiptFormatSettings;
