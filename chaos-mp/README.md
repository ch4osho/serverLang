# 学得慧 - 小程序 - 开发文档

## 小程序开发者文档 https://developers.weixin.qq.com/miniprogram/dev/framework/

### 使用 vsc 开发注意事项

.prettierrc - vsc 的格式化配置

安装两个插件方便开发

1. wx-app-development-tool 支持 wxss 和 wxml 文件

2. minapp 智能补全

另外在 vsc 内新建 page 需要在 app.json 内配置好 index，如果想要偷懒可以直接在微信开发工具内 new page 会自动配置


### 目录结构

----- pages
        |
        |------ convertPage             转化页(商品购买页)
        |------ groupPurchase           拼团页
        |------ index                   首页
        |------ intro                   介绍页
        |------ middlePage              app跳转客服中间页
        |------ order                   下单页面
        |------ parentGuide             家长指引
        |------ purchaseSuccessful      购买成功页面

### 目录下components/xdh-xx-xx为学得慧封装组件


### 遇到过的问题：

```
1、bandtap不需要{{}};

2、获取的dom好像不能修改其样式，只能通过动态绑定的方法去改变样式;;

3、wxml中进行复杂运算可能会出现无返回值的情况，多加留意;

4、如何只修改data中的某个对象的属性：
    if(!list){
        time = 'currentUserList3[0].time'
    } else {
        time = 'currentUserList2[' + index + '].time'
    }

    context.setData({
        [time] : `${hour}:${min}:${sec}:${ms}`
    })
    
5、一些微信小程序的api只能通过button的open-type触发;
    例如获取手机号，获取个人信息，获取收货地址

6、button默认样式，其伪类也有，改动时注意;

7、button open-type="contact"时跳转客服页面，带上的path，只有在退出当前客服页面，在微信聊天记录重新进入微信客服助手才能跳转至目标path;


8、获取用户个人信息已经不能调用wx.getUserInfo方法来获取了，只能有两种方式调起;
    a）使用button组件，open-type制定为getUserInfo类型
    b）open-data展示用户基本信息

9、小程序上线或者体验版的时候，会在小程序管理后台->运维中心->查询结果看到;
    	onPageNotFound error: page "pages/middlePage/index" is not found.; at onPageNotFound
    类似的错误，论坛里微信小程序技术运营专员描述：
        "iOS 有个在小程序更新期间、用户某些操作路径下代码包丢失的 bug，我们会在下个版本修复。"

```

10、


