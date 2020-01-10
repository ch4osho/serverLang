Ktu.Notification = Vue.component('ktu-notification', {
    template: `
    <div :class="classes" :style="styles" class="f_DNSTraffic">
        <ktu-notice
            v-for="notice in notices"
            :key="notice.name"
            :prefix-cls="prefixCls"
            :styles="notice.styles"
            :type="notice.type"
            :content="notice.content"
            :duration="notice.duration"
            :closable="notice.closable"
            :name="notice.name"
            :transition-name="notice.transitionName"
            :on-close="notice.onClose">
        </ktu-notice>
    </div>
	`,
    name: 'ktu-notification',
    props: {
        prefixCls: {
            type: String,
            default: 'ktu-notification',
        },
        styles: {
            type: Object,
            default() {
                return {
                    top: '65px',
                    left: '50%',
                };
            },
        },
        content: {
            type: String,
        },
        className: {
            type: String,
        },
    },
    data() {
        return {
            notices: [],
            now: Date.now(),
            seed: 0,
        };
    },
    computed: {
        classes() {
            const obj = {};
            obj[this.prefixCls] = !!this.className;

            return [this.prefixCls, obj];
        },
    },
    methods: {
        getUuid() {
            return `${this.prefixCls}_${this.now}_${this.seed++}`;
        },
        add(notice) {
            const name = notice.name || this.getUuid();

            const _notice = Object.assign({
                styles: {
                    right: '50%',
                },
                content: '',
                duration: 1.5,
                closable: false,
                name,
            }, notice);

            this.notices.push(_notice);
        },
        close(name) {
            const { notices } = this;
            for (let i = 0; i < notices.length; i++) {
                if (notices[i].name === name) {
                    this.notices.splice(i, 1);
                    break;
                }
            }
        },
        closeAll() {
            this.notices = [];
        },
    },
});

Ktu.Notification.newInstance = function (properties) {
    const _props = properties || {};

    const Instance = new Vue({
        data: _props,
        render(h) {
            return h(Ktu.Notification, {
                props: _props,
            });
        },
    });

    const component = Instance.$mount();
    document.body.appendChild(component.$el);
    const notification = Instance.$children[0];

    return {
        notice(noticeProps) {
            notification.add(noticeProps);
        },
        remove(name) {
            notification.close(name);
        },
        component: notification,
        destroy(element) {
            notification.closeAll();
            setTimeout(() => {
                document.body.removeChild(document.getElementsByClassName(element)[0]);
            }, 500);
        },
    };
};

Ktu.notice = (function () {
    const prefixCls = 'ktu-message';
    const iconPrefixCls = 'ktu-icon';
    const prefixKey = 'ktu_message_key_';

    const defaults = {
        top: 24,
        duration: 3,
    };

    let messageInstance;
    let name = 1;

    const iconTypes = {
        info: 'information-circled',
        success: 'checkmark-circled',
        warning: 'android-alert',
        error: 'close-circled',
        loading: 'load-c',
    };

    function getMessageInstance() {
        messageInstance = messageInstance || Ktu.Notification.newInstance({
            prefixCls,
            styles: {
                top: `${defaults.top}px`,
            },
        });

        return messageInstance;
    }

    function notice(content, duration, type, onClose, closable) {
        content = content || '';
        duration = duration == undefined ? defaults.duration : duration;
        onClose = onClose || function () {};
        closable = closable || false;

        // if loading
        const loadCls = type === 'loading' ? ' ktu-load-loop' : '';
        const iconType = iconTypes[type];
        const instance = getMessageInstance();

        let divClass = `${prefixCls}-custom-content`;
        divClass += ` ${prefixCls}-${type}`;
        let iconClass = iconPrefixCls;
        iconClass += ` ${iconPrefixCls}-${iconType}${loadCls}`;
        instance.notice({
            name: prefixKey + name,
            duration,
            styles: {},
            transitionName: 'move-up',
            content: `\
            <div class='${divClass}'>\
                <i class='${iconClass}'></i>\
                <span>${content}</span>\
            </div>\
            `,
            onClose,
            closable,
            type: 'message',
        });

        // 用于手动消除
        return (function () {
            const target = name++;

            return function () {
                instance.remove(prefixKey + target);
            };
        }());
    }

    return {
        name: 'Message',
        info(options) {
            return this.message('info', options);
        },
        success(options) {
            return this.message('success', options);
        },
        warning(options) {
            return this.message('warning', options);
        },
        error(options) {
            return this.message('error', options);
        },
        loading(options) {
            return this.message('loading', options);
        },
        message(type, options) {
            if (typeof options === 'string') {
                options = {
                    content: options,
                };
            }
            return notice(options.content, options.duration, type, options.onClose, options.closable);
        },
        config(options) {
            if (options.top || options.top === 0) {
                defaults.top = options.top;
            }
            if (options.duration || options.duration === 0) {
                defaults.duration = options.duration;
            }
        },
        destroy() {
            const instance = getMessageInstance();
            messageInstance = null;
            instance.destroy(prefixCls);
        },
    };
}());
Vue.prototype.$Notice = Ktu.notice;
