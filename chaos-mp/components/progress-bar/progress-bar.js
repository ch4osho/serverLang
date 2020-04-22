const app = getApp();
Component({
    /**
     * 组件的一些选项
     */
    options: {},
    /**
     * 组件的对外属性
     */
    properties: {
        progressArr: {
            type: Array,
            default: [
                {
                    label: '选项一'
                },
                {
                    label: '选项二'
                },
                {
                    label: '选项三'
                }
            ]
        },
        // 进度从零算起
        currentStep: {
            type: Number,
            default: 0,
            observer(val){
              this.setData({
                currentBarWidth: val == this.data.progressArr.length - 1 ? '100%' : this.getCurrentProgressBarWidth()
              })
              console.log(val)
            }
        },
    },
    /**
     * 组件的方法列表
     */
    methods: {
        // 计算当前进度条长度
        getCurrentProgressBarWidth() {
            let width = this.getDouble(
                (((this.data.currentStep) * 2 + 1) *
                    100) /
                    (2 * this.data.progressArr.length)
            ) + '%';
            return width;
        },
        // 保留小数点后两位
        getDouble(num) {
            return Math.floor(num * 100) / 100;
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
      // 当前进度
      currentBarWidth: '',
      // 每项长度
      labelWidth: ''
  },
    attached(){
      this.setData({
        currentBarWidth: this.getCurrentProgressBarWidth(),
        labelWidth: this.getDouble(100 / this.data.progressArr.length) + '%',
      })
    }
});
