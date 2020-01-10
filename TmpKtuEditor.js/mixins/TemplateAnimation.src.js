Ktu.mixins.TemplateAnimation = {
    data() {
        return {
            topAnimation: null,
            bottomAnimation: null,
            topTimeOut: null,
            bottomTimeOut: null,

            // 特殊类型，长图
            specialTemplates: [205],
            /* maxTranslateY  这个最大上滑限制根据主页面决定
               isSpecialTemplate  也是由主页面获取
               还需要注意数组需要进行动态绑定translateY的值 */
        };
    },
    computed: {},
    methods: {
        // 触发下滑动画
        translateTop(list, index) {
            this.topTimeOut = setTimeout(() => {
                this.topAnimation = window.requestAnimationFrame(() => {
                    this.addTranslateY(list, index);
                });
            }, 100);
        },

        // 销毁下滑动画
        destroyTranslateTop() {
            clearTimeout(this.topTimeOut);
            window.cancelAnimationFrame(this.topAnimation);
        },

        // 触发上滑动画
        translateBottom(list, index) {
            this.bottomTimeOut = setTimeout(() => {
                this.bottomAnimation = window.requestAnimationFrame(() => {
                    this.reduceTranslateY(list, index);
                });
            }, 100);
        },

        // 销毁上滑动画
        destroyTranslateBottom() {
            clearTimeout(this.bottomTimeOut);
            window.cancelAnimationFrame(this.bottomAnimation);
        },

        // 下滑动画实现
        addTranslateY(list, index) {
            if (list[index].translateY < 0) {
                // 判断是否足够下一次偏移
                if (list[index].translateY > -5) {
                    list[index].translateY = 0;
                } else {
                    list[index].translateY += 5;
                }
                this.topAnimation = window.requestAnimationFrame(() => {
                    this.addTranslateY(list, index);
                });
            }
        },

        // 上滑动画实现
        reduceTranslateY(list, index) {
            if (list[index].translateY > this.maxTranslateY) {
                // 判断是否足够下一次偏移
                if (list[index].translateY < this.maxTranslateY + 5) {
                    list[index].translateY = this.maxTranslateY;
                } else {
                    list[index].translateY -= 5;
                }
                this.bottomAnimation = window.requestAnimationFrame(() => {
                    this.reduceTranslateY(list, index);
                });
            }
        },
    },
};
