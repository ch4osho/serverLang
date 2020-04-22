// pages/parentGuide/subpages/otherCourse/otherCourse.js
Page({
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {
        return {
            title: '还有其他课程吗？',
            path: 'pages/parentGuide/subpages/otherCourse/index'
        }
    },
    navigateToDownload() {
        wx.navigateTo({
            url: '../howToDownload/index',
        })
    },

    navigateToHowToBuy() {
        wx.navigateTo({
            url: '../howToBuy/index',
        })
    }
})