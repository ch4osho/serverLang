Vue.component('tool-text-color', {
    template: `
    <div class="tool-box tool-text-color">
        <div class="tool-split" v-if="colorList.length"></div>
        <div class="tool-text-color-scheme" v-if="colorList.length > 1">
            <tool-btn icon="color-scheme" tips="配色方案" @click="show($event)" :class="{opened: isShow}"></tool-btn>
            <transition :name="transitionName">
                <div v-if="isShow" ref="popup" class="tool-popup tool-text-color-scheme-popup" :class="{'reverseX': isNeedReverseX, 'reverseY': isNeedReverseY, 'two': colorList.length === 2, 'three': colorList.length === 3}">
                    <div>配色方案</div>
                    <div class="container">
                        <div
                            v-for="(colors, index) in colorSchemeList"
                            :key="index"
                            class="colors"
                            @click="applyColorScheme(colors)"
                        >
                            <div
                                v-for="(color, index) in colors"
                                :key="index"
                                class="color"
                                :style="{backgroundColor: color}"
                            >
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
        <color-picker v-for="(value, index) in colorList" :key="index" :value="value" @input="inputColor" @change="changeColor(index)"></color-picker>
    </div>
    `,
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler],
    props: {
    },
    data() {
        return {
            popUpWidth: 204,
            popUpHeight: 292,
            selectedColor: '',
            colorPrefix: 'original',
            colorScheme: Ktu.config.colorScheme,
        };
    },
    computed: {
        colorList() {
            const colorList = [];
            const loop = object => {
                for (const prop of Object.keys(object)) {
                    if (typeof object[prop] === 'object') {
                        loop(object[prop]);
                    }
                    if (prop.includes(this.colorPrefix)) {
                        let colorPropName = prop.match(new RegExp(`${this.colorPrefix}(.+)`))[1];
                        colorPropName = colorPropName[0].toLowerCase() + colorPropName.slice(1);
                        colorList.push(object[colorPropName]);
                    }
                }
            };
            loop(this.selectedData.style.covers);
            return colorList;
        },
        colorSchemeList() {
            return this.colorList.length === 2 ? this.colorScheme.two : this.colorScheme.three;
        },
    },
    watch: {
        isShow(value) {
            if (value) {
                Ktu.log('wordart', 'openColorScheme');
            }
        },
    },
    methods: {
        inputColor(color) {
            this.selectedColor = color;
        },
        changeColor(index) {
            const color = this.selectedColor;
            const covers = _.cloneDeep(this.selectedData.style.covers);
            let currentIndex = 0;
            let canContinue = true;
            const loop = object => {
                if (canContinue) {
                    for (const prop of Object.keys(object)) {
                        if (typeof object[prop] === 'object') {
                            loop(object[prop]);
                        }
                        if (prop.includes(this.colorPrefix)) {
                            if (currentIndex === index) {
                                let colorPropName = prop.match(new RegExp(`${this.colorPrefix}(.+)`))[1];
                                colorPropName = colorPropName[0].toLowerCase() + colorPropName.slice(1);
                                object[colorPropName] = color;
                                canContinue = false;
                            }
                            currentIndex++;
                        }
                        if (!canContinue) {
                            break;
                        }
                    }
                }
            };
            loop(covers);
            this.selectedData.saveState();
            this.selectedData.style.covers = covers;
            this.selectedData.modifiedState();
            this.selectedData.dirty = true;
            Ktu.log('wordart', 'alterColor');
        },
        applyColorScheme(colors) {
            this.selectedData.saveState();
            let currentIndex = 0;
            const loop = object => {
                for (const prop of Object.keys(object)) {
                    if (typeof object[prop] === 'object') {
                        loop(object[prop]);
                    }
                    if (prop.includes(this.colorPrefix)) {
                        let colorPropName = prop.match(new RegExp(`${this.colorPrefix}(.+)`))[1];
                        colorPropName = colorPropName[0].toLowerCase() + colorPropName.slice(1);
                        object[colorPropName] = colors[currentIndex];
                        currentIndex++;
                    }
                }
            };
            loop(this.selectedData.style.covers);
            this.selectedData.modifiedState();
            this.selectedData.dirty = true;
            Ktu.log('wordart', 'alterColorScheme');
        },
    },
});
