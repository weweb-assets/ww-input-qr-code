---
name: ww-input-qr-code
description: QR code scanner component that uses device camera to read QR codes and barcode formats in real-time
keywords: [qr code, scanner, camera, barcode, mobile, form, input]
---

#### ww-input-qr-code

***Purpose:***
A camera-based QR code scanner component that provides real-time scanning capabilities with flexible camera selection options. Integrates seamlessly with WeWeb's form system for data collection workflows.

***Features:***
- Real-time QR code and barcode detection
- Multiple camera selection modes with facingMode constraints
- Form integration with validation support
- Debounced scanning to prevent duplicate reads
- Responsive camera viewport

***Properties:***
- cameraSelection: environment|user|custom - Camera selection method (default: "environment")
- cameraId: string - ***CUSTOM ONLY*** Specific camera device ID when selection is "custom" (default: "")
- fieldName: string - ***FORM ONLY*** Name for form submission when used inside a form
- required: boolean - ***FORM ONLY*** Whether field is required (default: false)
- customValidation: boolean - ***FORM ONLY*** Enable custom validation (default: false)
- validation: Formula - ***FORM ONLY*** Custom validation formula (returns true if valid)

***Slots:*** none

***Context data (only accessible to this element and its children):***
- context.local.data?.['status'] - Current scanning status: "pending", "scanning", "success", "error"
- context.local.data?.['value'] - Last scanned QR code value
- context.local.data?.['hasCamera'] - Whether a camera is available and configured
- context.local.data?.['cameras'] - List of available camera device names

***Exposed Variables:***
- code: Last scanned QR code value (path: variables['current_element_uid-code'])
- cameras: List of available camera devices (path: variables['current_element_uid-cameras'])
- status: Current scanning status (path: variables['current_element_uid-status'])
- hasCamera: Whether camera is available and configured (path: variables['current_element_uid-hasCamera'])

***Events:***
- scan: Triggered when a QR code is successfully scanned. Payload: { code: string }

***Notes:***
- Uses standard WebRTC facingMode constraints for reliable camera access
- Environment facing (back camera) is default for optimal QR scanning experience
- Custom mode allows specific camera device ID selection for advanced use cases
- When used inside a form container, enables form submission and validation features
- Status remains "success" after successful scan (no auto-reset)

***Example:***
Basic QR scanner for inventory management:
<elements>
{"uid":0,"tag":"ww-input-qr-code","name":"Inventory Scanner","props":{"default":{"cameraSelection":"environment","fieldName":"productCode","required":true,"customValidation":false}}}
</elements>