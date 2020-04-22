// pages/intro/intro.js
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showModal: false,
        imageUrls: [`https://web.xuexiyuansu.com/images/miniprogramimages/20417966_1582861887781.png`,
            `https://web.xuexiyuansu.com/images/miniprogramimages/29085105_1582861917625.png`,
            `https://web.xuexiyuansu.com/images/miniprogramimages/787786_1582861925939.png`,
            `https://web.xuexiyuansu.com/images/miniprogramimages/775338_1582861943922.png`,
            `https://web.xuexiyuansu.com/images/miniprogramimages/1160839_1582861954683.png`
        ],
        isFringeScreen: wx.getStorageSync('isFringeScreen') || false,
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {
        return {
            title: '了解学得慧',
            path: 'pages/intro/intro'
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
    }
})