import originAxios from 'axios';
import Vue from 'vue';

// 错误码
const ERROR_CODE = -1;

const instance = originAxios.create();

// get
export function getFetch(url, params = {}, headers = {}) {
    return instance.get(url, { params, headers }).then(res => {
        return res;
    });
}

// post
export function postFetch(url, data = {}, headers = {}) {
    return instance.post(url, data, { headers }).then(res => {
        return res;
    });
}

instance.interceptors.request.use(config => {
    let token = localStorage.getItem('token');
    if (token) {
        config.headers.Token = `Bearer ${token}`;
    }
    return config;
});

instance.interceptors.response.use(
    // res == error.response
    res => {
        return res;
    },
    error => {
            
        let ERROR_DES = '';

        if (error.response.status === 403) {
            ERROR_DES = '当前用户权限不足';
        } else if (error.response.status === 404) {
            ERROR_DES = '资源未找到';
        } else if (error.response.data.message) {
            // 服务端返回错误
            ERROR_DES = error.response.data.message;
        } else {
            ERROR_DES = '服务器错误，请刷新';
        }

        // return Promise.reject(Object.assign(error.response, {
        //     ERROR_CODE,
        //     ERROR_DES
        // }));

        return Object.assign(error.response, {
            ERROR_CODE,
            ERROR_DES
        });
    }
);

export const axios = instance;
