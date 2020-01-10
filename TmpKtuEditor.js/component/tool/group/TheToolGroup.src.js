Vue.component('tool-group', {
    mixins: [Ktu.mixins.dataHandler],
    template: `
        <div class="tool-group" :class="{'hide-group': isHideSetGroup}">
            <tool-btn class="tool-box" icon="group" v-if="!isHideSetGroup" :tips="isGroup ? '取消组合' : '组合'" @click="group" :class="['btn-group', {checked: isGroup}]"></tool-btn>
            <div class="tool-split tool-box" v-if="!isHideSetGroup"></div>

            <template v-if="isTextSvgGraph">
                <color-picker :value="color" @input="selectColor"></color-picker>
                <div class="tool-split tool-box"></div>
            </template>

            <template v-if="isAllText">
                <tool-text-bg from="edit-tool" v-if="!isGroup && isAllTextbox"></tool-text-bg>

                <div class="tool-split tool-box" v-if="!isGroup && isAllTextbox"></div>

                <tool-font-family></tool-font-family>

                <div class="tool-split tool-box"></div>

                <tool-font-size></tool-font-size>

                <div class="tool-split tool-box"></div>

            </template>

            <drop-menu v-if="isShowDropMenu" :value="dropMenuValue" :icon="dropMenuIcon" tips="文本对齐" :options="justifyList" @input="setJustify"></drop-menu>

            <drop-menu class="tool-justify"  icon="horizontal_left" tips="对齐与分布" :options="groupJustifyList" @input="selectJustify"></drop-menu>

            <div class="tool-split tool-box"></div>

            <tool-shadow v-if="isShowShadow"></tool-shadow>

            <tool-opacity></tool-opacity>

            <tool-rotate :disable-list="disableRotateList"></tool-rotate>
            <slot></slot>
        </div>
    `,
    data() {
        return {
            justifyList: Ktu.config.tool.options.justifyList,
            groupJustifyList: Ktu.config.tool.options.groupJustifyList,
        };
    },
    computed: {
        isMulti() {
            return this.activeObject.type === 'multi';
        },
        isGroup() {
            return this.activeObject.type === 'group';
        },
        isHideSetGroup() {
            if (this.isMulti) {
                const objectArr = this.activeObject.objects;
                for (let i = 0; i < objectArr.length; i++) {
                    const item = objectArr[i];
                    if (item.type === 'threeText') {
                        return true;
                    }
                }
            }
            return false;
        },
        isShowShadow() {
            if (this.activeObject.type === 'cimage' && /\.gif/.test(this.activeObject.image.src)) {
                return false;
            } else if (this.isMulti || this.isGroup) {
                const objectArr = this.activeObject.objects;
                for (let i = 0; i < objectArr.length; i++) {
                    if (objectArr[i].type === 'group') {
                        const groupArr = objectArr[i].objects;
                        for (let j = 0; j < groupArr.length; j++) {
                            if (groupArr[j].type === 'cimage' && /\.gif/.test(groupArr[j].image.src)) {
                                return false;
                            }
                        }
                    } else if (objectArr[i].type === 'cimage' && /\.gif/.test(objectArr[i].image.src)) {
                        return false;
                    } else if (objectArr[i].type === 'threeText') {
                        return false;
                    }
                }
            }
            return !this.activeObject.objects.some(object => (object.type === 'line' || object.type === 'wordCloud'));
        },
        isAllText() {
            return this.activeObject.objects.every(object => object.type === 'textbox' || object.type === 'wordart');
        },
        isAllTextbox() {
            return this.activeObject.objects.every(element => {
                if (element.objects !== undefined && element.objects.length > 0) {
                    return element.objects.every(el => el.type === 'textbox');
                }
                return element.type === 'textbox';
            });
        },
        isTextSvgGraph() {
            const isTextOrSvg = this.activeObject.objects.every(object => {
                const isText = object.type === 'textbox';
                const isAvailableSvg = object.type === 'path-group' && object.changedColors && Object.keys(object.changedColors).length;
                const isGraph = object.type === 'rect' || object.type === 'line' || object.type === 'ellipse';
                return isText || isAvailableSvg || isGraph;
            });
            return isTextOrSvg;
        },
        color() {
            let color = '';
            const isSame = this.activeObject.objects.every(object => {
                if (object.type === 'textbox' || object.type === 'rect' || object.type === 'ellipse') {
                    !color && (color = object.fill);
                    return object.fill === color;
                } else if (object.type === 'path-group') {
                    if (!color) {
                        const changedColors = object.changedColors[0].split('||');
                        color = changedColors[0] || changedColors[1];
                    }
                    const isSame = Object.keys(object.changedColors).every(index => {
                        const changedColors = object.changedColors[index].split('||');
                        return !(changedColors[0] && !(changedColors[0] === color) || changedColors[1] && !(changedColors[1] === color));
                    });
                    return isSame;
                } else if (object.type === 'line') {
                    !color && (color = object.stroke);
                    return object.stroke === color;
                }
                return;
            });
            return isSame ? color : 'colorful';
        },
        isShowDropMenu() {
            return this.activeObject.objects.every(element => {
                if (element.objects !== undefined && element.objects.length > 0) {
                    return element.objects.every(el => el.type === 'textbox' || el.type === 'wordart');
                }
                return element.type  === 'textbox' || element.type === 'wordart';
            });
        },
        dropMenuValue() {
            let textAlign;
            const arr = [];
            arr.push(this.activeObject);
            while (textAlign === undefined || arr.length <= 0) {
                const item = arr.shift();
                if (item.objects !== undefined && item.objects.length > 0) {
                    item.objects.forEach(element => {
                        arr.push(element);
                    });
                } else {
                    textAlign = item.textAlign;
                }
            }
            const isEqual = this.activeObject.objects.every(element => {
                if (element.objects !== undefined && element.objects.length > 0) {
                    return element.objects.every(el => el.textAlign === textAlign);
                }
                return element.textAlign === textAlign;
            });
            return isEqual ? textAlign : null;
        },
        dropMenuIcon() {
            const icon = this.dropMenuValue;
            return  icon === null ? 'left' : icon;
        },
        disableRotateList() {
            if (this.isHideSetGroup) {
                return ['vertical', 'horizontal'];
            }
            return [];
        },
    },
    methods: {
        group() {
            if (this.isGroup) {
                this.selectedGroup.cancelGroup();
                Ktu.log('group', 'cancel');
            } else {
                this.currentMulti.setGroup();
            }
        },
        selectColor(value) {
            this.activeObject.saveState();
            this.activeObject.objects.forEach(object => {
                if (object.type === 'textbox' || object.type === 'rect' || object.type === 'ellipse') {
                    object.fill = value;
                } else if (object.type === 'path-group') {
                    Object.keys(object.changedColors).forEach(index => {
                        const changedColors = object.changedColors[index].split('||');

                        if (changedColors[0]) {
                            changedColors[0] = value;
                            object.paths[index].fill = value;
                        }
                        if (changedColors[1]) {
                            changedColors[1] = value;
                            object.paths[index].stroke = value;
                        }
                        // 兼容旧数据
                        if (!changedColors[0] && !changedColors[1]) {
                            changedColors[0] = value;
                            object.paths[index].fill = value;
                        }
                        object.changedColors[index] = changedColors[1] ? changedColors.join('||') : changedColors[0];
                    });
                } else if (object.type === 'line') {
                    object.stroke = value;
                }
                object.dirty = true;
            });
            this.activeObject.modifiedState();
            Ktu.save.changeSaveNum();
            Ktu.log('group', 'color');
        },
        selectJustify(value) {
            Ktu.log('group', 'justify');
            if (value === 'horizontal' || value === 'vertical') {
                this.activeObject.distribute(value);
            } else {
                this.activeObject.setAlign(value);
            }
        },
        ergodicSetJustify(objects, value) {
            objects.forEach(element => {
                if (element.objects !== undefined && element.objects.length > 0) {
                    this.ergodicSetJustify(element.objects, value);
                } else {
                    element.hasChanged = true;
                    element.textAlign = value;
                }
            });
        },
        setJustify(value) {
		        this.activeObject.saveState();
            this.ergodicSetJustify(this.activeObject.objects, value);
		      	this.activeObject.dirty = true;
		 	      this.activeObject.modifiedState();
        },
    },
});
