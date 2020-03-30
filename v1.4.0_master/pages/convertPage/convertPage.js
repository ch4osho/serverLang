// pages/convertPage/convertPage.js
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userSecrets: app.globalData.userSecrets,
        isLogin: app.globalData.isLogin,
        convertPageParams: null,
        courseInfo: null,
        showModal: false,
        showBuyModal: false,
        countDownClock: null,
        remainingMilliSeconds: null,
        timeout: null,
        endTime: null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let that = this;
        that.setData({
            isLogin: app.globalData.isLogin
        })
        let {
            c
        } = JSON.parse(options.params);
        that.setData({
            convertPageParams: c
        });
        if (app.globalData.isLogin === true) {
            that.getConvertPage();
        }

    },
    onUnload: function() {
        let that = this;
        clearTimeout(that.data.timeout);
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        return {
            title: '学得慧',
            path: 'pages/index/index'
        }
    },
    /**
     * 获取用户手机号
     */
    getPhoneNumber(e) {
        let that = this;
        wx.request({
            url: `${app.globalData.domain}${app.globalData.appApi}/auth/mp/loginByPhone`,
            method: `POST`,
            data: {
                openId: app.globalData.openid,
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv
            },
            success: res => {
                app.globalData.isLogin = true;
                that.setData({
                    isLogin: true
                })
                app.globalData.token = res.data.data.token;
                app.globalData.xdhLoginUserInfo = res.data.data.userInfo;
                that.getConvertPage();
            },
            // fail: err => {
            //     console.log(err);
            // }
        })
    },
    getConvertPage() {
        let that = this;
        wx.request({
            // url: `http://edustatic-demo.my4399.com/webapi/trial/index?c=${that.data.convertPageParams}`,
            url: `${app.globalData.domain}${app.globalData.webApi}/trial/index?c=${that.data.convertPageParams}`,
            success: res => {
                if (res.data.status !== 0) {
                    throw new Error(`获取课程包失败`);
                }
                // console.log(`---课程内容---`)
                // console.log(res.data.data)
                that.setData({
                    courseInfo: res.data.data
                });
                that.setData({
                    endTime: res.data.data.remindTimeInMs + new Date().getTime()
                })
                that.countDown(that);
            },
            fail: err => {
                console.log(err);
            }
        })
    },
    /**
     * 这三个是选择报名课程的模态窗
     */
    showModal() {
        this.setData({
            showModal: true
        })
    },
    hideModal() {
        this.setData({
            showModal: false
        });
    },
    preventTouchMove() {},
    navigateToOrder(e) {
        let that = this,
            params = {
                c: that.data.convertPageParams,
                courseId: e.currentTarget.dataset.courseid,
                price: parseInt(e.currentTarget.dataset.trialprice)
            }
        wx.navigateTo({
            url: `../order/order?params=${JSON.stringify(params)}`,
        })
    },
    /**
     * 这2个是展示安心购内容的
     */
    showModal2() {
        this.setData({
            showBuyModal: true
        })
    },
    hideModal2() {
        this.setData({
            showBuyModal: false
        });
    },
    countDown(that) {
        let now = new Date().getTime();
        let remaining = that.data.endTime - now;
        if (remaining < 0) {
            clearTimeout(that.data.timeout);
            that.setData({
                countDownClock: "已经截止"
            });
        } else {
            let countDownClock = that.dateFormat(remaining);
            that.setData({
                countDownClock
            });
            that.setData({
                timeout: setTimeout(function() {
                    countDownClock -= 10;
                    that.countDown(that);
                }, 10)
            })
        }
    },
    dateFormat(ms) {
        let that = this,
            date = new Date(ms),
            milliSecond = date.getMilliseconds() % 100,
            second = date.getSeconds(),
            minute = date.getMinutes(),
            hour = date.getHours();
        const formatNumber = n => {
            n = n.toString();
            return n[1] ? n : '0' + n;
        }
        return [hour, minute, second, milliSecond].map(formatNumber).join(':')
    },

})