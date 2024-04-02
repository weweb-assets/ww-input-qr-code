<template>
    <div class="ww-input-qr-code" :id="elementId"></div>
</template>

<script>
import { Html5Qrcode } from 'html5-qrcode';

export default {
    props: {
        content: { type: Object, required: true },
        uid: { type: String, required: true },
        id: { type: String },
    },
    data() {
        return {
            cameraId: undefined,
            cameras: [],
        };
    },
    emits: ['trigger-event'],
    setup(props) {
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

        let lastCodeTimestamp = 0;
        let starting = false;

        return { codeValue, setCodeValue, camerasValue, setCamerasValue, lastCodeTimestamp, starting };
    },
    computed: {
        elementId() {
            return this.id || `ww-input-qr-code-${this.uid}`;
        },
    },
    mounted() {
        this.init();

        const resizeObserver = new ResizeObserver(entries => {
            clearTimeout(this.resizeTimeout);
            if (entries[0].contentRect.width && entries[0].contentRect.height) {
                this.resizeTimeout = setTimeout(async () => {
                    await this.init();
                }, 500);
            }
        });

        resizeObserver.observe(this.$el);
    },
    async unmounted() {
        await this.stopScan();
    },
    watch: {
        'content.cameraName': {
            immediate: true,
            async handler(newValue, oldValue) {
                if (oldValue !== newValue) {
                    let newCamera;
                    if (!this.content.cameraName || this.content.cameraName === '') {
                        newCamera = this.cameras[0];
                    } else {
                        newCamera = this.cameras.find(camera => camera.label === this.content.cameraName);
                    }
                    if (newCamera) {
                        this.cameraId = newCamera.id;
                        await this.init();
                    }
                }
            },
        },
    },
    methods: {
        async init() {
            if (this.starting) return;
            this.starting = true;

            if (this.html5QrCode) {
                await this.stopScan();
                await this.startScan();
            } else {
                this.html5QrCode = new Html5Qrcode(this.elementId);
                this.cameras = await Html5Qrcode.getCameras();
                if (this.cameras && this.cameras.length) {
                    const cameraNames = this.cameras.map(camera => camera.label);
                    this.setCamerasValue(cameraNames);
                    this.cameraId = this.cameraId || this.cameras[0].id;
                }

                await this.startScan();
            }
            this.starting = false;
        },
        async stopScan() {
            const state = this.html5QrCode.getState();
            if (state === 2) {
                await this.html5QrCode.stop();
            }
            await this.html5QrCode.clear();
        },
        async startScan() {
            if (!this.html5QrCode || !this.cameraId) return;

            const rect = this.$el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const aspectRatio = rect.width / (rect.height || (rect.width * 16) / 9);

            try {
                await this.html5QrCode.start(
                    this.cameraId,
                    {
                        aspectRatio: isNaN(aspectRatio) ? 9 / 16 : aspectRatio,
                    },
                    (decodedText, decodedResult) => {
                        const code = decodedText;
                        const format = decodedResult.result.format.formatName;

                        if (format === 'QR_CODE') {
                            const delay = Date.now() - this.lastCodeTimestamp;
                            if (delay < 1000 && code === this.codeValue) this.lastCodeTimestamp = Date.now();
                            else {
                                this.lastCodeTimestamp = Date.now();
                                this.setCodeValue(code);
                                this.$emit('trigger-event', {
                                    name: 'scan',
                                    event: { code: this.codeValue },
                                });
                            }
                        }
                    }
                );
            } catch (error) {
                console.error(error);
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
