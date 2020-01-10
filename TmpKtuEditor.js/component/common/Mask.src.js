Vue.component('ktuMask', {
    template: `
    <transition name="fade">
        <div v-show="showMask" class="mask f_DNSTraffic TheModal isTop"></div>
    </transition>
    `,
    computed: {
        showMask() {
            return this.$store.state.base.showMask;
        },
    },
    methods: {
        /* click: function(event){
           this.$emit('click', event);
           } */
    },
});
