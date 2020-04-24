const formatTime = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    return (
        [year, month, day].map(formatNumber).join('/') +
        ' ' +
        [hour, minute, second].map(formatNumber).join(':')
    );
};

const formatNumber = (n) => {
    n = n.toString();
    return n[1] ? n : '0' + n;
};

const urlMaker = (url, params) => {
    let resUrl = url + '?';
    for (const attr in params) {
        resUrl += `${attr}=${params[attr] || ''}&`;
    }

    // 去掉最后一个&
    resUrl = resUrl.substring(0, resUrl.length - 1);

    return resUrl;
};

const uriToParams = (url) => {
    let paramsStr = decodeURIComponent(url).split('?')[1];
    let paramsArr = paramsStr.split('&');
    let newOptions = {};

    paramsArr.forEach((item) => {
        let keyvalueArr = item.split('=');
        newOptions[keyvalueArr[0]] = keyvalueArr[1];
    });

    return newOptions;
};

module.exports = {
    formatTime,
    urlMaker,
    uriToParams,
};
