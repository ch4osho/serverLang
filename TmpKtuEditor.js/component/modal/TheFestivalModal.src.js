Vue.component('festival-modal-box', {
    template: `
    <Modal class="manageModal festival-modal" :width="845" v-model="festivalModalState">
        <div class="manageModalheader" slot="header">
            <span>月份</span>
            <selector class="filter-options" type="label" split :iconConf="iconConf" :options="monthArr" :value="monthValue" @input="monthChange" style="margin-right:25px;"></selector>
            <template v-if="!isOnly">
                <span>热度权重</span>
                <selector class="filter-options" type="label" split :iconConf="iconConf" :options="hotArr" :value="hotValue" @input="hotChange"></selector>
            </template>
        </div>
        <div class="modal-box">
            <div class="container clearfix">
                <div class="month-list" :class="{'active' : monthList.openList}" :data-month="monthIndex" v-for="(monthList,monthIndex) in festivalList">
                    <div class="month-title">{{monthIndex}}月份</div>
                    <div class="month-item-container clearfix">
                        <check-box class="month-item" v-for="(item,index) in monthList.data" :key="index" :value="item.checked" @input="itemCheck($event,item)">
                            {{item.name}}
                        </check-box>
                    </div>
                    <div v-if="monthList.isShow" class="month-more" @click="showMore(monthList)">
                        <svg><use xlink:href="#svg-icon-show"></use></svg>
                    </div>
                </div>
            </div>
            <div class="bottom">
                <div class="btn ok-btn" @click="addFestival">确认</div>
                <div class="btn cancel-btn" @click="cancel">取消</div>
            </div>
        </div>
    </Modal>
    `,
    name: 'FestivalModal',
    mixins: [Ktu.mixins.popupCtrl],
    props: {},
    data() {
        return {
            // 月份选择
            monthValue: 0,
            monthArr: (() => {
                const tmpArr = [{
                    label: '全部',
                    value: 0,
                }];
                for (let i = 1; i <= 12; i++) {
                    tmpArr.push({
                        value: i,
                        label: `${i}月`,
                    });
                }
                return tmpArr;
            })(),
            // 热度选择
            hotValue: 0,
            hotArr: (() => {
                const tmpArr = [];
                for (let i = 0; i < 11; i++) {
                    tmpArr.push({
                        value: i,
                        label: `大于${i}`,
                    });
                }
                return tmpArr;
            })(),
            // 节日列表
            festivalList: {},
            iconConf: {
                width: 10,
                height: 10,
            },
        };
    },
    mounted() {
        this.getFestivalList();
    },
    computed: {
        festivalModalState: {
            get() {
                return this.$store.state.modal.showFestivalModal;
            },
            set(newValue) {
                this.$store.commit('modal/festivalModalState', newValue);
            },
        },

        isOnly() {
            if (Object.keys(this.festivalList).length === 1) {
                return true;
            }
            return false;
        },

        tmpFestival: {
            get() {
                return this.$store.state.base.tmpFestival;
            },
            set(newValue) {
                this.$store.commit('base/changeState', {
                    prop: 'tmpFestival',
                    value: newValue,
                });
            },
        },

        selectedList() {
            const tmpArr = [];
            this.tmpFestival.forEach(item => {
                tmpArr.push(item.nameId);
            });

            return tmpArr;
        },
    },
    methods: {
        getFestivalList() {
            const url = '/ajax/ktuThirdDesigner_h.jsp?cmd=getFestivalList';

            axios
                .post(url, {
                    searchHot: this.hotValue,
                    month: this.monthValue,
                })
                .then(res => {
                    const info = res.data;
                    if (info.success) {
                        const tmp = {};
                        info.data.forEach(item => {
                            if (this.selectedList.includes(item.nameId)) {
                                item.checked = true;
                            } else {
                                item.checked = false;
                            }
                            if (!tmp[item.month]) {
                                tmp[item.month] = {
                                    isShow: false,
                                    openList: false,
                                    data: [item],
                                };
                            } else {
                                tmp[item.month].data.push(item);
                            }
                        });
                        Vue.set(this, 'festivalList', tmp);
                        Vue.nextTick(() => {
                            this.judgeStyle();
                        });
                    }
                })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => { });
        },
        // 判断如何展示
        judgeStyle() {
            const monthList = document.querySelectorAll('.month-list');
            monthList.forEach(item => {
                const {
                    month,
                } = item.dataset;
                const listHeight = item.offsetHeight;
                const itemContainer = item.querySelector('.month-item-container');
                const containerHeight = itemContainer.offsetHeight;

                if (listHeight < containerHeight) {
                    this.festivalList[month].isShow = true;
                    // 如果是具体月份 默认展开 并且不显示图标
                    if (monthList.length == 1) {
                        this.festivalList[month].isShow = false;
                        this.festivalList[month].openList = true;
                    }
                }
            });
        },
        monthChange(value) {
            if (this.monthValue == value.value) return;
            this.monthValue = value.value;
            if (value.value != 0) {
                this.hotValue = 0;
            } else { }
            this.getFestivalList();
        },
        hotChange(value) {
            if (this.hotValue == value.value) return;
            this.hotValue = value.value;
            this.getFestivalList();
        },
        itemCheck(value, item) {
            item.checked = value;
        },
        showMore(monthList) {
            monthList.openList = !monthList.openList;
        },
        addFestival() {
            const tmpArr = [];
            Object.keys(this.festivalList).forEach(key => {
                this.festivalList[key].data.forEach(item => {
                    if (item.checked) {
                        tmpArr.push({
                            name: item.name,
                            nameId: item.nameId,
                        });
                    }
                });
            });
            this.tmpFestival = tmpArr;
            this.cancel();
        },
        cancel() {
            this.festivalModalState = false;
        },
    },
});

