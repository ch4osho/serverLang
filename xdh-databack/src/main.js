import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import ElementUI from 'element-ui';

import { axios } from './util/request';
import api from './api/api'

import './static/index.scss';


// element-ui
import './static/element-ui/index.css';

import md5 from 'js-md5'

import echarts from 'echarts';

Vue.prototype.$echarts = echarts;

Vue.prototype.$api = api;


Vue.use(ElementUI);
Vue.prototype.$axios = axios;
Vue.prototype.$md5 = md5;
Vue.config.productionTip = false;

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');
