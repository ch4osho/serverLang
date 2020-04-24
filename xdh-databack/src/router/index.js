import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/home',
        name: 'home',
        component: () =>
            import(/* webpackChunkName: "home" */ '../views/Home.vue'),
        meta: {
            keepAlive: true,
            label: '首页'
        }
    },
    {
        path: '/login',
        name: 'login',
        component: () =>
            import(/* webpackChunkName: "login" */ '../views/Login.vue'),
        meta: {
            keepAlive: false,
            label: '登录'
        }
    },
    {
        path: '/liveCourse',
        name: 'liveCourse',
        component: () =>
            import(/* webpackChunkName: "user" */ '../views/live/liveCourse.vue'),
        meta: {
            keepAlive: true,
            label: '课程直播情况'
        }
    },
    {
        path: '/courseLog',
        name: 'courseLog',
        component: () =>
            import(
                /* webpackChunkName: "courseLog" */ '../views/log/CourseLog.vue'
            ),
        meta: {
            keepAlive: true,
            label: '上课日志情况'
        }
    },
    {
        path: '/lives',
        name: 'lives',
        component: () =>
            import(
                /* webpackChunkName: "lives" */ '../views/live/lives.vue'
            ),
        meta: {
            keepAlive: true,
            label: '实时课程情况'
        }
    },
    {
        path: '/liveCourseDetail',
        name: 'liveCourseDetail',
        component: () =>
            import(
                /* webpackChunkName: "lives" */ '../views/live/liveCourseDetail.vue'
            ),
        meta: {
            keepAlive: true,
            label: '用户参与情况'
        }
    },
    {
        path: '/liveCourseUsers',
        name: 'liveCourseUsers',
        component: () =>
            import(
                /* webpackChunkName: "lives" */ '../views/live/liveCourseUsers.vue'
            ),
        meta: {
            keepAlive: true,
            label: '课程用户查询'
        }
    },
    {
        path: '/loginLog',
        name: 'loginLog',
        component: () =>
            import(/* webpackChunkName: "loginLog" */ '../views/log/LoginLog.vue'),
        meta: {
            keepAlive: true,
            label: '登录日志'
        }
    },
    {
        path: '/eventLog',
        name: 'eventLog',
        component: () =>
            import(/* webpackChunkName: "eventLog" */ '../views/log/EventLog.vue'),
        meta: {
            keepAlive: true,
            label: '事件埋点日志'
        }
    },
    {
        path: '/purchaseLog',
        name: 'purchaseLog',
        component: () =>
            import(/* webpackChunkName: "purchaseLog" */ '../views/log/PurchaseLog.vue'),
        meta: {
            keepAlive: true,
            label: '购买日志'
        }
    },
    {
        path: '/eventSearch',
        name: 'eventSearch',
        component: () =>
            import(/* webpackChunkName: "purchaseLog" */ '../views/log/EventSearch.vue'),
        meta: {
            keepAlive: true,
            label: '事件详情查询'
        }
    }
];

const router = new VueRouter({
    base: process.env.BASE_URL,
    routes
});

router.onError(error => {
    const pattern = /Loading chunk (\d)+ failed/g;
    const isChunkLoadFailed = error.message.match(pattern);
    const targetPath = router.history.pending.fullPath;
    if (isChunkLoadFailed) {
        router.replace(targetPath);
    }
});

router.beforeEach((to, from, next) => {
    if (to.path !== '/login') {
        if (
            localStorage.getItem('token') &&
            new Date().getTime() < parseInt(localStorage.getItem('expiretime'))
        ) {
            next();
        } else {
            next({
                path: '/login'
            });
        }
    } else {
        localStorage.removeItem(`token`);
        localStorage.removeItem(`expiretime`);
        localStorage.removeItem(`nickName`);
        next();
    }
});

export default router;
