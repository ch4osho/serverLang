import MessageVue from "./Index.vue";
// 定义插件对象
const Message = {};
// vue的install方法，用于定义vue插件
Message.install = function(Vue, options) {
    const MessageInstance = Vue.extend(MessageVue);
    let currentMsg;
    const initInstance = () => {
        // 实例化vue实例
        currentMsg = new MessageInstance();
        const msgBoxEl = currentMsg.$mount().$el;
        document.body.appendChild(msgBoxEl);
    };
    initInstance();
    // 在Vue的原型上添加实例方法，以全局调用
    Vue.prototype.$message = {
        show(options) {
            if (!currentMsg) {
                initInstance();
            }
            if (typeof options === "string") {
                currentMsg.content = options;
            } else if (typeof options === "object") {
                Object.assign(currentMsg, options);
            }

            return currentMsg.show(options);
        },
        info(options) {
            if (!currentMsg) {
                initInstance();
            }
            if (typeof options === "string") {
                currentMsg.content = options;
            } else if (typeof options === "object") {
                Object.assign(currentMsg, options);
            }

            return currentMsg.info(options);
        },
        warn(options) {
            console.log("warn");
            if (!currentMsg) {
                initInstance();
            }
            if (typeof options === "string") {
                currentMsg.content = options;
            } else if (typeof options === "object") {
                Object.assign(currentMsg, options);
            }
            return currentMsg.warn(options);
        },
        error(options) {
            console.log("error");
            if (!currentMsg) {
                initInstance();
            }
            if (typeof options === "string") {
                currentMsg.content = options;
            } else if (typeof options === "object") {
                Object.assign(currentMsg, options);
            }
            return currentMsg.error(options);
        }
    };
};
export default Message;