# Thermal Receipt Printing - Implementation Guide

## Overview
Full thermal receipt printing system with ESC/POS formatting for 80mm thermal printers.

## Components Created

### 1. Thermal Printer Service
**File**: `src/services/thermalPrinterService.js`

**Features**:
- ✅ ESC/POS command formatting
- ✅ Receipt layout with header, body, footer
- ✅ Support for 80mm and 58mm paper
- ✅ QR code placeholder
- ✅ Currency and date formatting
- ✅ Multiple print methods (USB, Network, Browser)

**ESC/POS Commands Implemented**:
- Text alignment (left, center, right)
- Font styling (bold, underline, double width/height)
- Line separators
- Paper cutting
- Cash drawer opening (optional)

### 2. Thermal Receipt Preview
**File**: `src/modules/fees/receipt-book/components/ThermalReceiptPreview.jsx`

- Visual preview component
- Shows exactly how receipt will print
- Useful for verification before sending to printer

### 3. Integration
**File**: `src/modules/fees/receipt-book/ReceiptBookDashboard.jsx`

- Added school information configuration
- Printer settings (type, IP, port)
- Updated print handler to use thermal service

## Print Methods

### Method 1: Browser Print (Current Default)
```javascript
printerSettings.type = 'browser'
```
- Opens browser print dialog
- Works with any printer (thermal or regular)
- No special drivers needed
- ✅ Best for testing and compatibility

### Method 2: Network Thermal Printer
```javascript
printerSettings.type = 'network'
printerSettings.printerIp = '192.168.1.100'
printerSettings.printerPort = 9100
```
- Sends ESC/POS commands directly to network printer
- Requires backend endpoint: `/api/print/thermal`
- ⚠️ Needs backend implementation

### Method 3: USB Thermal Printer
```javascript
printerSettings.type = 'usb'
```
- Direct USB connection
- Requires Electron or native app
- Not available in browser
- ⚠️ Use Electron wrapper or local print server

## Setup Instructions

### 1. Install Dependencies
```bash
cd fahari-afrontend
npm install escpos escpos-usb qrcode
```

### 2. Configure School Information
Edit `ReceiptBookDashboard.jsx`:
```javascript
const [schoolInfo] = useState({
    name: 'YOUR SCHOOL NAME',
    address: 'P.O. Box XXX, City',
    phone: '07XXXXXXXX',
    email: 'info@yourschool.ac.ke',
    motto: 'Your School Motto'
});
```

### 3. Configure Printer
```javascript
const [printerSettings] = useState({
    type: 'browser', // or 'network' or 'usb'
    printerIp: null, // For network: '192.168.1.100'
    printerPort: 9100
});
```

## Network Printer Backend (Optional)

If using network thermal printers, add this backend endpoint:

**Django**: `fees/print_views.py`
```python
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import socket
import base64

@csrf_exempt
def thermal_print(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        printer_ip = data.get('printerIp')
        printer_port = data.get('printerPort', 9100)
        content = base64.b64decode(data.get('content'))
        
        try:
            # Send to network printer
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect((printer_ip, printer_port))
            sock.sendall(content)
            sock.close()
            
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
```

## Supported Thermal Printers

The ESC/POS standard is supported by:
- ✅ Epson TM series (TM-T20, TM-T82, TM-T88)
- ✅ Star Micronics (TSP100, TSP650)
- ✅ Xprinter (XP-58, XP-80)
- ✅ Rongta (RP80, RP326)
- ✅ Bixolon (SRP-350, SRP-275)
- ✅ Most Chinese thermal printers

## Testing

1. **Browser Print Test**:
   - Set `printerSettings.type = 'browser'`
   - Click print on any receipt
   - Verify preview shows correctly

2. **Network Printer Test**:
   - Configure printer IP
   - Ensure printer is on network
   - Test connection: `ping <printer-ip>`
   - Implement backend endpoint
   - Try printing

3. **USB Printer Test**:
   - Requires Electron or local server
   - Install `escpos-usb` dependencies
   - Run as desktop app

## Customization

### Adjust Paper Width
```javascript
// In thermalPrinterService.js
this.paperWidth = 32; // For 58mm paper
this.paperWidth = 48; // For 80mm paper
```

### Add Logo
```javascript
// In generateReceiptContent()
// After INIT command
content += this.commands.ALIGN_CENTER;
content += '[LOGO PLACEHOLDER]'; // Replace with actual logo
content += this.commands.NEWLINE;
```

### Add QR Code
Install: `npm install qrcode`
```javascript
import QRCode from 'qrcode';

// Generate QR code
const qrCodeData = await QRCode.toDataURL(receipt.receiptNumber);
// Convert to ESC/POS image commands
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No output from printer | Check power, connection, paper |
| Garbled text | Verify encoding (UTF-8 vs  CP437) |
| Not cutting paper | Some printers need different cut command |
| Slow printing | Use network connection, not USB over RDP |
| Alignment issues | Adjust `paperWidth` constant |

## Next Steps

1. ✅ Thermal service created
2. ✅ Preview component ready
3. ✅ Dashboard integrated
4. ⏳ Backend network print endpoint (optional)
5. ⏳ Fetch school info from settings API
6. ⏳ QR code generation
7. ⏳ Logo support

---

**Status**: ✅ Ready for Testing  
**Default Mode**: Browser Print (universal compatibility)  
**Recommended for Production**: Network or USB thermal printer
