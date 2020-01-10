Vue.component('ele-map', {
    template: `
        <div class="ele-map">
            <div class="ele-map-mask" @click="closeEditor"></div>

            <div class="ele-map-editor">
                <div class="ele-map-head">
                    <span class="title">{{modalTitle}}</span>
                    <div class="btn-close" @click="closeEditor">
                        <svg class="svg-icon">
                            <use xlink:href="#svg-close-icon"></use>
                        </svg>
                    </div>
                </div>

                <div class="ele-map-content">
                    <div class="address">
                        <span class="text">详细地址：</span>
                        <input
                            id="addressInput"
                            name="addressInput"
                            class="address-input"
                            ref="addressInput"
                            type="text"
                            v-model="addressText"
                            autocomplete="off"
                            @input="handleAddressInput"
                            @focus="addressInputFocus"
                            @blur="addressInputBlur"
                            @mouseup.stop
                        />
                    </div>

                    <div class="map">
                        <div id="mapContainer" class="container"></div>
                        <div class="type-wrapper" @scroll="typeWrapperScroll" ref="typeWrapper">
                            <div :class="['type-box', {'selected': style.id === selectedStyleId}]" v-for="(style, index) in styleListRoot" :key="style.id">
                                <div class="type" :style="'background:url('+ style.imgSrc +') center center / 165px 100px no-repeat;'" @click="chooseMapStyle(style, index)"></div>
                            </div>
                        </div>
                        <div class="type-mask" v-show="showTypeMask"></div>
                    </div>
                </div>

                <div class="ele-map-foot">
                    <div class="btn applyBtn" @click="addToCanvas">应用到画板</div>
                    <div class="btn cancelBtn" @click="closeEditor">取消</div>
                </div>
            </div>
        </div>
    `,
    props: {

    },
    data() {
        return {
            addressText: '',
            map: null,
            mapObj: {},
            geocoder: null,
            addressIndex: -1,
            sugResult: null,
            showSugResult: false,
            sugResultTimer: null,
            mapStyle: '',
            myKey: '202f02756a65a25cf819da1dcaa5c6fa',
            // isFinishedDrawMap: false,
            selectedStyleId: 0,
            drawMapTimer: null,
            isInAutoItem: false,
            isInAutoItemSpan: false,
            disableBtn: true,
            showTypeMask: true,
            added: false,
            wheelTimer: null,
        };
    },
    computed: {
        // 是否显示地图编辑页
        mapEditor: {
            get() {
                return this.$store.state.base.mapEditor;
            },
            set(value) {
                this.$store.state.base.mapEditor = value;
            },
        },
        resRoot() {
            return Ktu.initialData.resRoot;
        },
        modalTitle() {
            return this.mapEditor.type === 'update' ? '编辑地图' : '添加地图';
        },
        styleListRoot() {
            return this.styleList.map(style => ({
                id: style.id,
                imgSrc: `${this.resRoot}${style.imgSrc}`,
            }));
        },
        selectedData() {
            if (Ktu.store.state.data.selectedData) {
                return Ktu.store.state.data.selectedData;
            }
            return {};
        },
        oldData() {
            if (Ktu.store.state.data.selectedData && Ktu.store.state.data.selectedData.msg) {
                return JSON.parse(JSON.stringify(Ktu.store.state.data.selectedData.msg));
            }
            return {};
        },
        styleList() {
            return this.$store.state.base.mapStyleList;
        },
        docWidth() {
            return Ktu.edit.documentSize.width;
        },
        docHeight() {
            return Ktu.edit.documentSize.height;
        },
        mapWidth() {
            if (this.docWidth > 3000 || this.docHeight > 6000) {
                return 2500;
            }
            return 595.73;
        },
        mapHeight() {
            if (this.docWidth > 3000 || this.docHeight > 6000) {
                return 1405;
            }
            return 335;
        },
        isOpenUtilModal: {
            get() {
                return this.$store.state.base.isOpenUtilModal;
            },
            set(value) {
                this.$store.state.base.isOpenUtilModal = value;
            },
        },
    },
    mounted() {
        this.isOpenUtilModal = true;
        this.initData();
        this.genMap();
        this.handleMapClickOn();
        this.handleMapMoveEnd();
        this.handleMapScroll();
        if (this.mapEditor.type === 'update') {
            this.genMarker(this.mapObj.longitude, this.mapObj.latitude);
        }
    },
    destroyed() {
        this.isOpenUtilModal = false;
        if (this.sugResult) {
            document.body.removeChild(this.sugResult);
            clearInterval(this.sugResultTimer);
            this.sugResultTimer = null;
        }
    },
    methods: {
        // 关闭地图编辑器
        closeEditor() {
            this.mapObj = this.oldData.mapObj;
            this.mapEditor.show = false;
        },

        initData() {
            if (this.mapEditor.type === 'update') {
                this.mapSrc = this.selectedData.image.src;
                this.addressText = this.oldData.addressText;
                this.mapObj = this.oldData.mapObj;
                this.selectedStyleId = this.oldData.selectedStyleId;
                this.mapStyle = this.oldData.mapStyle;
                this.disableBtn = false;
                // this.isFinishedDrawMap = true;
            } else {
                this.mapObj.longitude = 116.397428;
                this.mapObj.latitude = 39.90923;
                this.mapObj.zoom = 13;
            }
        },

        // 生成地图
        genMap() {
            // 实例化地图
            this.map = new AMap.Map('mapContainer', {
                // 级别
                zoom: this.mapObj.zoom,
                // 中心点坐标
                center: [this.mapObj.longitude, this.mapObj.latitude],
                keyboardEnable: false,
                resizeEnable: true,
                viewMode: '3D',
                rotateEnable: false,
                pitchEnable: false,
                doubleClickZoom: false,
                mapStyle: this.mapStyle,
            });

            // 地理编码
            AMap.plugin('AMap.Geocoder', () => {
                this.geocoder = new AMap.Geocoder();
            });

            // 搜索提示
            AMap.plugin('AMap.Autocomplete', () => {
                const autoOptions = {
                    city: '全国',
                    input: 'addressInput',
                };
                const autocomplete = new AMap.Autocomplete(autoOptions);

                // 输入提示框添加f_DNSTraffic类
                this.sugResult = document.querySelector('.amap-sug-result');
                this.sugResult && this.sugResult.classList.add('f_DNSTraffic');

                AMap.event.addListener(autocomplete, 'select', e => {
                    // TODO 针对选中的poi实现自己的功能
                    if (!e.poi.location) {
                        this.geocoder.getLocation(e.poi.name, (status, result) => {
                            if (status === 'complete' && result.info === 'OK') {
                                // result中对应详细地理坐标信息
                                this.genMarker(result.geocodes[0].location.lng, result.geocodes[0].location.lat);

                                this.mapObj.longitude = result.geocodes[0].location.lng;
                                this.mapObj.latitude = result.geocodes[0].location.lat;
                            }
                        });
                    } else {
                        this.genMarker(e.poi.location.lng, e.poi.location.lat);

                        this.mapObj.longitude = e.poi.location.lng;
                        this.mapObj.latitude = e.poi.location.lat;
                    }
                    this.map.setZoom(15);
                    this.mapObj.zoom = 15;
                    this.addressText = e.poi.name;
                    this.disableBtn = false;
                });
            });

            // 方向键选择地址时修改颜色
            this.$refs.addressInput.addEventListener('keyup', e => {
                const autoItem = document.querySelectorAll('.auto-item');
                if (autoItem.length === 0) return;
                switch (e.keyCode) {
                    case 38:
                        this.addressIndex--;
                        if (this.addressIndex < 0) this.addressIndex = autoItem.length - 1;
                        autoItem.forEach(item => {
                            item.style = '';
                            item.querySelector('.auto-item-span').style = '';
                        });
                        autoItem[this.addressIndex].style.background = '#FEEFE4';
                        autoItem[this.addressIndex].style.color = '#ff7733';
                        autoItem[this.addressIndex].querySelector('.auto-item-span').style.color = 'rgba(255, 119, 51, 0.5)';
                        break;
                    case 40:
                        this.addressIndex++;
                        if (this.addressIndex > autoItem.length - 1) this.addressIndex = 0;
                        autoItem.forEach(item => {
                            item.style = '';
                            item.querySelector('.auto-item-span').style = '';
                        });
                        autoItem[this.addressIndex].style.background = '#FEEFE4';
                        autoItem[this.addressIndex].style.color = '#ff7733';
                        autoItem[this.addressIndex].querySelector('.auto-item-span').style.color = 'rgba(255, 119, 51, 0.5)';
                        break;
                    default:
                        break;
                }
            });

            // 监听输入提示框显示隐藏，隐藏时重置addressIndex
            this.sugResultTimer = setInterval(() => {
                if (this.sugResult && (this.sugResult.style.display === 'none' || this.sugResult.style.visibility === 'hidden')) {
                    this.addressIndex = -1;
                }
            }, 100);


            console.log('这是map地图',this.map)
        },

        genMarker(lng, lat) {
            this.map.setCenter([lng, lat]);
            new AMap.Marker({
                position: [lng, lat],
                map: this.map,
            });
        },

        chooseMapStyle(style, index) {
            const styleName = style.imgSrc.match(/\/map\/(\S*)\.png$/)[1];

            this.mapStyle = `amap://styles/${styleName}`;
            this.map.setMapStyle(this.mapStyle);

            if (this.mapEditor.type === 'update') {
                this.disableBtn = false;
            }

            Ktu.log('changeMapStyle', index + 1);

            this.selectedStyleId = style.id;
        },
        addToCanvas() {
            if (this.disableBtn) {
                this.$Notice.warning('请输入有效地址');
                return;
            }

            if (this.added) {
                return;
            }

            this.added = true;

            this.drawMap().then(() => {
                if (this.mapEditor.type === 'update') {
                    this.updateMap();
                } else {
                    this.createMap();
                }
                Ktu.log('addMapSuccess');

                this.closeEditor();
            });
        },

        updateMap() {
            if (!this.selectedData.type) return;

            this.selectedData.saveState();
            this.selectedData.base64 = this.mapSrc;
            this.selectedData.src = this.mapSrc;
            this.selectedData.image.fileId = '';
            this.selectedData.image.src = this.mapSrc;
            this.selectedData.image.originalSrc = this.mapSrc;
            this.selectedData.image.smallSrc = this.mapSrc;
            const msg = this.recordMsg();
            this.selectedData.msg = msg;
            this.selectedData.dirty = true;
            this.selectedData.modifiedState();
        },

        createMap() {
            const msg = this.recordMsg();

            const obj = {
                type: 'map',
                msg,
                elementName: '地图',
                width: this.mapWidth,
                height: this.mapHeight,
                radius: {
                    lb: true,
                    lt: true,
                    rb: true,
                    rt: true,
                    size: 0,
                },
                src: this.mapSrc,
            };
            Ktu.element.addModule('map', obj);
        },

        handleMapClickOn() {
            this.map.on('click', e => {
                this.map.clearMap();
                new AMap.Marker({
                    // marker所在的位置
                    position: [e.lnglat.lng, e.lnglat.lat],
                    // 创建时直接赋予map属性
                    map: this.map,
                });

                this.mapObj.longitude = e.lnglat.lng;
                this.mapObj.latitude = e.lnglat.lat;
                this.mapObj.zoom = this.disableBtn ? 15 : this.mapObj.zoom;

                this.map.setCenter([e.lnglat.lng, e.lnglat.lat]);
                this.map.setZoom(this.mapObj.zoom);

                this.geocoder.getAddress([e.lnglat.lng, e.lnglat.lat], (status, result) => {
                    if (status === 'complete' && result.info === 'OK') {
                        // 返回地址描述
                        const address = result.regeocode.formattedAddress;
                        this.addressText = address;
                        this.disableBtn = false;
                    } else {
                        this.addressText = '';
                    }
                });
            });
        },

        handleMapMoveEnd() {
            this.map.on('dragend', e => {
                this.map.clearMap();

                const { lng } = this.map.getCenter();
                const { lat } = this.map.getCenter();
                this.map.setCenter([lng, lat]);
                this.mapObj.longitude = lng;
                this.mapObj.latitude = lat;

                new AMap.Marker({
                    // marker所在的位置
                    position: [lng, lat],
                    // 创建时直接赋予map属性
                    map: this.map,
                });

                this.geocoder.getAddress([lng, lat], (status, result) => {
                    if (status === 'complete' && result.info === 'OK') {
                        // 返回地址描述
                        const address = result.regeocode.formattedAddress;
                        this.addressText = address;
                        this.disableBtn = false;
                    } else {
                        this.addressText = '';
                    }
                });
            });
        },

        handleMapScroll() {
            this.map.on('mousewheel', e => {
                const { lng } = e.lnglat;
                const { lat } = e.lnglat;

                if (this.wheelTimer) {
                    clearTimeout(this.wheelTimer);
                    this.wheelTimer = null;
                }

                this.wheelTimer = setTimeout(() => {
                    this.map.clearMap();
                    this.map.setCenter([lng, lat]);

                    this.mapObj.longitude = lng;
                    this.mapObj.latitude = lat;
                    this.mapObj.zoom = this.map.getZoom();

                    new AMap.Marker({
                        // marker所在的位置
                        position: [lng, lat],
                        // 创建时直接赋予map属性
                        map: this.map,
                    });

                    this.geocoder.getAddress([lng, lat], (status, result) => {
                        if (status === 'complete' && result.info === 'OK') {
                            // 返回地址描述
                            const address = result.regeocode.formattedAddress;
                            this.addressText = address;
                            this.disableBtn = false;
                        } else {
                            this.addressText = '';
                        }
                    });
                }, 400);
            });
        },

        recordMsg() {
            const msg = {};

            msg.addressText = this.addressText;
            msg.mapObj = this.mapObj;
            msg.selectedStyleId = this.selectedStyleId;
            msg.mapStyle = this.mapStyle;

            return msg;
        },

        // 把坐标的marker画到地图上
        drawMap() {
            return new Promise((resolve, reject) => {
                const container = document.createElement('div');
                container.setAttribute('id', 'hiddenMapContainer');
                container.style.visibility = 'hidden';
                container.style.width = `${this.mapWidth}px`;
                container.style.height = `${this.mapHeight}px`;
                container.classList.add('f_DNSTraffic');
                document.body.appendChild(container);

                if (this.drawMapTimer) {
                    clearTimeout(this.drawMapTimer);
                    this.drawMapTimer = null;
                }

                this.drawMapTimer = setTimeout(() => {
                    const image = new Image();
                    image.setAttribute('crossOrigin', 'Anonymous');
                    image.src = document.querySelector('#mapContainer canvas').toDataURL();

                    image.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        canvas.width = image.width;
                        canvas.height = image.height;

                        ctx.drawImage(image, 0, 0);

                        const imgIcon = new Image();
                        imgIcon.setAttribute('crossOrigin', 'Anonymous');
                        imgIcon.src = `${this.resRoot}/image/editor/map/mark_bs.png`;

                        imgIcon.onload = () => {
                            ctx.drawImage(imgIcon, canvas.width / 2 - imgIcon.width / 2, canvas.height / 2 - imgIcon.height, imgIcon.width, imgIcon.height + 5);

                            this.mapSrc = canvas.toDataURL();
                            this.mapObj.zoom = this.map.getZoom();
                            document.body.removeChild(container);
                            resolve();
                        };
                    };
                }, 500);

                /* const map = new AMap.Map('hiddenMapContainer', {
                    zoom: this.map.getZoom(),
                    center: [this.mapObj.longitude, this.mapObj.latitude],
                    // 使用3D视图
                    viewMode: '3D',
                    keyboardEnable: false,
                    resizeEnable: true,
                    mapStyle: this.mapStyle,
                });
                new AMap.Marker({
                    position: [this.mapObj.longitude, this.mapObj.latitude],
                    map,
                });

                map.on('complete', () => {
                    if (this.drawMapTimer) {
                        clearTimeout(this.drawMapTimer);
                        this.drawMapTimer = null;
                    }

                    this.drawMapTimer = setTimeout(() => {
                        const image = new Image();
                        image.setAttribute('crossOrigin', 'Anonymous');
                        image.src = document.querySelector('#hiddenMapContainer .amap-layer').toDataURL();

                        image.onload = () => {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');

                            canvas.width = image.width;
                            canvas.height = image.height;

                            ctx.drawImage(image, 0, 0);

                            const imgIcon = new Image();
                            imgIcon.setAttribute('crossOrigin', 'Anonymous');
                            imgIcon.src = `${this.resRoot}/image/editor/map/mark_bs.png`;

                            imgIcon.onload = () => {
                                ctx.drawImage(imgIcon, canvas.width / 2 - imgIcon.width / 2, canvas.height / 2 - imgIcon.height, imgIcon.width, imgIcon.height + 5);

                                this.mapSrc = canvas.toDataURL();
                                this.mapObj.zoom = this.map.getZoom();
                                // this.isFinishedDrawMap = true;
                                document.body.removeChild(container);
                                resolve();
                            };
                        };
                    }, 500);
                }); */
            });
        },
        typeWrapperScroll() {
            if (this.$refs.typeWrapper.clientHeight + this.$refs.typeWrapper.scrollTop === this.$refs.typeWrapper.scrollHeight) {
                this.showTypeMask = false;
            } else {
                this.showTypeMask = true;
            }
        },
        handleAddressInput() {
            if (!this.sugResult) {

            }
        },
        addressInputFocus() {
            this.$nextTick(() => {
                this.$refs.addressInput.select();
            });
            this.showSugResult = true;
            /* if (this.showSugResult) {
                setTimeout(() => {
                    this.sugResult.style.visibility = 'visible';
                    this.sugResult.style.display = 'block';
                }, 50);
            } */
        },
        addressInputBlur() {
            this.showSugResult = false;
        },
    },
});
