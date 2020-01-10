Vue.component('edit-text', {
    mixins: [Ktu.mixins.dataHandler],
    template: `  <div class="edit-text" v-if="isEditing" :style="[textBg,position]" @mousedown.stop @mousemove.stop @mouseup.stop>
                    <div contenteditable="true" id="textEditor" autocorrect="off" autocomplete="off" spellcheck="false" class="edit-text-input" :style="editStyle" v-html="text"></div>
                </div>
            `,
    data() {
        return {

        };
    },
    computed: {
        textBg() {
            return {
                backgroundColor: this.selectedData.textBg,
            };
        },
        isEditing() {
            return this.selectedData && this.selectedData.isEditing;
        },
        scale() {
            return this.selectedData.scaleX * this.edit.scale * (this.selectedData.group ? this.selectedData.group.scaleX : 1);
        },
        position() {
            const dimensions = this.selectedData.getDimensions();
            const {
                scale,
            } = this;
            const offsetTop = -this.selectedData.getEditingOffsetTop() * scale;
            let {
                left,
                top,
                angle,
            } = this.selectedData;
            if (this.selectedData.group) {
                const position = this.selectedData.getPositionToEditor();
                [left, top] = [position.left, position.top];
                angle = this.selectedData.angle + this.selectedData.group.angle;
            }
            const width = (dimensions.w + this.selectedData.getCharSpacing()) * scale;
            const height = dimensions.h * scale;
            const options = {
                position: 'absolute',
                left: `${this.edit.documentPosition.left + left * this.edit.scale}px`,
                top: `${this.edit.documentPosition.top + top * this.edit.scale}px`,
                width: `${width}px`,
                // height: dimensions.h*scale + 'px',
                transform: `translate(0, ${offsetTop}px) rotate(${angle}deg) translate(${width / 2}px, ${height / 2}px)  skew(${this.selectedData.skewX}deg, ${this.selectedData.skewY}deg) translate(${-width / 2}px, ${-height / 2}px)`,
            };
            if (this.selectedData.type === 'threeText') {
                options.textAlign = 'center';
            }
            return options;
        },
        editStyle() {
            const object = this.selectedData;
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

            // 支持渐变色
            let colorObj = null;
            if (object.type !== 'threeText') {
                if (object.fill.includes('type')) {
                    let gradient = '';

                    const value = JSON.parse(object.fill);
                    if (value.type === 'linear') {
                        let linear = 'linear-gradient(to right,';
                        value.value.forEach((item, index, arr) => {
                            linear += item.color;
                            if (index !== arr.length - 1) linear += ',';
                        });
                        linear += ')';
                        gradient = linear;
                    } else {
                        let radial = 'radial-gradient(circle,';
                        value.value.forEach((item, index, arr) => {
                            radial += item.color;
                            if (index !== arr.length - 1) radial += ',';
                        });
                        radial += ')';
                        gradient = radial;
                    }

                    colorObj = {
                        '-webkit-text-fill-color': 'transparent',
                        '-webkit-background-clip': 'text',
                        'background-image': gradient,
                    };
                } else {
                    colorObj = {
                        color: object.fill,
                    };
                }
            }

            const baseOptions = {
                fontSize: `${object.fontSize * scale}px`,
                fontFamily: `${fontFamily}, Source Han Sans CN Regular, Symbola`,
                fontStyle: object.fontStyle,
                fontWeight: object.fontWeight,
                opacity: object.opacity,
                lineHeight: `${object.getLineHeight() * scale}px`,
                letterSpacing: `${object.getCharSpacing() * scale}px`,
                textAlign: object.textAlign,
                textDecoration: object.textDecoration,
                transform: flipStr,
                position: 'relative',
            };

            const options = Object.assign(baseOptions, colorObj);

            if (object.type == 'threeText') {
                options.letterSpacing = '5px';
            }
            return options;
        },
        text() {
            return this.selectedData.text.replace(/&/g, '&amp;').replace(/ /g, '&nbsp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\\/g, '&#92;')
                .replace(/'/g, '&#39;')
                .replace(/"/g, '&quot;');
        },
        edit() {
            return this.$store.state.base.edit;
        },
        interactive() {
            return this.$store.state.base.interactive;
        },
    },
    methods: {

    },
});
