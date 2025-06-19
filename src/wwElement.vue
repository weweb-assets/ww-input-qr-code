<template>
    <div class="ww-input-qr-code" :id="elementId"></div>
</template>

<script>
import { Html5Qrcode } from 'html5-qrcode';
import { ref, computed, inject } from 'vue';

export default {
    props: {
        content: { type: Object, required: true },
        uid: { type: String, required: true },
        id: { type: String },
        wwElementState: { type: Object, required: true },
        useForm: { type: Boolean, default: true },
    },
    emits: ['trigger-event', 'add-state', 'remove-state', 'update:content:effect', 'update:sidepanel-content'],
    setup(props, { emit }) {
        /* wwEditor:start */
        // Migration: Convert bindable validation to non-bindable
        const componentRawContent = inject('componentRawContent', null);
        if (componentRawContent?.validation?.__wwtype) {
            const rawFormula = componentRawContent.validation;
            emit('update:content:effect', {
                validation: {
                    type: rawFormula.__wwtype, // Preserve 'f' or 'js'
                    code: rawFormula.code,
                    ...(rawFormula.filter && { filter: rawFormula.filter }),
                    ...(rawFormula.sort && { sort: rawFormula.sort }),
                    ...(rawFormula.__wwmap && { __wwmap: rawFormula.__wwmap })
                }
            });
        }
        /* wwEditor:end */

        const { value: codeValue, setValue: setCodeValue } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'code',
            type: 'string',
            readonly: true,
            defaultValue: '',
        });

        const { value: camerasValue, setValue: setCamerasValue } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'cameras',
            type: 'array',
            readonly: true,
            defaultValue: [],
        });

        // Define reactive state variables first
        const scanningState = ref('pending'); // pending, scanning, success, error
        const cameras = ref([]);

        const { value: statusValue, setValue: setStatusValue } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'status',
            type: 'string',
            readonly: true,
            defaultValue: computed(() => scanningState.value),
        });

        const { value: hasCameraValue, setValue: setHasCameraValue } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'hasCamera',
            type: 'boolean',
            readonly: true,
            defaultValue: computed(() => {
                const selection = props.content.cameraSelection;
                if ((selection === 'custom' || !selection) && props.content.cameraId) {
                    const camera = cameras.value.find(camera => camera.id === props.content.cameraId);
                    return !!camera;
                }
                return selection === 'user' || selection === 'environment' || !selection;
            }),
        });

        // Form integration
        const useForm = inject('_wwForm:useForm', () => {});

        const fieldName = computed(() => props.content.fieldName);
        const validation = computed(() => props.content.validation);
        const customValidation = computed(() => props.content.customValidation);
        const required = computed(() => props.content.required);

        useForm(
            codeValue,
            { fieldName, validation, customValidation, required, initialValue: computed(() => '') },
            { elementState: props.wwElementState, emit, sidepanelFormPath: 'form', setValue: setCodeValue }
        );

        // Register local context for child elements
        const qrScannerData = ref({
            status: statusValue,
            value: codeValue,
            hasCamera: hasCameraValue,
            cameras: camerasValue
        });

        const qrScannerMethods = {};

        const qrScannerMarkdown = `### QR Scanner local context

#### Data available
- \`status\`: Current scanning status ("pending", "scanning", "success", "error")
- \`value\`: Last scanned QR code value
- \`hasCamera\`: Boolean indicating if camera is available and configured
- \`cameras\`: Array of available camera device names`;

        wwLib.wwElement.useRegisterElementLocalContext(
            'qrScanner', 
            qrScannerData.value, 
            qrScannerMethods, 
            qrScannerMarkdown
        );

        return {
            codeValue,
            setCodeValue,
            camerasValue,
            setCamerasValue,
            lastCodeTimestamp: ref(0),
            cameras,
            html5QrCode: ref(undefined),
            resizeTimeout: ref(undefined),
            scanningState,
        };
    },
    computed: {
        elementId() {
            return this.id || `ww-input-qr-code-${this.uid}`;
        },
        scanningStatus() {
            return this.scanningState;
        },
        cameraConfig() {
            const selection = this.content.cameraSelection;

            if ((selection === 'custom' || !selection) && this.content.cameraId) {
                // Use specific camera ID
                const camera = this.cameras.find(camera => camera.id === this.content.cameraId);
                if (camera) {
                    return { type: 'deviceId', value: camera.id };
                }
            }

            if (selection === 'user') {
                return { type: 'facingMode', value: 'user' };
            }

            // Fallback to environment facing
            return { type: 'facingMode', value: 'environment' };
        },
    },
    mounted() {
        this.init();

        const resizeObserver = new ResizeObserver(entries => {
            clearTimeout(this.resizeTimeout);
            if (entries[0].contentRect.width && entries[0].contentRect.height) {
                this.resizeTimeout = setTimeout(async () => {
                    await this.refresh();
                }, 500);
            }
        });
        resizeObserver.observe(this.$el);
    },
    async unmounted() {
        await this.stopScan();
    },
    watch: {
        async 'content.cameraSelection'(newValue, oldValue) {
            if (oldValue === newValue) return;
            await this.refresh();
        },
        async 'content.cameraId'(newValue, oldValue) {
            if (oldValue === newValue) return;
            await this.refresh();
        },
    },
    methods: {
        async init() {
            try {
                this.scanningState = 'pending';
                this.html5QrCode = new Html5Qrcode(this.elementId);
                this.cameras = await Html5Qrcode.getCameras();
                if (this.cameras) this.setCamerasValue(this.cameras.map(camera => camera.label));
                await this.startScan();
            } catch (error) {
                this.scanningState = 'error';
            }
        },
        async refresh() {
            if (!this.html5QrCode) return;
            await this.stopScan();
            await this.startScan();
        },
        async stopScan() {
            try {
                if (!this.html5QrCode) return;
                const state = this.html5QrCode.getState();
                if (state === 2) {
                    await this.html5QrCode.stop();
                }
                if (state !== 1) { // Only clear if not already cleared
                    await this.html5QrCode.clear();
                }
                this.scanningState = 'pending';
            } catch (error) {
                // Ignore "Cannot clear while scan is ongoing" errors during cleanup
                if (!error.message?.includes('Cannot clear while scan is ongoing')) {
                    this.scanningState = 'error';
                }
            }
        },
        async startScan() {
            if (!this.html5QrCode || !this.cameraConfig?.value) return;

            const rect = this.$el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const aspectRatio = rect.width / (rect.height || (rect.width * 16) / 9);

            // Prepare camera constraints based on config type
            let cameraIdOrConstraints;
            const config = { aspectRatio: isNaN(aspectRatio) ? 9 / 16 : aspectRatio };

            if (this.cameraConfig.type === 'facingMode') {
                // Use facingMode for environment/user facing
                cameraIdOrConstraints = { facingMode: this.cameraConfig.value };
            } else {
                // Use specific device ID
                cameraIdOrConstraints = this.cameraConfig.value;
            }

            try {
                this.scanningState = 'scanning';
                
                // Capture 'this' reference for use in callbacks
                const self = this;
                
                await this.html5QrCode.start(
                    cameraIdOrConstraints,
                    config,
                    (decodedText, decodedResult) => {
                        const code = decodedText;
                        const format = decodedResult.result.format.formatName;

                        if (format === 'QR_CODE') {
                            const delay = Date.now() - self.lastCodeTimestamp;
                            
                            if (delay < 1000 && code === self.codeValue) {
                                self.lastCodeTimestamp = Date.now();
                            } else {
                                self.lastCodeTimestamp = Date.now();
                                self.setCodeValue(code);
                                self.scanningState = 'success';
                                self.$emit('trigger-event', { name: 'scan', event: { code: code } });
                            }
                        }
                    },
                    errorMessage => {
                        // QR code not found or scanning error - this is normal during scanning
                        // Only set error state for actual errors, not "No QR code found" messages
                        if (!errorMessage.includes('QR code found')) {
                            this.scanningState = 'error';
                        }
                    }
                );
            } catch (error) {
                this.scanningState = 'error';
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.ww-input-qr-code {
    border-radius: inherit;
    overflow: hidden;

    &:deep(video) {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100% !important;
        height: 100% !important;
        transform: translate(-50%, -50%);
    }
}
</style>
