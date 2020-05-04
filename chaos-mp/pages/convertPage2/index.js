// pages/convertPage/convertPage.js
const app = getApp();
const { uriToParams } = require('../../utils/util');
Page({
    data: {
        convertPageParams: null,
        courseInfo: null,
        showModal: false,
        showBuyModal: false,
        countDownClock: `00:00:00 0`,
        remainingMilliSeconds: null,
        isLogin: null, // 是否已经登录过
        signDisabled: false, // 已报满
        exipred: false, // 商品（课程）过期
        selectedGrade: null, // 选中的年级
        selectedGradeGoodsList: [], // 选中年级下的课程
        selectedGoods: null, // 选中的商品
        courseTag: [], // 课程的标签
        checkedImage: `https://web.xuexiyuansu.com/images/miniprogramimages/-1194061581_1585880129589.png`,
        starImage: `https://web.xuexiyuansu.com/images/miniprogramimages/684208302_1583381520919.png`,
        isFringeScreen: wx.getStorageSync('isFringeScreen') || false,
        errorDes: null,
        showErrorDialog: false,
    },
    onLoad: function (options) {
        // 二维码识别跳转,跳转参数会带有q，值为一个完整进入地址，需要decodeURIComponent一次，自行获取参数
        if (options.q) {
            options = uriToParams(options.q);
        }

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

    // 分享
    onShareAppMessage: function () {
        return {
            title: '学得慧',
            path: 'pages/index/index',
        };
    },

    // 获取用户手机号
    getPhoneNumber(e) {
        let that = this;
        if (e.detail.errMsg.includes('ok')) {
            wx.$post({
                url: wx.$apis.loginByPhone,
                data: {
                    openId: app.globalData.openid,
                    encryptedData: e.detail.encryptedData,
                    iv: e.detail.iv
                },
                success: (res) => {
                    if (res.data.status !== 0) {
                        return that.setData({
                            errorDes: res.data.message,
                            showErrorDialog: true,
                        });
                    }
                    app.globalData.isLogin = true;
                    app.globalData.token = res.data.data.token;
                    app.globalData.xdhLoginUserInfo = res.data.data.userInfo;

                    that.setData({
                        isLogin: true,
                    });

                    that.showModal();
                    
                    console.log('选取的商品',this.data.selectedGoods)
                    if(this.data.selectedGoods){
                        console.log('来到了第一步')
                        that.navigateToOrder()
                    } else {
                        console.log('来到了第二步')
                        that.showModal();
                    }
                },
            });
        }
    },

    // 获取页面详情
    getConvertPage() {
        let that = this;
        wx.$get({
            url: wx.$apis.convertPageIndex2,
            data: { c: that.data.convertPageParams },
            success: (res) => {
                if (res.data.status !== 0) {
                    throw new Error(`获取课程包失败`);
                }

                // usable 判断课程是否已经报满
                if (!res.data.data.usable) {
                    that.setData({
                        signDisabled: true,
                    });
                }

                // signEnd 判断课程是不是过期
                if (res.data.data.signEnd) {
                    that.setData({
                        expired: true,
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

    clearCurrentGrade(){
        console.log('进来clearCurrentGrade')
        this.setData({
            selectedGrade: null,
            selectedGoods: null
        })
    },

    // 选择报名课程
    showModal() {
        let that = this;
        // 第一种情况，该商品只有一个年级，而且该年级只有一个课程
        if(this.data.selectedGoods) {
            // 第二种情况，以及选择了年级了
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
            selectedGoods: null,
            selectedGrade: null,
        });
    },
    // 选择年级
    selectGrade(e) {
        let that = this;
        that.setData({
            selectedGrade: e.target.dataset.grade,
            selectedGoods: e.target.dataset.grade.courseList[0]
        });
    },

    // 生成订单
    navigateToOrder() {
        let that = this,
            params = {
                c: that.data.convertPageParams,
                goodsId: that.data.selectedGoods.goodsId,
                price: parseInt(that.data.courseInfo.salePrice),
                type: 'v2'
            };
        wx.navigateTo({
            url: wx.$urlMaker(`../order/index`, params),
        });
    },

    // 安心购弹窗
    showModal2() {
        this.setData({
            showBuyModal: true,
        });
    },

    hideModal2() {
        this.setData({
            showBuyModal: false,
        });
    }
});
