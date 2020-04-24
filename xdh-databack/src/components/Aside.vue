<template>
    <div class="menu" style="position: relative;">
        <el-container style="width: 100%; height: 100%;">
            <el-main style="padding: 0;">
                <el-menu
                    router
                    :default-active="$route.path"
                    class="el-menu-vertical"
                    :collapse="isCollapse"
                    active-text-color="#00d090"
                >
                    <el-menu-item @click="toCollapse">
                        <i :class="arrow"></i>
                        <span slot="title" v-if="isCollapse" class="global-text-theme">展 开 </span>
                        <span slot="title" v-else class="global-text-theme">收 起 </span>
                    </el-menu-item>
                    <!-- <el-menu-item index="/home">
                        <i class="el-icon-house"></i>
                        <span slot="title">首 页 </span>
                    </el-menu-item> -->
                    <el-submenu
                        v-for="submenu in asideArray"
                        :index="submenu.title"
                        :key="submenu.title"
                    >
                        <template slot="title">
                            <i :class="submenu.icon"></i>
                            <span>{{ submenu.title }}</span>
                        </template>
                        <el-menu-item
                            v-for="sub in submenu.subs"
                            :index="sub.index"
                            :key="sub.index"
                        >
                            <i :class="sub.icon"></i>
                            <span slot="title">{{ sub.label }}</span>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-main>
        </el-container>
    </div>
</template>
<script>
export default {
    data() {
        return {
            arrow: 'el-icon-arrow-left',
            isCollapse: false,
            asideArray: [
                {
                    title: '直播相关',
                    icon: 'el-icon-video-camera',
                    subs: [
                        {
                            icon: 'el-icon-monitor',
                            label: '直播课程情况',
                            index: '/liveCourse'
                        },
                        {
                            icon: 'el-icon-video-camera',
                            label: '实时课程情况',
                            index: '/lives'
                        },
                        {
                            icon: 'el-icon-user',
                            label: '用户参与情况',
                            index: '/liveCourseDetail'
                        },
                        {
                            icon: 'el-icon-document',
                            label: '课程用户查询',
                            index: '/liveCourseUsers'
                        }
                    ]
                },
                {
                    title: '日志',
                    icon: 'el-icon-bell',
                    subs: [
                        {
                            icon: 'el-icon-bell',
                            label: '上课日志记录',
                            index: '/courseLog'
                        },
                        {
                            icon: 'el-icon-mobile-phone',
                            label: '登陆日志',
                            index: '/loginLog'
                        },
                        {
                            icon: 'el-icon-star-off',
                            label: '事件埋点日志',
                            index: '/eventLog'
                        },
                        {
                            icon: 'el-icon-goods',
                            label: '购买日志',
                            index: '/purchaseLog'
                        },
                        {
                            icon: 'el-icon-chat-line-square',
                            label: '事件详情查询',
                            index: '/eventSearch'
                        }
                    ]
                }
            ]
        };
    },
    methods: {
        toCollapse() {
            this.isCollapse = !this.isCollapse;
            if (this.isCollapse) {
                this.arrow = 'el-icon-arrow-right';
            } else {
                this.arrow = 'el-icon-arrow-left';
            }
        }
    }
};
</script>

<style lang="scss" scoped>

.menu {
    margin: 0;
    padding: 0;
    height: 100%;
    font-size: 20px;
}
.el-menu-vertical {
    height: 100%;
    width: 60px;
    text-align: center;
}

.el-menu-vertical:not(.el-menu--collapse) {
    width: 200px;
    min-height: 400px;
}

.icon-container {
    position: absolute;
    color: $theme;
    text-align: right;
    font-size: 40px;
    font-weight: 900;
    cursor: pointer;
    z-index: 1000;
    right: -30px;
    top: 50%;
    transform: translateY(-50%) scale(.75,.75);
}
.el-menu-item {
    text-align: left;
}
.el-submenu {
    text-align: left;
}
.el-menu-vertical:not(.el-menu--collapse) {
    width: 200px;
}
.el-submenu .el-menu-item {
    min-width: 0;
}
/deep/ .is-active i {
    color: $theme !important;
}
/deep/ .el-menu-item > i,
/deep/ .el-submenu__title > i,
/deep/ .el-tooltip > i {
    color: $theme !important;
}
/deep/.el-menu-item.is-active > i {
    color: $theme !important;
}
/deep/.el-menu-item.is-active i {
    color: $theme !important;
}

// 滚动条
::-webkit-scrollbar-track {
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.02);
}

::-webkit-scrollbar-thumb {
    border-radius: 1000px;
    background-color: rgba($color: $theme, $alpha: 0.1);
}
</style>
