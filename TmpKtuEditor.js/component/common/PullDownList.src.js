Vue.component('pull-down-list', {
    template: `
    <div>
        <div class="line-des" :class="{active:isShow}" v-if="showListWay === 'formatList'">
            <div class="format-input" @click="showMenu">{{formatObj.label}}</div>
            <svg class="unfold-icon">
                <use xlink:href="#svg-arrow"></use>
            </svg>
            <transition name="popover-up">
                <ul v-show="isShow" class="format-menu-popup file-menu-popup" v-if="curNavObj.type === 1">
                    <li class="format-item" :class="{active:item.id === formatObj.id}" v-for="item in typeOptions" @click='chooseFormat(item)'>
                        <p>{{item.label}}</p>
                    </li>
                </ul>
                <ul v-show="isShow" class="format-menu-popup file-menu-popup" v-else>
                    <li class="format-item" :class="{active:item.id === formatObj.id}" v-for="item in typeOptions" v-if="!filterTypeArr.includes(item.value)" @click='chooseFormat(item)'>
                        <p>{{item.label}}</p>
                    </li>
                </ul>
            </transition>
        </div>
        <div class="line-des" :class="{active:isShow}" v-else-if="showListWay === 'qualityList'">
            <div class="quality-input" :class="{active:loadCodeStatus===5}" @click="showMenu">
                {{qualityObj.label}}<span class="recommend" v-if="qualityObj.type === 2">推荐</span>
            </div>
            <svg class="unfold-icon">
                <use xlink:href="#svg-arrow"></use>
            </svg>
            <transition name="popover-up">
                <ul v-show="isShow" class="quality-menu-popup file-menu-popup" :class="{gif:templateType !== 'normal'}">
                    <li class="quality-item" v-for="item in qualityOptions[templateType]" :key="item.type" @click='chooseQuality(item)'>
                        <div class="quality-info">
                            <p class="type" :class="{active: qualityObj.label === item.label}">{{item.label}}<span class="recommend" v-if="item.type === 2">推荐</span></p>
                            <p class="des">{{item.des}}</p>
                        </div>
                    </li>
                </ul>
            </transition>
        </div>
    </div>
    `,
    mixins: [Ktu.mixins.popupCtrl],
    props: {
        curNavObj: {
            type: Object,
        },
        showListWay: {
            type: String,
        },
        loadCodeStatus: {
            type: Number,
        },
        templateType: {
            type: String,
        },
    },
    data() {
        return {
            typeOptions: [
                {
                    id: 1,
                    label: 'JPG',
                    value: 'jpg',
                },
                {
                    id: 2,
                    label: 'PNG（含背景）',
                    value: 'png',
                },
                {
                    id: 3,
                    label: 'PNG（不含背景）',
                    value: 'png',
                },
                {
                    id: 4,
                    label: 'PDF印刷',
                    value: 'pdf',
                },
                {
                    id: 5,
                    label: 'PSD',
                    value: 'psd',
                },
            ],
            qualityOptions: {
                normal: [
                    {
                        type: 1,
                        label: '标清',
                        des: '画质一般，文件最小',
                    },
                    {
                        type: 2,
                        label: '高清',
                        des: '画质接近无损，大幅度压缩容量',
                    },
                    {
                        type: 0,
                        label: '原画',
                        des: '画质最佳，文件最大',
                    },
                ],
                gif: [
                    {
                        type: 0,
                        label: 'GIF原图',
                        gifType: 333,
                    },
                    {
                        type: 0,
                        label: 'GIF公众号配图（<5M）',
                        gifType: 335,
                    },
                    {
                        type: 0,
                        label: 'GIF表情包（<1M）',
                        gifType: 334,
                    },
                ],
            },
            filterTypeArr: ['psd', 'pdf'],
        };
    },
    computed: {
        formatObj: {
            get() {
                return this.$store.state.modal.formatObj;
            },
            set(value) {
                this.$store.state.modal.formatObj = value;
            },
        },
        qualityObj: {
            get() {
                return this.$store.state.modal.qualityObj;
            },
            set(value) {
                this.$store.state.modal.qualityObj = value;
            },
        },
    },
    methods: {
        chooseFormat(item) {
            this.formatObj = item;
            this.qualityObj = { label: '高清', type: 2 };
        },
        chooseQuality(item) {
            this.qualityObj = item;
        },
        showMenu(e) {
            if (this.loadCodeStatus === 5) {
                return;
            }
            this.show();
        },
    },
});
