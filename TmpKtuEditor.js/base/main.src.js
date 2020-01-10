Ktu.templateData = [];
(() => {
    Ktu.globalObject = {};

    Ktu.globalConfig = new Object({
        navigatorSize: 110,
    });
    Number.prototype.roundToFixed = function (digital) {
        const a = 10 ** digital;
        return Math.round(this * a) / a;
    };
    // 剪贴板是否有内容
    let hasCopiedObject = !!window.localStorage.getItem(`_ktuCopyObject_${Ktu.ktuData.ktuAid}`);

    Object.defineProperty(Ktu.globalObject, 'hasCopiedObject', {
        get() {
            return hasCopiedObject;
        },
        set(newValue) {
            hasCopiedObject = newValue;
            Ktu.store.commit('data/changeState', {
                prop: 'hasCopiedObject',
                value: hasCopiedObject,
            });
        },
    });
    Object.defineProperty(Ktu, 'activeObject', {
        get() {
            return Ktu.selectedData || Ktu.selectedGroup || Ktu.currentMulti;
        },
    });
    let selectedData;
    Object.defineProperty(Ktu, 'selectedData', {
        get() {
            return selectedData;
        },
        set(value) {
            Ktu.element.checkAndExitClip();
            if (value) {
                value.isSelected = true;
                // delete value.multi;
                if (value.group) {
                    value.group.objects.forEach(object => {
                        object !== value && (object.isSelected = false);
                    });
                }
            }
            selectedData = value;
            Ktu.store.commit('data/changeSelectedData', selectedData);
        },
    });
    let selectedTemplateData = {};
    Object.defineProperty(Ktu, 'selectedTemplateData', {
        get() {
            return selectedTemplateData;
        },
        set(val) {
            selectedTemplateData = val;
            Ktu.store.commit('data/changeState', {
                prop: 'selectedTemplateData',
                value: selectedTemplateData,
            });
        },
    });
    let currentMulti = null;
    Object.defineProperty(Ktu, 'currentMulti', {
        get() {
            return currentMulti;
        },
        set(value) {
            if (value) {
                value.isSelected = true;
                value.objects.forEach(object => {
                    object.isSelected = true;
                });
            }
            currentMulti = value;
            Ktu.store.commit('data/changeState', {
                prop: 'currentMulti',
                value,
            });
        },
    });
    let selectedGroup = null;
    Object.defineProperty(Ktu, 'selectedGroup', {
        get() {
            return selectedGroup;
        },
        set(value) {
            if (value) {
                value.isSelected = true;
                // delete value.multi;
                value.objects.forEach(object => {
                    object.isSelected = true;
                });
            }
            selectedGroup = value;
            Ktu.store.commit('data/changeState', {
                prop: 'selectedGroup',
                value,
            });
        },
    });

    Ktu.checkBrowser = function () {
        const UserAgent = navigator.userAgent.toLowerCase();
        let version = '';

        const os = {
            isIpad: /ipad/.test(UserAgent),
            isIphone: /iphone os/.test(UserAgent),
            isMac: /mac os/.test(UserAgent),
            isIOS: /os x/.test(UserAgent),
            isAndroid: /android/.test(UserAgent),
            isLinux: /linux/.test(UserAgent),
            isWindows: /windows/.test(UserAgent),
            isWindowsMobile: /windows mobile/.test(UserAgent),
            isWin2K: /windows nt 5.0/.test(UserAgent),
            isXP: /windows nt 5.1/.test(UserAgent),
            isVista: /windows nt 6.0/.test(UserAgent),
            isWin7: /windows nt 6.1/.test(UserAgent),
            isWin8: /windows nt 6.2/.test(UserAgent),
            isWin81: /windows nt 6.3/.test(UserAgent),
        };

        if (os.isIOS) {
            version = 'ios';
        } else if (os.isWindows) {
            version = 'window';
        } else if (os.isAndroid) {
            version = 'android';
        } else if (os.isLinux) {
            version = 'linux';
        }

        $('body').addClass(version);

        Ktu.os = os;
    };

    Ktu.main = function () {
        Ktu.checkBrowser();
        // new dpiTransform(Ktu.ktuData);
        Ktu.edit = new Edit();
        Ktu.store.commit('base/changeState', {
            prop: 'edit',
            value: Ktu.edit,
        });
        Ktu.thumb = new Thumb();
        Ktu.registerKeys();
        Ktu.template = new Template();
        Ktu.store.state.base.interactive.init();
    };

    window.onload = function () {
        setTimeout(() => {
            Ktu.vm.hasLoaded = true;
            const loading = document.getElementById('web-loading');
            loading.style.display = 'none';
            Ktu.save.autoSave();
            Ktu.utils.saveLoop();
            Ktu.template.hasLoaded();
            if (Ktu.isFromUploadToCreate) {
                Ktu.save.changeSaveNum();
                Ktu.template.saveCurrentPage(false, false);
                history.pushState('', '', localStorage.getItem('locationHref'));
                localStorage.removeItem('locationHref');
            }
        }, 10);
    };
})();
