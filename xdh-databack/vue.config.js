const path = require('path');
module.exports = {
    // 增加alias
    chainWebpack: config => {
        config.resolve.alias
            .set('@util', path.join(__dirname, 'src/util'))
            .set('@components', path.join(__dirname, 'src/components'))
            .set('@assets', path.join(__dirname, 'src/assets'))
            .set('@static', path.join(__dirname, 'src/static'))
            .set('@api', path.join(__dirname, 'src/api'));
    },
    devServer: {
        // host: '10.1.251.141',
        host: '0.0.0.0',
        port: 9090,
        https: false,
        open: true,
        proxy: {
            '/statusApi': {
                target: 'http://edustatic-demo.my4399.com/statapi',
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    '^/statusApi': ''
                }
            }
        }
    },
    outputDir: 'statusadmin',
    publicPath: '/statusadmin/',
    productionSourceMap: false,
    css: {
        sourceMap: false,
        loaderOptions: {
        // sass预处理
        sass: {
            prependData: `
                @import "@static/global.scss";                `
        }
    }
    }
};
