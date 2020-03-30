//index.js
//获取应用实例
const app = getApp()

Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        lastY: 0,
        upward: true,
        showModal: false,
        currentTab: 0,
        // systemInfo: {},
        clientHeight: 0,
        scrollViewHeight: app.globalData.windowHeight - (190 * (app.globalData.windowWidth / 750)),
        courseList: [],
        recommendCourseList: [],
        primaryCourseList: [],
        middleCourseList: [],
        highCourseList: []
    },
    onPageScroll(e) {
        if (e.scrollTop > this.data.lastY) {
            this.setData({
                upward: false
            });
            this.setData({
                lastY: e.scrollTop
            });
        } else {
            this.setData({
                upward: true
            });
            this.setData({
                lastY: e.scrollTop
            });
        }

    },
    navigateToParentGuide() {
        wx.navigateTo({
            url: '../parentGuide/parentGuide'
        })
    },
    navigateToConvertPage(event) {
        // console.log(`带上的参数data-c：${event.currentTarget.dataset.c}`);
        let params = {
            c: event.currentTarget.dataset.c,
        };
        wx.navigateTo({
            url: `../convertPage/convertPage?params=${JSON.stringify(params)}`,
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        let that = this
        if (app.globalData.userInfo) {
            that.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            });
            // console.log(this.data.userInfo);
        } else if (that.data.canIUse) {
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            app.userInfoReadyCallback = res => {
                that.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
            }
        } else {
            // 在没有 open-type=getUserInfo 版本的兼容处理
            wx.getUserInfo({
                success: res => {
                    app.globalData.userInfo = res.userInfo
                    that.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true
                    })
                }
            })
        }
        that.getCourseList();
    },
    /**
     *  滑动切换选项卡
     */
    swiperTab(e) {
        let that = this;
        that.setData({
            currentTab: e.detail.current
        });
    },
    /**
     *  点击切换选项卡
     */
    clickTab(e) {
        let that = this;
        if (this.data.currentTab === e.target.dataset.current) {
            return false;
        } else {
            that.setData({
                currentTab: e.target.dataset.current
            })
        }
    },
    /**
     *  获取用户资料 
     */
    getUserInfo: function(e) {
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        });
    },
    /**
     * 分享模块
     */
    onShareAppMessage() {
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
     *  跳转到长图介绍页
     */
    navigateToIntro() {
        wx.navigateTo({
            url: '../intro/intro',
        })
    },
    // /**
    //  * 跳转到购课成功页，之后移除
    //  */
    // navigateToPurchaseSuccessful() {
    //     let params = {
    //         orderId: `D_10135606657918998`
    //     }
    //     wx.navigateTo({
    //         url: `../purchaseSuccessful/purchaseSuccessful?params=${JSON.stringify(params)}`,
    //     })
    // },
    /**
     * 获取各种课程
     */
    getCourseList() {
        let that = this;
        wx.request({
            url: `${app.globalData.domain}${app.globalData.webApi}/miniProgram/index`,
            success: res => {
                if (res.data.status !== 0) {
                    throw new Error(`获取失败`);
                }
                let recommendCourseList = res.data.data.courseGroup.find(item => {
                        return item.groupId === 0;
                    }),
                    primaryCourseList = res.data.data.courseGroup.find(item => {
                        return item.groupId === 1;
                    }),
                    middleCourseList = res.data.data.courseGroup.find(item => {
                        return item.groupId === 2;
                    }),
                    highCourseList = res.data.data.courseGroup.find(item => {
                        return item.groupId === 3;
                    });
            
                that.setData({
                    recommendCourseList: recommendCourseList ? recommendCourseList.courseChannels : [],
                    primaryCourseList: primaryCourseList ? primaryCourseList.courseChannels : [],
                    middleCourseList: middleCourseList ? middleCourseList.courseChannels : [],
                    highCourseList: highCourseList ? highCourseList.courseChannels : [],
                });
            },
            // fail: err => {
            //     console.log(err);
            // }
        })
    },

})