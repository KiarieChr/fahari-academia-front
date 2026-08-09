/**
 * Thermal Printer Service
 * Handles ESC/POS formatting and printing for thermal receipt printers
 * Supports 80mm and 58mm paper widths
 */

// Note: escpos and escpos-usb require native bindings and may need Electron or Node.js backend
// For browser-based React, we'll use a virtual ESC/POS encoder
// For production with USB printers, integrate with Electron or use a local print server

class ThermalPrinterService {
    constructor() {
        this.paperWidth = 48; // characters for 80mm paper
        this.encoding = 'utf8';
    }

    /**
     * ESC/POS Command Codes
     */
    commands = {
        INIT: '\x1B\x40',           // Initialize printer
        ALIGN_LEFT: '\x1B\x61\x00',
        ALIGN_CENTER: '\x1B\x61\x01',
        ALIGN_RIGHT: '\x1B\x61\x02',
        BOLD_ON: '\x1B\x45\x01',
        BOLD_OFF: '\x1B\x45\x00',
        UNDERLINE_ON: '\x1B\x2D\x01',
        UNDERLINE_OFF: '\x1B\x2D\x00',
        DOUBLE_WIDTH_ON: '\x1B\x21\x20',
        DOUBLE_WIDTH_OFF: '\x1B\x21\x00',
        DOUBLE_HEIGHT_ON: '\x1B\x21\x10',
        FONT_SIZE_NORMAL: '\x1D\x21\x00',
        FONT_SIZE_DOUBLE: '\x1D\x21\x11',
        NEWLINE: '\n',
        CUT_PAPER: '\x1D\x56\x00',
        OPEN_DRAWER: '\x1B\x70\x00',
    };

    /**
     * Generate separator line
     */
    separator(char = '-', width = this.paperWidth) {
        return char.repeat(width) + this.commands.NEWLINE;
    }

    /**
     * Center align text with padding
     */
    centerText(text, width = this.paperWidth) {
        const padding = Math.max(0, Math.floor((width - text.length) / 2));
        return ' '.repeat(padding) + text + this.commands.NEWLINE;
    }

    /**
     * Create two-column layout (label: value)
     */
    twoColumn(label, value, width = this.paperWidth) {
        const maxValueWidth = width - label.length - 2;
        const truncatedValue = value.length > maxValueWidth
            ? value.substring(0, maxValueWidth - 3) + '...'
            : value;
        const spaces = width - label.length - truncatedValue.length;
        return label + ' '.repeat(Math.max(1, spaces)) + truncatedValue + this.commands.NEWLINE;
    }

