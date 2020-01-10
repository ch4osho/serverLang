'use strict';
const urlTypes = ['.jsp', '.do'];
axios.interceptors.request.use(
    request => {
        const { url } = request;
        let isCorrectType = false;
        urlTypes.forEach(type => {
            if (url.includes(type)) isCorrectType = true;
        });
        if (isCorrectType) {
            if (request.url.indexOf('?') == -1) {
                request.url += `?_TOKEN=${Ktu.initialData.token}`;
            } else {
                request.url += `&_TOKEN=${Ktu.initialData.token}`;
            }
            if (typeof $('#__tmpfaiscoAid').attr('value') === 'string') {
                request.url += `&__tmpaid=${$('#__tmpfaiscoAid').attr('value')}`;
            }
        }
        if (request.headers['Content-Type'] != 'multipart/form-data') {
            request.data = Qs.stringify(request.data);
        }
        return request;
    },
    err => {

    }
);
axios.interceptors.response.use(
    response => {
        const newPromise = new Promise((resolve, reject) => {
            // 未登录
            if (response.data && (response.data.code == -23 || response.data.code == -27)) {
                let tmp = new Vue();
                !window.signTip && tmp.$Notice.warning('请重新登录');
                window.signTip = true;
                tmp.$Modal.confirm({
                    // content: '请登录后，再进行相关操作！',
                    content: Ktu.reLogin(),
                    onOk() {
                        Ktu.initialData.token = $('#_TOKEN').attr('value');
                        const { config } = response;
                        const url = config.url.replace(/[&?]_TOKEN=\w+/, '');
                        const data = Ktu.utils.requestToJson(config.data);
                        resolve(axios.post(url, data));
                        tmp = null;
                        window.signTip = false;
                    },
                    onCancel() {
                        tmp = null;
                        window.signTip = false;
                    },
                });
                $('.ktu-modal-confirm-footer').hide();
            } else {
                resolve(response);
            }
        });

        return newPromise;
    },
    error => {
        /* if (error.response) {
           switch (error.response.status) {
           case 401:
           // 返回 401 清除token信息并跳转到登录页面
           store.commit(types.LOGOUT);
           router.replace({
           path: 'login',
           query: {redirect: router.currentRoute.fullPath}
           })
           }
           }
           return Promise.reject(error.response.data); */
    }
);

Ktu.reLogin = function () {
    document.domain = Ktu.domain;
    const href = Ktu.encodeUrl(top.window.location.href);
    const domain = Ktu.encodeUrl(top.document.domain);
    const iframeSrc = `//${Ktu.portalHost}/loginFormNew.jsp?f=${href}&rqDomain=${domain}&track=2&ram=${Math.random()}`;
    const html = `<iframe width="380" height="140" src="${iframeSrc}" style="border:none;"></iframe>`;
    return html;
};
