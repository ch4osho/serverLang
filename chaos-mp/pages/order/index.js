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
        errorDes: null,
        showErrorDialog: false,
        gradeList: [],
        currentGrade: 110,
        showMap: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this, params = options;
        that.setData({
            endTime: 1800000 + new Date().getTime(),
            params
        });
        // 倒数
        that.countDown(that);

        // v2版本需要获取班级字典
        if(options.type && options.type == 'v2'){
            this.getGradeMap()
        }

        wx.$get({
            url: wx.$apis.getCourseDetail,
            data: {
                g: params.goodsId,
                c: params.c,
            },
            success: (res) => {
                // console.log(`商品详情`, res.data.data)
                if (res.data.status !== 0) {
                    return that.setData({
                        errorDes: res.data.message,
                        showErrorDialog: true,
                    });
                }
                
                that.setData({
                    courseDetail: res.data.data,
                    // currentGrate: 
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
                        }
                    },
                });
            },
        });
    },

    searchGrade(){
        let grade = ''
        this.data.gradeList.forEach(item=>{
            item.filter.forEach(item=>{
                if(item.dickey == this.currentGrade) grade = item.dickey
            })

        })
    },

    // 获取班级字典
    getGradeMap(){
        let that = this
        wx.$post({
            url: wx.$apis.getGradeMap,
            data: {
                type: '100'
            },
            success(res){
                that.setData({
                    gradeList: that.gradeMapFormater(res.data.data)
                })
            },
            fail(err){
                console.log('getGradeMapERR',err)
            }
        })
    },

    // 字典处理
    gradeMapFormater(maps){

        let that = this

        // 年级分类
        maps.forEach(item=>{
            if(that.data.showMap[item.description]) {
                that.data.showMap[item.description].filter.push(item)
            } else {
                that.data.showMap[item.description] = {
                    filter: []
                }
                that.data.showMap[item.description].filter.push(item)
            }
        })

        
        var temp = [], middleClass = []

        // 对象转数组
        Object.keys(this.data.showMap).forEach(item=>{
            temp.push({
                grade: item,
                filter: [...that.data.showMap[item].filter]
            })
        })


        // 初中处理
        temp[1].filter.forEach(item=>{
            let dicval = ''

            switch(item.dicval){
                case '七年级':
                    dicval = '初一';
                    break;
                case '八年级':
                    dicval = '初二';
                    break;
                case '九年级':
                    dicval = '初三'
                    break;
                default:
                    dicval = '初一';
                    break;
            }

            middleClass.push({
                grade: dicval,
                filter: [item]
            })
        })


        return [temp[0], ...middleClass, temp[2]]
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
    changeCurrentGrade(e){
        this.setData({
            currentGrade: e.target.dataset.grade.grade
        })
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
            success: info => {
                if (info.data.status != 0) {
                    return that.setData({
                        errorDes: info.data.message,
                        showErrorDialog: true,
                    });
                }
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
                console.log(res);
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
                    return that.setData({
                        errorDes: res.data.message,
                        showErrorDialog: true,
                    });
                }
                // console.log(`---这里是检查支付情况成功的res.data包---`)
                // console.log(res.data);
                that.setData()
                that.navigateToSuccessful();
            },
            // fail: err => {
            //     console.log(`---这里是检查支付情况失败的---`)
            //     console.log(err);
            // }
        });
    },
    navigateToSuccessful: function () {
        // 清除timout
        if(this.data.timeout) clearTimeout(this.data.timeout)

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
