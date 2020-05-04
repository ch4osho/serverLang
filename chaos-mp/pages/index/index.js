//index.js
//获取应用实例
const app = getApp();

Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        lastY: 0,
        upward: true,
        showModal: false,
        currentTab: 0,
        clientHeight: 0,
        scrollViewHeight:
            app.globalData.windowHeight -
            190 * (app.globalData.windowWidth / 750),
        courseList: [],
        recommendCourseList: [],
        primaryCourseList: [],
        middleCourseList: [],
        highCourseList: [],
        isFringeScreen: wx.getStorageSync('isFringeScreen') || false,
        errorDes: null,
        showErrorDialog: false,
    },
    onPageScroll(e) {
        if (e.scrollTop > this.data.lastY) {
            this.setData({
                upward: false,
            });
            this.setData({
                lastY: e.scrollTop,
            });
        } else {
            this.setData({
                upward: true,
            });
            this.setData({
                lastY: e.scrollTop,
            });
        }
    },
    navigateToParentGuide() {
        wx.navigateTo({
            url: '../parentGuide/index',
        });
    },
    navigateToConvertPage(event) {
        let params = {
            c: event.currentTarget.dataset.c,
            ctype: event.currentTarget.dataset.ctype,
        };

        let type;
        // 1正常商品，2拼团商品，3自动（1.7.0的转化页）
        switch (params.ctype) {
            case 1:
                type = 'convertPage';
                break;
            case 2:
                type = 'groupPurchase';
                break;
            case 3:
                type = 'convertPage2';
                break;
            default:
                type = 'convertPage';
                break;
        }

        wx.navigateTo({
            url: wx.$urlMaker(`../${type}/index`, params),
        });
    },
    navigateToGroupPurchase(event) {
        let params = {
            c: event.currentTarget.dataset.c,
        };

        wx.navigateTo({
            url: wx.$urlMaker(`../groupPurchase/index`, params),
        });
    },
    navigateToMiddlePage() {
        wx.navigateTo({
            url: `../middlePage/index`,
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let that = this;
        if (app.globalData.userInfo) {
            that.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true,
            });
            // console.log(this.data.userInfo);
        } else if (that.data.canIUse) {
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            app.userInfoReadyCallback = (res) => {
                that.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true,
                });
            };
        } else {
            // 在没有 open-type=getUserInfo 版本的兼容处理
            wx.getUserInfo({
                success: (res) => {
                    app.globalData.userInfo = res.userInfo;
                    that.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true,
                    });
                },
            });
        }
        that.getCourseList();
        /* NOTE: 这里是获取转化追踪的 */
        // url参数中可以获取到gdt_vid、weixinadinfo参数值 let gdt_vid = options.gdt_vid
        // let weixinadinfo = options.weixinadinfo;
        // console.log(`转化追踪内容：`, weixinadinfo);
        // // 获取广告id
        // let aid = 0;
        // if (weixinadinfo) {
        //     let weixinadinfoArr = weixinadinfo.split('.');
        //     aid = weixinadinfoArr[0];
        // }
        // console.log('来源广告的广告id是:' + aid);
    },
    /**
     *
     *发送跟踪内容
     */
    sendTraceInfo(adInfo) {},
    /**
     *  滑动切换选项卡
     */
    swiperTab(e) {
        let that = this;
        that.setData({
            currentTab: e.detail.current,
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
                currentTab: e.target.dataset.current,
            });
        }
    },
    /**
     *  获取用户资料
     */
    getUserInfo: function (e) {
        app.globalData.userInfo = e.detail.userInfo;
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true,
        });
    },
    /**
     * 分享模块
     */
    onShareAppMessage() {
        return {
            title: '学得慧',
            path: 'pages/index/index',
        };
    },
    /**
     *  跳转到长图介绍页
     */
    navigateToIntro() {
        wx.navigateTo({
            url: '../intro/index',
        });
    },
    /**
     * TODO: FIXME: NOTE: 跳转到购课成功页，线上移除
     */
    navigateToPurchaseSuccessful() {
        let params = {
            orderId: `D_10173634043365337`,
            c: 'wt21',
            type: 2,
        };

        wx.navigateTo({
            url: wx.$urlMaker(`../purchaseSuccessful/index`, params),
        });
    },
    /**
     * TODO: FIXME: NOTE: 登录模块，线上移除
     */
    getPhoneNumber(e) {
        let that = this;
        if (e.detail.errMsg.includes('ok')) {
            wx.$post({
                url: wx.$apis.loginByPhone,
                data: {
                    openId: app.globalData.openid,
                    encryptedData: e.detail.encryptedData,
                    iv: e.detail.iv,
                },
                success: (res) => {
                    if (res.data.status !== 0) {
                        return that.setData({
                            errorDes: res.data.message,
                            showErrorDialog: true,
                        });
                    }
                    console.log(`---获取用户信息成功---`);
                    console.log(res.data);
                    app.globalData.isLogin = true;
                    app.globalData.token = res.data.data.token;
                    app.globalData.xdhLoginUserInfo = res.data.data.userInfo;
                },
            });
        }
    },
    // // 显示错误弹窗
    // switchErrorDialog() {
    //     this.setData({
    //         showErrorDialog: true,
    //     });
    // },
    /**
     * 获取课程列表
     */
    getCourseList() {
        let that = this;
        wx.$get({
            url: wx.$apis.pageIndex,
            success: (res) => {
                if (res.data.status !== 0) {
                    return that.setData({
                        errorDes: res.data.message,
                        showErrorDialog: true,
                    });
                }
                let recommendCourseList = res.data.data.courseGroup.find(
                        (item) => {
                            return item.groupId === 0;
                        }
                    ),
                    primaryCourseList = res.data.data.courseGroup.find(
                        (item) => {
                            return item.groupId === 1;
                        }
                    ),
                    middleCourseList = res.data.data.courseGroup.find(
                        (item) => {
                            return item.groupId === 2;
                        }
                    ),
                    highCourseList = res.data.data.courseGroup.find((item) => {
                        return item.groupId === 3;
                    });
                that.setData({
                    recommendCourseList: recommendCourseList
                        ? recommendCourseList.courseChannels
                        : [],
                    primaryCourseList: primaryCourseList
                        ? primaryCourseList.courseChannels
                        : [],
                    middleCourseList: middleCourseList
                        ? middleCourseList.courseChannels
                        : [],
                    highCourseList: highCourseList
                        ? highCourseList.courseChannels
                        : [],
                });
            },
        });
    },
    handleUserInfo(res) {
        console.log(res);
    },
    triggerError() {
        console.log(`触发一下错误`);
        let that = this;
        console.log(`原来的错误值`, that.data.errorDes);
        that.setData({
            errorDes: `主动触发错误`,
        });
        that.setData({
            showErrorDialog: true,
        });
    },
});
