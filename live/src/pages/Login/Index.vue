<template>
  <div class="page">
    <div class="logo-name">
      <img src="@/assets/images/logo.png" alt />
    </div>
    <div class="logo">
      <img src="@/assets/images/logo.jpg" alt />
    </div>
    <div class="login_form">
      <div :class="'login_form-item '+ userborder">
        <div class="icon icon-user"></div>
        <input type="text" placeholder="请输入用户名" v-model="userName" @focus="userFocus" />
      </div>
      <div :class="'login_form-item '+ pwdborder">
        <div class="icon icon-lock"></div>
        <input type="password" placeholder="请输入密码" v-model="password" @focus="pwdFocus" />
        <!-- <div class="icon br-l icon-preview" size="23"></div> -->
      </div>
      <div class="login-btn br" @click="login">{{btnText}}</div>

      <div class="login-change">
        <div class="change-type" @click="login">短信验证码登录</div>
        <div class="forget-password">忘记密码？</div>
      </div>
    </div>
  </div>
</template>
 
 
 
<script>
export default {
  data() {
    return {
      userName: "",
      password: "",
      isBtnLoading: false,
      userborder: " br-b",
      pwdborder: " br-b"
    };
  },
  created() {
    if (
      localStorage.getItem("user") &&
      JSON.parse(localStorage.getItem("user")).userName
    ) {
      this.userName = JSON.parse(localStorage.getItem("user")).userName;
      this.password = JSON.parse(localStorage.getItem("user")).password;
    }
  },
  computed: {
    btnText() {
      if (this.isBtnLoading) return "登录中...";
      return "立即登录";
    }
  },
  methods: {
    userFocus: function() {
      this.userborder = " br-b-focus";
      this.pwdborder = " br-b";
    },
    pwdFocus: function() {
      this.userborder = " br-b";
      this.pwdborder = " br-b-focus";
    },
    login: function() {
      this.$log.info("double clock!");
      if (!this.userName || !this.password) {
        this.$message.error("账号或密码不能为空！");
        return;
      }
      if (this.userName !== "admin" || this.password !== "admin") {
        this.$message.error("账号或密码错误！");
        return;
      }
      localStorage.setItem(
        "user",
        JSON.stringify({
          userName: this.userName,
          password: this.password
        })
      );
      this.isBtnLoading = true;
      localStorage.removeItem("token");
      localStorage.setItem("token", "testtoken");
      // this.$router.replace("/home");
      this.$router.replace("/index");
    }
  }
};
</script>
<style lang="stylus" scoped>
.br {
  border: 1px solid #c0c0c0;
}

.br-l {
  border-left: 1px solid #c0c0c0;
}

.br-r {
  border-right: 1px solid #c0c0c0;
}

.br-b {
  border-bottom: 1px solid #c0c0c0;
}

.br-b-focus {
  border-bottom: 1px solid #1b97fc;
  color: #1b97fc;
}

.page {
  position: relative;
  padding: 5%;
  user-select: none;
  text-align: center

  .logo-name {
    width: 100%;
    min-height: 130px;
    max-height: 200px;

    img {
      min-width: 100px;
    }
  }

  .logo {
    width: 100%;
    min-height: 150px;

    img {
      min-height: 150px;
      min-width: 150px;
      max-height: 240px;
      max-width: 240px;
      border-radius: 50%;
    }
  }

  .login_form {
    padding-top: 50px;

    .login_form-item {
      width: 100%;
      min-width: 300px;
      max-width: 500px;
      margin: auto;
      height: 40px;
      line-height: 40px;
      margin-bottom: 20px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      font-size: 20px;

      .icon {
        min-width: 50px;
      }

      input {
        width: 100%;
        padding-left: 10px;
        padding-right: 10px;
        text-align: center;
        max-height: 40px;
        line-height: 40px;
        border: none;
        background: none;
        outline: none;
      }

      input:focus {
        color: #1b97fc;
      }
    }

    .login-btn {
      width: 50%;
      min-width: 80px;
      max-width: 400px;
      margin: auto;
      margin-top: 5%;
      height: 40px;
      line-height: 40px;
      text-align: center;
      border-radius: 20px;
      border: none;
      background: #00d090;
      color: white;
      cursor: pointer;
    }

    .login-change {
      width: 48%;
      min-width: 80px;
      max-width: 360px;
      margin: auto;
      margin-bottom: 20px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      font-size: 14px;
      border: none;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      color: #989898;
      cursor: pointer;

      .change-type {
        color: #1c38fbf5;
      }

      .forget-password {
        text-decoration: underline;
      }
    }
  }
}
</style>
