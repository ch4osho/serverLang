Vue.component('tool-map-style', {
    template: `
        <div class="map-style tool-box">
            <tool-btn
                :active="isShow"
                @click="show"
            >地图样式</tool-btn>
            <transition :name="transitionName">
                <div v-show="isShow" class="tool-popup tool-map-style-popup" ref="popup" >
                    <div class="style-container" ref="styleContainer">
                        <div
                            :class="['style-box', {'selected': selectedStyleId===style.id}]"
                            v-for="style in styleListRoot"
                            key="style.id"
                            @click="changeMapStyle(style)"
                        >
                            <div class="style" :style="'background:url('+ style.imgSrc +') center center / 165px 100px no-repeat;'"></div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    `,
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler],
    props: {

    },
    computed: {
        selectedData() {
            if (Ktu.store.state.data.selectedData) {
                return Ktu.store.state.data.selectedData;
            }
            return {};
        },
        oldData() {
            if (Ktu.store.state.data.selectedData) {
                return Ktu.store.state.data.selectedData.msg;
            }
            return {};
        },

        mapEditor() {
            return this.$store.state.base.mapEditor;
        },
        styleList() {
            return this.$store.state.base.mapStyleList;
        },
        resRoot() {
            return Ktu.initialData.resRoot;
        },
        styleListRoot() {
            return this.styleList.map(style => ({
                id: style.id,
                imgSrc: `${this.resRoot}${style.imgSrc}`,
            }));
        },
        selectedStyleId: {
            get() {
                return this.oldData.selectedStyleId;
            },
            set(value) {
                this.oldData.selectedStyleId = value;
            },
        },
    },
    data() {
        return {
            newMapSrc: '',
            mapWidth: 597,
            mapHeight: 337,
            mapTimer: null,
            mapStyle: '',
        };
    },
    methods: {
        changeMapStyle(style) {
            this.selectedStyleId = style.id;

            const styleName = style.imgSrc.match(/\/map\/(\S*)\.png$/)[1];

            this.mapStyle = `amap://styles/${styleName}`;

            if (!document.querySelector('#hiddenMapContainer')) {
                const container = document.createElement('div');
                container.setAttribute('id', 'hiddenMapContainer');
                container.style.visibility = 'hidden';
                container.style.width = `${this.mapWidth}px`;
                container.style.height = `${this.mapHeight}px`;
                container.classList.add('f_DNSTraffic');
                document.body.appendChild(container);
            }

            const map = new AMap.Map('hiddenMapContainer', {
                zoom: this.oldData.mapObj.zoom,
                center: [this.oldData.mapObj.longitude, this.oldData.mapObj.latitude],
                // 使用3D视图
                viewMode: '3D',
                keyboardEnable: false,
                resizeEnable: true,
                mapStyle: this.mapStyle,
            });
            new AMap.Marker({
                position: [this.oldData.mapObj.longitude, this.oldData.mapObj.latitude],
                map,
            });

            map.on('complete', () => {
                if (this.mapTimer) {
                    clearTimeout(this.mapTimer);
                    this.mapTimer = null;
                }
                this.mapTimer = setTimeout(() => {
                    const mapCanvas = document.querySelector('#hiddenMapContainer .amap-layer');
                    const newMapSrc = mapCanvas.toDataURL();

                    const image = new Image();
                    image.setAttribute('crossOrigin', 'Anonymous');
                    image.src = newMapSrc;

                    image.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        canvas.width = this.mapWidth;
                        canvas.height = this.mapHeight;

                        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

                        const imgIcon = new Image();
                        imgIcon.setAttribute('crossOrigin', 'Anonymous');
                        imgIcon.src = `${Ktu.initialData.resRoot}/image/editor/map/mark_bs.png`;

                        imgIcon.onload = () => {
                            ctx.drawImage(imgIcon, canvas.width / 2 - imgIcon.width / 2, canvas.height / 2 - imgIcon.height, imgIcon.width, imgIcon.height);

                            this.newMapSrc = canvas.toDataURL();
                            this.updataMapState();
                        };
                    };
                }, 500);
            });

            Ktu.log('map', 'mapStyle');
        },
        updataMapState() {
            const newImg = new Image();
            newImg.setAttribute('crossorigin', Ktu.utils.getCrossOriginByBrowser());
            newImg.src = this.newMapSrc;

            newImg.onload = () => {
                this.selectedData.saveState();
                this.selectedData._originalElement = newImg;
                this.selectedData._element = newImg;

                this.selectedData.image.fileId = '';
                this.selectedData.src = this.newMapSrc;
                this.selectedData.base64 = this.newMapSrc;
                this.selectedData.image.src = this.newMapSrc;
                this.selectedData.image.smallSrc = this.newMapSrc;
                this.selectedData.image.originalSrc = this.newMapSrc;
                const msg = this.oldData;
                msg.mapStyle = this.mapStyle;
                msg.selectedStyleId = this.selectedStyleId;
                this.selectedData.msg = msg;
                this.selectedData.dirty = true;
                this.selectedData.modifiedState();
            };
        },
    },
});

