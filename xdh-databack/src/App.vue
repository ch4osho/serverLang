<template>
    <div id="app">
        <div v-if="$route.meta.keepAlive">
            <Header></Header>
            <div class="content-container">
                <!-- 侧边栏 -->
                <Aside></Aside>

                <!-- 右边内容区域 -->
                <div class="right-content">
                    
                    <!-- 路由历史栏 -->
                    <visited-menus></visited-menus>

                    <!-- 页面切换内容区域 -->
                    <div class="router-view">
                        <router-view></router-view>
                    </div>
                </div>
            </div>
        </div>
        <router-view v-if="!$route.meta.keepAlive"></router-view>
    </div>
</template>

<script>
import Header from './components/Header';
import Aside from './components/Aside';
import VisitedMenus from './components/VisitedMenus';
export default {
    components: {
        Header,
        Aside,
        VisitedMenus
    },
    watch: {
        $route(to, from) {
            // 路由为空不入栈
            if (to.name === null) return;

            // 首页和登录不入栈
            if (to.name === 'home' || to.name === 'login') return;

            // 访问过的不入栈
            if (
                this.$store.getters.visitedMenus.find(item => {
                    return item.name === to.name;
                })
            )
                return;

            this.$store.dispatch('addMenus', to);
        }
    }
};
</script>

<style lang="scss">
.content-container {
    height: calc(100% - 60px);
    width: 100%;
    position: fixed;
    display: flex;
    top: 60px;
    display: flex;
}

.right-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}

.router-view {
    width: stretch;
    flex: 1;
    height: calc(100% - 60px);
}
</style>
