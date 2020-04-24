Component({
    options: {
        multipleSlots: true
    },
    properties: {
        btnText: {
            type: String,
            value: "立即下载：回复 1"
        },
        showModal: {
            type: Boolean,
            value: false
        },
        showClose: {
            type: Boolean,
            value: true
        }
    },
    methods: {
        hideModal(){
            this.triggerEvent('hideModal')
        }
    },
});
