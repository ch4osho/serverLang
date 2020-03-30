// pages/purchaseSuccessful/purchaseSuccessful.js
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showModal: false,
        orderId: null,
        courseDetails: null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let that = this,
            params = JSON.parse(options.params);
        // console.log(`---传过来的订单id---`);
        // console.log(params);
        that.setData({
            orderId: params.orderId
        })
        that.getCourseDetails();
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

    showDownloadModal() {
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

    /**
     * 添加到剪切板
     */
    addToClipBoard() {
        let that = this;
        wx.setClipboardData({
            data: that.data.courseDetails.contact,
            success: function(res) {}
        })
    },
    /**
     * 获取课程详情信息
     */
    getCourseDetails() {
        let that = this;
        wx.request({
            url: `${app.globalData.domain}${app.globalData.appApi}/customer/getMyOrderDetail`,
            method: 'POST',
            header: {
                token: `Bearer ${app.globalData.token}`
            },
            data: {
                orderId: that.data.orderId
            },
            success: res => {
                // console.log(res);
                if (res.data.status == 403) {
                    throw new Error(`无权限`);
                }
                // console.log(`---这里是获取课程详情成功的---`);
                // console.log(res.data.data.detail[0]);
                that.setData({
                    courseDetails: res.data.data.detail[0]
                })
            },
            // fail: err => {
            //     console.log(`---这里是获取课程详情失败的---`)
            //     console.log(err)
            // }
        })
    }
})