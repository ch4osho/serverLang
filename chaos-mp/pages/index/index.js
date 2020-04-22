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
            url: '../parentGuide/index'
        });
    },
    navigateToConvertPage(event) {
        let params = {
            c: event.currentTarget.dataset.c,
            ctype: event.currentTarget.dataset.ctype
        };

        let type;
        // 1正常商品，2拼团商品
        switch(params.ctype){
            case 1 :
                type = 'convertPage';
                break;
            case 2 :
                type = 'groupPurchase';
                break;
            default:
                type = 'convertPage';
                break;
        }
        
        wx.navigateTo({
            url: `../${type}/index?params=${JSON.stringify(params)}`
        });
    },
    navigateToGroupPurchase(event){
        let params = {
            c: event.currentTarget.dataset.c
        }
        wx.navigateTo({
            url: `../groupPurchase/index?params=${JSON.stringify(params)}`
        });
    },
    navigateToMiddlePage(){
        wx.navigateTo({
            url: `../middlePage/index`
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
                });
            };
        } else {
            // 在没有 open-type=getUserInfo 版本的兼容处理
            wx.getUserInfo({
                success: res => {
                    app.globalData.userInfo = res.userInfo;
                    that.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true
                    });
                }
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

        console.log('查看全局data',app.globalData)
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
            });
        }
    },
    /**
     *  获取用户资料
     */
    getUserInfo: function(e) {
        app.globalData.userInfo = e.detail.userInfo;
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
        };
    },
    showDownloadModal() {
        this.setData({
            showModal: true
        });
    },
    hideModal() {
        this.setData({
            showModal: false
        });
    },
    /**
     *  跳转到长图介绍页
     */
    navigateToIntro() {
        wx.navigateTo({
            url: '../intro/index'
        });
    },
    /**
     * TODO: FIXME: NOTE: 跳转到购课成功页，线上移除
     */
    navigateToPurchaseSuccessful() {
        let params = {
            orderId: `D_10173634043365337`,
            c: 'wt21',
            type: 2
        };
        wx.navigateTo({
            url: `../purchaseSuccessful/index?params=${JSON.stringify(
                params
            )}`
        });
    },
    /**
     * TODO: FIXME: NOTE: 登录模块，线上移除
     */
    getPhoneNumber(e) {
        if (e.detail.errMsg.includes('ok')) {
            wx.$post({
                url: wx.$apis.loginByPhone,
                data: {
                    openId: app.globalData.openid,
                    encryptedData: e.detail.encryptedData,
                    iv: e.detail.iv
                },
                success: res => {
                    app.globalData.isLogin = true;
                    app.globalData.token = res.data.data.token;
                    app.globalData.xdhLoginUserInfo = res.data.data.userInfo;
                    console.log(app.globalData)
                }
            });
        }
    },
    /**
     * 获取各种课程
     */
    getCourseList() {
        let that = this;
        wx.$get({
            url: wx.$apis.pageIndex,
            success: res => {
                if (res.data.status !== 0) {
                    throw new Error(`获取失败`);
                }
                let recommendCourseList = res.data.data.courseGroup.find(
                        item => {
                            return item.groupId === 0;
                        }
                    ),
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
                        : []
                });
            }
        });
    }
});