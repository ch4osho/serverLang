const app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        showModal: false,
        orderId: null,
        courseDetails: null,
        //随材默认false
        withMaterial: false,
        // 是否是刘海屏
        isFringeScreen: wx.getStorageSync('isFringeScreen') || false,
        // 进度条参数
        progressArr: [
            {
                label: '支付成功',
            },
            {
                label: '完善收货信息',
            },
            {
                label: '添加班主任微信',
            },
        ],
        // 用户信息
        userInfo: {
            contactName: '',
            contactPhone: '',
            userRegion: [],
            localAddress: '',
        },
        // 进度从零算起
        currentStep: 1,
        // 错误提示语列表
        errorDesList: {
            contactName: '收货人姓名不能为空',
            contactPhone: '收货人手机号码不能为空',
            userRegion: '所在地区不能为空',
            localAddress: '详细地址不能为空',
        },
        // 错误描述
        errorDes: '',
        // 控制错误弹窗
        showErrorDialog: false,
        // 控制显示教师模块
        showTeacher: true,
        // 是否是拼团
        isGroupPurchase: false,
        // 支付类型
        type: 0,
        // 团购团长信息
        groupPurchaseUser: null,
        // 个人头像
        userAvatarUrl: '',
        // 支付页带过来的页面参数
        params: null,
        // 显示团购成功
        showGroupPurchase: false,
        // 是否显示随材
        showWithMaterial: false,

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this,
            params = options;
        that.setData({
            orderId: params.orderId,
            isGroupPurchase: params.type == 2 ? true : false,
            params,
            // discountPrice: app.globalData.discountPrice ? app.globalData.discountPrice : ''
            // 打折价钱
            discountPrice: wx.getStorageSync('discountPrice') || '',
             // 获取团购团长信息
             groupPurchaseUser: wx.getStorageSync('groupPurchaseUser') || null,
        });

        that.getCourseDetails();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        let params = {
            c: this.data.params.c
        }

        // 团购分享
        if(this.data.isGroupPurchase){
            return {
                // title: `${res.userInfo.nickName}邀请你一起来拼团！19元5节名师精品课，物理高分锦囊等你来领！`,
                title: `${app.globalData.xdhLoginUserInfo.customerName}邀请你一起来拼团！19元5节名师精品课，物理高分锦囊等你来领！`,
                imageUrl: 'https://web.xuexiyuansu.com/images/webcommonimages/wxshare20200415-111546.png',
                path: `pages/groupPurchase/index?params=${JSON.stringify(params)}`
            }

        }

        // 页面的普通分享
        return {
            title: '学得慧',
            path: 'pages/index/index',
        };
    },
    
    importAddress(){
        this.getaddress()
    },

    showDownloadModal() {
        this.setData({
            showModal: true,
        });
    },
    hideModal() {
        this.setData({
            showModal: false,
        });
    },
    /**
     * 添加到剪切板
     */
    addToClipBoard() {
        let that = this;
        wx.setClipboardData({
            data: that.data.courseDetails.headTeacherInfo.contact,
            success: function () {
                wx.showToast({
                    title: '已复制',
                    icon: 'success',
                    duration: 2000,
                });
            },
        });
    },
    /**
     * 获取微信用户的收货地址
     */
    getaddress(){
        let that = this
        wx.chooseAddress({
            success(res){
                let { provinceName,cityName,countyName } = res
                that.setData({
                    ['userInfo.userRegion']: [provinceName, cityName, countyName],
                    ['userInfo.contactName']: res.userName ? res.userName : '',
                    ['userInfo.contactPhone']: res.telNumber ? res.telNumber : '',
                    ['userInfo.localAddress']: res.detailInfo ? res.detailInfo : ''
                })
            },
            fail(err){
                wx.showToast({
                    title: err,
                    icon: 'none',
                    duration: 2000,
                });
            }
        })
    },
    /**
     * 获取课程详情信息
     */
    getCourseDetails() {
        let that = this;
        wx.$post({
            url: wx.$apis.getMyOrderDetail,
            header: {
                token: `Bearer ${app.globalData.token}`,
            },
            data: {
                orderId: that.data.orderId,
            },
            success: (res) => {
                if (res.data.status == 403) {
                    throw new Error(`无权限`);
                }
                if(res.data.status === 0 ){
                    that.setData({
                        courseDetails: res.data.data.detail[0],
                        withMaterial: res.data.data.withMaterial,
                        showTeacher: !res.data.data.withMaterial,
                        showGroupPurchase: !res.data.data.withMaterial,
                        showWithMaterial: res.data.data.withMaterial
                    });

                } else {
                    that.setData({
                        errorDes: res.data.message
                    });
                    this.switchErrorDialog();
                }
            },
            // fail: err => {
            //     console.log(err)
            // }
        });
    },
    // 提交
    submit() {
        const {
            contactName,
            contactPhone,
            userRegion,
            localAddress,
        } = this.data.userInfo;
        const province = userRegion[0] ? userRegion[0] : '';
        const city = userRegion[1] ? userRegion[1] : '';
        const region = userRegion[2] ? userRegion[2] : '';
        let that = this;
        wx.$post({
            url: wx.$apis.updateAddress,
            header: {
                token: `Bearer ${app.globalData.token}`,
            },
            data: {
                orderId: that.data.orderId,
                contactName,
                contactPhone,
                localAddress,
                province,
                city,
                region,
            },
            success(res) {
                that.setData({
                    // 跳下一页
                    currentStep: 2,
                    showTeacher: that.data.isGroupPurchase ? false : true,
                    showGroupPurchase: that.data.isGroupPurchase ? true : false,
                    showWithMaterial: false
                });
            },
            fail(error) {
                console.log('这是更新地址的error', error);
            },
        });
    },
    // 信息输入
    infoInput(e) {
        this.setData({
            userInfo: Object.assign(this.data.userInfo, {
                [e.currentTarget.dataset.type]: e.detail.value,
            }),
        });
    },
    // 数据检查
    checkBeforeSubmit() {
        // 检查当前填入的数据是否有空值，有则返回第一个
        let errorItem = Object.keys(this.data.userInfo).find((item) => {
            console.log(item);
            return this.data.userInfo[item].length === 0;
        });

        // 匹配到错误提示列表的提示语
        if (errorItem) {
            this.setData({
                errorDes: this.data.errorDesList[errorItem],
            });
            this.switchErrorDialog();
            return;
        }

        // 手机格式检测
        // if (
        //     this.data.userInfo.contactPhone !== '' &&
        //     !/^1[3456789]\d{9}$/.test(this.data.userInfo.contactPhone)
        // ) {
        //     this.setData({
        //         errorDes: '收货人手机号码格式不正确',
        //     });
        //     this.switchErrorDialog();
        //     return;
        // }
        this.submit();
    },
    // 显示错误弹窗
    switchErrorDialog() {
        this.setData({
            showErrorDialog: true,
        });
    },
    // 输入手机号时做检测
    // phoneFormatCheck() {
    //     if (
    //         this.data.userInfo.contactPhone !== '' &&
    //         !/^1\d{10}$/.test(this.data.userInfo.contactPhone)
    //     ) {
    //         return wx.showToast({
    //             title: '手机号码格式不正确',
    //             icon: 'none',
    //             duration: 2000,
    //         });
    //     }
    // },
});
