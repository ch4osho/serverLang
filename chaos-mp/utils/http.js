const config = require('../config/config.js');
const domain = config.domain;
const post = ({ url, header = {}, data, success, fail }) => {
    if (url.includes('http://') || url.includes('https://')) {
        url = url;
    } else {
        url = domain + url;
    }
    wx.request({
        url: url,
        method: 'post',
        header: header,
        data: data,
        success: success,
        fail: fail
    });
};

const get = ({ url, header, data, success, fail }) =>
    wx.request({
        url: domain + url,
        method: 'get',
        header: header,
        data: data,
        success: success,
        fail: fail
    });

module.exports = {
    domain,
    post,
    get
};
