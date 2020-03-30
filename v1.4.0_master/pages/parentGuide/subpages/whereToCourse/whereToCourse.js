// pages/parentGuide/subpages/whereToCourse/whereToCourse.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        whereToCourse: `https://web.xuexiyuansu.com/images/miniprogramimages/-1429057275_1583547144290.png`
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        return {
            title: '如何下载学得慧',
            path: 'pages/parentGuide/subpages/whereToCourse/whereToCourse'
        }
    },
    navigateToDownload() {
        wx.navigateTo({
            url: '../howToDownload/howToDownload',
        })
    },
    navigateToWhereToReplay() {
        wx.navigateTo({
            url: '../whereToReplay/whereToReplay',
        })
    },
    clickImage(e) {
        let that = this;
        wx.previewImage({
            urls: [that.data.whereToCourse],
            current: '',
            success(res) {},
            fail(res) {},
            complete(res) {},
        })
    }
})