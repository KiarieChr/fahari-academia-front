import React from 'react';
import { formatKES, formatDateTime, numberToWords } from '../utils/receiptUtils';

// ─── Shared Helpers ─────────────────────────────────────────────────────────

const resolveUrl = (val) => {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (val instanceof File || val instanceof Blob) return URL.createObjectURL(val);
    return null;
};
const getLogoUrl = (settings, profile) => resolveUrl(settings?.receipt_logo) || resolveUrl(profile?.logo) || null;
const getCoatUrl = (settings, profile) => resolveUrl(settings?.receipt_coat_of_arms) || null;
const getInst = (profile, settings, field, profileField) => profile?.[profileField] || settings?.[field] || '';

const SchoolHeader = ({ settings, institutionProfile, compact = false }) => {
    const logo = getLogoUrl(settings, institutionProfile);
    const coat = getCoatUrl(settings, institutionProfile);
    const style = settings?.receipt_header_style || 'LOGO_ONLY';
    const name = institutionProfile?.name || settings?.receipt_institution_name || 'INSTITUTION NAME';
    const address = getInst(institutionProfile, settings, 'receipt_institution_address', 'address_line_1');
    const phone = getInst(institutionProfile, settings, 'receipt_institution_phone', 'phone');
    const email = getInst(institutionProfile, settings, 'receipt_institution_email', 'email');
    const motto = getInst(institutionProfile, settings, 'receipt_institution_motto', 'motto');
    const primary = settings?.receipt_color_primary || institutionProfile?.primary_color || '#1a56db';

    const imgSize = compact ? 48 : 64;

    const renderImages = () => {
        if (style === 'LOGO_ONLY' && logo) return <img src={logo} alt="Logo" style={{ height: imgSize, objectFit: 'contain' }} />;
        if (style === 'COAT_ONLY' && coat) return <img src={coat} alt="Coat of Arms" style={{ height: imgSize, objectFit: 'contain' }} />;
        if (style === 'BOTH_SIDE') return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                {logo && <img src={logo} alt="Logo" style={{ height: imgSize, objectFit: 'contain' }} />}
                <div style={{ flex: 1 }} />
                {coat && <img src={coat} alt="Coat of Arms" style={{ height: imgSize, objectFit: 'contain' }} />}
            </div>
        );
        if (style === 'COAT_LEFT_LOGO_RIGHT') return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                {coat && <img src={coat} alt="Coat of Arms" style={{ height: imgSize, objectFit: 'contain' }} />}
                <div style={{ flex: 1 }} />
                {logo && <img src={logo} alt="Logo" style={{ height: imgSize, objectFit: 'contain' }} />}
            </div>
        );
        if (style === 'BOTH_CENTER') return (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, alignItems: 'center' }}>
                {coat && <img src={coat} alt="Coat of Arms" style={{ height: imgSize, objectFit: 'contain' }} />}
                {logo && <img src={logo} alt="Logo" style={{ height: imgSize, objectFit: 'contain' }} />}
            </div>
        );
        return null;
    };

    return (
        <div style={{ textAlign: 'center', marginBottom: compact ? 8 : 16 }}>
            {renderImages()}
            <div style={{ fontSize: compact ? 16 : 20, fontWeight: 'bold', color: primary, marginTop: 4 }}>{name}</div>
            {address && <div style={{ fontSize: compact ? 10 : 12, color: '#555' }}>{address}</div>}
            {(phone || email) && <div style={{ fontSize: compact ? 10 : 12, color: '#555' }}>{[phone, email].filter(Boolean).join(' | ')}</div>}
            {motto && <div style={{ fontSize: compact ? 9 : 11, fontStyle: 'italic', color: '#777', marginTop: 2 }}>{motto}</div>}
        </div>
    );
};

const QRPlaceholder = ({ receipt, size = 80 }) => (
    <div style={{ width: size, height: size, border: '1px solid #ccc', margin: '8px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#aaa' }}>
        QR: {receipt.receiptNumber || receipt.receipt_number}
    </div>
);

const Watermark = ({ settings }) => {
    const coat = getCoatUrl(settings);
    if (!settings?.receipt_watermark_enabled || !coat) return null;
    return (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.04, pointerEvents: 'none', zIndex: 0 }}>
            <img src={coat} alt="" style={{ width: 300, height: 300, objectFit: 'contain' }} />
        </div>
    );
};

const CopyLabel = ({ label }) => (
    <div style={{ position: 'absolute', top: 8, right: 12, fontSize: 10, fontWeight: 'bold', color: '#999', textTransform: 'uppercase', border: '1px solid #ddd', padding: '2px 8px', borderRadius: 3 }}>
        {label}
    </div>
);

