
Ktu.directive.transferDom = Vue.directive('tip', {
    inserted(el, { value }, vnode) {
        el.classList.add('has-tips');
        if (value == 'up') {
            el.classList.add('up');
        }
    },
});
