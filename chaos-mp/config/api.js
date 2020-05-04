const config = require('./config.js');

// api列表

const apiList = {
    login: `${config.appApi}/auth/mp/login`, //首页登录换取openId
    pageIndex: `${config.webApi}/miniProgram/index`, //获取首页数据
    loginByPhone: `${config.appApi}/auth/mp/loginByPhone`, //手机号授权登录
    convertPageIndex: `${config.webApi}/v1/goods/index`, //转化页首页查询
    convertPageIndex2: `${config.webApi}/v2/goods/index`, //转化页首页查询
    getCourseDetail: `${config.webApi}/v1/goods/detail`,
    generateOrder: `${config.appApi}/customer/generateBussinessOrder`, //生成订单
    paySubmit: `/pay/pay/submit`, //提交支付
    checkPayment: `/pay/biz/get`, //校验支付状态
    closeOrder: `${config.appApi}/customer/closeOrder`, //关闭订单
    getMyOrderDetail: `${config.appApi}/customer/getMyBusinessOrderDetail`, //购买成功获取我的订单详情
    updateAddress: `${config.appApi}/customer/order/updateAddress`, //更新收货地址
    log: `${config.appApi}/log/web/active.json`,
    getGradeMap: `${config.appApi}/common/dictory/list`
};

module.exports = {
    apiList,
};
