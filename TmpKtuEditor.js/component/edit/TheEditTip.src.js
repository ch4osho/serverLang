Vue.component('edit-tip', {
    mixins: [Ktu.mixins.dataHandler],
    template: `<div class="editTip">
            <div v-if="isTranslating || (isKeyDownMoving && !isLocked)" class="tip moving-tip" :style="moveStyleAbs">
                {{zb}}
            </div>
            <div v-if="!!hoverTip&&!!interactive.end&&!isTranslating&&(selectedData?!selectedData.isEditing:true)" class="tip hover-tip" :style="hoverStyleAbs">
                {{hoverTip}}
            </div>
            <div v-if="isRotating" class="tip rotate-tip" :style="rotateStyleAbs">
                {{rotate}}
            </div>
            <div v-if="isResizing" class="tip resize-tip" :style="resizeStyleAbs">
                {{resizeText}}
            </div>
            <div v-if="isImageContainer&&!isTranslating&&!isRotating" class="tip imgContainer-tip" :style="imgContainerStyleAbs">
                {{containerHouverTip}}
            </div>
    </div>`,
    data() {
        return {};
    },
    computed: {
        ktuEdit() {
            return this.$store.state.base.edit;
        },
        interactive() {
            return this.$store.state.base.interactive;
        },
        isTranslating() {
            return this.interactive.isTranslating;
        },
        isKeyDownMoving() {
            return !!this.ctrlEle && this.$store.state.data.isKeyDownMoving;
        },
        isRotating() {
            return this.interactive.isRotating;
        },
        isResizing() {
            return this.interactive.isResizing;
        },
        hoverTip() {
            return this.interactive.hoverTip;
        },
        // 图片容器选中
        isImageContainer() {
            return this.activeObject && this.activeObject.type === 'imageContainer';
        },
        hoverStyleAbs() {
            const left = this.interactive.end.x - this.ktuEdit.size.left - this.ktuEdit.editBox.left;
            const top = this.interactive.end.y - this.ktuEdit.size.top - this.ktuEdit.editBox.top;
            /* if(this.ctrlEle&&this.ctrlEle.type=="imageContainer"){
               const editorClientRectTop = this.ktuEdit.documentPosition.viewTop;
               const editorClientRectLeft = this.ktuEdit.documentPosition.viewLeft;
               left = editorClientRectLeft + this.ctrlEle.left * this.ktuEdit.scale;
               top = editorClientRectTop + this.ctrlEle.top * this.ktuEdit.scale;
               } */
            return {
                left: `${left}px`,
                top: `${top}px`,
            };
        },
        moveStyleAbs() {
            const editorClientRectTop = this.ktuEdit.documentPosition.viewTop;
            const editorClientRectLeft = this.ktuEdit.documentPosition.viewLeft;

            let { left } = this.ctrlEle;
            let { top } = this.ctrlEle;

            if (this.ctrlEle.group) {
                left += this.ctrlEle.group.left;
                top += this.ctrlEle.group.top;
            }

            return {
                left: `${editorClientRectLeft + left * this.ktuEdit.scale}px`,
                top: `${editorClientRectTop + top * this.ktuEdit.scale}px`,
            };
        },
        imgContainerStyleAbs() {
            const editorClientRectTop = this.ktuEdit.documentPosition.viewTop;
            const editorClientRectLeft = this.ktuEdit.documentPosition.viewLeft;
            const radian = this.ctrlEle.angle * Math.PI / 180;
            const angleCos = Math.cos(radian);
            const angleSin = Math.sin(radian);
            const offsetX = 5 * angleSin;
            const offsetY = 5 * angleCos;

             if (this.ctrlEle.group) {
                return {
                    left: `${-offsetX + editorClientRectLeft + (this.ctrlEle.group.coords.tl.x + (this.ctrlEle.coords.tl.x + this.ctrlEle.coords.tr.x) / 2) * this.ktuEdit.scale}px`,
                    top: `${-offsetY + editorClientRectTop + (this.ctrlEle.group.coords.tl.y + (this.ctrlEle.coords.tl.y + this.ctrlEle.coords.tr.y) / 2) * this.ktuEdit.scale}px`,
                };
            } else {
                return {
                    left: `${-offsetX + editorClientRectLeft + (this.ctrlEle.coords.tl.x + this.ctrlEle.coords.tr.x) / 2 * this.ktuEdit.scale}px`,
                    top: `${-offsetY + editorClientRectTop + (this.ctrlEle.coords.tl.y + this.ctrlEle.coords.tr.y) / 2 * this.ktuEdit.scale}px`,
                };
            }


        },
        ctrlEle() {
            return this.activeObject && (this.activeObject.isInContainer ? this.activeObject.container : this.activeObject);
        },
        rotateStyleAbs() {
            const editorClientRectTop = this.ktuEdit.documentPosition.viewTop;
            const editorClientRectLeft = this.ktuEdit.documentPosition.viewLeft;
            const radian = this.ctrlEle.angle * Math.PI / 180;
            const angleCos = Math.cos(radian);
            const angleSin = Math.sin(radian);
            const offsetX = 50 * angleSin;
            const offsetY = 50 * angleCos;

            return {
                left: `${-offsetX + editorClientRectLeft + (this.ctrlEle.coords.bl.x + (this.ctrlEle.group ? this.ctrlEle.group.left * 2 : 0) + this.ctrlEle.coords.br.x) / 2 * this.ktuEdit.scale}px`,
                top: `${offsetY + editorClientRectTop + (this.ctrlEle.coords.bl.y + (this.ctrlEle.group ? this.ctrlEle.group.top * 2 : 0) + this.ctrlEle.coords.br.y) / 2 * this.ktuEdit.scale}px`,
            };

        },
        zb() {
            let { left } = this.ctrlEle;
            let { top } = this.ctrlEle;
            if (this.ctrlEle.group) {
                left += this.ctrlEle.group.left;
                top += this.ctrlEle.group.top;
            }
            return `${Math.round(left)},${Math.round(top)}`;
        },
        rotate() {
            return `${this.ctrlEle.angle}°`;
        },
        resizeStyleAbs() {
            const editorClientRectTop = this.ktuEdit.documentPosition.viewTop;
            const editorClientRectLeft = this.ktuEdit.documentPosition.viewLeft;
            const { currentControl } = this.interactive;
            const width = Math.round(this.ctrlEle.width * this.ctrlEle.scaleX);
            const height = Math.round((this.ctrlEle.type === 'line' ? this.ctrlEle.strokeWidth : this.ctrlEle.height) * this.ctrlEle.scaleY);
            const tipsWidth = 10 * 2 + 6 * 3 + width.toString().length * 6 + height.toString().length * 6;
            const tipsHeight = 18;
            const margin = 10;
            let offsetX = -tipsWidth / 2;
            let offsetY = -tipsHeight / 2;
            if (currentControl.includes('l')) {
                offsetX = -tipsWidth - margin;
            }
            if (currentControl.includes('t')) {
                offsetY = -tipsHeight - margin;
            }
            if (currentControl.includes('r')) {
                offsetX = margin;
            }
            if (currentControl.includes('b')) {
                offsetY = margin;
            }

            let { x } = this.ctrlEle.coords[currentControl];
            let { y } = this.ctrlEle.coords[currentControl];

            if (this.ctrlEle.group) {
                x += this.ctrlEle.group.left;
                y += this.ctrlEle.group.top;
            }

            return {
                left: `${editorClientRectLeft + x * this.ktuEdit.scale + offsetX}px`,
                top: `${editorClientRectTop + y * this.ktuEdit.scale + offsetY}px`,
            };
        },
        resizeText() {
            const width = Math.round(this.ctrlEle.width * this.ctrlEle.scaleX);
            const height = Math.round((this.ctrlEle.type === 'line' ? this.ctrlEle.strokeWidth : this.ctrlEle.height) * this.ctrlEle.scaleY);
            return `${width} x ${height}`;
        },
        isLocked() {
            return this.activeObject && this.activeObject.isLocked;
        },
        isInImgContainer() {
            return this.activeObject && this.activeObject.container && this.activeObject.container.type === 'imageContainer';
        },
        containerHouverTip(){
            return this.ctrlEle.group ? '双击换图' : '双击换图或将图片拖入容器'
        },
    },
    methods: {},
});
