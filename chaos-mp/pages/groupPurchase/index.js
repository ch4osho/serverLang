const app = getApp()
const { currentUserList1, currentUserList2, currentUserList3} = require('./Users.js')

Page({
    data: {
        // 用户假数据
        currentUserList1,
        currentUserList2,
        currentUserList3,
        courseInfo: null,
        showBuyModal: false,
        showModal: false,
        // 是否已经登录过
        isLogin: null,
        // 转化页参数
        convertPageParams: null,
        // 课程是否已经结束
        signDisabled: false,
        // 课程是否已经过期
        expired: false,
        // 选中的商品
        selectedGoods: null,
        checkedImage: `https://web.xuexiyuansu.com/images/miniprogramimages/-1194061581_1585880129589.png`,
        starImage: `https://web.xuexiyuansu.com/images/miniprogramimages/684208302_1583381520919.png`,
        currentUser: null,
        isFringeScreen: wx.getStorageSync('isFringeScreen') || false,
        errorDes: null,
        showErrorDialog: false
    },
    onLoad(options){
        let that = this;
        let { c } = options;
        that.setData({
            convertPageParams: c,
            isLogin: app.globalData.isLogin,
        });

        // 获取商品详情
        this.getConvertPage();
        
        // 取列表中随机六位用户
        let listRandomNum1 = this.createRandom(12)

        // 随机获取一个用户
        let listRandomNum2 = this.createRandom(4)

        this.data.currentUserList3.unshift(this.data.currentUserList3.splice(listRandomNum2, 1)[0])

        this.setData({
            currentUserList2:currentUserList2.slice(listRandomNum1, listRandomNum1 + 6),
            currentUserList3:this.data.currentUserList3
        })

    },

    // 0 - max随机数
    createRandom(max){
        return Math.floor(Math.random() * (max + 1))
    },

    switchModal(){
        this.setData({
            showBuyModal: !this.data.showBuyModal
        })
    },
    // 倒数
    countDown(){
        let that = this
        setInterval(()=>{
            
            that.data.currentUserList2.forEach((item, index, currentUserList2)=>{
                that.formaterAndCountdown(item, index, currentUserList2, that)
            })

            that.formaterAndCountdown(that.data.currentUserList3[0], null, null, that)

        }, 100)
    },

    // 课程报满或者到期
    endTime(){
        let temp = this.data.currentUserList2

        temp.forEach((item)=>{
            item.time = '00:00:00:0'
        })

        // 前两个用户，并且页面停止滚动
        temp = [temp[0], temp[1]]

        this.setData({
            currentUserList2: temp
        })
    },
    // 时间格式化和倒数
    formaterAndCountdown(item, index, list, context){
        let timeformat = item.time.split(':'),
            hour = timeformat[0],
            min = timeformat[1],
            sec = timeformat[2],
            ms = timeformat[3],
            time = '';

                // 先减，再判断
                --ms

                // 毫秒
                if(ms < 0){
                    --sec
                    ms = 9
                }

                // 秒
                if(sec < 10 && sec >= 0) {
                    sec =  '0' + sec * 1
                } else if(sec < 0){
                    sec = '59'
                    --min
                }

                // 分
                if(min < 10 && min >= 0) {
                    min =  '0' + min * 1
                } else if(min < 0){
                    min = '59'
                    --hour
                }

                // 时
                if(hour < 10 && hour >= 0) {
                    hour =  '0' + hour * 1
                } else if(hour < 0){
                    hour = '23'
                }

                // list不存在就是单独改变底部的拼团用户数据
                if(!list && hour == 0 && min == 0 && sec == 0 && ms == 0){
                    //时间重回原始时间
                    context.data.currentUserList3[0].time = context.data.currentUserList3[0].originTime

                    // 数组第一个元素去到最后
                    context.data.currentUserList3.push(context.data.currentUserList3.shift())
                    
                    context.setData({
                        currentUserList3: context.data.currentUserList3
                    })

                    return;
                }


                // 这里是一个典型例子，setData改变data中某对象中的某个属性值
                if(hour == 0 && min == 0 && sec == 0 && ms == 0) {
                    let time = 'currentUserList2[' + index + '].time'

                    context.setData({
                        [time] : list[index]['originTime']
                    })

                    return;
                }

                // 时间没倒数完的情况
                if(!list){
                    time = 'currentUserList3[0].time'
                } else {
                    time = 'currentUserList2[' + index + '].time'
                }

                // 修改时间
                context.setData({
                    [time] : `${hour}:${min}:${sec}:${ms}`
                })

                
    },
    hideModal() {
        this.setData({
            showModal: false,
        });
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
                    return that.setData({
                        errorDes: res.data.message,
                        showErrorDialog: true,
                    });
                }
                /* NOTE: 获取上课日期 */
                that.getCourseDateRange(res.data.data.courseSignEndDate);
                /* NOTE: usable 判断课程是否已经报满 */
                if (!res.data.data.usable) {
                    that.setData({
                        signDisabled: true,
                    });
                }
                /* NOT
                E: signEnd 判断课程是不是过期 */
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
                    courseInfo: res.data.data,
                });

                // 本地存储打折价钱，以供支付成功使用
                wx.setStorageSync('discountPrice', that.data.courseInfo.originPrice - that.data.courseInfo.salePrice)


                // 判断是否开始倒计时
                if(that.data.signDisabled || that.data.expired){
                    this.endTime()
                } else {
                    this.countDown()
                }
            },
        });
    },
    /**
     * 选择报名课程
     */
    showModal(e) {
        if(this.data.signDisabled || this.data.expired) return
        let that = this;

        // 本地存储拼团团长头像
        wx.setStorageSync('groupPurchaseUser', e.currentTarget.dataset.user ? e.currentTarget.dataset.user : this.data.currentUserList2[0])

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
    /* 选择年级 */
    selectGrade(e) {
        let that = this;
        that.setData({
            selectedGrade: e.target.dataset.grade,
            selectedGoods: null
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
                // type为2就是团购
                type: 2
            };
        wx.navigateTo({
            // url: `../order/index?params=${JSON.stringify(params)}`,
            url: wx.$urlMaker(`../order/index`, params)
        });
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
                    
                    console.log('eeeeeeeee',e)
                    if(e.currentTarget.dataset.issys) {
                        that.setData({
                            errorDes: '系统将为你自动拼团~',
                            showErrorDialog: true,
                        });
                        setTimeout(function(){
                            that.showModal(e);
                        },2500)
                    } else {
                        that.showModal(e);
                    }
                    
                },
            });
        }
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
})