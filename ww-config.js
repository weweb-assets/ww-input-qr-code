export default {
    editor: {
        label: 'QR Code Reader',
        icon: 'eye',
        customSettingsPropertiesOrder: [
            'formInfobox',
            ['fieldName', 'customValidation', 'validation'],
            'cameraName',
            'cameraFace',
            'required',
        ],
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
        cameraFace: {
            label: 'Camera Face',
            type: 'TextSelect',
            options: {
                options: [
                    { value: 'auto', label: 'Auto' },
                    { value: 'front', label: 'Front Camera' },
                    { value: 'back', label: 'Back Camera' },
                ],
            },
            defaultValue: 'auto',
            section: 'settings',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Choose between front or back camera',
            },
            /* wwEditor:end */
        },
        /* wwEditor:start */
        form: {
            editorOnly: true,
            hidden: true,
            defaultValue: false,
        },
        formInfobox: {
            type: 'InfoBox',
            section: 'settings',
            options: (_, sidePanelContent) => ({
                variant: sidePanelContent.form?.name ? 'success' : 'warning',
                icon: 'pencil',
                title: sidePanelContent.form?.name || 'Unnamed form',
                content: !sidePanelContent.form?.name && 'Give your form a meaningful name.',
            }),
            hidden: (_, sidePanelContent) => !sidePanelContent.form?.uid,
        },
        /* wwEditor:end */
        fieldName: {
            label: 'Field name',
            section: 'settings',
            type: 'Text',
            defaultValue: '',
            bindable: true,
            hidden: (_, sidePanelContent) => {
                return !sidePanelContent.form?.uid;
            },
        },
        required: {
            label: { en: 'Required', fr: 'Requis' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            hidden: (_, sidePanelContent) => {
                return !sidePanelContent.form?.uid;
            },
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'A boolean that defines if the input is required: `true | false`',
            },
            /* wwEditor:end */
        },
        customValidation: {
            label: 'Custom validation',
            section: 'settings',
            type: 'OnOff',
            defaultValue: false,
            bindable: true,
            hidden: (_, sidePanelContent) => {
                return !sidePanelContent.form?.uid;
            },
        },
        validation: {
            label: 'Validation',
            section: 'settings',
            type: 'Formula',
            defaultValue: '',
            bindable: true,
            hidden: (content, sidePanelContent) => {
                return !sidePanelContent.form?.uid || !content.customValidation;
            },
        },
    },
};
