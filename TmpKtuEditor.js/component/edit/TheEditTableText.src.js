Vue.component('edit-table-text', {
    mixins: [Ktu.mixins.dataHandler],
    template: `  <div class="edit-table-text" v-if="isEditing" :style="position" @mousedown.stop @mousemove.stop @mouseup.stop @scroll.stop @wheel.stop>
                    <div contenteditable="true" id="textEditor" autocorrect="off" autocomplete="off" spellcheck="false" class="edit-text-input" :style="editStyle" v-html="text"></div>
                </div>
            `,
    data() {
        return {
            boxOffset: 16,
        };
    },
    computed: {
        selectedCell() {
            if (this.selectedData && this.selectedData.type === 'table') {
                return this.selectedData.selectedCell;
            }
        },
        //  表格中被选中的文本
        selectedText() {
            if (this.selectedCell) {
                return this.selectedCell.object;
            }
            return null;
        },

        isEditing() {
            return this.selectedData && this.selectedData.type === 'table' && this.selectedText && this.selectedText.isEditing;
        },

        dataList() {
            return this.selectedData.msg.tableData.dataList;
        },

        scale() {
            return this.edit.scale * this.selectedText.scaleX * this.selectedData.scaleX * (this.selectedData.group ? this.selectedData.group.scaleX : 1);
        },

        position() {
            // const dimensions = this.selectedText.getDimensions();
            const {
                scale,
            } = this;
            const strokeWidth = this.selectedData.strokeWidth * this.edit.scale;

            let top = strokeWidth;
            let left = strokeWidth;

            for (let i = 0; i < this.selectedCell.row; i++) {
                top += this.dataList[i][0].height * scale;
            }

            for (let i = 0; i < this.selectedCell.col; i++) {
                left += this.dataList[0][i].width * scale;
            }

            const width = this.selectedCell.width * scale - strokeWidth;
            const height = this.selectedCell.height * scale - strokeWidth;

            return {
                position: 'absolute',
                left: `${this.boxOffset + left}px`,
                top: `${this.boxOffset + top}px`,
                width: `${width}px`,
                height: `${height}px`,
            };
        },
        editStyle() {
            const object = this.selectedText;
            const {
                scale,
            } = this;
            let flipStr = '';
            if (object.flipX) {
                flipStr += 'scale(-1, 1)';
            }
            if (object.flipY) {
                flipStr += 'scale(1, -1)';
            }
            // 判断当前字体是什么
            const fontId = object.ftFamilyList && object.ftFamilyList[0] ? object.ftFamilyList[0].fontid : 58;
            const fontFamily = Ktu.indexedDB.hasFont(fontId) ? object.getFontName() : object.fontFamily;
            return {
                color: object.fill,
                fontSize: `${object.fontSize * scale}px`,
                fontFamily: `${fontFamily}, Source Han Sans CN Regular`,
                fontStyle: object.fontStyle,
                fontWeight: object.fontWeight,
                opacity: object.opacity,
                /* lineHeight: object.getLineHeight() * scale + 'px',
                   letterSpacing: object.getCharSpacing() * scale + 'px', */
                textAlign: object.textAlign,
                textDecoration: object.textDecoration,
                transform: flipStr,
                maxHeight: this.position.height,
            };
        },
        edit() {
            return this.$store.state.base.edit;
        },
        text() {
            return this.selectedCell.text.replace(/&/g, '&amp;').replace(/ /g, '&nbsp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\\/g, '&#92;')
                .replace(/'/g, '&#39;')
                .replace(/"/g, '&quot;');
        },
        interactive() {
            return this.$store.state.base.interactive;
        },
    },
    methods: {

    },
});
