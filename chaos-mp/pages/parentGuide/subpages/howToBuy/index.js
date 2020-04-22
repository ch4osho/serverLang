// pages/parentGuide/subpages/howToBuy/howToBuy.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        currentTab: 0,
        clientHeight: app.globalData.windowHeight,
        system: app.globalData.systemInfo.system,
        ios: `https://web.xuexiyuansu.com/images/miniprogramimages/-36875423_1583547210947.png`,
        android: `https://web.xuexiyuansu.com/images/miniprogramimages/-1794480965_1583547196463.png`
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let that = this;
        if (that.data.system.toLowerCase().includes(`ios`)) {
            that.setData({
                currentTab: 1
            })
        } else {
            that.setData({
                currentTab: 0
            })
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        return {
            title: `如何购买课程？`,
            path: 'pages/parentGuide/subpages/whereToBuy/whereToBuy'
        }
    },
    /**
     * 滑动切换
     */
    swiperTab(e) {
        var that = this;
        that.setData({
            currentTab: e.detail.current
        });
    },
    /**
     * 点击切换
     */
    clickTab(e) {
        var that = this;
        if (this.data.currentTab === e.target.dataset.current) {
            return false;
        } else {
            that.setData({
                currentTab: e.target.dataset.current
            })
        }
    },
    /**
     * 点击查看大图
     */
    clickImage(e) {
        let that = this;
        wx.previewImage({
            urls: [that.data.ios, that.data.android],
            current: '',
            success(res) {},
            fail(res) {},
            complete(res) {},
        })
    },
    /**
     * 跳转下载指导页
     */
    navigateToDownload() {
        wx.navigateTo({
            url: '../howToDownload/index',
        })
    }
})