Component({
    properties: {
        show: {
            type: Boolean,
            value: false,
            observer(val){
                this._showTotast()
            }
        },
        await: {
            type: Number,
            value: 2000
        },
        msg: {
            type: String,
            value: ''
        }
    },
    data: {
        timeout: null
    },
    methods: {
        _showTotast(){
            if(this.data.show){
                this.data.timeout = setTimeout(() => {
                    this.setData({
                        show: false
                    });
                    this.data.timeout = null;
                }, this.data.await);
            }
        }
    }
})