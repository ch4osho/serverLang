Vue.component('tool-size', {
    template: `<div class="tool-box tool-size">
                    <div class="tool-size-container">
                        <div class="input-box has-tips" :class="{opened: isWidthInput}" tips="宽">
                            <input type="text" v-model="width" @blur="blurInput(0)" @input="numberOnlyWidth" @keyup.enter="enterInput(0)" @focus="focusInput(0)" ref="width"/>
                        </div>

                        <tool-btn  v-if="isNormalBtn" :icon="icon" :tips="tips" @click="toggleLock" class="tool-size-lock"></tool-btn>

                        <div v-else class="tool-box tool-btn-special" @click="toggleLock">
                            <svg class="tool-btn-svg">
                                <use xlink:href="#svg-tool-size_lock" class="tool-btn-svg-use"></use>
                            </svg>
                        </div>

                        <div class="input-box has-tips" :class="{opened: isHeightInput}" tips="高">
                            <input type="text" v-model="height" @blur="blurInput(1)" @input="numberOnlyHeight" @keyup.enter="enterInput(1)" @focus="focusInput(1)" ref="height"/>
                        </div>
                    </div>
                </div>
    `,
    mixins: [Ktu.mixins.dataHandler],
    data() {
        return {
            width: '',
            height: '',
            ratio: 1,

            cacheWidth: '',
            cacheHeight: '',

            isWidthInput: false,
            isHeightInput: false,

            isDestroyRatio: false,
        };
    },
    computed: {
        // 获取该图片尺寸是否为锁定状态
        isSizeLock: {
            get() {
                if (typeof (this.activeObject.isSizeLock) == 'undefined') {
                    if (this.activeObject.type === 'line') {
                        return false;
                    }
                    return true;
                }
                return this.activeObject.isSizeLock;
            },
            set(value) {
                this.$set(this.activeObject, 'isSizeLock', value);
            },
        },

        tips() {
            if (this.isSizeLock) {
                return '解锁高宽比';
            }
            return '锁定高宽比';
        },

        icon() {
            if (this.isSizeLock) {
                return 'size_lock';
            }
            return 'size_unlock';
        },

        isNormalBtn() {
            if (this.activeObject.type === 'qr-code') {
                return false;
            }
            return true;
        },

        selectedWidth() {
            return Math.round(this.activeObject.width * this.activeObject.scaleX);
        },

        selectedHeight() {
            if (this.activeObject.type === 'line') {
                return Math.max(Math.round(this.activeObject.strokeWidth * this.activeObject.scaleY), 1);
            }
            return Math.round(this.activeObject.height * this.activeObject.scaleY);
        },
    },
    watch: {
        selectedWidth() {
            this.width = this.selectedWidth;
            this.cacheWidth = this.width;

            if (this.isSizeLock) {
                this.ratio = this.width / this.height;
            }
        },

        selectedHeight() {
            this.height = this.selectedHeight;
            this.cacheHeight = this.height;

            if (this.isSizeLock) {
                this.ratio = this.width / this.height;
            }
        },
    },
    created() {
        this.width = this.selectedWidth;
        this.height = this.selectedHeight;
        this.ratio = this.width / this.height;

        this.cacheWidth = this.width;
        this.cacheHeight = this.height;
    },
    methods: {
        // 是否选中输入中
        focusInput(type) {
            if (type === 0) {
                this.isWidthInput = true;
                this.$refs.width.select();
            } else {
                this.isHeightInput = true;
                this.$refs.height.select();
            }
        },

        // 是否离开输出
        blurInput(type) {
            if (type === 0) {
                this.isWidthInput = false;
            } else {
                this.isHeightInput = false;
            }
            this.changeSize();
            if (!!this.activeObject.group) {
                setTimeout(() => {
                    this.activeObject.group.updateSizePosition();
                });
            }
        },

        enterInput(type) {
            if (type === 0) {
                this.$refs.width.blur();
            } else {
                this.$refs.height.blur();
            }
        },

        // 改变是否为锁定高宽比状态
        toggleLock() {
            if (!this.isNormalBtn) {
                return;
            }
            this.activeObject.saveState();
            this.isSizeLock = !this.isSizeLock;
            if (this.isSizeLock) {
                this.ratio = this.width / this.height;
            }
            this.activeObject.modifiedState();
        },

        numberOnlyWidth(e) {
            this.width = e.target.value.replace(/[^\d]/g, '');
            if (this.isSizeLock) {
                const height = Math.round(this.width / this.ratio);

                if (height < 1) {
                    this.height = 1;
                    this.isDestroyRatio = true;
                } else {
                    this.height = height;
                    this.isDestroyRatio = false;
                }
            }
        },

        numberOnlyHeight(e) {
            this.height = e.target.value.replace(/[^\d]/g, '');
            if (this.isSizeLock) {
                const width = Math.round(this.height * this.ratio);

                if (width < 1) {
                    this.width = 1;
                    this.isDestroyRatio = true;
                } else {
                    this.width = width;
                    this.isDestroyRatio = false;
                }
            }
        },

        changeSize() {
            if (this.width < 1 || this.height < 1 || this.width > Ktu.config.edit.maxWidth || this.height > Ktu.config.edit.maxHeight) {
                this.width = this.cacheWidth;
                this.height = this.cacheHeight;
                this.$Notice.warning(`请输入1~${Ktu.config.edit.maxWidth}的数字`);
                return;
            }

            this.activeObject.saveState();
            // 线条很特殊，通过width，strokeWidth改变长宽
            if (this.activeObject.type === 'line') {
                this.activeObject.strokeWidth = parseInt(this.height, 10) / this.activeObject.scaleY;
                this.activeObject.width = this.width / this.activeObject.scaleX;
            } else if (this.activeObject.type === 'rect' || this.activeObject.type === 'ellipse') {
                if (this.isSizeLock && !this.isDestroyRatio) {
                    this.activeObject.scaleY = this.height / this.activeObject.height;
                    this.activeObject.scaleX = this.height / this.activeObject.height;
                    // this.activeObject.scaleX = this.width / this.activeObject.width;
                } else {
                    this.activeObject.height = this.height / this.activeObject.scaleY;
                    this.activeObject.width = this.width / this.activeObject.scaleX;
                }
            } else {
                this.activeObject.scaleY = this.height / this.activeObject.height;
                this.activeObject.scaleX = this.width / this.activeObject.width;
            }

            this.activeObject.dirty = true;
            this.activeObject.setCoords();

            // 组合内元素修改
            this.isObjectInGroup && this.updateGroup();
            this.activeObject.modifiedState();

            this.width = this.selectedWidth;
            this.height = this.selectedHeight;

            const { type } = this.activeObject;
            if (type === 'line' || type === 'rect' || type === 'ellipse') {
                Ktu.log('quickDrawTool', 'size');
            } else {
                if (type === 'cimage' && /gif$/.test(this.activeObject.imageType)) {
                    Ktu.log('gif', 'size');
                } else {
                    Ktu.log(this.activeObject.type, 'size');
                }
            }
        },
    },
});
