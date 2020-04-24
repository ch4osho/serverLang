# statusadmin 数据后台开发流程

## 开发
```
npm install安装依赖
```

### 运行本地服务器
```
npm run serve
```

### 打包至测试环境
```
npm run build
```

### 打包至正式环境
```
npm run online
```

## 部署
```
测试环境服务器为120.31.141.139：4399，权限请联系运维添加
```
### 测试账号
```
account:  lijianjie
password: Lee@123456
```

### 测试部署
```
把目录下的statusadmin上传至测试服务器/data/web/edustatic, 替换掉statusadmin文件夹
```

### 正式部署
```
把目录下的statusadmin打包成zip压缩包发送给衣玉杰上传正式服务器
```

## 地址
```
测试地址：http://edustatic-demo.my4399.com/statusadmin/
正式地址：
后台文档地址： https://sop.4399om.com/pages/viewpage.action?pageId=89063492
```

## 账号
```
ac: hechaohao
pwd: Qaz@123456
```
```
ac: lijianjie
pwd: Lee@123456
```
```
ac: dengfuhua
pwd: Qaz@123456
```

## 问题总结
遇到过的问题:
1、测试地址和正式地址的包要放正确，测试地址的包为npm run build打出，正式环境的包为npm run online打出，出现过测试环境放的包是请求线上正式接口的情况；（2020-04-08 chaos）

2、vue-cli3脚手架不需要再在vue.config.js中配置plugins的html-webpack-plugin插件；，工具主工程目录下的public下就是template模板文件，（2020-04-23）

