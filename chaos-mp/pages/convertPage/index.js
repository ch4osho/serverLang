// pages/convertPage/convertPage.js
const app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        convertPageParams: null,
        courseInfo: null,
        showModal: false,
        showBuyModal: false,
        countDownClock: `00:00:00 0`,
        remainingMilliSeconds: null,
        // timeout: null,
        // endTime: null,
        isLogin: null, // 是否已经登录过
        signDisabled: false, // 已报满
        exipred: false, // 商品（课程）过期
        selectedGrade: null, // 选中的年级
        selectedGradeGoodsList: [], // 选中年级下的课程
        selectedGoods: null, // 选中的商品
        courseTag: [], // 课程的标签
        checkedImage: `https://web.xuexiyuansu.com/images/miniprogramimages/-1194061581_1585880129589.png`,
        starImage: `https://web.xuexiyuansu.com/images/miniprogramimages/684208302_1583381520919.png`,
        courseDateRange: null,
        isFringeScreen: wx.getStorageSync('isFringeScreen') || false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;
        let { c } = options;
        that.setData({
            isLogin: app.globalData.isLogin,
        });
        that.setData({
            convertPageParams: c,
        });
        that.getConvertPage();
    },

    onUnload: function () {
        // let that = this;
        // clearTimeout(that.data.timeout);
    },

    /**
     * 分享
     */
    onShareAppMessage: function () {
        return {
            title: '学得慧',
            path: 'pages/index/index',
        };
    },

    /**
     * 获取用户手机号
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
                    app.globalData.isLogin = true;
                    app.globalData.token = res.data.data.token;
                    app.globalData.xdhLoginUserInfo = res.data.data.userInfo;
                    that.setData({
                        isLogin: true,
                    });
                    that.showModal();
                },
            });
        }
    },

    /**
     * 获取页面详情
     * */
    getConvertPage() {
        let that = this;
        wx.$get({
            url: wx.$apis.convertPageIndex,
            data: { c: that.data.convertPageParams },
            success: (res) => {
                if (res.data.status !== 0) {
                    throw new Error(`获取课程包失败`);
                }
                /* NOTE: 获取上课日期 */
                that.getCourseDateRange(res.data.data.courseSignEndDate);
                /* NOTE: usable 判断课程是否已经报满 */
                if (!res.data.data.usable) {
                    that.setData({
                        signDisabled: true,
                    });
                }
                /* NOTE: signEnd 判断课程是不是过期 */
                if (res.data.data.signEnd) {
                    that.setData({
                        expired: true,
                    });
                } 
                // else {
                //     that.setData({
                //         endTime:
                //             res.data.data.remindTimeInMs + new Date().getTime(),
                //     });
                //     that.countDown(that);
                // }
                /* NOTE: 如果只有一个年级直接展示课程列表 */
                if (res.data.data.courseGradeList.length == 1) {
                    that.setData({
                        selectedGradeGoodsList:
                            res.data.data.courseGradeList[0].courseList,
                    });
                }
                that.setData({
                    courseTag: res.data.data.packageLabel.split(','),
                });
                that.setData({
                    courseInfo: res.data.data,
                });
            },
        });
    },

    /**
     * 选择报名课程
     */
    showModal() {
        let that = this;
        if (
            that.data.courseInfo.courseGradeList.length === 1 &&
            that.data.courseInfo.courseGradeList[0].courseList.length === 1
        ) {
            that.setData({
                selectedGoods:
                    that.data.courseInfo.courseGradeList[0].courseList[0]
                        .goodsId,
            });
            that.navigateToOrder();
        } else {
            this.setData({
                showModal: true,
            });
        }
    },
    hideModal() {
        this.setData({
            showModal: false,
        });
    },
    /* 选择年级 */
    selectGrade(e) {
        let that = this;
        that.setData({
            selectedGrade: e.target.dataset.grade,
        });
        let courseList = that.data.courseInfo.courseGradeList.find((item) => {
            return item.grade === that.data.selectedGrade;
        }).courseList;
        that.setData({
            selectedGradeGoodsList: courseList,
        });
    },

    /* 选择课程 */
    selectGoods(e) {
        let that = this;
        that.setData({
            selectedGoods: e.target.dataset.g,
        });
    },

    /* 生成订单 */
    navigateToOrder() {
        let that = this,
            params = {
                c: that.data.convertPageParams,
                goodsId: that.data.selectedGoods,
                price: parseInt(that.data.courseInfo.salePrice),
            };
        wx.navigateTo({
            url: `../order/index?params=${JSON.stringify(params)}`,
        });
    },

    /**
     * 展示安心购内容
     */
    showModal2() {
        this.setData({
            showBuyModal: true,
        });
    },
    hideModal2() {
        this.setData({
            showBuyModal: false,
        });
    },

    // /**
    //  * 计时器
    //  */
    // countDown(that) {
    //     let now = new Date().getTime();
    //     let remaining = that.data.endTime - now;
    //     if (remaining < 0) {
    //         clearTimeout(that.data.timeout);
    //         that.setData({
    //             countDownClock: '00:00:00 0',
    //         });
    //     } else {
    //         let countDownClock = that.dateFormat(remaining);
    //         that.setData({
    //             countDownClock,
    //         });
    //         that.setData({
    //             timeout: setTimeout(function () {
    //                 countDownClock -= 10;
    //                 that.countDown(that);
    //             }, 10),
    //         });
    //     }
    // },
    dateFormat(ms) {
        let date = new Date(ms),
            milliSecond = date.getMilliseconds() % 10,
            second = date.getSeconds(),
            minute = date.getMinutes(),
            hour = date.getHours();
        const formatNumber = (n) => {
            n = n.toString();
            return n[1] ? n : '0' + n;
        };
        return [hour, minute, second]
            .map(formatNumber)
            .concat([milliSecond])
            .join(':');
    },
    getCourseDateRange(ms) {
        let that = this;
        let endDate = new Date(parseInt(ms));
        let startDate = new Date(parseInt(ms - 3 * 24 * 3600 * 1000));
        that.setData({
            courseDateRange: `${
                startDate.getMonth() + 1
            }月${startDate.getDate()}日 - ${
                endDate.getMonth() + 1
            }月${endDate.getDate()}日`,
        });
    },
});
