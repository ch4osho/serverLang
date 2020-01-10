Ktu.mixins.colorCtrl = {
    data() {
        return {
            isCancelingCollect: false,
            collectColorList: Ktu.userData.other.collectColor || [],
        };
    },
    computed: {

    },
    methods: {
        // 获取颜色按钮的圆角样式
        getRadiusClass(index, list, colorEachRow, hasCollectBtn = false) {
            const {
                length,
            } = list;

            let classStr = '';
            let row = 1;
            if (hasCollectBtn) {
                row = Math.ceil((length + 1) / colorEachRow);
            } else {
                row = Math.ceil(length / colorEachRow);
                if (length <= colorEachRow && index === length - 1) {
                    classStr = 'top-right-radius ';
                }
            }
            const remain = length % colorEachRow;
            if (index === (row - 1) * colorEachRow) {
                return `${classStr}bottom-left-radius`;
            } else if (index === (row - 1) * colorEachRow - 1 && remain !== colorEachRow - 1) {
                return `${classStr} bottom-right-radius`;
            }
            return classStr;
        },
        delBtnClass() {
            const {
                length,
            } = this.collectColorList;
            const row = Math.ceil(length / this.colorEachRow);
            const remain = length % this.colorEachRow;
            const rowStr = row === 1 ? 'top-right-radius' : '';
            return remain === 0 ? 'bottom-left-radius' : rowStr;
        },
        chooseListColor(color) {
            let colorTabType = 1;

            if (color.includes('type')) {
                colorTabType = color.includes('linear') ? 2 : 3;
                this.$emit('change', JSON.parse(color), colorTabType);
            } else {
                this.$emit('change', color, colorTabType);
            }
        },
        cancelCollect(color) {
            const index = this.collectColorList.indexOf(color);
            this.collectColorList.splice(index, 1);
            if (this.collectColorList.length === 0) {
                this.isCancelingCollect = false;
            }
            this.saveCollectColor();
            Ktu.log('colorPicker', 'cancelCollect');
        },
        saveCollectColor() {
            const _this = this;
            axios.post('/ajax/ktu_h.jsp?cmd=setUserOther', {
                collectColor: JSON.stringify(this.collectColorList),
            }).then(res => {
                const result = (res.data);
                if (result.success) {
                    Ktu.userData.other.collectColor = _this.collectColorList;
                    _this.$Notice.success('操作成功！');
                }
            })
                .catch(err => {
                    _this.$Notice.error('服务繁忙，请稍后再试。');
                });
        },
        colorListFilter(value) {
            let color = '';

            if (value.includes('linear')) {
                const linearValue = JSON.parse(value);
                color = 'linear-gradient(to right,';
                linearValue.value.forEach((item, index, arr) => {
                    color += item.color;
                    if (index !== arr.length - 1) color += ',';
                });
                color += ')';

                return color;
            } else if (value.includes('radial')) {
                const radialValue = JSON.parse(value);
                color = 'radial-gradient(circle,';
                radialValue.value.forEach((item, index, arr) => {
                    color += item.color;
                    if (index !== arr.length - 1) color += ',';
                });
                color += ')';

                return color;
            }
            return value;
        },
        collectColor() {
            const { value } = this;

            if (typeof value === 'string' && value === 'colorful') return;

            const isReapeat = this.collectColorList.some(color => {
                if (typeof value !== 'string') return JSON.stringify(value) === color;
                return value.toUpperCase() === color.toUpperCase();
            });

            if (isReapeat) {
                this.$Notice.warning('该颜色已被收藏，请勿重复收藏');
            } else {
                if (typeof value !== 'string') {
                    this.collectColorList.push(JSON.stringify(this.value));
                } else {
                    this.collectColorList.push(value);
                }
                this.saveCollectColor();
            }
            Ktu.log('colorPicker', 'collect');
        },
    },
};
