// pages/order/order.js
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        courseDetail: null,
        orderDetails: null,
        countDownClock: null,
        endTime: null,
        timeout: null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let that = this,
            params = JSON.parse(options.params);
        that.setData({
            endTime: 1800000 + new Date().getTime()
        })
        that.countDown(that);
        wx.request({
            // url: `http://edustatic-demo.my4399.com/api/trial/courseDetail.json?c=${params.c}&courseId=${params.courseId}&price=${params.price}`,
            url: `${app.globalData.domain}${app.globalData.appApi}/trial/courseDetail.json?c=${params.c}&courseId=${params.courseId}&price=${params.price}`,
            success: res => {
                if (res.data.status !== 0) {
                    throw new Error();
                }
                that.setData({
                    courseDetail: res.data.data
                })
                wx.request({
                    // url: 'http://edustatic-demo.my4399.com/api/customer/generateOrder',
                    url: `${app.globalData.domain}${app.globalData.appApi}/customer/generateOrder`,
                    method: `POST`,
                    header: {
                        token: 'Bearer ' + app.globalData.token
                    },
                    data: {
                        orderChannel: `mini`,
                        courseIds: [params.courseId],
                        withMaterial: res.data.data.giftList.length > 0,
                        packageId: `default`
                    },
                    success: res => {
                        // console.log(`---这里是生成订单成功的res.data---`)
                        // console.log(res.data);
                        if (res.data.status != 0) {
                            // console.log(res.data.message)
                            wx.showModal({
                                title: '提示',
                                content: res.data.message,
                                showCancel: false,
                                success(res) {
                                    wx.navigateBack({
                                        delta: 1
                                    })
                                }
                            })
                        } else {
                            that.setData({
                                orderDetails: res.data.data
                            })
                        }
                    },
                    // fail: err => {
                    //     console.log(`---这里是生成订单失败的---`)
                    //     console.log(err);
                    // }
                })
            },
            // fail: err => {
            //     console.lg(`---这里是获取课程详情失败的---`)
            //     console.log(err);
            // }
        });

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {
        let that = this;
        if (that.data.orderDetails !== null && that.data.orderDetails.orderId) {
            that.cancelOrder();
        }
        clearTimeout(that.data.timeout);
    },

    onShareAppMessage() {
        return {
            title: '学得慧',
            path: 'pages/index/index'
        }
    },

    /**
     * 发起支付
     */
    payNow: function(e) {
        var that = this;
        let orderId = that.data.orderDetails.orderId,
            orderIdL4 = orderId.substring(orderId.length - 4);
        wx.request({
            // url: 'http://edustatic-demo.my4399.com/pay/pay/submit',
            url: `${app.globalData.domain}/pay/pay/submit`,
            method: `POST`,
            data: {
                bizAppId: app.globalData.bizAppId,
                reqTimestamp: new Date().getTime(),
                bizOrderNo: that.data.orderDetails.orderId,
                payType: `wx-mp`,
                tdUserIdentity: app.globalData.openid,
                title: `报名 - ${that.data.courseDetail.title} - ${orderIdL4}`,
                amount: parseFloat(that.data.orderDetails.orderAmount) * 100
            },
            success: info => {
                // console.log(`---这里是申请支付参数成功的---`)
                // console.log(info.data.data);
                let payInfo = JSON.parse(info.data.data.payInfo);
                that.requestPayment(payInfo)
            },
            // fail: err => {
            //     console.log(`---这里是申请支付参数失败的---`)
            //     console.log(err);
            // }
        })
    },
    requestPayment: function(payInfo) {
        let that = this;
        wx.requestPayment({
            timeStamp: payInfo.timeStamp,
            nonceStr: payInfo.nonceStr,
            package: payInfo.packageStr,
            signType: payInfo.signType,
            paySign: payInfo.sign,
            success: function(res) {
                // console.log(`---这里是发起支付成功的res.data包---`);
                // console.log(res.data);
                that.checkPayment();
            },
            // fail: function(err) {
            //     console.log(`---这里是发起支付失败的---`)
            //     console.log(err);
            // }
        })
    },
    checkPayment: function() {
        let that = this;
        wx.request({
            // url: `http://edustatic-demo.my4399.com/pay/biz/get?bizAppId=${app.globalData.bizAppId}&bizOrderNo=${that.data.orderDetails.orderId}`,
            url: `${app.globalData.domain}/pay/biz/get?bizAppId=${app.globalData.bizAppId}&bizOrderNo=${that.data.orderDetails.orderId}`,
            success: res => {
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
        })
    },
    navigateToSuccessful: function() {
        let that = this;
        let params = {
            orderId: that.data.orderDetails.orderId
        }
        wx.navigateTo({
            url: `../purchaseSuccessful/purchaseSuccessful?params=${JSON.stringify(params)}`,
        })
    },
    cancelOrder() {
        let that = this;
        wx.request({
            // url: 'http://edustatic-demo.my4399.com/api/customer/closeOrder',
            url: `${app.globalData.domain}${app.globalData.appApi}/customer/closeOrder`,
            method: `POST`,
            header: {
                token: `Bearer ${app.globalData.token}`
            },
            data: {
                orderId: that.data.orderDetails.orderId
            },
            // success: res => {
            //     console.log(`---取消订单成功res.data包---`);
            //     console.log(res.data);
            // },
            // fail: err => {
            //     console.log(`---取消订单失败---`)
            //     console.log(err);
            // }
        })
    },
    countDown(that) {
        let now = new Date().getTime(),
            remaining = that.data.endTime - now;
        if (remaining < 0) {
            that.setData({
                countDownClock: "已经截止"
            });
            clearTimeout(that.data.timeout);
            wx.showModal({
                title: '提示',
                content: '订单超时',
                showCancel: false,
                success(res) {
                    if (res.confirm) {
                        wx.navigateBack({})
                    }
                }
            })

        } else {
            let countDownClock = that.dateFormat(remaining);
            // console.log(countDownClock)
            that.setData({
                countDownClock
            });
            that.setData({
                timeout: setTimeout(function() {
                    countDownClock -= 1000;
                    that.countDown(that);
                }, 1000)
            });
        }
    },
    dateFormat(ms) {
        let that = this,
            date = new Date(ms),
            second = date.getSeconds(),
            minute = date.getMinutes();
        const formatNumber = n => {
            n = n.toString();
            return n[1] ? n : '0' + n;
        }
        return [minute, second].map(formatNumber).join('：')
    },
})