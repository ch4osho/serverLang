<template>
    <div id="nav">
        <div class="logo">
            <img src="../assets/lg.png" alt="学得慧logo" />
        </div>
        <div class="title">学得慧数据后台系统</div>
        <div class="user">
            <div class="login">欢迎回来，</div>
            <div class="ava">
                <el-dropdown @command="handleCommand">
                    <span class="el-dropdown-link" style="cursor: poniter;">
                        {{ userName }}
                        <i class="el-icon-arrow-down el-icon--right"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="1" disabled
                            >修改密码</el-dropdown-item
                        >
                        <el-dropdown-item command="2"
                            >退出登录</el-dropdown-item
                        >
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            userName: localStorage.getItem('nickName')
        };
    },
    methods: {
        handleCommand(command) {
            switch (command) {
                case '1':
                    break;
                case '2':
                    this.$router.push('/login');
                    break;
                default:
                    break;
            }
        }
    }
};
</script>

<style lang="scss" scoped>
#nav {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin: auto;
    height: 60px;
    width: 100%;
    background-color: $theme;
    background: linear-gradient(160deg, $theme 20%,#33D9A6 80%);
    
    .logo {
        width: 80px;
        text-align: center;
        margin: auto;
        height: 50px;
        img {
            width: 50px;
            height: 50px;
        }
    }
    .title {
        width: 200px;
        font-size: 20px;
        font-weight: bold;
        text-align: left;
        margin: auto;
        height: 50px;
        color: $white;
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }
    .user {
        color: $white;
        margin: auto;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        padding-right: 20px;
        width: calc(100% - 280px);
        height: 50px;
        line-height: 50px;
        .login {
            height: 50px;
            line-height: 50px;
            width: 80px;
        }
        .ava {
            height: 50px;
            line-height: 50px;
            width: 100px;
            cursor: pointer;
        }
    }
}
.el-dropdown-link {
    color: $white;
}
.el-dropdown-menu__item:hover {
    color: $theme;
}
</style>
