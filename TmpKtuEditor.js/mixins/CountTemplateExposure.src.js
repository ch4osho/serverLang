Ktu.mixins.countTemplateExposure = {
    data() {
        return {
            templatePosArr: [],
            newPosArr: [],
        };
    },
    methods: {
        getTemplatePosArr() {
            if (!this.$refs.templateList) {
                return;
            }
            const height = $('.tcenter').height();
            this.templatePosArr.push(...this.newPosArr);
            this.newPosArr = [];
            this.$nextTick(() => {
                this.templateList.forEach(item => {
                    const tmpDom = this.$refs.templateList.$refs[`template${item.id}`][0];
                    const top = tmpDom.getBoundingClientRect().top;
                    const offsetHeight = tmpDom.offsetHeight;
                    if (!this.templatePosArr.includes(item.id) && top > 69 &&  (top + offsetHeight - 100) < height) {
                        this.newPosArr.push(item.id);
                    }
                });
                this.countExposureTimes(this.newPosArr);
            });
        },
        countExposureTimes(templatePosArr) {
            if (templatePosArr.length > 0) {
                const url = '/ajax/logBss_h.jsp';
                axios.post(url, {
                    cmd: 'templateExposure',
                    templateIds: JSON.stringify(templatePosArr),
                    ktuId: Ktu.ktuId,
                    classification: Ktu.ktuData.type,
                }).then(res => {
                    // console.log(res);
                })
                    .catch(err => {
                        console.log(err);
                    });
            }
        },
        // 节流函数
        throttle(func, wait) {
            if (this.setTimeout) {
                clearTimeout(this.setTimeout);
            }
            this.setTimeout = setTimeout(() => {
                func();
            }, wait);
        },
    },
    updated() {
        this.throttle(this.getTemplatePosArr, 300);
    },
};
