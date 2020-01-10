Vue.component('edit-thumb', {
    template: `<div class="edit-thumb" id="editThumb">
                    <div id="viewNavigator" class="viewNavigator fadeIn">
                        <div class="thumbView">
                                <img id="thumbImage" class="thumb-image" />
                            </div>
                            
                            <div class="wrapper">
                                <canvas id="naviCanvas"
                                 @mousedown="grabStart">
                                </canvas>
                            </div>
                    </div>
                    <div id="thumb-trigger" class="thumb-trigger" @click="triggerThumb">
                        <svg class="thumb-trigger-icon">
                            <use xlink:href="#svg-edit-trigger" class="icon-use"></use>
                        </svg>
                    </div>
                </div>`,
    data() {
    	return {

    	};
    },
    computed: {
    },
    mounted() {

    },
    methods: {
        triggerThumb() {
            Ktu.thumb.triggerThumb();
        },
        grabStart(ev) {
            console.log('this is grabing')
            Ktu.element.checkAndExitClip();
            Ktu.thumb.grabStart(ev);

            $(document).on('mousemove.thumb', this.grabing.bind(this));
            $(document).on('mouseup.thumb mouseleave.thumb', this.grabEnd.bind(this));
            ev.stopPropagation();
        },
        grabing(ev) {
            Ktu.thumb.grabing(ev);
            ev.stopPropagation();
        },
        grabEnd(ev) {
            Ktu.thumb.grabEnd(ev);
            $(document).off('mousemove.thumb mouseup.thumb mouseleave.thumb ');
            ev.stopPropagation();
        },
    },
});
