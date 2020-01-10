Vue.component('tool-map', {
    template: `
        <div class="tool-map">
            <tool-btn class="map-tip tool-box" @click="modifyMap">编辑地图</tool-btn>
            <div class="tool-split tool-box"></div>

            <tool-map-style></tool-map-style>

            <div class="tool-split tool-box"></div>

            <tool-btn class="tool-box" icon="crop" @click="crop" tips="裁切" v-if="!isObjectInGroup"></tool-btn>

            <tool-radius eventType="map"></tool-radius>

            <tool-shadow eventType="map"></tool-shadow>

            <tool-opacity eventType="map"></tool-opacity>

            <tool-rotate eventType="map"></tool-rotate>

            <div v-if="!isObjectInGroup" class="tool-split tool-box"></div>

            <tool-change-pic eventType="map"></tool-change-pic>

            <div class="tool-split tool-box"></div>

            <tool-size></tool-size>

            <slot></slot>
        </div>
    `,
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler],
    data() {
        return {

        };
    },
    computed: {
        selectedData() {
            if (Ktu.store.state.data.selectedData) {
                return Ktu.store.state.data.selectedData;
            }
            return {};
        },
    },
    watch: {

    },
    mounted() {

    },
    methods: {
        modifyMap() {
            if (this.selectedData && this.selectedData.type === 'map') {
                this.selectedData.modifyMap();
                Ktu.log('map', 'modifyMap');
            }
        },
        crop() {
            this.selectedData.enterClipMode();
            Ktu.log('map', 'crop');
        },
    },
});
