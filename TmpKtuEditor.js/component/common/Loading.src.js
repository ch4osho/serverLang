Vue.component('loading', {
    template: `
    <div class="ktu-loading">
        <div class="loading-box loading-box-small" v-if="loadingType == 1">
            <div class="loading-circle loading-circle-1"></div>
            <div class="loading-circle loading-circle-2"></div>
            <div class="loading-circle loading-circle-3"></div>
        </div>
        <div class="loading-box circle-loading" v-else-if="loadingType == 3" :style="loadingSize">
            <div class="loading-background">
            </div>
            <div class="circle-loading-icon">
                <svg id="svg-loading-small" width="16" height="16" viewBox="0 0 16 16">
                    <path d="M8,16a8,8,0,1,1,8-8A8,8,0,0,1,8,16ZM8,2a6,6,0,1,0,6,6A6,6,0,0,0,8,2Z" fill="#fff" fill-opacity="0.5"></path>
                    <path d="M15,9a1,1,0,0,1-1-1A6,6,0,0,0,8,2,1,1,0,0,1,8,0a8,8,0,0,1,8,8A1,1,0,0,1,15,9Z" fill="#fff"></path>
                </svg>
            </div>
        </div>
        <div class="loading-box loading-box-normal full" :style="loadingSize" v-else>
           <!-- <div class="loading-circle loading-circle-1"></div>
            <div class="loading-circle loading-circle-2"></div>
            <div class="loading-circle loading-circle-3"></div>
            <div class="loading-icon loading-icon-normal"></div> -->

            <svg display="none" id="cloud" data-name="cloud" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 120 120" class="loading-svg loading-svg-0">
                <defs>
                    <linearGradient id="cloud1" x1="59" y1="69.95" x2="112.83" y2="69.95" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stop-color="#f4d96a" />
                        <stop offset="1" stop-color="#fc9364" />
                    </linearGradient>
                    <linearGradient id="cloud2" x1="22.48" y1="94.89" x2="85.83" y2="31.54" xlink:href="#cloud1" />
                </defs>
                <title>云端</title>
                <path
                    d="M93.06,50.91A19.2,19.2,0,0,1,89.63,89H63"
                    fill="none"
                    stroke-linecap="round"
                    stroke-miterlimit="10"
                    stroke-width="8"
                    stroke="url(#cloud1)"
                    class="cloud-right"
                />
                <path
                    d="M48.33,89h12A32,32,0,1,0,29,50.66,19.19,19.19,0,0,0,30.2,89H49"
                    fill="none"
                    stroke-linecap="round"
                    stroke-miterlimit="1000"
                    stroke-width="8"
                    stroke="url(#cloud2)"
                    class="cloud-left"
                />
            </svg>

            <svg display="none" id="speed" data-name="speed" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 120 120" class="loading-svg loading-svg-1">
                <defs>
                    <linearGradient id="speed_inner" x1="46.65" y1="60" x2="73.31" y2="60" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stop-color="#f4d96a" />
                        <stop offset="1" stop-color="#fc9364" />
                    </linearGradient>
                    <linearGradient id="speed_outer" x1="15.98" x2="103.98" xlink:href="#speed_inner" />
                </defs>
                <title>快速</title>
                <path
                    d="M58.48,43,50.85,57.4A1.77,1.77,0,0,0,52.42,60H67.54a1.77,1.77,0,0,1,1.56,2.6L61.48,77"
                    fill="none"
                    stroke-linecap="round"
                    stroke-miterlimit="10"
                    stroke-width="8"
                    stroke="url(#speed_inner)"
                    class="speed-inner"
                />
                <path
                    d="M86.92,30.43a40.82,40.82,0,1,1-.27-.24"
                    fill="none"
                    stroke-linecap="round"
                    stroke-miterlimit="10"
                    stroke-width="8"
                    stroke="url(#speed_outer)"
                    class="speed-outer"
                />
            </svg>

            <svg display="none" id="pic" data-name="pic" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 120 120" class="loading-svg loading-svg-2">
                <defs>
                    <linearGradient id="pic_outer" x1="14" y1="60" x2="106" y2="60" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stop-color="#f4d96a" />
                        <stop offset="1" stop-color="#fc9364" />
                    </linearGradient>
                    <linearGradient id="line" x1="36" y1="72" x2="66" y2="72" xlink:href="#pic_outer" />
                    <linearGradient id="pic_inner" x1="36" y1="51.82" x2="83" y2="51.82" xlink:href="#pic_outer" />
                </defs>
                <title>图片</title>
                <path
                    d="M79,95H24a6,6,0,0,1-6-6V31a6,6,0,0,1,6-6H96a6,6,0,0,1,6,6V74.61a10.6,10.6,0,0,1-3.1,7.49l-9.8,9.8A10.6,10.6,0,0,1,81.61,95H79V76a4,4,0,0,1,4-4H99"
                    fill="none"
                    stroke-linecap="round"
                    stroke-miterlimit="10"
                    stroke-width="8"
                    stroke="url(#pic_outer)"
                    class="pic-outer"
                />
                <line x1="40" y1="72" x2="62" y2="72" fill="none" stroke-linecap="round" stroke-miterlimit="10" stroke-width="8" stroke="url(#line)" class="pic-line" />
                <path
                    d="M40,57l9.92-9.92a1.54,1.54,0,0,1,2.16,0l8.84,8.84a1.54,1.54,0,0,0,2.16,0l6.77-6.77a1.54,1.54,0,0,1,2.23.06L79,57"
                    fill="none"
                    stroke-linecap="round"
                    stroke-miterlimit="10"
                    stroke-width="8"
                    stroke="url(#pic_inner)"
                    class="pic-inner"
                />
            </svg>

            <svg display="none" id="text" data-name="text" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 120 120" class="loading-svg loading-svg-3">
                <defs>
                    <linearGradient id="text_outer" x1="14" y1="60" x2="106" y2="60" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stop-color="#f4d96a" />
                        <stop offset="1" stop-color="#fc9364" />
                    </linearGradient>
                    <linearGradient id="line_vertical" x1="60.5" y1="81" x2="60.5" y2="44" xlink:href="#text_outer" />
                    <linearGradient id="line_horizen" x1="40" y1="47" x2="81" y2="47" xlink:href="#text_outer" />
                </defs>
                <title>文字</title>
                <path
                    d="M81.75,91.77h2.94a7.08,7.08,0,0,0,7.08-7.08v-8.6a7.06,7.06,0,0,1,2.08-5L99.93,65a7.1,7.1,0,0,0,0-10l-6.08-6.08a7.06,7.06,0,0,1-2.08-5v-8.6a7.08,7.08,0,0,0-7.08-7.08h-8.6a7.06,7.06,0,0,1-5-2.08L65,20.07a7.1,7.1,0,0,0-10,0l-6.08,6.08a7.06,7.06,0,0,1-5,2.08h-8.6a7.08,7.08,0,0,0-7.08,7.08v8.6a7.06,7.06,0,0,1-2.08,5L20.07,55a7.1,7.1,0,0,0,0,10l6.08,6.08a7.06,7.06,0,0,1,2.08,5v8.6a7.08,7.08,0,0,0,7.08,7.08h8.6a7.06,7.06,0,0,1,5,2.08L55,99.93a7.1,7.1,0,0,0,10,0l6.08-6.08a7.06,7.06,0,0,1,5-2.08h4.33"
                    fill="none"
                    stroke-linecap="round"
                    stroke-miterlimit="10"
                    stroke-width="8"
                    stroke="url(#text_outer)"
                    class="text-outer"
                />
                <line
                    class="line-vertical"
                    x1="60.5"
                    y1="48"
                    x2="60.5"
                    y2="77"
                    fill="none"
                    stroke-linecap="round"
                    stroke-miterlimit="10"
                    stroke-width="8"
                    stroke="url(#line_vertical)"
                />
                <line class="line-horizen" x1="44" y1="47" x2="77" y2="47" fill="none" stroke-linecap="round" stroke-miterlimit="10" stroke-width="8" stroke="url(#line_horizen)" />
            </svg>

            <svg display="none" id="setting" data-name="setting" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 120 120" class="loading-svg loading-svg-4">
                <defs>
                    <linearGradient id="line_left" x1="32" y1="22" x2="32" y2="98" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stop-color="#f4d96a" />
                        <stop offset="1" stop-color="#fc9364" />
                    </linearGradient>
                    <linearGradient id="line_mid" x1="60" x2="60" xlink:href="#line_left" />
                    <linearGradient id="line_right" x1="88" x2="88" xlink:href="#line_left" />
                    <linearGradient id="circle_left" x1="20" y1="77" x2="44" y2="77" xlink:href="#line_left" />
                    <linearGradient id="circle_mid" x1="48" y1="44" x2="72" y2="44" xlink:href="#line_left" />
                    <linearGradient id="circle_right" x1="76" y1="69" x2="100" y2="69" xlink:href="#line_left" />
                </defs>
                <title>设置</title>
                <line x1="32" y1="26" x2="32" y2="94" fill="none" stroke-linecap="round" stroke-miterlimit="10" stroke-width="8" stroke="url(#line_left)" class="line-lr" />
                <line x1="60" y1="26" x2="60" y2="94" fill="none" stroke-linecap="round" stroke-miterlimit="10" stroke-width="8" stroke="url(#line_mid)" class="line-mid" />
                <line x1="88" y1="26" x2="88" y2="94" fill="none" stroke-linecap="round" stroke-miterlimit="10" stroke-width="8" stroke="url(#line_right)" class="line-lr" />
                <path d="M40,77.19a8,8,0,1,1,0-.39" fill="#fff" stroke-linecap="round" stroke-miterlimit="10" stroke-width="8" stroke="url(#circle_left)" class="setting-circle" />
                <path d="M68,44.19a8,8,0,1,1,0-.39" fill="#fff" stroke-linecap="round" stroke-miterlimit="10" stroke-width="8" stroke="url(#circle_mid)" class="setting-circle" />
                <path d="M96,69.19a8,8,0,1,1,0-.39" fill="#fff" stroke-linecap="round" stroke-miterlimit="10" stroke-width="8" stroke="url(#circle_right)" class="setting-circle" />
            </svg>

            <svg display="none" id="shear" data-name="shear" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 120 120" class="loading-svg loading-svg-5">
                <defs>
                    <linearGradient id="shear_line_right" x1="34.46" y1="46.25" x2="76.96" y2="46.25" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stop-color="#f4d96a" />
                        <stop offset="1" stop-color="#fc9364" />
                    </linearGradient>
                    <linearGradient id="shear_line_left" x1="83.96" x2="41.46" xlink:href="#shear_line_right" />
                    <linearGradient id="shear_circle_right" x1="62.02" y1="78" x2="98.02" y2="78" xlink:href="#shear_line_right" />
                    <linearGradient id="shear_circle_left" x1="57.98" y1="78" x2="21.98" y2="78" xlink:href="#shear_line_right" />
                </defs>
                <title>剪切</title>
                <line
                    x1="72.96"
                    y1="65"
                    x2="38.46"
                    y2="27.5"
                    fill="none"
                    stroke-linecap="round"
                    stroke-miterlimit="10"
                    stroke-width="8"
                    stroke="url(#shear_line_right)"
                    class="shear-right"
                />
                <line
                    x1="45.46"
                    y1="65"
                    x2="79.96"
                    y2="27.5"
                    fill="none"
                    stroke-linecap="round"
                    stroke-miterlimit="10"
                    stroke-width="8"
                    stroke="url(#shear_line_left)"
                    class="shear-left"
                />
                <path
                    d="M94,78.32a14,14,0,1,1,0-.67"
                    fill="none"
                    stroke-linecap="round"
                    stroke-miterlimit="10"
                    stroke-width="8"
                    stroke="url(#shear_circle_right)"
                    class="shear-circle"
                />
                <path
                    d="M54,78.32a14,14,0,1,1,0-.67"
                    fill="none"
                    stroke-linecap="round"
                    stroke-miterlimit="10"
                    stroke-width="8"
                    stroke="url(#shear_circle_left)"
                    class="shear-circle"
                />
            </svg>
        </div>
    </div>`,
    props: {
        loadingType: {
            type: Number,
            // 默认1是不带logo  主要左边加载素材用   2是带logo 弹窗loading用
            default: 1,
        },
        size: {
            type: Number,
            default: 42,
        },
    },
    data() {
        return {
            loadingTimer: null,
        };
    },
    computed: {
        loadingSize() {
            return {
                width: `${this.size}px`,
                height: `${this.size}px`,
            };
        },
        /* 下载作品loading状态
           downloadLoadingStatus: {
           get: function () {
           return this.$store.state.modal.downloadLoadingStatus;
           },
           set: function (newValue) {
           this.$store.state.modal.downloadLoadingStatus = newValue;
           }
           }, */
    },
    methods: {
        loadingAnimation() {
            this.$nextTick(() => {
                if ($('.loading-svg').length > 0) {
                    let index = 0;
                    $(`.loading-svg-${index}`).show();

                    this.loadingTimer = setInterval(() => {
                        index++;

                        if (index > 5) {
                            index = 0;
                            // this.downloadLoadingStatus = false;
                        }

                        $(`.loading-svg-${index}`)
                            .show()
                            .siblings()
                            .hide();
                    }, 700);
                }
            });
        },
    },
    mounted() {
        this.loadingAnimation();
    },
    destroyed() {
        clearInterval(this.loadingTimer);
        // this.downloadLoadingStatus = true;
    },
});
