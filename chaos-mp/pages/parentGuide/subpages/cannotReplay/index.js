// pages/parentGuide/subpages/cannotReplay/cannotReplay.js
Page({
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        return {
            title: `打不开回放？`,
            path: 'pages/parentGuide/subpages/cannotReplay/cannotReplay'
        }
    },
    navigateToWhereToReplay() {
        wx.navigateTo({
            url: '../whereToReplay/index',
        })
    }
})