const BalanceSummary = ({ receipt, settings, compact = false }) => {
    if (!settings?.receipt_show_balance) return null;
    const bi = receipt?.balance_info || receipt?.balanceInfo;
    if (!bi) return null;
    const fs = compact ? 10 : 12;
    const pad = compact ? '6px 10px' : '8px 14px';
    const primary = settings?.receipt_color_primary || '#1a56db';
    return (
        <div style={{ border: `1px solid ${primary}33`, borderRadius: 4, padding: pad, marginBottom: compact ? 8 : 16, background: '#fafbff', fontSize: fs }}>
            <div style={{ fontWeight: 'bold', fontSize: fs + 1, color: primary, marginBottom: 4, borderBottom: `1px solid ${primary}22`, paddingBottom: 3 }}>
                Balance Summary
            </div>
            <table style={{ width: '100%' }}>
                <tbody>
                    <tr>
                        <td style={{ padding: '2px 0' }}>Previous Balance:</td>
                        <td style={{ padding: '2px 0', textAlign: 'right', fontWeight: 600 }}>{formatKES(bi.previous_balance)}</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '2px 0', color: '#16a34a' }}>This Payment:</td>
                        <td style={{ padding: '2px 0', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>({formatKES(bi.this_payment)})</td>
                    </tr>
                    <tr style={{ borderTop: '1px solid #ddd' }}>
                        <td style={{ padding: '4px 0 2px', fontWeight: 'bold' }}>Current Balance:</td>
                        <td style={{ padding: '4px 0 2px', textAlign: 'right', fontWeight: 'bold', color: bi.current_balance > 0 ? '#dc2626' : '#16a34a' }}>
                            {formatKES(bi.current_balance)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

// ─── 1. STANDARD A4 ────────────────────────────────────────────────────────

export const StandardA4Receipt = ({ receipt, settings, institutionProfile, copyLabel }) => {
    const primary = settings?.receipt_color_primary || '#1a56db';
    const secondary = settings?.receipt_color_secondary || '#374151';
    const r = receipt;
    const rcptNo = r.receiptNumber || r.receipt_number;
    const rcptDate = r.date || r.received_date;
    const amount = r.amount || r.amount_received;
    const footer = settings?.receipt_footer_message || 'Thank you for your payment.';

    return (
        <div style={{ width: '210mm', minHeight: '297mm', padding: '20mm 15mm', fontFamily: 'Georgia, serif', fontSize: 13, position: 'relative', background: '#fff', color: '#222', boxSizing: 'border-box' }}>
            <Watermark settings={settings} />
            {copyLabel && <CopyLabel label={copyLabel} />}

            <SchoolHeader settings={settings} institutionProfile={institutionProfile} />

            {/* Title Bar */}
            <div style={{ background: primary, color: '#fff', textAlign: 'center', padding: '8px 0', fontSize: 16, fontWeight: 'bold', letterSpacing: 2, marginBottom: 16, borderRadius: 2 }}>
                OFFICIAL RECEIPT
            </div>

            {/* Receipt Number & Date Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 13 }}>
                <div><strong>Receipt No:</strong> <span style={{ color: primary, fontWeight: 'bold' }}>{rcptNo}</span></div>
                <div><strong>Date:</strong> {formatDateTime(rcptDate)}</div>
            </div>

            {/* Payer Section */}
            <div style={{ border: `1px solid ${primary}33`, borderRadius: 4, padding: 16, marginBottom: 16, background: '#fafbff' }}>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: secondary, textTransform: 'uppercase', marginBottom: 8, borderBottom: `2px solid ${primary}`, paddingBottom: 4 }}>
                    Payer Information
                </div>
                <table style={{ width: '100%', fontSize: 13 }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '30%', padding: '4px 0', fontWeight: 600 }}>Received From:</td>
                            <td style={{ padding: '4px 0' }}>{r.payerName || r.payer_name}</td>
                        </tr>
                        {(r.studentName || r.student_name) && (
                            <>
                                <tr>
                                    <td style={{ padding: '4px 0', fontWeight: 600 }}>Student Name:</td>
                                    <td style={{ padding: '4px 0' }}>{r.studentName || r.student_name}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '4px 0', fontWeight: 600 }}>Admission No:</td>
                                    <td style={{ padding: '4px 0' }}>{r.admissionNo || r.admission_number || 'N/A'}</td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Payment Details */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: secondary, textTransform: 'uppercase', marginBottom: 8, borderBottom: `2px solid ${primary}`, paddingBottom: 4 }}>
                    Payment Details
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr style={{ background: `${primary}11` }}>
                            <th style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'left' }}>Description</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'right', width: 150 }}>Amount (KES)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {r.allocations && r.allocations.length > 0 ? (
                            r.allocations.map((a, i) => (
                                <tr key={i}>
                                    <td style={{ border: '1px solid #ddd', padding: '8px 12px' }}>{a.fee_category || a.fee_item || a.description || 'Payment'}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'right' }}>{formatKES(a.amount)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td style={{ border: '1px solid #ddd', padding: '8px 12px' }}>{r.feeCategory || r.description || r.receiptType || 'Payment'}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'right' }}>{formatKES(amount)}</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr style={{ background: `${primary}11` }}>
                            <td style={{ border: '1px solid #ddd', padding: '10px 12px', fontWeight: 'bold', fontSize: 14 }}>TOTAL</td>
                            <td style={{ border: '1px solid #ddd', padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', fontSize: 16, color: primary }}>{formatKES(amount)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Amount in Words */}
            <div style={{ background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: 4, padding: '10px 14px', marginBottom: 16, fontSize: 12 }}>
                <strong>Amount in Words:</strong> <em>{numberToWords(Number(amount))} Only</em>
            </div>

            {/* Payment Method & Reference */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 24, fontSize: 13 }}>
                <div><strong>Payment Method:</strong> {r.paymentMethod || r.payment_method?.name || 'Cash'}</div>
                {r.reference && <div><strong>Reference:</strong> {r.reference}</div>}
                {r.term && <div><strong>Term:</strong> {r.term} {r.year || ''}</div>}
            </div>

            {/* Balance Summary */}
            <BalanceSummary receipt={r} settings={settings} />

            {/* Signature Section */}
            {settings?.receipt_signature_enabled !== false && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, paddingTop: 16 }}>
                    <div style={{ textAlign: 'center', width: '45%' }}>
                        <div style={{ borderBottom: '1px solid #333', marginBottom: 4, minHeight: 40 }} />
                        <div style={{ fontSize: 11 }}>Served by: {r.issuedBy || r.received_by || ''}</div>
                        <div style={{ fontSize: 9, color: '#888' }}>on behalf of {institutionProfile?.name || settings?.receipt_institution_name || ''}</div>
                    </div>
                    <div style={{ textAlign: 'center', width: '40%' }}>
                        <div style={{ borderBottom: '1px solid #333', marginBottom: 4, minHeight: 40 }} />
                        <div style={{ fontSize: 11 }}>Authorized Signature</div>
                    </div>
                </div>
            )}

            {/* QR & Footer */}
            <div style={{ marginTop: 32, borderTop: `2px solid ${primary}`, paddingTop: 12, textAlign: 'center' }}>
                {settings?.receipt_show_qr_code !== false && <QRPlaceholder receipt={r} size={80} />}
                <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{footer}</div>
                <div style={{ fontSize: 9, color: '#aaa', marginTop: 8 }}>Powered by Fahari School ERP</div>
            </div>
        </div>
    );
};

