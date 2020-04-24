Component({
    properties: {
        isFringeScreen: {
            type: Boolean,
            value: false
        }
    },
    data: {
        showModal: false
    },
    methods: {
        showDownloadModal(){
            this.setData({
                showModal: !this.data.showModal
            })
        }
    }
})
