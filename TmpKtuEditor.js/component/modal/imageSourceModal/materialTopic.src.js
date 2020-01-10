Vue.component('image-source-material-topic', {
    template: `
    <div class="topic-item-list">
        <div class="topic-item" v-if="index < showLength || (materialTopic.length == showLength + 1)" v-for="(item,index) in materialTopic" :class="{active:materialTopicValue == item.key}" @click="clickMaterialTopic(item)">{{item.name}}</div>
        <div class="more-item-switch" :class="{active:isShow || isMore}" v-if="materialTopic.length > (showLength + 1)" @click="show">
            <svg><use xlink:href="#svg-source-switch"></use></svg>
            <transition name="slide-up">
                <div class="more-item-popup clearfix" v-show="isShow">
                    <div v-if="index > showLength" class="more-item" :class="{active:materialTopicValue == item.key}" v-for="(item,index) in materialTopic" @click="clickMaterialTopic(item)">{{item.name}}</div>
                </div>
            </transition>
        </div>
    </div>
    `,
    mixins: [Ktu.mixins.popupCtrl],
    props: {
        materialTopic: Array,
        materialTopicValue: Number,
        showLength: {
            type: Number,
            default: 10,
        },
    },
    data() {
        return {
        };
    },
    computed: {
        // 判断是否选中了 更多主题里面的主题 
        isMore() {
            if (this.materialTopic.length < this.showLength) return false;
            for (let i = 0;i < this.showLength;i++) {
                if (this.materialTopic[i].key === this.materialTopicValue) return false;
            }
            return true;
        },
    },
    methods: {
        clickMaterialTopic(item) {
            this.$emit('click', item);
        },
    },
});
