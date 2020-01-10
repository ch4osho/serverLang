
Ktu.directive.transferDom = Vue.directive('transferDom', {
    inserted(el, { value }, vnode) {
        if (el.getAttribute && el.getAttribute('data-transfer') !== 'true') return false;
        el.className = el.className ? `${el.className} v-transfer-dom` : 'v-transfer-dom';
        const { parentNode } = el;
        if (!parentNode) return;
        const home = document.createComment('');
        let hasMovedOut = false;

        if (value !== false) {
            // moving out, el is no longer in the document
            parentNode.replaceChild(home, el);
            // moving into new place
            Ktu.utils.getTarget(value).appendChild(el);
            hasMovedOut = true;
        }
        if (!el.__transferDomData) {
            el.__transferDomData = {
                parentNode,
                home,
                target: Ktu.utils.getTarget(value),
                hasMovedOut,
            };
        }
    },
    componentUpdated(el, { value }) {
        if (el.getAttribute && el.getAttribute('data-transfer') !== 'true') return false;
        // need to make sure children are done updating (vs. `update`)
        const ref$1 = el.__transferDomData;
        if (!ref$1) return;
        // homes.get(el)
        const { parentNode } = ref$1;
        const { home } = ref$1;
        // recall where home is
        const { hasMovedOut } = ref$1;

        if (!hasMovedOut && value) {
            // remove from document and leave placeholder
            parentNode.replaceChild(home, el);
            // append to target
            Ktu.utils.getTarget(value).appendChild(el);
            el.__transferDomData = Object.assign({}, el.__transferDomData, { hasMovedOut: true, target: Ktu.utils.getTarget(value) });
        } else if (hasMovedOut && value === false) {
            // previously moved, coming back home
            parentNode.replaceChild(el, home);
            el.__transferDomData = Object.assign({}, el.__transferDomData, { hasMovedOut: false, target: Ktu.utils.getTarget(value) });
        } else if (value) {
            // already moved, going somewhere else
            Ktu.utils.getTarget(value).appendChild(el);
        }
    },
    unbind(el) {
        if (el.getAttribute && el.getAttribute('data-transfer') !== 'true') return false;
        el.className = el.className.replace('v-transfer-dom', '');
        const ref$1 = el.__transferDomData;
        if (!ref$1) return;
        if (el.__transferDomData.hasMovedOut === true) {
            el.__transferDomData.parentNode && el.__transferDomData.parentNode.appendChild(el);
        }
        el.__transferDomData = null;
    },
});
