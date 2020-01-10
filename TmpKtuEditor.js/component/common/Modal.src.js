(function () {
    Ktu.modal = Vue.component('Modal', {
        template: `
        <div class="f_DNSTraffic TheModal isTop" v-transfer-dom :data-transfer="transfer">
            <transition :name="transitionNames[1]" v-if="maskAnimate && !isMoreModal">
                <div :class="maskClasses" v-show="visible" @click="mask" v-if="showMask"></div>
            </transition>
            <div v-else>
                <div :class="maskClasses" v-show="visible" @click="mask" v-if="showMask"></div>
            </div>
            <div :class="wrapClasses" @mousedown="handleWrapMousedown" @click="handleWrapClick">
                <transition :name="transitionNames[0]" @after-leave="animationFinish">
                    <div :class="classes" :style="mainStyles" v-show="visible">
                        <div :class="[prefixCls + '-content']">
                            <div :class="[prefixCls + '-close']" v-if="closable" @click="close">
                                <slot name="close">
                                    <svg class="svg-icon" width="12" height="12">
                                        <use xlink:href="#svg-close-icon"></use>
                                    </svg>
                                </slot>
                            </div>
                            <div :class="[prefixCls + '-header']" v-if="showHead"><slot name="header"><div :class="[prefixCls + '-header-inner']">{{ title }}</div></slot></div>
                            <div :class="[prefixCls + '-body']"><slot></slot></div>
                            <div :class="[prefixCls + '-footer']" v-if="!footerHide">
                                <slot name="footer">
                                    <btn type="text" size="large" @click.native="cancel">{{ localeCancelText }}</btn>
                                    <btn type="primary" size="large" :loading="buttonLoading" @click.native="ok">{{ localeOkText }}</btn>
                                </slot>
                            </div>
                        </div>
                    </div>
                </transition>
            </div>
        </div>
        `,
        name: 'Modal',
        mixins: [Ktu.mixins.emitter, Ktu.mixins.scrollBar],
        directives: {
            transferDom: Ktu.directive.transferDom,
        },
        props: {
            value: {
                type: Boolean,
                default: false,
            },
            closable: {
                type: Boolean,
                default: true,
            },
            maskClosable: {
                type: Boolean,
                default: true,
            },
            title: {
                type: String,
            },
            width: {
                type: [Number, String],
                default: 520,
            },
            okText: {
                type: String,
                default: '确认',
            },
            cancelText: {
                type: String,
                default: '取消',
            },
            loading: {
                type: Boolean,
                default: false,
            },
            styles: {
                type: Object,
            },
            downloadModalStyles: {
                type: Object,
            },
            className: {
                type: String,
            },
            modalClass: {
                type: String,
            },
            // for instance
            footerHide: {
                type: Boolean,
                default: false,
            },
            scrollable: {
                type: Boolean,
                default: false,
            },
            transitionNames: {
                type: Array,
                default() {
                    return ['ease', 'fade'];
                },
            },
            transfer: {
                type: Boolean,
                default: true,
            },
            // 是否需要Mask
            showMask: {
                type: Boolean,
                default: true,
            },
            // mask是否需要动画
            maskAnimate: {
                type: Boolean,
                default: true,
            },
            maskClick: {
                type: Function,
                default() {},
            },
            removeESC: {
                type: Boolean,
                default: false,
            },
        },
        data() {
            return {
                prefixCls: 'ktu-modal',
                wrapShow: false,
                showHead: true,
                buttonLoading: false,
                visible: this.value,
                isMoreModal: false,
                isShowMask: true,
            };
        },
        created() {
            // 判断是否存在其他弹窗  如果存在，则禁止
            this.isMoreModal = Boolean($('.TheModal').length);
        },
        computed: {
            wrapClasses() {
                const { prefixCls } = this;
                const obj = {};
                obj[`${prefixCls}-hidden`] = !this.wrapShow;
                obj[this.className] = !!this.className;
                obj[this.modalClass] = !!this.modalClass;

                return [`${prefixCls}-wrap`, obj];
            },
            maskClasses() {
                return `${this.prefixCls}-mask`;
            },
            classes() {
                return this.prefixCls;
            },
            mainStyles() {
                const style = {};

                const width = parseInt(this.width, 10);
                const styleWidth = {
                    width: width <= 100 ? `${width}%` : `${width}px`,
                };

                const customStyle = this.styles ? this.styles : {};
                Object.assign(style, styleWidth, customStyle);

                return style;
            },
            localeOkText() {
                return this.okText;
            },
            localeCancelText() {
                return this.cancelText;
            },
            qrIsTop: {
                get() {
                    return this.$store.state.base.qrIsTop;
                },
                set(value) {
                    this.$store.state.base.qrIsTop = value;
                },
            },
        },
        watch: {
            isShow: {
                handler(value) {
                    console.log('watch', value);
                },
                immediate: true,
            },
        },
        methods: {
            close() {
                if (document.querySelectorAll('.TheModal').length <= 1) this.qrIsTop = true;
                if ($(this.$el).siblings('.TheModal').length >= 1) $(this.$el).siblings('.TheModal')
                    .eq(0)
                    .addClass('isTop');
                this.visible = false;
                this.$emit('input', false);
                this.$emit('on-cancel');
                this.$store.commit('base/maskState', false);
                this.$store.commit('base/setModelClose', true);
            },
            mask() {
                if (this.maskClosable) {
                    this.maskClick();
                    this.close();
                }
            },
            handleWrapMousedown(event) {
                const className = event.target.getAttribute('class');
                if (className && className.indexOf(`${this.prefixCls}-wrap`) > -1) {
                    this.wrapMousedown = true;
                }
            },
            handleWrapClick(event) {
                // use indexOf,do not use === ,because ivu-modal-wrap can have other custom className
                const className = event.target.getAttribute('class');
                if (className && className.indexOf(`${this.prefixCls}-wrap`) > -1 && this.wrapMousedown) {
                    this.mask();
                }
                this.wrapMousedown = false;
            },
            cancel() {
                this.close();
            },
            ok() {
                if (this.loading) {
                    this.buttonLoading = true;
                } else {
                    this.visible = false;
                    this.$emit('input', false);
                }
                this.$emit('on-ok');
            },
            EscClose(e) {
                if (this.removeESC) return;
                if (this.visible) {
                    if (e.keyCode === 27) {
                        // 判断是当前的modal是否顶层
                        if ($(this.$el).hasClass('isTop')) {
                            this.close();
                        }
                    }
                }
            },
            animationFinish() {
                this.$emit('on-hidden');
            },
        },
        mounted() {
            if (this.visible) {
                this.wrapShow = true;
            }

            let showHead = true;

            if (this.$slots.header === undefined && !this.title) {
                showHead = false;
            }

            this.showHead = showHead;

            this.$nextTick(() => {
                $(this.$el)
                    .siblings('.TheModal')
                    .removeClass('isTop');
            });

            // ESC close
            document.addEventListener('keydown', this.EscClose);
        },
        beforeDestroy() {
            document.removeEventListener('keydown', this.EscClose);
        },
        watch: {
            value(val) {
                this.visible = val;
            },
            visible(val) {
                if (val === false) {
                    this.buttonLoading = false;
                    this.timer = setTimeout(() => {
                        this.wrapShow = false;
                        if (!this.isMoreModal) {
                            this.removeScrollEffect();
                        }
                    }, 300);
                } else {
                    if (this.timer) clearTimeout(this.timer);
                    this.wrapShow = true;
                    if (!this.scrollable) {
                        this.addScrollEffect();
                    }
                }
                this.broadcast('Table', 'on-visible-change', val);
                this.$emit('on-visible-change', val);
            },
            loading(val) {
                if (!val) {
                    this.buttonLoading = false;
                }
            },
            scrollable(val) {
                if (!val) {
                    this.addScrollEffect();
                } else {
                    this.removeScrollEffect();
                }
            },
            title(val) {
                if (this.$slots.header === undefined) {
                    this.showHead = !!val;
                }
            },
        },
    });

    Vue.prototype.$Modal = Ktu.modal;

    Ktu.modal.newInstance = function (properties) {
        const _props = properties || {};

        const prefixCls = 'ktu-modal-confirm';

        const Instance = new Vue({
            data: Object.assign({}, {
                visible: false,
                width: 416,
                title: '',
                body: '',
                iconType: '',
                iconName: '',
                okText: '确定',
                cancelText: '取消',
                showCancel: false,
                loading: false,
                buttonLoading: false,
                scrollable: false,
                renderHead: true,
                renderClose: false,
            }, _props),
            render(h) {
                const self = this;
                const footerVNodes = [];
                // 确认按钮
                footerVNodes.push(h('btn', {
                    props: {
                        type: this.okBtnType || 'common',
                        btnClass: this.okClass || 'formCancle',
                    },
                    on: {
                        click: this.ok,
                    },
                }, this.localeOkText));
                // 取消按钮
                if (this.showCancel) {
                    footerVNodes.push(h('btn', {
                        props: {
                            type: 'cancel',
                        },
                        on: {
                            click: this.cancel,
                        },
                    }, this.localeCancelText));
                }

                const renderArr = [];

                // 渲染 头部
                let headRender;
                if (this.renderHead) {
                    headRender = h('div', {
                        attrs: {
                            class: `${prefixCls}-head`,
                        },
                    }, [
                        h('div', {
                            attrs: {
                                class: `${prefixCls}-head-title`,
                            },
                            domProps: {
                                innerHTML: this.title,
                            },
                        }),
                    ]);
                    renderArr.push(headRender);
                }

                // render content
                let bodyRender;
                if (this.render) {
                    bodyRender = h('div', {
                        attrs: {
                            class: `${prefixCls}-body ${prefixCls}-body-render`,
                        },
                    }, [this.render(h)]);
                } else {
                    let iconRender;
                    if (this.iconRender) {
                        iconRender = [
                            h('i', {
                                class: self.iconNameCls,
                            }),
                        ];
                    }
                    bodyRender = h('div', {
                        attrs: {
                            class: `${prefixCls}-body`,
                        },
                    }, [
                        h('div', {
                            class: self.iconTypeCls,
                        }, iconRender),
                        h('div', {
                            domProps: {
                                innerHTML: this.body,
                            },
                        }),
                    ]);
                }
                renderArr.push(bodyRender);

                // 渲染 关闭按钮
                let renderClose;
                if (this.renderClose) {
                    renderClose = h('div', {
                        attrs: {
                            class: 'ktu-modal-close',
                        },
                        on: {
                            click: this.cancel,
                        },
                        domProps: {
                            innerHTML: '<svg class="svg-icon" width="12" height="12"><use xlink:href="#svg-close-icon"></use></svg>',
                        },
                    });
                    renderArr.push(renderClose);
                }

                // 渲染 底部
                const footerRender = h('div', {
                    attrs: {
                        class: `${prefixCls}-footer`,
                    },
                }, footerVNodes);
                renderArr.push(footerRender);

                const modalClass = {};
                if (this.modalClass) {
                    modalClass[this.modalClass] = true;
                }
                return h('Modal', {
                    props: Object.assign({}, _props, {
                        width: this.width,
                        scrollable: this.scrollable,
                    }),
                    domProps: {
                        value: this.visible,
                    },
                    on: {
                        input(status) {
                            self.visible = status;
                        },
                    },
                }, [
                    h('div', {
                        attrs: {
                            class: prefixCls,
                        },
                    }, renderArr),
                ]);
            },
            computed: {
                iconTypeCls() {
                    return [
                        `${prefixCls}-body-icon`,
                        `${prefixCls}-body-icon-${this.iconType}`,
                    ];
                },
                iconNameCls() {
                    return [
                        'ktu-icon',
                        `ktu-icon-${this.iconName}`,
                    ];
                },
                localeOkText() {
                    return this.okText;
                },
                localeCancelText() {
                    return this.cancelText;
                },
                isQrCode() {
                    return this.$store.state.base.qrCodeEditor.show;
                },
            },
            methods: {
                cancel() {
                    this.$children[0].visible = false;
                    this.buttonLoading = false;
                    this.onCancel();
                    this.remove();
                    $(this.$el).siblings('.TheModal')
                        .addClass('isTop');
                },
                ok() {
                    if (this.loading) {
                        this.buttonLoading = true;
                    } else {
                        $(this.$el).siblings('.TheModal')
                            .addClass('isTop');
                        this.$children[0].visible = false;
                        this.remove();
                    }
                    this.onOk();
                },
                remove() {
                    const self = this;
                    setTimeout(() => {
                        self.destroy();
                    }, 300);
                },
                destroy() {
                    this.$destroy();
                    document.body.removeChild(this.$el);
                    this.onRemove();
                },
                onOk() {},
                onCancel() {},
                onRemove() {},
            },
            store: Ktu.store,
        });

        const component = Instance.$mount();
        document.body.appendChild(component.$el);
        const modal = Instance.$children[0];

        return {
            show(props) {
                modal.$parent.showCancel = props.showCancel;
                modal.$parent.iconType = props.icon;

                switch (props.icon) {
                    case 'info':
                        modal.$parent.iconName = 'information-circled';
                        break;
                    case 'success':
                        modal.$parent.iconName = 'checkmark-circled';
                        break;
                    case 'warning':
                        modal.$parent.iconName = 'android-alert';
                        break;
                    case 'error':
                        modal.$parent.iconName = 'close-circled';
                        break;
                    case 'confirm':
                        modal.$parent.iconName = 'help-circled';
                        break;
                }

                if ('width' in props) {
                    modal.$parent.width = props.width;
                }

                if ('title' in props) {
                    modal.$parent.title = props.title;
                }

                if ('content' in props) {
                    modal.$parent.body = props.content;
                }

                if ('okText' in props) {
                    modal.$parent.okText = props.okText;
                }

                if ('okClass' in props) {
                    modal.$parent.okClass = props.okClass;
                }

                if ('okBtnType' in props) {
                    modal.$parent.okBtnType = props.okBtnType;
                }

                if ('cancelText' in props) {
                    modal.$parent.cancelText = props.cancelText;
                }

                if ('onCancel' in props) {
                    modal.$parent.onCancel = props.onCancel;
                }

                if ('onOk' in props) {
                    modal.$parent.onOk = props.onOk;
                }

                // async for ok
                if ('loading' in props) {
                    modal.$parent.loading = props.loading;
                }

                if ('scrollable' in props) {
                    modal.$parent.scrollable = props.scrollable;
                }

                // notice when component destroy
                modal.$parent.onRemove = props.onRemove;

                modal.visible = true;
            },
            remove() {
                modal.visible = false;
                modal.$parent.buttonLoading = false;
                modal.$parent.remove();
            },
            component: modal,
        };
    };

    (function () {
        const modal = Vue.prototype.$Modal;

        let modalInstance;

        function getModalInstance(options) {
            const obj = Object.assign({
                closable: false,
                maskClosable: false,
                footerHide: true,
                render: options.render,
                renderHead: options.renderHead,
                renderClose: options.renderClose,
            });
            modalInstance = modalInstance || Ktu.modal.newInstance(obj);

            return modalInstance;
        }

        function confirm(options) {
            // const render = ('render' in options) ? options.render : undefined;
            const instance  = getModalInstance(options);

            options.onRemove = function () {
                modalInstance = null;
            };

            instance.show(options);
        }

        modal.info = function (props) {
            props = props || {};
            props.icon = 'info';
            props.showCancel = false;
            return confirm(props);
        };

        modal.success = function (props) {
            props = props || {};
            props.icon = 'success';
            props.showCancel = false;
            return confirm(props);
        };

        modal.warning = function (props) {
            props = props || {};
            props.icon = 'warning';
            props.showCancel = false;
            return confirm(props);
        };

        modal.error = function (props) {
            props = props || {};
            props.icon = 'error';
            props.showCancel = false;
            return confirm(props);
        };

        modal.confirm = function (props) {
            props = props || {};
            props.icon = 'confirm';
            props.showCancel = true;
            props.renderHead = false;
            props.renderClose = true;
            props.modalClass = 'confirmModal';
            return confirm(props);
        };

        modal.remove = function () {
            // at loading status, remove after Cancel
            if (!modalInstance) {
                return false;
            }

            const instance = getModalInstance();

            instance.remove();
        };
    }());
}());
