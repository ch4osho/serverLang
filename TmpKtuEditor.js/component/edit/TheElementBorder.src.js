Vue.component('border-box', {
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler],
    template: ` <div class="border-box" id="border-box" style="overflow: visible;">
                    <div v-if="(element.isHover || element.isSelected || element.hasChosen) && !element.isEditing && !element.isClipMode && !isTranslating && element.type !== 'table' && (selectedGroup&&selectedData ? (element === selectedData || element === selectedGroup ) : (selectedData ? !selectedData.isEditing : true))" class="eleBorder"
                        :class="{isLocked: element.type !== 'background' && element.isLocked, isGroup:element.type=='group',isSelected : element.isSelected,isHover : element.isHover}"
                        v-for="(element,index) in selectedTemplateData" :style="divStyle(element)">
                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="100%" height="100%" style="position: absolute;overflow: visible;">
                                <g class="parentPath" transform="translate(0.5 0.5)"   :class="{isOpacity:isOpacity(element)} ">
                                    <path class="border-line black" :d="linePath( element )" />
                                    <path class="border-line white" :d="linePath( element )" />
                                </g>
                                <g v-if="!!element.objects&&element.type!='imageContainer'" :class="{selectedInGroup : isSelectedInGroup}">
                                    <g v-for="childEle in element.objects" class="childPath"
                                        :class="{isHover:selectedData&&(selectedData.group?selectedData.group===element:false) ? false : childEle.isHover, isSelected : isSelected(childEle) || childEle.isSelected  , isEditing : childEle.isEditing}" transform="translate(0.5 0.5)"
                                        >
                                        <path class="border-line black" :d="childLinePath( childEle )" :style="childLineStyle(childEle)"/>
                                        <path class="border-line white" :d="childLinePath( childEle )" :style="childLineStyle(childEle)"/>
                                    </g>
                                </g>
                                <g v-if="element.type=='imageContainer'">
                                    <g v-for="childEle in element.objects" class="childPath"  :class="{isHover:childEle.isHover , isSelected : childEle.isSelected}"
                                         v-if="(childEle.isHover||childEle.isSelected)&&!childEle.isClipMode" transform="translate(0.5 0.5)">
                                        <g class="border-line black" v-html="childBorder( childEle )" :style="childLineStyle(childEle)"/>
                                        <g class="border-line white" v-html="childBorder( childEle )" :style="childLineStyle(childEle)"/>
                                    </g>
                                </g>
                            </svg>
                    </div>
                </div>
            `,
    data() {
        return {
            navHeight: Ktu.config.nav.height,
            categoryWidth: Ktu.config.ele.categoryWidth,
            detailWidth: Ktu.config.ele.detailWidth,
            controlSize: 14,
            rotateLine: 20,
            rotateIcon: {
                width: 26,
                height: 16,
            },
        };
    },
    computed: {
        selectedTemplateData() {
            const selTemplateData = this.$store.state.data.selectedTemplateData;
            const { objects } = selTemplateData;
            return objects;
        },
        scale() {
            return this.$store.state.data.scale;
        },
        isSelectedInGroup() {
            return (!!this.selectedGroup || !!this.currentMulti) && !!this.selectedData;
        },
        isTranslating() {
            return this.$store.state.base.interactive.isTranslating;
        },
    },
    methods: {
        isSelected(ele) {
            return !this.selectedData && !!this.selectedGroup || ele === this.selectedData;
        },
        // 是否编辑组合元素中的单个元素
        isEditingObject(element) {
            return Ktu.store.state.data.selectedData && Ktu.store.state.data.selectedData.group === element;
        },
        isOpacity(element) {
            if (this.isEditingObject(element)) {
                return true;
            }
            if (element.type == 'imageContainer') {
                return element.objects.some(e => !!e.isSelected);
            }
        },
        isSelectedorNot(element) {
            let result = false;
            if (element.type != 'imageContainer') {
                result = element.isSelected || element.isHover || element.hasChosen;
            } else {
                result = !element.objects.some(e => !!e.isSelected);
            }
            return result;
        },
        divStyle(element, isChild) {
            const editorClientRectTop = isChild ? 0 : Ktu.edit.documentPosition.viewTop;
            const editorClientRectLeft = isChild ? 0 : Ktu.edit.documentPosition.viewLeft;
            const delteWidth = isChild ? 0 : 0;
            const delteHeight = isChild ? 0 : 0;
            const dimensions = element.getDimensions();

            const radian = element.angle * Math.PI / 180;
            const angleCos = Math.cos(-radian);
            const angleSin = Math.sin(-radian);
            // 得到相对于元素中心点的坐标
            const toCenter = {
                x: element.left - element.coords.center.x,
                y: element.top - element.coords.center.y,
            };
            /* 矩阵转换，由点向量乘以旋转代表的矩阵后解方程得出公式。 */
            const originLeft = element.coords.center.x + toCenter.x * angleCos - toCenter.y * angleSin;
            const originTop = element.coords.center.y + toCenter.x * angleSin + toCenter.y * angleCos;
            const width = dimensions.w * (element.group ? element.group.scaleX : 1) * element.scaleX * this.scale + delteWidth;
            let height = dimensions.h * (element.group ? element.group.scaleY : 1) * element.scaleY * this.scale + delteHeight;
            const left = originLeft * (element.group ? element.group.scaleX : 1) * this.scale + editorClientRectLeft;
            let top = originTop * (element.group ? element.group.scaleX : 1) * this.scale + editorClientRectTop;
            if ((element.type == 'path-group' || element.type == 'line') && height < 10) {
                top -= ((10 - height) / 2);
                height = 10;
            }
            let flipStr = '';
            if (element.flipX) {
                flipStr += `matrix(-1,0,0,1,0,0)`;
            }
            if (element.flipY) {
                flipStr += `matrix(1,0,0,-1,0,0)`;
            }

            const style = {
                position: 'absolute',
                width: `${width}px`,
                height: `${height}px`,
                left: `${left}px`,
                top: `${top}px`,
                zIndex: element.key,
                transform: `rotate(${element.angle}deg) ${flipStr}`,
            };

            return style;
        },
        linePath(ele) {
            const dimensions = ele.getDimensions();
            const width = dimensions.w * (ele.group ? ele.group.scaleX : 1) * ele.scaleX * this.scale;
            let height = dimensions.h * (ele.group ? ele.group.scaleX : 1) * ele.scaleY * this.scale;
            if ((ele.type == 'path-group' || ele.type == 'line') && height < 10) {
                height = 10;
            }
            return `M 0 0 h ${width} v ${height} h ${-width} v ${-height}`;
        },
        childLinePath(ele) {
            const dimensions = ele.getDimensions();
            let l; let t; let w; let h;
            w = dimensions.w * ele.scaleX * this.scale;
            h = dimensions.h * ele.scaleY * this.scale;
            if (ele.group) {
                l = ele.left * ele.group.scaleX * this.scale;
                t = ele.top * ele.group.scaleY * this.scale;
                w *= ele.group.scaleX;
                h *= ele.group.scaleY;
            } else if (ele.container) {
                l = ele.left * ele.container.scaleX * this.scale;
                t = ele.top * ele.container.scaleY * this.scale;
                w *= ele.container.scaleX;
                h *= ele.container.scaleY;
            }
            return `M ${l} ${t} h ${w} v ${h} h ${-w} v ${-h}`;
        },
        // 图片容器用
        childBorder(ele) {
            return ele.getBorderPath();
        },
        childLineStyle(ele) {
            let l; let t;
            if (ele.group) {
                l = ele.left * ele.group.scaleX * this.scale;
                t = ele.top * ele.group.scaleY * this.scale;
            } else if (ele.container) {
                l = ele.left * ele.container.scaleX * this.scale;
                t = ele.top * ele.container.scaleY * this.scale;
            }

            const transformOrigin = `${l}px ${t}px`;
            const transform = `rotate(${ele.angle}deg)`;

            return {
                transform,
                transformOrigin,
                left: `${ele.left}`,
            };
        },
    },
});
