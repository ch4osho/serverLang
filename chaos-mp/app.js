// app.js
const api = require("config/api.js");
const http = require("utils/http.js");
App({
    onLaunch: function() {
        wx.$apis = api.apiList;
        wx.$post = http.post;
        wx.$get = http.get;
        let that = this;

        // 展示本地存储能力
        // var logs = wx.getStorageSync('logs') || []
        // logs.unshift(Date.now())
        // wx.setStorageSync('logs', logs)

        // 登录
        wx.login({
            success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
                wx.$post({
                    url: wx.$apis.login,
                    data: {
                        "code": res.code
                    },
                    success: info => {
                        // console.log(info.data);
                        that.globalData.openid = info.data.data.openid;
                        // console.log(`app全局内容${that.globalData.openid}`)
                    },
                    fail: err => {
                        console.log(`---小程序用户登录失败---`)
                        console.log(err);
                    }
                })
            }
        })

        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            // console.log(res);
                            // 可以将 res 发送给后台解码出 unionId
                            this.globalData.userInfo = res.userInfo
                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res)
                            }
                        }
                    })
                }
            }
        })
        this.getSystemInfo();
    },
    /* 获取用户手机系统参数 */
    getSystemInfo() {
        let that = this;
        wx.getSystemInfo({
            success: function(res) {
                that.globalData.systemInfo = res;
                that.globalData.windowHeight = res.windowHeight;
                that.globalData.windowWidth = res.windowWidth;
                if (res.system.toLowerCase().includes(`ios`)) {
                    that.globalData.isIOS = true;
                } else {
                    that.globalData.isIOS = false;
                }
                // 本地存储是否是刘海屏幕
                wx.setStorageSync('isFringeScreen', that.isFringeScreen())
            },
        })
    },
    // 判断是不是刘海屏
    isFringeScreen(){
        let isFringeScreen = false,
            fringeScreenList = ['iPhone XS','iPhone X','iPhone XS Max', 'iPhone XR'];

        fringeScreenList.forEach(item=>{
            if(this.globalData.systemInfo.model.includes(item)) isFringeScreen = true
        })

        return isFringeScreen
    },
    globalData: {
        userInfo: null,
        systemInfo: null,
        windowWidth: null,
        windowHeight: null,
        isIOS: null,
        userSecrets: null,
        isLogin: false,
        openid: null,
        token: null,
        xdhLoginUserInfo: null,
    }
})