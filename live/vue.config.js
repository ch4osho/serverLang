const now = new Date().getTime();
module.exports = {
    publicPath: "./", //vue-cli3.3+新版本使用

    // eslint-loader 是否在保存的时候检查
    lintOnSave: true,
    //放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录。
    assetsDir: "static",
    //以多页模式构建应用程序。
    pages: undefined,
    //是否使用包含运行时编译器的 Vue 构建版本
    runtimeCompiler: false,
    //是否为 Babel 或 TypeScript 使用 thread-loader。该选项在系统的 CPU 有多于一个内核时自动启用，仅作用于生产构建，在适当的时候开启几个子进程去并发的执行压缩
    parallel: require("os").cpus().length > 1,
    //生产环境是否生成 sourceMap 文件，一般情况不建议打开
    productionSourceMap: false,

    chainWebpack: config => {},
    configureWebpack: {
        output: {
            // 输出重构  打包编译后的 文件名称  【模块名称_时间戳.版本号】
            filename: `js/[name]_${now}.js`,
            chunkFilename: `js/[name]_${now}.js`
        }
    },
    devServer: {
        proxy: {
            "": {
                target: "http://edustatic-demo.my4399.com/",
                changeOrigin: true,
                pathRewrite: {}
            }
        }
    },

    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                productName: "xdh_student",
                appId: "xuexiyuansu.com",
                dmg: {
                    contents: [{
                            x: 410,
                            y: 150,
                            type: "link",
                            path: "/Applications"
                        },
                        {
                            x: 130,
                            y: 150,
                            type: "file"
                        }
                    ]
                },
                directories: {
                    output: "dist_electron"
                },

                mac: {
                    icon: "public/favicon.ico"
                },
                win: {
                    icon: "public/favicon.jpg"
                },
                linux: {
                    icon: "public/favicon.ico"
                },
                nsis: {
                    oneClick: false, // 是否一键安装
                    perMachine: false, //是否需要管理员权限打开
                    allowElevation: true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
                    allowToChangeInstallationDirectory: true, // 允许修改安装目录
                    // installerIcon: "public/favicon.jpg", // 安装图标
                    // uninstallerIcon: "public/favicon.jpg", //卸载图标
                    // installerHeaderIcon: "public/favicon.jpg", // 安装时头部图标
                    createDesktopShortcut: true, // 创建桌面图标
                    createStartMenuShortcut: true, // 创建开始菜单图标
                    shortcutName: "卸载" // 图标名称
                }
            }
        }
    }
};