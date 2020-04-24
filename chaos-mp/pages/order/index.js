// pages/order/order.js
const app = getApp();

const config = require('../../config/config');

Page({
    /**
     * 页面的初始数据
     */
    data: {
        courseDetail: null,
        orderDetails: null,
        countDownClock: null,
        endTime: null,
        timeout: null,
        // NOTE: 页面加载带过来的参数记录
        params: null,
        isFringeScreen: wx.getStorageSync('isFringeScreen') || false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log('支付成功页的options',options)
        let that = this,
            params = options;
        that.setData({
            endTime: 1800000 + new Date().getTime(),
        });
        that.countDown(that);
        that.setData({
            params,
        });
        wx.$get({
            url: wx.$apis.getCourseDetail,
            data: {
                g: params.goodsId,
                c: params.c,
            },
            success: (res) => {
                // console.log(`商品详情`, res.data.data)
                if (res.data.status !== 0) {
                    throw new Error();
                }
                that.setData({
                    courseDetail: res.data.data,
                });
                wx.$post({
                    url: wx.$apis.generateOrder,
                    header: {
                        token: 'Bearer ' + app.globalData.token,
                    },
                    data: {
                        orderChannel: `miniprogram`,
                        goodIds: [params.goodsId],
                        withMaterial:
                            res.data.data.materialDetailList.length > 0,
                        // packageId: `default` // 非必填
                    },
                    success: (res) => {
                        // console.log(`---这里是生成订单成功的res.data---`);
                        // console.log(res.data);
                        if (res.data.status != 0) {
                            wx.showModal({
                                title: '提示',
                                content: res.data.message,
                                showCancel: false,
                                success(res) {
                                    wx.navigateBack({
                                        delta: 1,
                                    });
                                },
                            });
                        } else {
                            that.setData({
                                orderDetails: res.data.data,
                            });
                            console.log(`orderDetails`, that.data.orderDetails);
                        }
                    },
                });
            },
        });
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        let that = this;
        if (that.data.orderDetails !== null && that.data.orderDetails.orderId) {
            that.cancelOrder();
        }
        clearTimeout(that.data.timeout);
    },

    /**
     * 分享
     */
    onShareAppMessage() {
        return {
            title: '学得慧',
            path: 'pages/index/index',
        };
    },

    /**
     * 发起支付
     */
    payNow: function (e) {
        let that = this;
        let orderId = that.data.orderDetails.orderId,
            orderIdL4 = orderId.substring(orderId.length - 4);
        wx.$post({
            url: wx.$apis.log,
            data: {
                c: that.data.params.c,
                activePoint: `payconfirm`,
                userPhone: app.globalData.xdhLoginUserInfo.phone,
                courseid: that.data.params.goodsId,
                openid: app.globalData.openid,
                supporter: `miniprogram`
            },
        });
        wx.$post({
            url: wx.$apis.paySubmit,
            data: {
                bizAppId: config.bizAppId,
                reqTimestamp: new Date().getTime(),
                bizOrderNo: that.data.orderDetails.orderId,
                payType: `wx-mp`,
                tdUserIdentity: app.globalData.openid,
                title: `报名 - ${that.data.courseDetail.goodsName} - ${orderIdL4}`,
                amount: parseFloat(that.data.orderDetails.orderAmount) * 100,
            },
            success: (info) => {
                let payInfo = JSON.parse(info.data.data.payInfo);
                that.requestPayment(payInfo);
            },
        });
    },
    requestPayment: function (payInfo) {
        let that = this;
        wx.requestPayment({
            timeStamp: payInfo.timeStamp,
            nonceStr: payInfo.nonceStr,
            package: payInfo.packageStr,
            signType: payInfo.signType,
            paySign: payInfo.sign,
            success: function (res) {
                console.log(`---这里是发起支付成功的res.data包---`);
                console.log(res.data);
                that.checkPayment();
            },
            error: (err) => {
                console.log(`---这里是发起支付失败的err---`);
                console.log(err);
            },
        });
    },
    checkPayment: function () {
        let that = this;
        wx.$get({
            url: wx.$apis.checkPayment,
            data: {
                bizAppId: config.bizAppId,
                bizOrderNo: that.data.orderDetails.orderId,
            },
            success: (res) => {
                // console.log(`---检查支付情况的res.data包---`)
                // console.log(res.data)
                if (res.data.status != 0) {
                    throw new Error(`检查支付情况失败`);
                }
                // console.log(`---这里是检查支付情况成功的res.data包---`)
                // console.log(res.data);
                that.navigateToSuccessful();
            },
            // fail: err => {
            //     console.log(`---这里是检查支付情况失败的---`)
            //     console.log(err);
            // }
        });
    },
    navigateToSuccessful: function () {
        let that = this;
        let params = {
            orderId: that.data.orderDetails.orderId,
            c: that.data.params.c,
            type: that.data.params.type
        };
        wx.navigateTo({
            // url: `../purchaseSuccessful/index?params=${JSON.stringify(
            //     params
            // )}`,
            url: wx.$urlMaker(`../purchaseSuccessful/index`, params)
        });
    },
    cancelOrder() {
        let that = this;
        wx.$post({
            url: wx.$apis.closeOrder,
            header: {
                token: `Bearer ${app.globalData.token}`,
            },
            data: {
                orderId: that.data.orderDetails.orderId,
            },
        });
    },
    countDown(that) {
        let now = new Date().getTime(),
            remaining = that.data.endTime - now;
        if (remaining < 0) {
            that.setData({
                countDownClock: '已经截止',
            });
            clearTimeout(that.data.timeout);
            wx.showModal({
                title: '提示',
                content: '订单超时',
                showCancel: false,
                success(res) {
                    if (res.confirm) {
                        wx.navigateBack({});
                    }
                },
            });
        } else {
            let countDownClock = that.dateFormat(remaining);
            // console.log(countDownClock)
            that.setData({
                countDownClock,
            });
            that.setData({
                timeout: setTimeout(function () {
                    countDownClock -= 1000;
                    that.countDown(that);
                }, 1000),
            });
        }
    },
    dateFormat(ms) {
        let that = this,
            date = new Date(ms),
            second = date.getSeconds(),
            minute = date.getMinutes();
        const formatNumber = (n) => {
            n = n.toString();
            return n[1] ? n : '0' + n;
        };
        return [minute, second].map(formatNumber).join('：');
    },
});
