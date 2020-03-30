// pages/parentGuide/subpages/whereToReplay/whereToReplay.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        whereToReplay: `https://web.xuexiyuansu.com/images/miniprogramimages/-1023683942_1583547166603.png`
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        return {
            title: `怎么观看回放？`,
            path: `pages/parentGuide/subpages/whereToReplay/whereToReplay`
        }
    },
    clickImage(e) {
        let that = this;
        wx.previewImage({
            urls: [that.data.whereToReplay],
            current: '',
            success(res) {},
            fail(res) {},
            complete(res) {},
        })
    },
    navigateToDownload() {
        wx.navigateTo({
            url: '../howToDownload/howToDownload',
        })
    },
    navigateToCannotReplay() {
        wx.navigateTo({
            url: '../cannotReplay/cannotReplay',
        })
    }
})