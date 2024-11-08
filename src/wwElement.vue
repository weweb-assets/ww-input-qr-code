<template>
    <div class="ww-input-qr-code" :id="elementId"></div>
</template>

<script>
import { Html5Qrcode } from 'html5-qrcode';
import { ref } from 'vue';

export default {
    props: {
        content: { type: Object, required: true },
        uid: { type: String, required: true },
        id: { type: String },
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

        return {
            codeValue,
            setCodeValue,
            camerasValue,
            setCamerasValue,
            lastCodeTimestamp: ref(0),
            cameras: ref([]),
            html5QrCode: ref(undefined),
            resizeTimeout: ref(undefined),
        };
    },
    computed: {
        elementId() {
            return this.id || `ww-input-qr-code-${this.uid}`;
        },
        cameraId() {
            return this.content.cameraName
                ? this.cameras.find(camera => camera.label === this.content.cameraName)?.id
                : this.cameras[0]?.id;
        },
    },
    mounted() {
        this.init();

        const resizeObserver = new ResizeObserver(entries => {
            clearTimeout(this.resizeTimeout);
            if (entries[0].contentRect.width && entries[0].contentRect.height) {
                this.resizeTimeout = setTimeout(async () => {
                    await this.refresh();
                }, 5000);
            }
        });
        resizeObserver.observe(this.$el);
    },
    async unmounted() {
        await this.stopScan();
    },
    watch: {
        async 'content.cameraName'(newValue, oldValue) {
            if (oldValue === newValue) return;
            await this.refresh();
        },
    },
    methods: {
        async init() {
            console.log('init');
            this.html5QrCode = new Html5Qrcode(this.elementId);
            console.log('html5QrCode', this.html5QrCode);
            this.cameras = await Html5Qrcode.getCameras();
            console.log('cameras', this.cameras);
            if (this.cameras) this.setCamerasValue(this.cameras.map(camera => camera.label));
            console.log('camerasValue', this.camerasValue);
            await this.startScan();
            console.log('startScan');
        },
        async refresh() {
            console.log('refresh');
            if (!this.html5QrCode) return;
            await this.stopScan();
            console.log('stopScan');
            await this.startScan();
            console.log('startScan');
        },
        async stopScan() {
            const state = this.html5QrCode.getState();
            console.log('stopScan', state);
            if (state === 2) await this.html5QrCode.stop();
            console.log('stop');
            await this.html5QrCode.clear();
        },
        async startScan() {
            console.log('startScan');
            if (!this.html5QrCode || !this.cameraId) return;

            const rect = this.$el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const aspectRatio = rect.width / (rect.height || (rect.width * 16) / 9);
            console.log('aspectRatio', this);
            try {
                await this.html5QrCode.start(
                    this.cameraId,
                    { aspectRatio: isNaN(aspectRatio) ? 9 / 16 : aspectRatio },
                    (decodedText, decodedResult) => {
                        const code = decodedText;
                        const format = decodedResult.result.format.formatName;

                        if (format === 'QR_CODE') {
                            const delay = Date.now() - this.lastCodeTimestamp;
                            if (delay < 1000 && code === this.codeValue) {
                                this.lastCodeTimestamp = Date.now();
                            } else {
                                this.lastCodeTimestamp = Date.now();
                                this.setCodeValue(code);
                                this.$emit('trigger-event', { name: 'scan', event: { code: this.codeValue } });
                            }
                        }
                    }
                );
            } catch (error) {
                console.log('error', error);
                wwLib.wwLog.error(error);
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
