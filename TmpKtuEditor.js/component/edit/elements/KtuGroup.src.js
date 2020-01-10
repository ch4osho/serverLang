Vue.component('ktu-group', {
    template: `
        <div :style="divStyle" class="ele group" v-show="element.visible" :data-index="element.key"
            :class="{isHover: element.isHover,selected: element.isSelected, locked: element.isLocked}"
            @dragstart.prevent
            @mouseenter="element.isHover = true"
            @mouseleave="element.isHover = false">
                <div class="mask" :style="maskStyle"></div>
                <ktu-element :element="object" v-for="(object, index) in element.objects" :key="object.objectId" :groupPosition = "{left:element.left,top:element.top}">
                </ktu-element>
        </div>
    `,
    mixins: [Ktu.mixins.dataHandler],
    data() {
        return {
        };
    },
    props: {
        element: {
            type: Object,
        },
        groupPosition: {
            type: Object,
            default() {
                return {
                    left: 0,
                    top: 0,
                };
            },
        },
    },
    mounted() {
    },
    computed: {
        divStyle() {
            const style = {
                position: 'absolute',
                left: `${this.element.left}px`,
                top: `${this.element.top}px`,
                width: `${this.element.width}px`,
                height: `${this.element.height}px`,
                // opacity: this.element.opacity,
                zIndex: this.zIndex,
                transformOrigin: `top left`,
                transform: `rotate(${this.element.angle}deg) scale(${this.element.scaleX}, ${this.element.scaleY}) ${this.flip}`,
                // 'transform-origin': `${this.element.originX} ${this.element.originY}`,
            };
            return style;
        },
        flip() {
            let flipStr = '';
            if (this.element.flipX) {
                flipStr += `matrix(-1,0,0,1,${this.element.width},0)`;
            }
            if (this.element.flipY) {
                flipStr += `matrix(1,0,0,-1,0,${this.element.height})`;
            }
            return flipStr;
        },
        scale() {
            return this.$store.state.data.scale;
        },
        maskStyle() {
            if (Ktu.store.state.data.selectedData && Ktu.store.state.data.selectedData.group === this.element) {
                return {
                    width: `${Ktu.edit.documentSize.width / this.element.scaleX}px`,
                    height: `${Ktu.edit.documentSize.height / this.element.scaleY}px`,
                    opacity: '.5',
                    position: 'absolute',
                    left: `${- this.element.left / this.element.scaleX}px`,
                    top: `${- this.element.top / this.element.scaleY}px`,
                    backgroundColor: '#fff',
                    zIndex: -1,
                    pointerEvents: 'none',
                };
            }
            this.groupIndex = this.element.key;
            return {
                display: 'none',
            };
        },
        zIndex() {
            // 当编辑组合中单个元素时，组合层级设为最高
            if (Ktu.store.state.data.selectedData && Ktu.store.state.data.selectedData.group === this.element) {
                return 10000000;
            }
            return this.element.key;
        },
    },

});
