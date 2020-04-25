import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../pages/Home.vue";

Vue.use(VueRouter);

const routes = [{
        path: "/",
        redirect: "/login"
    },
    {
        path: "/login",
        name: "Login",
        component: () =>
            import ("../pages/Login/Index.vue")
    },
    {
        path: "/index",
        name: "Index",

        component: () =>
            import ("../pages/Index/index.vue")
    },
    {
        path: "/home",
        name: "Home",
        component: Home
    },
    {
        path: "/about",
        name: "About",

        component: () =>
            import ("../pages/About.vue")
    }
];
const router = new VueRouter({
    routes
});

export default router;