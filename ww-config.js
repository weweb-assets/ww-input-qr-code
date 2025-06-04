export default {
    editor: {
        label: 'QR Code Reader',
        icon: 'eye',
        customSettingsPropertiesOrder: [
            'formInfobox',
            ['fieldName', 'customValidation', 'validation'],
            'cameraSelection',
            'cameraId',
            'required',
        ],
    },
    triggerEvents: [{ name: 'scan', label: 'On scan', event: { code: '' }, default: true }],
    properties: {
        cameraSelection: {
            label: 'Camera Selection',
            type: 'TextSelect',
            options: {
                options: [
                    { value: 'environment', label: 'Prefer environment facing' },
                    { value: 'user', label: 'Prefer user facing' },
                    { value: 'custom', label: 'Custom' },
                ],
            },
            defaultValue: 'environment',
            section: 'settings',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Choose camera selection method: environment facing, user facing, or custom',
            },
            /* wwEditor:end */
        },
        cameraId: {
            label: 'Camera ID',
            type: 'Text',
            defaultValue: '',
            section: 'settings',
            bindable: true,
            hidden: content => content.cameraSelection !== 'custom',
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Specific camera device ID to use',
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
            bindable: false,
            hidden: (content, sidePanelContent) => {
                return !sidePanelContent.form?.uid || !content.customValidation;
            },
        },
    },
};