// ─── 2. COMPACT A4 (Half Page — 2-up) ──────────────────────────────────────

export const CompactA4Receipt = ({ receipt, settings, institutionProfile, copyLabel }) => {
    const primary = settings?.receipt_color_primary || '#1a56db';
    const r = receipt;
    const rcptNo = r.receiptNumber || r.receipt_number;
    const rcptDate = r.date || r.received_date;
    const amount = r.amount || r.amount_received;
    const footer = settings?.receipt_footer_message || 'Thank you for your payment.';

    return (
        <div style={{ width: '210mm', height: '148mm', padding: '10mm 12mm', fontFamily: 'Arial, sans-serif', fontSize: 11, position: 'relative', background: '#fff', boxSizing: 'border-box', borderBottom: '1px dashed #999' }}>
            <Watermark settings={settings} />
            {copyLabel && <CopyLabel label={copyLabel} />}

            <SchoolHeader settings={settings} institutionProfile={institutionProfile} compact />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: primary, color: '#fff', padding: '4px 12px', borderRadius: 2, marginBottom: 10 }}>
                <span style={{ fontWeight: 'bold', letterSpacing: 1 }}>OFFICIAL RECEIPT</span>
                <span style={{ fontSize: 12, fontWeight: 'bold' }}>{rcptNo}</span>
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
                {/* Left: Payer Info */}
                <div style={{ flex: 1, fontSize: 11 }}>
                    <div style={{ marginBottom: 3 }}><strong>Date:</strong> {formatDateTime(rcptDate)}</div>
                    <div style={{ marginBottom: 3 }}><strong>Received From:</strong> {r.payerName || r.payer_name}</div>
                    {(r.studentName || r.student_name) && (
                        <>
                            <div style={{ marginBottom: 3 }}><strong>Student:</strong> {r.studentName || r.student_name}</div>
                            <div style={{ marginBottom: 3 }}><strong>Adm No:</strong> {r.admissionNo || r.admission_number || 'N/A'}</div>
                        </>
                    )}
                    <div style={{ marginBottom: 3 }}><strong>Method:</strong> {r.paymentMethod || r.payment_method?.name || 'Cash'}</div>
                    {r.reference && <div style={{ marginBottom: 3 }}><strong>Ref:</strong> {r.reference}</div>}
                </div>

                {/* Right: Amount */}
                <div style={{ width: 200, textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>Amount Received</div>
                    <div style={{ fontSize: 22, fontWeight: 'bold', color: primary }}>{formatKES(amount)}</div>

                    {/* Allocations */}
                    {r.allocations && r.allocations.length > 0 && (
                        <div style={{ marginTop: 8, fontSize: 10, textAlign: 'left', borderTop: '1px solid #eee', paddingTop: 4 }}>
                            {r.allocations.map((a, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{a.fee_category || a.fee_item}</span>
                                    <span>{formatKES(a.amount)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Amount in Words */}
            <div style={{ fontSize: 10, marginTop: 8, padding: '4px 8px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 3 }}>
                <strong>In Words:</strong> {numberToWords(Number(amount))} Only
            </div>

            {/* Balance Summary */}
            <BalanceSummary receipt={r} settings={settings} compact />

            {/* Bottom Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 }}>
                {settings?.receipt_signature_enabled !== false && (
                    <div style={{ fontSize: 10 }}>
                        <div style={{ borderBottom: '1px solid #333', width: 180, marginBottom: 2, minHeight: 24 }} />
                        Served by: {r.issuedBy || r.received_by || ''}
                        <div style={{ fontSize: 8, color: '#888' }}>on behalf of {institutionProfile?.name || settings?.receipt_institution_name || ''}</div>
                    </div>
                )}
                <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 10, color: '#666' }}>{footer}</div>
                </div>
                {settings?.receipt_show_qr_code !== false && <QRPlaceholder receipt={r} size={50} />}
            </div>
        </div>
    );
};

// ─── 3. THERMAL POS 80mm ────────────────────────────────────────────────────

export const Thermal80mmReceipt = ({ receipt, settings, institutionProfile, copyLabel }) => {
    const r = receipt;
    const rcptNo = r.receiptNumber || r.receipt_number;
    const rcptDate = r.date || r.received_date;
    const amount = r.amount || r.amount_received;
    const logo = getLogoUrl(settings, institutionProfile);
    const instName = institutionProfile?.name || settings?.receipt_institution_name || 'INSTITUTION NAME';
    const instAddress = getInst(institutionProfile, settings, 'receipt_institution_address', 'address_line_1');
    const instPhone = getInst(institutionProfile, settings, 'receipt_institution_phone', 'phone');
    const instMotto = getInst(institutionProfile, settings, 'receipt_institution_motto', 'motto');
    const footer = settings?.receipt_footer_message || 'Thank you!';

    const s = {
        container: { width: '80mm', fontFamily: '"Courier New", monospace', fontSize: 12, background: '#fff', padding: 10, margin: '0 auto', border: '1px dashed #ccc' },
        center: { textAlign: 'center' },
        bold: { fontWeight: 'bold' },
        sep: { borderTop: '1px dashed #333', margin: '6px 0' },
        row: { display: 'flex', justifyContent: 'space-between', marginBottom: 2, fontSize: 11 },
    };

    return (
        <div style={s.container}>
            {copyLabel && <div style={{ textAlign: 'right', fontSize: 9, color: '#999' }}>{copyLabel}</div>}

            {/* Header with Logo */}
            {logo && (
                <div style={s.center}>
                    <img src={logo} alt="Logo" style={{ height: 40, objectFit: 'contain', marginBottom: 4 }} />
                </div>
            )}
            <div style={{ ...s.center, ...s.bold, fontSize: 14 }}>
                {instName}
            </div>
            {instAddress && <div style={s.center}>{instAddress}</div>}
            {instPhone && <div style={s.center}>Tel: {instPhone}</div>}

            <div style={s.sep} />
            <div style={{ ...s.center, ...s.bold, fontSize: 13 }}>OFFICIAL RECEIPT</div>
            <div style={s.sep} />

            <div style={s.row}><span>Receipt No:</span><span style={s.bold}>{rcptNo}</span></div>
            <div style={s.row}><span>Date:</span><span>{formatDateTime(rcptDate)}</span></div>

            <div style={s.sep} />

            <div style={{ ...s.bold, fontSize: 11, marginBottom: 4 }}>PAYER</div>
            <div style={s.row}><span>Name:</span><span>{r.payerName || r.payer_name}</span></div>
            {(r.studentName || r.student_name) && (
                <>
                    <div style={s.row}><span>Student:</span><span>{r.studentName || r.student_name}</span></div>
                    <div style={s.row}><span>Adm No:</span><span>{r.admissionNo || r.admission_number || 'N/A'}</span></div>
                </>
            )}

            <div style={s.sep} />

            <div style={s.row}><span>Method:</span><span>{r.paymentMethod || r.payment_method?.name || 'Cash'}</span></div>
            {r.reference && <div style={s.row}><span>Ref:</span><span>{r.reference}</span></div>}

            <div style={s.sep} />

            {/* Allocations */}
            {r.allocations && r.allocations.length > 0 && (
                <>
                    <div style={{ ...s.bold, fontSize: 11, marginBottom: 2 }}>BREAKDOWN</div>
                    {r.allocations.map((a, i) => (
                        <div key={i} style={s.row}>
                            <span>{a.fee_category || a.fee_item}</span>
                            <span>{formatKES(a.amount)}</span>
                        </div>
                    ))}
                    <div style={s.sep} />
                </>
            )}

            {/* Total */}
            <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 'bold', margin: '8px 0' }}>
                {formatKES(amount)}
            </div>

            <div style={s.sep} />

            {r.notes && <div style={{ fontSize: 10, marginBottom: 4 }}>Note: {r.notes}</div>}

            {/* Balance Summary */}
            {settings?.receipt_show_balance && r.balance_info && (
                <>
                    <div style={s.sep} />
                    <div style={{ ...s.bold, fontSize: 11, marginBottom: 2 }}>BALANCE</div>
                    <div style={s.row}><span>Prev Bal:</span><span>{formatKES(r.balance_info.previous_balance)}</span></div>
                    <div style={s.row}><span>This Pay:</span><span>({formatKES(r.balance_info.this_payment)})</span></div>
                    <div style={{ ...s.row, ...s.bold }}><span>Cur Bal:</span><span>{formatKES(r.balance_info.current_balance)}</span></div>
                </>
            )}

            <div style={{ ...s.center, fontSize: 10 }}>
                Served by: {r.issuedBy || r.received_by || 'System'}
            </div>
            <div style={{ ...s.center, fontSize: 8, color: '#666' }}>on behalf of {instName}</div>

            <div style={s.sep} />

            {settings?.receipt_show_qr_code !== false && <QRPlaceholder receipt={r} size={60} />}

            <div style={{ ...s.center, ...s.bold, fontSize: 12 }}>THANK YOU!</div>
            {instMotto && <div style={{ ...s.center, fontSize: 9, fontStyle: 'italic' }}>{instMotto}</div>}
            <div style={{ ...s.center, fontSize: 10, marginTop: 4 }}>{footer}</div>
            <div style={{ ...s.center, fontSize: 8, color: '#aaa', marginTop: 6 }}>Powered by Fahari School ERP</div>
        </div>
    );
};

// ─── 4. THERMAL POS 58mm ────────────────────────────────────────────────────

export const Thermal58mmReceipt = ({ receipt, settings, institutionProfile, copyLabel }) => {
    const r = receipt;
    const rcptNo = r.receiptNumber || r.receipt_number;
    const rcptDate = r.date || r.received_date;
    const amount = r.amount || r.amount_received;
    const logo = getLogoUrl(settings, institutionProfile);
    const instName = institutionProfile?.name || settings?.receipt_institution_name || 'INSTITUTION';
    const instPhone = getInst(institutionProfile, settings, 'receipt_institution_phone', 'phone');
    const footer = settings?.receipt_footer_message || 'Thank you!';

    const s = {
        container: { width: '58mm', fontFamily: '"Courier New", monospace', fontSize: 10, background: '#fff', padding: 6, margin: '0 auto', border: '1px dashed #ccc' },
        center: { textAlign: 'center' },
        bold: { fontWeight: 'bold' },
        sep: { borderTop: '1px dashed #333', margin: '4px 0' },
        row: { display: 'flex', justifyContent: 'space-between', marginBottom: 1, fontSize: 9 },
    };

    return (
        <div style={s.container}>
            {logo && <div style={s.center}><img src={logo} alt="" style={{ height: 28, objectFit: 'contain' }} /></div>}
            <div style={{ ...s.center, ...s.bold, fontSize: 11 }}>{instName}</div>
            {instPhone && <div style={{ ...s.center, fontSize: 8 }}>Tel: {instPhone}</div>}

            <div style={s.sep} />
            <div style={{ ...s.center, ...s.bold, fontSize: 10 }}>RECEIPT</div>
            <div style={s.sep} />

            <div style={s.row}><span>No:</span><span>{rcptNo}</span></div>
            <div style={s.row}><span>Date:</span><span>{new Date(rcptDate).toLocaleDateString()}</span></div>
            <div style={s.row}><span>From:</span><span>{(r.payerName || r.payer_name || '').substring(0, 18)}</span></div>
            {(r.studentName || r.student_name) && <div style={s.row}><span>Stud:</span><span>{(r.studentName || r.student_name).substring(0, 16)}</span></div>}
            <div style={s.row}><span>Method:</span><span>{r.paymentMethod || r.payment_method?.name || 'Cash'}</span></div>

            <div style={s.sep} />

            {r.allocations && r.allocations.length > 0 && (
                <>
                    {r.allocations.map((a, i) => (
                        <div key={i} style={s.row}><span>{(a.fee_category || a.fee_item || '').substring(0, 14)}</span><span>{formatKES(a.amount)}</span></div>
                    ))}
                    <div style={s.sep} />
                </>
            )}

            <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold', margin: '4px 0' }}>{formatKES(amount)}</div>

            {/* Balance Summary */}
            {settings?.receipt_show_balance && r.balance_info && (
                <>
                    <div style={s.sep} />
                    <div style={{ ...s.bold, fontSize: 9, marginBottom: 1 }}>BALANCE</div>
                    <div style={s.row}><span>Prev:</span><span>{formatKES(r.balance_info.previous_balance)}</span></div>
                    <div style={s.row}><span>Paid:</span><span>({formatKES(r.balance_info.this_payment)})</span></div>
                    <div style={{ ...s.row, ...s.bold }}><span>Bal:</span><span>{formatKES(r.balance_info.current_balance)}</span></div>
                </>
            )}

            <div style={s.sep} />
            <div style={{ ...s.center, fontSize: 8 }}>Served by: {(r.issuedBy || r.received_by || 'System').substring(0, 20)}</div>
            <div style={{ ...s.center, fontSize: 7, color: '#666' }}>on behalf of {instName}</div>
            {settings?.receipt_show_qr_code !== false && <QRPlaceholder receipt={r} size={40} />}
            <div style={{ ...s.center, ...s.bold, fontSize: 9 }}>THANK YOU!</div>
            <div style={{ ...s.center, fontSize: 7, color: '#aaa', marginTop: 4 }}>Fahari ERP</div>
        </div>
    );
};

// ─── 5. DUPLICATE BOOK STYLE ────────────────────────────────────────────────

export const DuplicateBookReceipt = ({ receipt, settings, institutionProfile, copyLabel }) => {
    const primary = settings?.receipt_color_primary || '#1a56db';
    const r = receipt;
    const rcptNo = r.receiptNumber || r.receipt_number;
    const rcptDate = r.date || r.received_date;
    const amount = r.amount || r.amount_received;
    const logo = getLogoUrl(settings, institutionProfile);
    const coat = getCoatUrl(settings, institutionProfile);
    const instName = institutionProfile?.name || settings?.receipt_institution_name || 'INSTITUTION NAME';
    const instAddress = getInst(institutionProfile, settings, 'receipt_institution_address', 'address_line_1');
    const instPhone = getInst(institutionProfile, settings, 'receipt_institution_phone', 'phone');
    const footer = settings?.receipt_footer_message || 'Thank you for your payment.';

    return (
        <div style={{ width: '180mm', padding: '12mm', fontFamily: 'Georgia, serif', fontSize: 12, background: '#fffef5', border: '2px solid #b89a5e', position: 'relative', boxSizing: 'border-box' }}>
            {copyLabel && <CopyLabel label={copyLabel} />}

            {/* Header Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 12 }}>
                {coat && <img src={coat} alt="Coat of Arms" style={{ height: 50, objectFit: 'contain' }} />}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>{instName}</div>
                    {instAddress && <div style={{ fontSize: 10, color: '#666' }}>{instAddress}</div>}
                    {instPhone && <div style={{ fontSize: 10, color: '#666' }}>Tel: {instPhone}</div>}
                </div>
                {logo && <img src={logo} alt="Logo" style={{ height: 50, objectFit: 'contain' }} />}
            </div>

            {/* Receipt Number Band */}
            <div style={{ background: '#b89a5e', color: '#fff', textAlign: 'center', padding: '4px 0', fontWeight: 'bold', letterSpacing: 2, marginBottom: 12, fontSize: 13 }}>
                RECEIPT NO: {rcptNo}
            </div>

            {/* Date */}
            <div style={{ textAlign: 'right', marginBottom: 8, fontSize: 11 }}>Date: {formatDateTime(rcptDate)}</div>

            {/* Main Fields (Book Style — ruled lines) */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
                <tbody>
                    <tr><td style={bookTd}>Received with thanks from</td><td style={bookVal}>{r.payerName || r.payer_name}</td></tr>
                    {(r.studentName || r.student_name) && (
                        <tr><td style={bookTd}>Student Name / Adm No</td><td style={bookVal}>{r.studentName || r.student_name} — {r.admissionNo || r.admission_number || 'N/A'}</td></tr>
                    )}
                    <tr><td style={bookTd}>The sum of Shillings</td><td style={bookVal}>{numberToWords(Number(amount))} Only</td></tr>
                    <tr><td style={bookTd}>Being payment for</td><td style={bookVal}>{r.feeCategory || r.description || r.receiptType || 'Payment'}</td></tr>
                    <tr><td style={bookTd}>Payment Method / Ref</td><td style={bookVal}>{r.paymentMethod || r.payment_method?.name || 'Cash'}{r.reference ? ` — ${r.reference}` : ''}</td></tr>
                </tbody>
            </table>

            {/* Amount Box */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <div style={{ border: '2px solid #333', padding: '8px 20px', fontSize: 18, fontWeight: 'bold' }}>
                    {formatKES(amount)}
                </div>
            </div>

            {/* Balance Summary */}
            <BalanceSummary receipt={r} settings={settings} compact />

            {/* Signatures */}
            {settings?.receipt_signature_enabled !== false && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                    <div style={{ textAlign: 'center', width: '40%' }}>
                        <div style={{ borderBottom: '1px solid #333', minHeight: 30, marginBottom: 4 }} />
                        <div style={{ fontSize: 10 }}>Served by: {r.issuedBy || r.received_by || ''}</div>
                        <div style={{ fontSize: 8, color: '#888' }}>on behalf of {instName}</div>
                    </div>
                    <div style={{ textAlign: 'center', width: '40%' }}>
                        <div style={{ borderBottom: '1px solid #333', minHeight: 30, marginBottom: 4 }} />
                        <div style={{ fontSize: 10 }}>Authorized Signature & Stamp</div>
                    </div>
                </div>
            )}

            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 10, color: '#888' }}>{footer}</div>
        </div>
    );
};

const bookTd = { padding: '6px 8px', fontSize: 11, fontWeight: 600, width: '35%', verticalAlign: 'top', color: '#555' };
const bookVal = { padding: '6px 8px', fontSize: 12, borderBottom: '1px solid #ccc' };

// ─── 6. A5 RECEIPT ──────────────────────────────────────────────────────────

export const A5Receipt = ({ receipt, settings, institutionProfile, copyLabel }) => {
    const primary = settings?.receipt_color_primary || '#1a56db';
    const secondary = settings?.receipt_color_secondary || '#374151';
    const r = receipt;
    const rcptNo = r.receiptNumber || r.receipt_number;
    const rcptDate = r.date || r.received_date;
    const amount = r.amount || r.amount_received;
    const footer = settings?.receipt_footer_message || 'Thank you for your payment.';

    return (
        <div style={{ width: '148mm', minHeight: '210mm', padding: '10mm', fontFamily: 'Arial, sans-serif', fontSize: 11, position: 'relative', background: '#fff', color: '#222', boxSizing: 'border-box' }}>
            <Watermark settings={settings} />
            {copyLabel && <CopyLabel label={copyLabel} />}

            <SchoolHeader settings={settings} institutionProfile={institutionProfile} compact />

            {/* Title */}
            <div style={{ background: primary, color: '#fff', textAlign: 'center', padding: '5px 0', fontSize: 13, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 10, borderRadius: 2 }}>
                OFFICIAL RECEIPT
            </div>

            {/* Receipt No & Date */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 11 }}>
                <div><strong>Receipt No:</strong> <span style={{ color: primary, fontWeight: 'bold' }}>{rcptNo}</span></div>
                <div><strong>Date:</strong> {formatDateTime(rcptDate)}</div>
            </div>

            {/* Payer Info */}
            <div style={{ border: `1px solid ${primary}33`, borderRadius: 4, padding: 10, marginBottom: 10, background: '#fafbff', fontSize: 11 }}>
                <div style={{ fontSize: 10, fontWeight: 'bold', color: secondary, textTransform: 'uppercase', marginBottom: 6, borderBottom: `1px solid ${primary}`, paddingBottom: 3 }}>Payer Information</div>
                <div style={{ marginBottom: 2 }}><strong>Received From:</strong> {r.payerName || r.payer_name}</div>
                {(r.studentName || r.student_name) && (
                    <>
                        <div style={{ marginBottom: 2 }}><strong>Student:</strong> {r.studentName || r.student_name}</div>
                        <div style={{ marginBottom: 2 }}><strong>Adm No:</strong> {r.admissionNo || r.admission_number || 'N/A'}</div>
                    </>
                )}
            </div>

            {/* Payment Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 10 }}>
                <thead>
                    <tr style={{ background: `${primary}11` }}>
                        <th style={{ border: '1px solid #ddd', padding: '5px 8px', textAlign: 'left' }}>Description</th>
                        <th style={{ border: '1px solid #ddd', padding: '5px 8px', textAlign: 'right', width: 120 }}>Amount (KES)</th>
                    </tr>
                </thead>
                <tbody>
                    {r.allocations && r.allocations.length > 0 ? (
                        r.allocations.map((a, i) => (
                            <tr key={i}>
                                <td style={{ border: '1px solid #ddd', padding: '5px 8px' }}>{a.fee_category || a.fee_item || a.description || 'Payment'}</td>
                                <td style={{ border: '1px solid #ddd', padding: '5px 8px', textAlign: 'right' }}>{formatKES(a.amount)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td style={{ border: '1px solid #ddd', padding: '5px 8px' }}>{r.feeCategory || r.description || r.receiptType || 'Payment'}</td>
                            <td style={{ border: '1px solid #ddd', padding: '5px 8px', textAlign: 'right' }}>{formatKES(amount)}</td>
                        </tr>
                    )}
                </tbody>
                <tfoot>
                    <tr style={{ background: `${primary}11` }}>
                        <td style={{ border: '1px solid #ddd', padding: '6px 8px', fontWeight: 'bold', fontSize: 12 }}>TOTAL</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px 8px', textAlign: 'right', fontWeight: 'bold', fontSize: 14, color: primary }}>{formatKES(amount)}</td>
                    </tr>
                </tfoot>
            </table>

            {/* Amount in Words */}
            <div style={{ background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: 3, padding: '6px 10px', marginBottom: 10, fontSize: 10 }}>
                <strong>In Words:</strong> <em>{numberToWords(Number(amount))} Only</em>
            </div>

            {/* Payment Method */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 11 }}>
                <div><strong>Method:</strong> {r.paymentMethod || r.payment_method?.name || 'Cash'}</div>
                {r.reference && <div><strong>Ref:</strong> {r.reference}</div>}
                {r.term && <div><strong>Term:</strong> {r.term} {r.year || ''}</div>}
            </div>

            {/* Balance Summary */}
            <BalanceSummary receipt={r} settings={settings} compact />

            {/* Signature */}
            {settings?.receipt_signature_enabled !== false && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, paddingTop: 10 }}>
                    <div style={{ textAlign: 'center', width: '45%' }}>
                        <div style={{ borderBottom: '1px solid #333', marginBottom: 3, minHeight: 28 }} />
                        <div style={{ fontSize: 10 }}>Served by: {r.issuedBy || r.received_by || ''}</div>
                        <div style={{ fontSize: 8, color: '#888' }}>on behalf of {institutionProfile?.name || settings?.receipt_institution_name || ''}</div>
                    </div>
                    <div style={{ textAlign: 'center', width: '40%' }}>
                        <div style={{ borderBottom: '1px solid #333', marginBottom: 3, minHeight: 28 }} />
                        <div style={{ fontSize: 10 }}>Authorized Signature</div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div style={{ marginTop: 16, borderTop: `1px solid ${primary}`, paddingTop: 8, textAlign: 'center' }}>
                {settings?.receipt_show_qr_code !== false && <QRPlaceholder receipt={r} size={60} />}
                <div style={{ fontSize: 10, color: '#666' }}>{footer}</div>
                <div style={{ fontSize: 8, color: '#aaa', marginTop: 4 }}>Powered by Fahari School ERP</div>
            </div>
        </div>
    );
};

// ─── Template Map ───────────────────────────────────────────────────────────

export const RECEIPT_TEMPLATES = {
    STANDARD_A4: StandardA4Receipt,
    COMPACT_A4: CompactA4Receipt,
    A5_RECEIPT: A5Receipt,
    THERMAL_80MM: Thermal80mmReceipt,
    THERMAL_58MM: Thermal58mmReceipt,
    DUPLICATE_BOOK: DuplicateBookReceipt,
};

export const TEMPLATE_INFO = [
    { key: 'STANDARD_A4', name: 'Standard A4', desc: 'Full-page formal receipt with letterhead, bordered sections, and signature area', size: 'A4' },
    { key: 'COMPACT_A4', name: 'Compact A4', desc: 'Half-page receipt — prints 2-up on A4 for efficient paper use', size: 'A4 Half' },
    { key: 'A5_RECEIPT', name: 'A5 Receipt', desc: 'Compact A5 format — ideal for smaller stationery and booklets', size: 'A5' },
    { key: 'THERMAL_80MM', name: 'POS Thermal 80mm', desc: 'Standard thermal printer receipt with logo and QR code', size: '80mm' },
    { key: 'THERMAL_58MM', name: 'POS Thermal 58mm', desc: 'Narrow thermal receipt for compact POS printers', size: '58mm' },
    { key: 'DUPLICATE_BOOK', name: 'Duplicate Book', desc: 'Classic receipt book style with ruled lines and gold accent', size: 'Custom' },
];

export default RECEIPT_TEMPLATES;
