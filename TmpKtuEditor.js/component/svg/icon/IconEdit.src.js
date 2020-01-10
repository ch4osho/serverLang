Vue.component('icon-edit', {
    template: `
        <g type="edit" desc="编辑区图标">
            <symbol id="svg-edit-origin" viewBox="0 0 26 26" >
                <desc>还原</desc>
                <rect x="11" y="11" width="4" height="4"/>
                <path d="M17,7h-3v2h3v3h2V9C19,7.9,18.1,7,17,7z"/>
                <path d="M17,17h-3v2h3c1.1,0,2-0.9,2-2v-3h-2V17z"/>
                <path d="M9,14H7v3c0,1.1,0.9,2,2,2h3v-2H9V14z"/>
                <path d="M9,9h3V7H9C7.9,7,7,7.9,7,9v3h2V9z"/>
            </symbol>
            <symbol id="svg-edit-minus" viewBox="0 0 26 26" >
                <desc>缩小</desc>
                <path d="M17,12H9c-0.5,0-1,0.5-1,1s0.5,1,1,1h8c0.5,0,1-0.5,1-1S17.5,12,17,12z"/>
            </symbol>
            <symbol id="svg-edit-plus" viewBox="0 0 26 26" >
                <desc>放大</desc>
                <path d="M17,11h-3V8c0-0.5-0.5-1-1-1s-1,0.5-1,1v3H9c-0.6,0-1,0.5-1,1c0,0.5,0.5,1,1,1h3v3c0,0.5,0.5,1,1,1s1-0.5,1-1v-3h3c0.5,0,1-0.4,1-1C18,11.4,17.6,11,17,11z"/>
            </symbol>
            <symbol id="svg-edit-trigger" viewBox="0 0 26 26">
                <desc>收起</desc>
                <path d="M20,19l0-4c0-0.6-0.5-1-1-1v0c-0.6,0-1,0.4-1,1l0,1.6l-2.8-2.8c-0.4-0.4-1-0.4-1.4,0c-0.4,0.4-0.4,1,0,1.4l2.8,2.8L15,18c-0.5,0-1,0.5-1,1c0,0.6,0.5,1,1,1h4c0,0,0,0,0,0c0.3,0,0.5-0.1,0.7-0.3C19.9,19.5,20,19.3,20,19C20,19,20,19,20,19z"/>
                <path d="M11,18H8L8,8h10v3c0,0.6,0.4,1,1,1c0.6,0,1-0.4,1-1V8c0-1.1-0.9-2-2-2H8C6.9,6,6,6.9,6,8v2l0,6v2c0,1.1,0.9,2,2,2h2h1c0.6,0,1-0.4,1-1C12,18.4,11.6,18,11,18z"/>
            </symbol>
            <symbol id="svg-edit-tool" viewBox="0 0 26 26">
                <desc>标尺</desc>
                <path d="M19,7l0,4H12v2l0,5H8V7H19m0-2H8A2,2,0,0,0,6,7V18a2,2,0,0,0,2,2h4a2,2,0,0,0,2-2V13h5a2,2,0,0,0,2-2V7a2,2,0,0,0-2-2Z"/>
                <polygon points="10 10 8 10 8 11 10 11 10 10 10 10"/>
                <polygon points="10 12 8 12 8 13 10 13 10 12 10 12"/>
                <polygon points="10 14 8 14 8 15 10 15 10 14 10 14"/>
                <polygon points="10 16 8 16 8 17 10 17 10 16 10 16"/>
                <polygon points="12 7 11 7 11 9 12 9 12 7 12 7"/>
                <polygon points="14 7 13 7 13 9 14 9 14 7 14 7"/>
                <polygon points="16 7 15 7 15 9 16 9 16 7 16 7"/>
                <polygon points="18 7 17 7 17 9 18 9 18 7 18 7"/>
            </symbol>
        </g>
    `,
    data() {
        return {

        };
    },
    computed: {

    },
});
