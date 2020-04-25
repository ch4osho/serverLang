import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Mousetrap from "./assets/js/app/ShortCut.js";
import Message from "./components/Message/index";
const log = require("./assets/js/app/log.js");
Vue.prototype.$log = log;
Vue.use(Message);
Vue.config.productionTip = false;
router.beforeEach((to, from, next) => {
    if (to.path == "/login") {
        next();
    } else {
        if (!localStorage.getItem("token")) {
            next({ path: "/login" });
        } else {
            next();
        }
    }
});
new Vue({
    router,
    store,
    render: h => h(App)
}).$mount("#app");