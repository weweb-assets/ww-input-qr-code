export default {
    editor: {
        label: {
            en: 'QR Code Reader',
        },
        icon: 'eye',
    },
    triggerEvents: [{ name: 'scan', label: { en: 'On scan' }, event: { code: '' }, default: true }],
    properties: {
        cameraName: {
            label: {
                en: 'Camera Name',
            },
            type: 'Info',
            options: {
                text: { en: 'Use default camera' },
            },
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
