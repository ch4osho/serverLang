<template>
    <div id="login">
        <img src="../assets/1024.png" class="logo" />
        <div class="content">
            <div class="left-content">
                <img src="../assets/loginback.jpg" />
            </div>
            <div class="right-content">
                <div class="row r1">学得慧数据后台系统</div>
                <div class="row row-input">
                    <el-input
                        type="text"
                        v-model="userName"
                        placeholder="用户名"
                    />
                </div>
                <div class="row row-input">
                    <el-input
                        type="password"
                        v-model="password"
                        @keyup.enter.native="login"
                        placeholder="密码"
                    />
                </div>
                <div class="row">
                    <el-button
                        type="primary"
                        round
                        :loading="isLogin"
                        class="btn"
                        @click="login"
                        >登录</el-button
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { postFetch } from '@util/request';

export default {
    data() {
        return {
            isLogin: false,
            userName: '',
            password: ''
        };
    },
    methods: {
        async login() {
            if ('' !== this.userName && '' !== this.password) {
                this.isLogin = true;
                const res = await postFetch(this.$api.login, {
                    account: this.userName,
                    password: this.$md5(this.password)
                });

                if (res.ERROR_CODE || !res.data) {
                    this.isLogin = false;
                    this.$message.error(`登录失败: ${res.ERROR_DES ? res.ERROR_DES : '服务器错误'}`);
                } else {
                    
                    if (res.data.status !== 0) {
                        this.isLogin = false;
                        this.$message.error(res.data.message);
                        return;
                    }

                    localStorage.setItem('token', res.data.data.token);
                    localStorage.setItem(
                        'expiretime',
                        res.data.data.expires_time
                    );
                    localStorage.setItem(
                        'nickName',
                        res.data.data.userInfo.nickName
                    );
                    this.$router.push('/home');
                }
            } else {
                this.$message.error('账号或密码不能为空！');
            }
        }
    }
};
</script>

<style lang="scss" scoped>
#login {
    background: white;
    position: relative;
    height: 100vh;
    width: 100%;
    .logo {
        position: absolute;
        top: 20px;
        left: 30px;
        width: 130px;
    }
}
.content {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    width: 50%;
    height: 60%;
    background: white;
    border-radius: 16px;
    z-index: 2;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: row;
    .left-content {
        width: 40%;
        border-radius: 16px;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background: $theme;
        .txtrow {
            color: white;
            font-size: 35px;
            height: 80px;
            line-height: 80px;
            font-weight: 600;
        }
        img {
            height: 100%;
            width: 100%;
            border-top-left-radius: 16px;
            border-bottom-left-radius: 16px;
        }
    }
    .right-content {
        flex: 1;
        background: white;
        border-radius: 16px;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
}

.row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex-grow: initial;
    width: 100%;
    height: 60px;
    line-height: 60px;
}
.r1 {
    color: $black4;
    margin: 0 auto;
    padding-bottom: 30px;
    font: {
        size: 32px;
    }
    display: flex;
    justify-content: center;
    align-items: center;
}
.row-input {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 55%;
}
.btn {
    height: 40px;
    font-size: 16px;
    width: 40%;
    background: $theme;
    border: none;
    margin-top: 30px;
}

</style>