    /**
     * Format currency (KES)
     */
    formatCurrency(amount) {
        return 'KES ' + parseFloat(amount).toLocaleString('en-KE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    /**
     * Format date and time
     */
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-KE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    /**
     * Generate receipt content with ESC/POS commands
     */
    generateReceiptContent(receipt, schoolInfo = {}) {
        let content = '';

        // Initialize
        content += this.commands.INIT;

        // Header - School Info
        content += this.commands.ALIGN_CENTER;
        content += this.commands.BOLD_ON;
        content += this.commands.FONT_SIZE_DOUBLE;
        content += schoolInfo.name || 'SCHOOL NAME';
        content += this.commands.NEWLINE;
        content += this.commands.FONT_SIZE_NORMAL;
        content += this.commands.BOLD_OFF;

        if (schoolInfo.address) {
            content += schoolInfo.address + this.commands.NEWLINE;
        }
        if (schoolInfo.phone) {
            content += 'Tel: ' + schoolInfo.phone + this.commands.NEWLINE;
        }
        if (schoolInfo.email) {
            content += schoolInfo.email + this.commands.NEWLINE;
        }

        content += this.separator('=');

        // Receipt Title
        content += this.commands.BOLD_ON;
        content += 'OFFICIAL RECEIPT';
        content += this.commands.NEWLINE;
        content += this.commands.BOLD_OFF;
        content += this.separator('=');

        // Receipt Details
        content += this.commands.ALIGN_LEFT;
        content += this.twoColumn('Receipt No:', receipt.receiptNumber || receipt.receipt_number);
        content += this.twoColumn('Date:', this.formatDateTime(receipt.date || receipt.received_date));
        content += this.separator('-');

        // Payer Information
        content += this.commands.BOLD_ON;
        content += 'PAYER INFORMATION';
        content += this.commands.NEWLINE;
        content += this.commands.BOLD_OFF;
        content += this.twoColumn('Name:', receipt.payerName || receipt.payer_name);

        if (receipt.studentName || receipt.student_name) {
            content += this.twoColumn('Student:', receipt.studentName || receipt.student_name);
            content += this.twoColumn('Admission:', receipt.admissionNo || receipt.admission_number || 'N/A');
        }

        content += this.separator('-');

        // Payment Details
        content += this.commands.BOLD_ON;
        content += 'PAYMENT DETAILS';
        content += this.commands.NEWLINE;
        content += this.commands.BOLD_OFF;

        // Receipt Type
        const receiptType = receipt.receiptType || receipt.receipt_type || 'General';
        content += this.twoColumn('Type:', receiptType);

        // Payment Method
        const paymentMethod = receipt.paymentMethod || receipt.payment_method?.name || 'Cash';
        content += this.twoColumn('Method:', paymentMethod);

        // Reference (if any)
        if (receipt.reference) {
            content += this.twoColumn('Ref:', receipt.reference);
        }

        // Term/Year (if applicable)
        if (receipt.term && receipt.year) {
            content += this.twoColumn('Term/Year:', `${receipt.term} ${receipt.year}`);
        }

        content += this.separator('=');

        // Amount - Highlighted
        content += this.commands.ALIGN_CENTER;
        content += this.commands.BOLD_ON;
        content += this.commands.FONT_SIZE_DOUBLE;
        content += this.formatCurrency(receipt.amount || receipt.amount_received);
        content += this.commands.NEWLINE;
        content += this.commands.FONT_SIZE_NORMAL;
        content += this.commands.BOLD_OFF;
        content += this.separator('=');

        // Allocations/Breakdown (if available)
        if (receipt.allocations && receipt.allocations.length > 0) {
            content += this.commands.ALIGN_LEFT;
            content += this.commands.BOLD_ON;
            content += 'PAYMENT BREAKDOWN';
            content += this.commands.NEWLINE;
            content += this.commands.BOLD_OFF;

            receipt.allocations.forEach(allocation => {
                const feeItem = allocation.fee_category || allocation.fee_item || 'Fee';
                const amount = this.formatCurrency(allocation.amount);
                content += this.twoColumn(feeItem + ':', amount);
            });

            content += this.separator('-');
        }

        // Notes (if any)
        if (receipt.notes) {
            content += this.commands.ALIGN_LEFT;
            content += 'Notes: ' + receipt.notes + this.commands.NEWLINE;
            content += this.separator('-');
        }

        // Footer
        content += this.commands.ALIGN_CENTER;
        content += 'Received By: ' + (receipt.issuedBy || receipt.received_by || 'System');
        content += this.commands.NEWLINE;
        content += this.separator('-');

        // Thank you message
        content += this.commands.BOLD_ON;
        content += 'THANK YOU!';
        content += this.commands.NEWLINE;
        content += this.commands.BOLD_OFF;

        if (schoolInfo.motto) {
            content += schoolInfo.motto + this.commands.NEWLINE;
        }

        // QR Code placeholder (requires special implementation)
        content += this.commands.NEWLINE;
        content += `[QR: ${receipt.receiptNumber || receipt.receipt_number}]`;
        content += this.commands.NEWLINE;

        // Footer text
        content += 'Powered by Fahari School ERP';
        content += this.commands.NEWLINE;
        content += this.separator('-');

        // Spacing before cut
        content += this.commands.NEWLINE;
        content += this.commands.NEWLINE;
        content += this.commands.NEWLINE;

        // Cut paper
        content += this.commands.CUT_PAPER;

        return content;
    }

    /**
     * Send to thermal printer via USB (requires native integration)
     * For browser use, this would need a local print server or Electron
     */
    async printViaUSB(content) {
        // This requires native USB access
        // In production, use Electron with escpos-usb or a local print server
        console.warn('USB printing requires native integration (Electron or print server)');
        console.log('Print content:', content);

        // Fallback: Create blob and trigger download
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'receipt.txt';
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Send to thermal printer via Network/IP
     */
    async printViaNetwork(content, printerIp, printerPort = 9100) {
        try {
            // This would require a backend endpoint or WebSocket connection
            const response = await fetch('/api/print/thermal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    printerIp,
                    printerPort,
                    content: btoa(content) // Base64 encode
                })
            });

            return response.json();
        } catch (error) {
            console.error('Network printing error:', error);
            throw error;
        }
    }

    /**
     * Main print method
     */
    async print(receipt, schoolInfo = {}, options = {}) {
        const content = this.generateReceiptContent(receipt, schoolInfo);

        // Determine print method
        if (options.printerType === 'usb') {
            return this.printViaUSB(content);
        } else if (options.printerType === 'network' && options.printerIp) {
            return this.printViaNetwork(content, options.printerIp, options.printerPort);
        } else {
            // Fallback: browser print
            return this.browserPrint(content);
        }
    }

    /**
     * Browser print fallback
     */
    browserPrint(content) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              width: 80mm;
              font-family: 'Courier New', monospace;
              font-size: 12px;
              margin: 0;
              padding: 10px;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>${content.replace(/\x1B\[[0-9;]*m/g, '')}</body>
      </html>
    `);
        printWindow.document.close();
        printWindow.print();
    }
}

export default new ThermalPrinterService();
