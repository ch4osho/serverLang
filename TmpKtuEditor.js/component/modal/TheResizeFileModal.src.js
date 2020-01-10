Vue.component('resizefile-modal-box', {
    template: `
    <modal class="manageModal resizefile-modal" :width="500" class-name="resizefileModalBody" v-model="showResizefileModal">
        <div class="resizefileModalHeader" slot="header">
            <span class="headerTitle">请输入画布尺寸</span>
            <span class="lineTip"></span>
            <span class="headerTip">修改画布将改变所有页面尺寸</span>
        </div>

        <div class="newModalContent">
            <div class="inputBox">

                <label class="input-tip">宽</label>
                <validate-input
                    id="rf_canvasWidth"
                    placeholder="宽度"
                    class="newModalInput nav-title-input"
                    style="width:60px"
                    @keyup.native="changeW"
                    v-model="widthVal"
                    :inputVal="widthVal"
                    @focus="focusInput"
                    @blur.native="blurInput">
                </validate-input>

                <div class="lock-icon" @click="toggleLock" :tips="tip">
                    <svg v-show="!isLockWH" class="svg-lock-icon">
                        <use xlink:href="#svg-unlock-wh"></use>
                    </svg>

                    <svg v-show="isLockWH" class="svg-lock-icon">
                        <use xlink:href="#svg-lock-wh"></use>
                    </svg>
                </div>

                <label class="input-tip">高</label>
                <validate-input id="rf_canvasHeight"
                    placeholder="高度"
                    class="newModalInput nav-title-input"
                    style="width:60px"
                    @keyup.native="changeH"
                    v-model="heightVal"
                    :inputVal="heightVal"
                    @focus="focusInput"
                    @blur.native="blurInput">
                </validate-input>

                <selector :value="unit" :options="unitList" @input="selectUnit" :iconConf="iconConf" type="label"></selector>
            </div>
            <div class="adjustMaterial" :class="isAdjustMaterial ? 'is-checked' : ''">
                <svg class="svg-icon" @click="setAdjust">
                    <use xlink:href="#svg-check-true"></use>
                </svg>
                <label>
                    <input type="checkbox" :checked="isAdjustMaterial" @click="setAdjust">
                    </input>
                    同时调整素材大小
                </label>
            </div>
            <div class="newBtn" @click="changeFile">确定</div>
        </div>
    </modal>
    `,
    name: 'resizefileModal',
    props: {
        isOpen: Boolean,
        fromTo: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            widthVal: '',
            heightVal: '',
            pageType: 0,
            unitLabel: '像素',
            unit: 1,
            unitList: [{
                value: 1,
                label: '像素',
            },
            {
                value: 2,
                label: '毫米',
            },
            {
                value: 3,
                label: '厘米',
            },
            {
                value: 4,
                label: '英寸',
            },
            ],
            iconConf: {
                width: 68,
                height: 160,
            },
            oldScale: this.$store.state.base.originalWHRatio,
            // 判断是否需要上一次的比例
            isLast: false,
        };
    },
    computed: {
        showResizefileModal: {
            get() {
                return this.$store.state.modal.showResizefileModal;
            },
            set(newValue) {
                this.$store.commit('modal/resizeFileModalState', {
                    isOpen: newValue,
                });
            },
        },

        fileOptions() {
            return Ktu.config.fileOptions;
        },

        isLockWH: {
            get() {
                return this.$store.state.base.isLockWH;
            },
            set(newValue) {
                this.$store.state.base.isLockWH = newValue;
            },
        },

        isAdjustMaterial: {
            get() {
                return this.$store.state.base.isAdjustMaterial;
            },
            set(newValue) {
                this.$store.state.base.isAdjustMaterial = newValue;
            },
        },

        tip() {
            if (this.isLockWH) {
                return '解锁高宽比';
            }
            return '锁定高宽比';
        },

        unitTip() {
            let tip = '';
            switch (this.unit) {
                case 1:
                    tip = '像素';
                    break;
                case 2:
                    tip = '毫米';
                    break;
                case 3:
                    tip = '厘米';
                    break;
                case 4:
                    tip = '英寸';
                    break;
            }
            return tip;
        },
    },

    mounted() {
        this.unit = Ktu.ktuData.other.unit;
        this.widthVal = Ktu.ktuData.other.originalWidth;
        this.heightVal = Ktu.ktuData.other.originalHeight;
    },
    beforeDestroy() {
        if (!this.isLast) {
            this.$store.state.base.originalWHRatio = this.oldScale;
        }
    },
    methods: {
        changeFile() {
            const originalWidth = parseInt(this.widthVal, 10);
            const originalHeight = parseInt(this.heightVal, 10);
            const pageObj = {
                originalWidth,
                originalHeight,
                unitId: this.unit,
                id: 0,
            };

            if (this.isLockWH) {
                this.$store.state.base.originalWHRatio = originalWidth / originalHeight;
            }

            const isRegular = Ktu.utils.checkWorkSize(pageObj);

            if (!isRegular) {
                return;
            }

            if (this.fromTo == 0) {
                Ktu.log('resizePage', 'fCreate');
            } else {
                Ktu.log('resizePage', 'mCreate');
            }
            Ktu.template.resizePage(pageObj, false, Ktu.store.state.base.isAdjustMaterial);

            this.isLast = true;

            this.$store.commit('modal/resizeFileModalState', {
                isOpen: false,
            });
        },

        blurInput(e) {
            this.widthVal = (parseInt(this.widthVal, 10) || 0);
            this.heightVal = (parseInt(this.heightVal, 10) || 0);
        },

        focusInput(e) {
            e.target.value = parseInt(e.target.value.replace(/[^\d]/g, '') || '', 10);
            if (e.target.placeholder == '高度') {
                this.heightVal = (parseInt(this.heightVal, 10) || 0);
            } else {
                this.widthVal = (parseInt(this.widthVal, 10) || 0);
            }
        },

        changeW(e) {
            e.target.value = e.target.value.replace(/[^\d]/g, '') || '';

            if (this.isLockWH) {
                const ratio = this.$store.state.base.originalWHRatio;

                this.heightVal = Math.round(e.target.value / ratio);
            }
        },
        changeH(e) {
            e.target.value = e.target.value.replace(/[^\d]/g, '') || '';

            if (this.isLockWH) {
                const ratio = this.$store.state.base.originalWHRatio;

                this.widthVal = Math.round(e.target.value * ratio);
            }
        },

        toggleLock() {
            const width = parseInt(this.widthVal, 10);
            const height = parseInt(this.heightVal, 10);

            this.oldScale = this.$store.state.base.originalWHRatio;

            if (!height) {
                this.$Notice.error('请输入高度值');
                $('#rf_canvasHeight').focus();
                return;
            }
            if (!width) {
                this.$Notice.error('请输入宽度值');
                $('#rf_canvasWidth').focus();
                return;
            }

            this.isLockWH = !this.isLockWH;

            this.isLast = false;

            if (this.isLockWH) {
                this.$store.state.base.originalWHRatio = width / height;
            }

            Ktu.log('resizePage', 'lock');
        },

        selectUnit(option) {
            this.unit = option.value;
        },
        setAdjust() {
            this.isAdjustMaterial = !this.isAdjustMaterial;
        },
    },
});
