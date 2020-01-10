Vue.component('align-line', {
    mixins: [Ktu.mixins.dataHandler],
    template: `<div v-if="isShowLine" class="snap-line" id="snapLine">
                    <div v-if="showRotateLine" class="rotate-line" :style="lineObjStyle">
                        <div class="line" :style="{transform:'rotate('+(line.angle) +'deg)'}" v-for="(line,index) in rotateLine"
                            :class="{highlight : activeObject.angle == line.referAngle1 || activeObject.angle == line.referAngle2}"></div>
                    </div>

                    <div  class="align-line" >
                        <div :id="line.type" class="line" v-for="(line,index) in alignLine"></div>
                    </div>
    			</div>`,
    data() {
    	return {
            rotateLine: [{
                angle: 90,
                referAngle1: 0,
                referAngle2: 180,
            }, {
                angle: 135,
                referAngle1: 45,
                referAngle2: 225,
            }, {
                angle: 180,
                referAngle1: 90,
                referAngle2: 270,
            }, {
                angle: 225,
                referAngle1: 135,
                referAngle2: 315,
            }],
            alignLine: [{
                type: 'guidelineH',
            }, {
                type: 'guidelineV',
            }],
    	};
    },
    computed: {
        scale() {
            return this.$store.state.data.scale;
        },
        ctrlEle() {
            return this.activeObject && (this.activeObject.isInContainer ? this.activeObject.container : this.activeObject);
        },
        boxSizePosition() {
            const editorClientRectTop = Ktu.edit.documentPosition.viewTop;
            const editorClientRectLeft = Ktu.edit.documentPosition.viewLeft;
            const dimensions = this.ctrlEle.getDimensions();
            const coords = this.ctrlEle.calculateCoords();

            const width = dimensions.w * this.ctrlEle.scaleX * this.scale;
            const height = dimensions.h * this.ctrlEle.scaleY * this.scale;
            const centerX = (coords.center.x + (this.ctrlEle.group ? this.ctrlEle.group.left : 0)) * this.scale + editorClientRectLeft ;
            const centerY = (coords.center.y + (this.ctrlEle.group ? this.ctrlEle.group.top : 0)) * this.scale  + editorClientRectTop ;

            return {
                width,
                height,
                centerX,
                centerY,
            };
        },
        width() {
            return this.boxSizePosition.width;
        },
        height() {
            return this.boxSizePosition.height;
        },
        left() {
            return this.boxSizePosition.centerX - this.radius / 2;
        },
        top() {
            return this.boxSizePosition.centerY - this.radius / 2;
        },
        radius() {
            return Math.sqrt(this.width * this.width +  this.height *  this.height) * 1.5;
        },
        lineObjStyle() {
            return {
                width: `${this.radius}px`,
                height: `${this.radius}px`,
                top: `${this.top}px`,
                left: `${this.left}px`,
            };
        },
        interactive() {
            return this.$store.state.base.interactive;
        },
        showRotateLine() {
            return this.interactive.canRotate;
        },
        showAlignLine() {
            return this.interactive.canTranslate || this.interactive.canResize;
        },
        isShowLine() {
            return this.activeObject;
            // return this.showRotateLine || this.showAlignLine;
        },
        snapObjStyle() {

        },
    },

    methods: {

    },
});
