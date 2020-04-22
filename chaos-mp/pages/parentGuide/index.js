// pages/parentGuide/parentGuide.js
Page({
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {
        return {
            title: '家长指引 - 学得慧',
            path: 'pages/parentGuide/parentGuide'
        }
    }
})