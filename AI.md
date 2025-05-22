---
name: ww-input-qr-code
description: A QR code scanner component that uses device camera to read QR codes and barcode formats, with camera selection capabilities and real-time scanning functionality.
keywords:
  - qr code scanner
  - barcode reader
  - camera input
  - mobile scanner
  - device camera
  - code detection
  - real-time scanning
  - camera selection
---

#### ww-input-qr-code

Renders a QR code scanner that uses the device camera to detect and read QR codes and other barcode formats in real-time.

Properties:
- cameraSelection: auto|environment|user|custom - Camera selection method. Default: "auto"
- cameraId: string - Specific camera device ID (only visible when cameraSelection is "custom"). Default: ""
- fieldName: string - Form field name for form integration. Default: ""
- required: boolean - Whether field is required in forms. Default: false
- customValidation: boolean - Enable custom validation rules. Default: false
- validation: Formula - Custom validation formula. Requires customValidation to be true!

Slots: none

Events:
- scan: {code: string} - Triggered when a QR code is successfully scanned

Variables:
- code: string - Last scanned QR code value
- cameras: array - List of available camera devices

Features:
- Real-time QR code and barcode scanning
- Multiple camera selection modes: auto, environment facing, user facing, or custom device ID
- Uses facingMode constraints for better camera selection
- Responsive camera viewport
- Form integration support
- Debounced scanning to prevent duplicate reads

Example:
<elements>
{"uid":0,"tag":"ww-input-qr-code","name":"QR Scanner","props":{"default":{"cameraSelection":"environment","fieldName":"scannedCode","required":true,"customValidation":false}}}
</elements>