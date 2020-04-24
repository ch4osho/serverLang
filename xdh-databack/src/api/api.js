// base
const baseUrl = process.env.VUE_APP_API;

export default {

    // 获取课程详情
    total: baseUrl + '/course/query/use/total',

    // 事件埋点日志记录
    event: baseUrl + '/event/query/appDetail',

    // 课程日志
    course: baseUrl + '/course/query/useDetail',

    // 事件详情日志
    eventLog: baseUrl + '/event/query/app',

    // 登录
    login: baseUrl + '/login/account',

    // 登录日志
    loginLog: baseUrl + '/login/detail',
    
    // 购买日志
    purchaseLog: baseUrl + '/course/query/order',

    // 直播课程日志
    liveCourseLog: baseUrl + '/course/query/current' ,

    // 直播课程详情
    liveCourseDetail: baseUrl + '/course/query/courseToUser',

    //课程用户查询
    liveCourseUsers: baseUrl + '/course/query/userToCourse'

    
}


