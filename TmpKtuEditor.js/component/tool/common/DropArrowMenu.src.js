Vue.component('drop-arrow-menu', {
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler],
    props: {

    },
    template: `<div class="tool-box drop-arrow-menu" ref="dropArrowMenu">
                <div class="arrow-btn" @click="show">
                    <div class="arrow-text">箭头样式</div>
                    <div class="tool-btn-arrow">
                        <svg class="tool-btn-arrow-svg">
                            <use xlink:href="#svg-tool-arrow"></use>
                        </svg>
                    </div>
                </div>
                <transition name="slide-up">
                    <div class="drop-arrow-menu-popup" @click.stop :style="arrowStyle=='normal'?'height:100px':''" v-show="isShow">
                        <div class="arrow-style">
                            <div class="menu-text">样式</div>
                            <div class="menu-selection">
                                <div class="arrow-style-item" :class="item==arrowStyle?'active':''" :key="index" @click.stop="changeArrowStyle(item)" v-for="(item,index) in arrowStyleList">
                                    <svg class="arrow-style-svg" :style="arrowEndpoint.left&&!arrowEndpoint.right?'transform:rotate(180deg)':''">
                                        <use :xlink:href="!(arrowEndpoint.left&&arrowEndpoint.right)?'#svg-tool-single-line-'+item:'#svg-tool-line-'+item"></use>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="arrow-endpoint" v-if="arrowStyle!='normal'">
                            <div class="menu-text">端点</div>
                            <div class="menu-selection">
                                <div class="arrow-endpoint-item left-arrow" :class="arrowEndpoint.left?'active':''" @click.stop="changeEndpoint('left')"></div>
                                <div class="arrow-endpoint-svg">
                                    <svg class="arrow-style-svg" v-if="arrowEndpoint.left&&arrowEndpoint.right">
                                        <use :xlink:href="'#svg-tool-line-'+arrowStyle"></use>
                                    </svg>
                                    <svg class="arrow-style-svg" style="transform:rotate(180deg)" v-else-if="arrowEndpoint.left">
                                        <use :xlink:href="'#svg-tool-single-line-'+arrowStyle"></use>
                                    </svg>
                                    <svg class="arrow-style-svg" v-else-if="arrowEndpoint.right">
                                        <use :xlink:href="'#svg-tool-single-line-'+arrowStyle"></use>
                                    </svg>
                                    <svg class="arrow-style-svg" v-else>
                                        <use xlink:href="#svg-tool-line-normal"></use>
                                    </svg>
                                </div>
                                <div class="arrow-endpoint-item right-arrow" :class="arrowEndpoint.right?'active':''" @click.stop="changeEndpoint('right')"></div>
                            </div>
                        </div>
                    </div>
                </transition>
            </div>`,
    data() {
        return {
            arrowStyleList: ['normal', 'solid', 'arrow', 'circular', 'square', 'rectangle'],
            showPopup: false,
        };
    },
    computed: {
        arrowStyle() {
            return this.activeObject.msg.arrowStyle;
        },
        arrowEndpoint() {
            return this.activeObject.msg.arrowEndpoint;
        },
    },
    methods: {
        changeArrowStyle(item) {
            const lastStyle = this.arrowStyle;
            this.$emit('selectArrow', {
                arrowEndpoint: this.arrowEndpoint,
                arrowStyle: item,
            });
            this.activeObject.getActualSize();
            this.activeObject.setEndPoint('reset', item, lastStyle);
            if (this.activeObject.group) {
                this.activeObject.group.updateSizePosition();
            }
        },
        changeEndpoint(item) {
            const data = _.cloneDeep(this.arrowEndpoint);
            data[item] = !data[item];
            if (!Object.values(data).includes(true)) {
                return;
            }
            this.$emit('selectArrow', {
                arrowEndpoint: data,
                arrowStyle: this.arrowStyle,
            });
            this.activeObject.getActualSize();
            if (data[item]) {
                this.activeObject.setEndPoint('add', item);
            } else {
                this.activeObject.setEndPoint('del', item);
            }
            if (this.activeObject.group) {
                this.activeObject.group.updateSizePosition();
            }
        },
    },
});

