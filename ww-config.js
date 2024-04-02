export default {
    editor: {
        label: 'QR Code Reader',
        icon: 'eye',
    },
    triggerEvents: [{ name: 'scan', label: 'On scan', event: { code: '' }, default: true }],
    properties: {
        cameraName: {
            label: 'Camera Name',
            type: 'Info',
            options: { text: 'Use default camera' },
            defaultValue: '',
            section: 'settings',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A string that is the name of the camera',
            },
            /* wwEditor:end */
        },
    },
};
