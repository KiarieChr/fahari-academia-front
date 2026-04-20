import React, { useRef, useState } from 'react';
import { Printer, Download, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { RECEIPT_TEMPLATES, TEMPLATE_INFO } from '../templates/ReceiptTemplates';

const COPY_LABELS = ['Original', 'Duplicate', 'Office Copy'];

/**
 * ReceiptPrintManager
 * Renders the selected receipt template and provides print / PDF actions.
 * Props:
 *   receipt   — the receipt data object
 *   settings  — finance settings (receipt_format, branding, etc.)
 *   onClose   — close handler
 *   onPrinted — callback after print is sent (for tracking)
 */
const ReceiptPrintManager = ({ receipt, settings, institutionProfile, onClose, onPrinted }) => {
    const printRef = useRef(null);
    const format = settings?.receipt_format || 'THERMAL_80MM';
    const copies = settings?.receipt_copies || 1;
    const TemplateComponent = RECEIPT_TEMPLATES[format] || RECEIPT_TEMPLATES.THERMAL_80MM;
    const templateInfo = TEMPLATE_INFO.find(t => t.key === format);
    const [previewCopy, setPreviewCopy] = useState(0); // which copy to preview in the UI

    const isThermal = format.startsWith('THERMAL_');

    const getPrintCSS = () => {
        if (isThermal) {
            const width = format === 'THERMAL_58MM' ? '58mm' : '80mm';
            return `
                @page { size: ${width} auto; margin: 0; }
                body { margin: 0; padding: 0; }
                .no-print { display: none !important; }
            `;
        }
        if (format === 'COMPACT_A4') {
            return `
                @page { size: A4 portrait; margin: 5mm; }
                body { margin: 0; padding: 0; }
                .receipt-copy { page-break-inside: avoid; }
                .no-print { display: none !important; }
            `;
        }
        const paperSize = settings?.receipt_paper_size || 'A4';
        return `
            @page { size: ${paperSize} portrait; margin: 10mm; }
            body { margin: 0; padding: 0; }
            .receipt-copy { page-break-after: always; }
            .receipt-copy:last-child { page-break-after: auto; }
            .no-print { display: none !important; }
        `;
    };

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt ${receipt.receiptNumber || receipt.receipt_number}</title>
                <style>${getPrintCSS()}</style>
            </head>
            <body>${printContent.innerHTML}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 300);

        if (onPrinted) onPrinted(receipt);
    };

    const copyLabels = Array.from({ length: copies }, (_, i) => COPY_LABELS[i] || `Copy ${i + 1}`);

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar */}
            <div className="no-print" style={{ background: '#1f2937', color: '#fff', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontWeight: 'bold', fontSize: 15 }}>Receipt Preview</span>
                    <span style={{ fontSize: 12, color: '#9ca3af', background: '#374151', padding: '2px 10px', borderRadius: 12 }}>
                        {templateInfo?.name || format}
                    </span>
                    {copies > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 12 }}>
                            <button onClick={() => setPreviewCopy(Math.max(0, previewCopy - 1))} disabled={previewCopy === 0} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: previewCopy === 0 ? 0.3 : 1 }}>
                                <ChevronLeft size={16} />
                            </button>
                            <span style={{ fontSize: 12 }}>{copyLabels[previewCopy]} ({previewCopy + 1}/{copies})</span>
                            <button onClick={() => setPreviewCopy(Math.min(copies - 1, previewCopy + 1))} disabled={previewCopy >= copies - 1} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: previewCopy >= copies - 1 ? 0.3 : 1 }}>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                        <Printer size={16} /> Print {copies > 1 ? `(${copies} copies)` : ''}
                    </button>
                    <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#4b5563', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}>
                        <X size={16} /> Close
                    </button>
                </div>
            </div>

            {/* Preview Area (scrollable) */}
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', padding: 20, background: '#e5e7eb' }}>
                {/* Visible Preview — single copy at a time */}
                <div style={{ background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.15)', borderRadius: 4 }}>
                    <TemplateComponent receipt={receipt} settings={settings} institutionProfile={institutionProfile} copyLabel={copies > 1 ? copyLabels[previewCopy] : null} />
                </div>
            </div>

            {/* Hidden print content — all copies */}
            <div ref={printRef} style={{ position: 'absolute', left: -9999, top: 0 }}>
                {copyLabels.map((label, i) => (
                    <div key={i} className="receipt-copy">
                        <TemplateComponent receipt={receipt} settings={settings} institutionProfile={institutionProfile} copyLabel={copies > 1 ? label : null} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReceiptPrintManager;
