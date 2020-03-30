// // pages/parentGuide/subpages/howToDownload/howToDownload.js
const app = getApp()

Page({
    data: {
        currentTab: 0,
        clientHeight: app.globalData.windowHeight - (100 * (app.globalData.windowWidth / 750)),
        showModal: false,
        system: app.globalData.systemInfo.system,
        ios: `https://web.xuexiyuansu.com/images/miniprogramimages/752343501_1583547124564.png`,
        android: `https://web.xuexiyuansu.com/images/miniprogramimages/375535621_1583547091176.png`
    },
    onLoad(options) {
        /* 页面初始化 options为页面跳转所带来的参数 */
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
    // 滑动切换
    swiperTab(e) {
        var that = this;
        that.setData({
            currentTab: e.detail.current
        });
    },
    // 点击切换
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
    /* 设置分享 */
    onShareAppMessage() {
        return {
            title: '如何下载安装学得慧APP？',
            path: 'pages/parentGuide/subpages/howToDownload/howToDownload'
        }
    },
    /* 自定义模态窗口模块 */
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
    }
})