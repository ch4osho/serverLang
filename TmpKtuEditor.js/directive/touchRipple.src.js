;(function () {
    const touchripple = (function () {
        const classlist = (function () {
            const trim = /^\s+|\s+$/g;
            const whitespace = /\s+/g;

            function interpret(input) {
                return typeof input === 'string' ? input.replace(trim, '').split(whitespace) : input;
            }

            function classes(el) {
                if (isElement(el)) {
                    return el.className.replace(trim, '').split(whitespace);
                }

                return [];
            }

            function set(el, input) {
                if (isElement(el)) {
                    el.className = interpret(input).join(' ');
                }
            }

            function add(el, input) {
                const current = remove(el, input);
                const values = interpret(input);

                current.push(...values);
                set(el, current);

                return current;
            }

            function remove(el, input) {
                const current = classes(el);
                const values = interpret(input);

                values.forEach(value => {
                    const i = current.indexOf(value);
                    if (i !== -1) {
                        current.splice(i, 1);
                    }
                });

                set(el, current);

                return current;
            }

            function contains(el, input) {
                const current = classes(el);
                const values = interpret(input);

                return values.every(value => current.indexOf(value) !== -1);
            }

            function isElement(o) {
                const elementObjects = typeof HTMLElement === 'object';

                return elementObjects ? o instanceof HTMLElement : isElementObject(o);
            }

            function isElementObject(o) {
                return o
                    && typeof o === 'object'
                    && typeof o.nodeName === 'string'
                    && o.nodeType === 1;
            }

            return {
                add,
                remove,
                contains,
                has: contains,
                set,
                get: classes,
            };
        }());

        // startRipple
        const startRipple = function (eventType, event) {
            // 获取事件目标元素
            let holder = event.currentTarget || event.target;

            if (holder.className.indexOf('disabled') > -1) {
                return;
            }

            // var holderColor = $(holder).css("backgroundColor");
            const $holder = $(holder);
            const holderColor =  $holder.attr('rippleColor') || $holder.find('svg')
                .css('fill') || $holder.find('label')
                .css('color') || $holder.css('color') || '#000000';
            /* function rgb2hex(rgb) {
               rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(,.+)?\)$/); */

            /* return {
               r : parseInt(rgb[1]),
               g : parseInt(rgb[2]),
               b : parseInt(rgb[3])
               }
               }
               var rgbObj = rgb2hex(holderColor); */
            const rippleColor = Ktu.color.rgbToHex(holderColor);

            // 当前元素不能包含既定元素
            if (!classlist.has(holder, 'touch-ripple')) {
                if (!holder) return;
                holder = holder.querySelector('.touch-ripple');
                if (!holder) return;
            }

            const prev = holder.getAttribute('data-ui-event');
            if (prev && prev !== eventType) return;

            holder.setAttribute('data-ui-event', eventType);

            // Create and position the ripple
            const rect = holder.getBoundingClientRect();
            /* var x = event.offsetX;
               var y; */

            /* if (x !== undefined) {
               y = event.offsetY;
               } else {
               x = event.clientX - rect.left;
               y = event.clientY - rect.top;
               } */

            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const ripple = document.createElement('div');
            let max;

            if (rect.width === rect.height) {
                max = rect.width * 1.412;
            } else {
                max = Math.sqrt(
                    (rect.width * rect.width) + (rect.height * rect.height)
                );
            }

            const dim = `${max * 2}px`;

            ripple.style.width = dim;
            ripple.style.height = dim;
            ripple.style.marginLeft = `${-max + x}px`;
            ripple.style.marginTop = `${-max + y}px`;
            ripple.style.backgroundColor = Ktu.color.hexToRgb(rippleColor, 0.5);

            // Activate/add the element
            ripple.className = 'ripple';
            holder.appendChild(ripple);

            setTimeout(() => {
                classlist.add(ripple, 'held');
            }, 0);

            const releaseEvent = (eventType === 'mousedown' ? 'mouseup' : 'touchend');

            const release = function () {
                document.removeEventListener(releaseEvent, release);

                classlist.add(ripple, 'done');

                // Larger than the animation duration in CSS
                setTimeout(() => {
                    $.contains(holder, ripple) && holder.removeChild(ripple);

                    if (!holder.children.length) {
                        classlist.remove(holder, 'active');
                        holder.removeAttribute('data-ui-event');
                    }
                }, 450);
            };

            document.addEventListener(releaseEvent, release);
        };

        // 鼠标按下
        const handleMouseDown = function (e) {
            // Trigger on left click only
            if (e.button === 0) {
                startRipple(e.type, e);
            }
        };

        // 触摸事件开始
        const handleTouchStart = function (e) {
            const touchs = e.changedTouches;
            if (touchs) {
                touchs.forEach(t => {
                    startRipple(e.type, t);
                });
            }
        };

        return {
            startRipple,
            handleMouseDown,
            handleTouchStart,
        };
    }());

    // 暂时好像没用到 先注释掉
    /* const GetCurrentStyle = function (obj, attr) {
        if (obj.currentStyle) {
            return obj.currentStyle[attr];
        }
        return getComputedStyle(obj, false)[attr];
    }; */

    // 指令用法  一般都适用这种形式
    Vue.directive('touch-ripple', {
        bind(el) {
            const elValue = this && this.el ? this.el : el;
            const element = this ? elValue : el;
            // console.log(element)
            if (element) {
                const ripple = document.createElement('div');
                ripple.className = 'touch-ripple';
                element.appendChild(ripple);
                // 指令执行时组件中的标签尚未转换为真实的dom，此时读不出css属性，需要nextTick读取
                Vue.nextTick(() => {
                    (!($(element).css('position')) || $(element).css('position') === 'static') && (element.style.position = 'relative');
                });

                /* element.style.position = 'relative';
                   element.addEventListener('touchstart', touchripple.handleTouchStart) */
                element.addEventListener('mousedown', touchripple.handleMouseDown);
            }
        },
        update(value) {
            // console.log(value)
        },
        unbind(el) {
            const elValue = this && this.el ? this.el : el;
            const element = this ? elValue : el;
            if (element) {
                element.removeEventListener('mousedown', touchripple.handleMouseDown);
                // element.removeEventListener('touchstart', touchripple.handleTouchStart)
            }
        },
    });

    // 如果不能添加内联元素 要适用组件方法
    Vue.component('touch-ripple', {
        template: `
        <div style="position:relative">
            <slot></slot>
            <div class="touch-ripple"></div>
        </div>`,
        name: 'touch-ripple',
        mounted() {
            this.initialize();
        },
        beforeDestroy() {
            if (this.$el) {
                this.$el.removeEventListener('mousedown', touchripple.handleMouseDown);
                // this.$el.removeEventListener('touchstart', touchripple.handleTouchStart)
            }
        },
        methods: {
            initialize() {
                if (this.$el) {
                    // console.log(this, this.$el.ontouchstart)
                    this.$el.addEventListener('mousedown', touchripple.handleMouseDown);
                    /*
                     if (window.ontouchstart === null) {
                     this.$el.addEventListener('touchstart', touchripple.handleTouchStart)
                     } else {
                     this.$el.addEventListener('mousedown', touchripple.handleMouseDown)
                     }
                     */
                }
            },
        },
    });
}());
