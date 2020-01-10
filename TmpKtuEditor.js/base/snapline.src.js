class SnapLine {
    constructor(options) {
        this.__lastClickTime = Date.now();
        this.snapDistance = 4;
        this.guildLineEnabled = true;
    }

    checkTranslate(target) {
        const { scale } = Ktu.edit;

        const snapDistance = this.snapDistance / scale;

        target.snapOffsetX = 0;
        target.snapOffsetY = 0;

        this.hideAllGuides();

        // 是否开启辅助线吸附
        const openAssistSnap = Ktu.store.state.msg.openAssistLine && Ktu.store.state.msg.isAutoSnap;

        const assistOffsetx = Ktu.store.state.msg.assistLinesx;
        const assistOffsety = Ktu.store.state.msg.assistLinesy;

        assistOffsetx.forEach(item => {
            item.isSnap = false;
        });
        assistOffsety.forEach(item => {
            item.isSnap = false;
        });

        if (Mousetrap.ctrl || Mousetrap.command) {} else {
            if (this.guildLineEnabled) {
                // 分别对应横纵三条线
                const guideLines = [0, 0, 0, 0, 0, 0];
                let guideIndexH; let guideIndexV;
                const guideOffset = [undefined, undefined, undefined, undefined, undefined, undefined];
                const guideLinesTag = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE];

                let allCompareTargets = [];

                if (!Mousetrap.shift) allCompareTargets = Ktu.selectedTemplateData.objects.slice(1);

                // 加上对绘布边缘的判定
                allCompareTargets.push({
                    active: false,
                    coords: Ktu.selectedTemplateData.objects[0].coords,
                    isCanvas: true,
                });
                const targetCoords = target.coords;
                // 若该元素在组内进行编辑，则需加上组的left,top值
                if (target.group) {
                    const keys = Object.keys(targetCoords);
                    for (const key of keys) {
                        targetCoords[key].x += target.group.left;
                        targetCoords[key].y += target.group.top;
                    }
                }
                allCompareTargets.forEach(obj => {
                    if (!obj.isSelected) {
                        const _coords = obj.coords;

                        // 判断左边辅助线
                        const tlx = Math.min(targetCoords.tl.x,  targetCoords.bl.x);
                        const ll = _coords.tl.x - tlx;
                        const cl = _coords.center.x - tlx;
                        const rl = _coords.br.x - tlx;
                        const minl = Math.min(Math.abs(ll), Math.abs(cl), Math.abs(rl));
                        if (minl < Math.min(snapDistance, guideLinesTag[0])) {
                            guideLines[0] = obj;
                            guideLinesTag[0] = minl;
                            if (Math.abs(ll) == minl) {
                                guideOffset[0] = ll;
                            } else if (Math.abs(cl) == minl) {
                                guideOffset[0] = cl;
                            } else if (Math.abs(rl) == minl) {
                                guideOffset[0] = rl;
                            }
                            guideIndexV = 0;
                        }

                        // 判断横向中辅助线
                        const lc = _coords.tl.x - targetCoords.center.x;
                        let cc = _coords.center.x - targetCoords.center.x;
                        const rc = _coords.br.x - targetCoords.center.x;
                        let minc = Math.min(Math.abs(lc), Math.abs(cc), Math.abs(rc));
                        if (Math.abs(minc) < Math.min(snapDistance, guideLinesTag[1])) {
                            guideLines[1] = obj;
                            guideLinesTag[1] = minc;
                            if (Math.abs(lc) == minc) guideOffset[1] = lc;
                            else if (Math.abs(cc) == minc) guideOffset[1] = cc;
                            else if (Math.abs(rc) == minc) guideOffset[1] = rc;
                            if (minc <= guideLinesTag[1]) guideIndexV = 1;
                        }

                        // 判断右辅助线
                        const blx = Math.max(targetCoords.tr.x, targetCoords.br.x);
                        const lr = _coords.tl.x - blx;
                        const cr = _coords.center.x - blx;
                        const rr = _coords.br.x - blx;
                        const minr = Math.min(Math.abs(lr), Math.abs(cr), Math.abs(rr));
                        if (Math.abs(minr) < Math.min(snapDistance, guideLinesTag[2])) {
                            guideLines[2] = obj;
                            guideLinesTag[2] = minr;
                            if (Math.abs(lr) == minr) {
                                guideOffset[2] = lr;
                            } else if (Math.abs(cr) == minr) {
                                guideOffset[2] = cr;
                            } else if (Math.abs(rr) == minr) {
                                guideOffset[2] = rr;
                            }
                            if (minr <= Math.min(guideLinesTag[0], guideLinesTag[1])) guideIndexV = 2;
                        }

                        // 判断上辅助线
                        const tly = Math.min(targetCoords.tl.y, targetCoords.tr.y);
                        const tt = _coords.tl.y - tly;
                        const ct = _coords.center.y - tly;
                        const bt = _coords.br.y - tly;
                        const mint = Math.min(Math.abs(tt), Math.abs(ct), Math.abs(bt));
                        if (mint < Math.min(snapDistance, guideLinesTag[3])) {
                            guideLines[3] = obj;
                            guideLinesTag[3] = mint;
                            if (Math.abs(tt) == mint) {
                                guideOffset[3] = tt;
                            } else if (Math.abs(ct) == mint) {
                                guideOffset[3] = ct;
                            } else if (Math.abs(bt) == mint) {
                                guideOffset[3] = bt;
                            }
                            guideIndexH = 3;
                        }
                        // 判断纵中辅助线
                        const tc = _coords.tl.y - targetCoords.center.y;
                        cc = _coords.center.y - targetCoords.center.y;
                        const bc = _coords.br.y - targetCoords.center.y;
                        minc = Math.min(Math.abs(tc), Math.abs(cc), Math.abs(bc));
                        if (minc < Math.min(snapDistance, guideLinesTag[4])) {
                            guideLines[4] = obj;
                            guideLinesTag[4] = minc;
                            if (Math.abs(tc) == minc) guideOffset[4] = tc;
                            else if (Math.abs(cc) == minc) guideOffset[4] = cc;
                            else if (Math.abs(bc) == minc) guideOffset[4] = bc;
                            if (minc <= guideLinesTag[3]) guideIndexH = 4;
                        }
                        // 判断右辅助线
                        const bly = Math.max(targetCoords.bl.y, targetCoords.br.y);
                        const tb = _coords.tl.y - bly;
                        const cb = _coords.center.y - bly;
                        const bb = _coords.br.y - bly;
                        const minb = Math.min(Math.abs(tb), Math.abs(cb), Math.abs(bb));
                        if (minb < Math.min(snapDistance, guideLinesTag[5])) {
                            guideLines[5] = obj;
                            guideLinesTag[5] = minb;
                            if (Math.abs(tb) == minb) {
                                guideOffset[5] = tb;
                            } else if (Math.abs(cb) == minb) {
                                guideOffset[5] = cb;
                            } else if (Math.abs(bb) == minb) {
                                guideOffset[5] = bb;
                            }
                            if (minb <= Math.min(guideLinesTag[3], guideLinesTag[4])) guideIndexH = 5;
                        }
                    }
                }, this);

                if (openAssistSnap) {
                    // 对齐水平辅助线
                    assistOffsetx.forEach((item, index) => {
                        const linex = item.x;
                        const gline = { isLine: true, isCanvas: true, key: index };
                        // 判断左边辅助线
                        const tlx = Math.min(targetCoords.tl.x,  targetCoords.bl.x);
                        const minl = linex - tlx;

                        if (Math.abs(minl) < Math.min(snapDistance, guideLinesTag[0])) {
                            guideLines[0] = gline;
                            guideOffset[0] = minl;
                            guideLinesTag[0] = minl;
                            guideIndexV = 0;
                        }

                        // 判断横向中辅助线
                        const minc = linex - targetCoords.center.x;
                        if (Math.abs(minc) < Math.min(snapDistance, guideLinesTag[1])) {
                            guideLines[1] = gline;
                            guideOffset[1] = minc;
                            guideLinesTag[1] = minc;

                            if (minc <= guideLinesTag[1]) guideIndexV = 1;
                        }

                        // 判断右辅助线
                        const blx = Math.max(targetCoords.tr.x, targetCoords.br.x);
                        const minr = linex - blx;
                        if (Math.abs(minr) < Math.min(snapDistance, guideLinesTag[2])) {
                            guideLines[2] = gline;
                            guideOffset[2] = minr;
                            guideLinesTag[2] = minr;
                            if (minr <= Math.min(guideLinesTag[0], guideLinesTag[1])) guideIndexV = 2;
                        }
                    });

                    // 对齐垂直辅助线
                    assistOffsety.forEach((item, index) => {
                        const liney = item.y;
                        const gline = { isLine: true, isCanvas: true, key: index };
                        // 判断上辅助线
                        const tly = Math.min(targetCoords.tl.y, targetCoords.tr.y);
                        const mint = liney - tly;

                        if (Math.abs(mint) < Math.min(snapDistance, guideLinesTag[3])) {
                            guideLines[3] = gline;
                            guideOffset[3] = mint;
                            guideLinesTag[3] = mint;
                            guideIndexH = 3;
                        }
                        // 判断纵中辅助线
                        const minc = liney - targetCoords.center.y;
                        if (Math.abs(minc) < Math.min(snapDistance, guideLinesTag[4])) {
                            guideLines[4] = gline;
                            guideOffset[4] = minc;
                            guideLinesTag[4] = minc;
                            if (minc <= guideLinesTag[3]) guideIndexH = 4;
                        }
                        // 判断右辅助线
                        const bly = Math.max(targetCoords.bl.y, targetCoords.br.y);
                        const minb = liney - bly;
                        if (Math.abs(minb) < Math.min(snapDistance, guideLinesTag[5])) {
                            guideLines[5] = gline;
                            guideOffset[5] = minb;
                            guideLinesTag[5] = minb;
                            if (minb <= Math.min(guideLinesTag[3], guideLinesTag[4])) guideIndexH = 5;
                        }
                    });
                }

                for (let g = 0; g < 6; g++) {
                    const guide = guideLines[g];
                    const _coords = guide.coords;

                    if (guide == 0 || guideOffset[g] == undefined) continue;

                    let s; let e;
                    // 画竖线
                    const tlx = Math.min(targetCoords.tl.x, targetCoords.bl.x);
                    const brx = Math.max(targetCoords.tr.x, targetCoords.br.x);
                    const tly = Math.min(targetCoords.tl.y, targetCoords.tr.y);
                    const bly = Math.max(targetCoords.bl.y, targetCoords.br.y);

                    if (g == 0) {
                        s = {
                            x: tlx + guideOffset[g],
                            y: guide.isCanvas ? 0 : _coords.center.y,
                        };
                        e = {
                            x: tlx + guideOffset[g],
                            y: guide.isCanvas ? Ktu.edit.size.height : targetCoords.center.y,
                        };

                        target.snapOffsetX = guideOffset[g];
                    } else if (g == 1) {
                        s = {
                            x: targetCoords.center.x + guideOffset[g],
                            y: guide.isCanvas ? 0 : _coords.center.y,
                        };
                        e = {
                            x: targetCoords.center.x + guideOffset[g],
                            y: guide.isCanvas ? Ktu.edit.size.height : targetCoords.center.y,
                        };
                        if (!target.snapOffsetX || Math.abs(target.snapOffsetX) > Math.abs(guideOffset[g])) target.snapOffsetX = guideOffset[g];
                    } else if (g == 2) {
                        s = {
                            x: brx + guideOffset[g] - 1,
                            y: guide.isCanvas ? 0 : _coords.center.y,
                        };
                        e = {
                            x: brx + guideOffset[g] - 1,
                            y: guide.isCanvas ? Ktu.edit.size.height : targetCoords.center.y,
                        };
                        if (!target.snapOffsetX || Math.abs(target.snapOffsetX) > Math.abs(guideOffset[g])) target.snapOffsetX = guideOffset[g];
                    }
                    // 画横线
                    else if (g == 3) {
                        s = {
                            x: guide.isCanvas ? 0 : _coords.center.x,
                            y: tly + guideOffset[g],
                        };
                        e = {
                            x: guide.isCanvas ? Ktu.edit.size.width : targetCoords.center.x,
                            y: tly + guideOffset[g],
                        };
                        target.snapOffsetY = guideOffset[g];
                    } else if (g == 4) {
                        s = {
                            x: guide.isCanvas ? 0 : _coords.center.x,
                            y: targetCoords.center.y + guideOffset[g],
                        };
                        e = {
                            x: guide.isCanvas ? Ktu.edit.size.width : targetCoords.center.x,
                            y: targetCoords.center.y + guideOffset[g],
                        };
                        if (!target.snapOffsetY || Math.abs(target.snapOffsetY) > Math.abs(guideOffset[g])) target.snapOffsetY = guideOffset[g];
                    } else if (g == 5) {
                        s = {
                            x: guide.isCanvas ? 0 : _coords.center.x,
                            y: bly + guideOffset[g] - 1,
                        };
                        e = {
                            x: guide.isCanvas ? Ktu.edit.size.width : targetCoords.center.x,
                            y: bly + guideOffset[g] - 1,
                        };
                        if (!target.snapOffsetY || Math.abs(target.snapOffsetY) > Math.abs(guideOffset[g])) target.snapOffsetY = guideOffset[g];
                    }

                    const isHLine = g >= 3;

                    if (guide.isLine && !isHLine) {
                        this.changeSnapLineState('x', guide.key);
                        continue;
                    }
                    if (guide.isLine && isHLine) {
                        this.changeSnapLineState('y', guide.key);
                        continue;
                    }

                    if (isHLine && g == guideIndexH || !isHLine && g == guideIndexV) {
                        // 处理一下点位置,保证起点在终点的左/上方
                        if (isHLine && s.x > e.x || !isHLine && s.y > e.y) {
                            const tmp = s;
                            s = e;
                            e = tmp;
                        }
                        this.addGuideLine(s, e, isHLine, guide.isCanvas);
                    }
                }
            }
        }

        target.left += target.snapOffsetX;
        target.top += target.snapOffsetY;

        if (target.type === 'multi') {
            target.objects.forEach((object, index) => {
                object.left += target.snapOffsetX;
                object.top += target.snapOffsetY;
                object.setCoords();
            });
        }
        target.setCoords();
    }

    changeSnapLineState(type, key) {
        if (type === 'x') {
            const lineObj = Ktu.store.state.msg.assistLinesx[key];
            lineObj.isSnap = true;
        } else if (type === 'y') {
            const lineObj = Ktu.store.state.msg.assistLinesy[key];
            lineObj.isSnap = true;
        }
    }

    checkResize(target, corner, equally) {
        const self = this;
        self.hideAllGuides();

        const { scale } = Ktu.edit;

        const snapDistance = 1 / scale;

        target.snapOffsetX = 0;
        target.snapOffsetY = 0;

        // 是否开启辅助线吸附
        const openAssistSnap = Ktu.store.state.msg.openAssistLine && Ktu.store.state.msg.isAutoSnap;

        if ((Mousetrap.ctrl || Mousetrap.command)) {} else {
            if (this.guildLineEnabled) {
                /* 0    1    2
                   |    |    |
                   3---------------
                   |    |    |
                   4---------------
                   |    |    |
                   5---------------
                   |    |    | */

                // 分别对应横纵三条线
                const guideLines = [0, 0, 0, 0, 0, 0];
                let guideIndexH; let guideIndexV;
                const guideOffset = [undefined, undefined, undefined, undefined, undefined, undefined];
                const guideLinesTag = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE];

                const targetCoords = target.coords;
                // 若该元素在组内进行编辑，则需加上组的left,top值
                if (target.group) {
                    const keys = Object.keys(targetCoords);
                    for (const key of keys) {
                        targetCoords[key].x += target.group.left;
                        targetCoords[key].y += target.group.top;
                    }
                }
                const onlyCheckBounds = true;

                const allCompareTargets = Ktu.selectedTemplateData.objects.slice(1);

                allCompareTargets.push({
                    active: false,
                    coords: Ktu.selectedTemplateData.objects[0].coords,
                    isCanvas: true,
                });

                allCompareTargets.forEach(obj => {
                    if (!obj.isSelected) {
                        const { coords } = obj;

                        /* 判断左边辅助线
                           只有在拖的是左边的时候才需要CHECK */
                        if (corner.indexOf('l') >= 0) {
                            const ll = coords.tl.x - targetCoords.tl.x;
                            const cl = coords.center.x - targetCoords.tl.x;
                            const rl = coords.br.x - targetCoords.tl.x;
                            const minl = onlyCheckBounds ? Math.min(Math.abs(ll), Math.abs(rl)) : Math.min(Math.abs(ll), Math.abs(cl), Math.abs(rl));
                            if (minl < Math.min(snapDistance, guideLinesTag[0])) {
                                guideLines[0] = obj;
                                guideLinesTag[0] = minl;
                                if (Math.abs(ll) == minl) guideOffset[0] = ll;
                                else if (Math.abs(cl) == minl && !onlyCheckBounds) guideOffset[0] = cl;
                                else if (Math.abs(rl) == minl) guideOffset[0] = rl;
                                guideIndexV = 0;
                            }
                        }

                        // 判断横向中辅助线
                        if (!onlyCheckBounds) {
                            const lc = coords.tl.x - targetCoords.center.x;
                            const cc = coords.center.x - targetCoords.center.x;
                            const rc = coords.br.x - targetCoords.center.x;
                            const minc = Math.min(Math.abs(lc), Math.abs(cc), Math.abs(rc));
                            if (Math.abs(minc) < Math.min(snapDistance, guideLinesTag[1])) {
                                guideLines[1] = obj;
                                guideLinesTag[1] = minc;
                                if (Math.abs(lc) == minc) guideOffset[1] = lc;
                                else if (Math.abs(cc) == minc) guideOffset[1] = cc;
                                else if (Math.abs(rc) == minc) guideOffset[1] = rc;
                                if (minc <= guideLinesTag[0]) guideIndexV = 1;
                            }
                        }

                        /* 判断右辅助线
                           只有在拖的是右边的时候才需要CHECK */
                        if (corner.indexOf('r') >= 0) {
                            const lr = coords.tl.x - targetCoords.br.x;
                            const cr = coords.center.x - targetCoords.br.x;
                            const rr = coords.br.x - targetCoords.br.x;
                            const minr = onlyCheckBounds ? Math.min(Math.abs(lr), Math.abs(rr)) : Math.min(Math.abs(lr), Math.abs(cr), Math.abs(rr));
                            if (Math.abs(minr) < Math.min(snapDistance, guideLinesTag[2])) {
                                guideLines[2] = obj;
                                guideLinesTag[2] = minr;
                                if (Math.abs(lr) == minr) guideOffset[2] = lr;
                                else if (Math.abs(cr) == minr) guideOffset[2] = cr;
                                else if (Math.abs(rr) == minr) guideOffset[2] = rr;
                                if (minr <= Math.min(guideLinesTag[0], guideLinesTag[1])) guideIndexV = 2;
                            }
                        }

                        /* 判断上辅助线
                           只有在拖的是上边的时候才需要CHECK */
                        if (corner.indexOf('t') >= 0) {
                            const tt = coords.tl.y - targetCoords.tl.y;
                            const ct = coords.center.y - targetCoords.tl.y;
                            const bt = coords.br.y - targetCoords.tl.y;
                            const mint = onlyCheckBounds ? Math.min(Math.abs(tt), Math.abs(bt)) : Math.min(Math.abs(tt), Math.abs(ct), Math.abs(bt));
                            if (mint < Math.min(snapDistance, guideLinesTag[3])) {
                                guideLines[3] = obj;
                                guideLinesTag[3] = mint;
                                if (Math.abs(tt) == mint) guideOffset[3] = tt;
                                else if (Math.abs(ct) == mint) guideOffset[3] = ct;
                                else if (Math.abs(bt) == mint) guideOffset[3] = bt;
                                guideIndexH = 3;
                            }
                        }

                        // 判断纵中辅助线
                        if (!onlyCheckBounds) {
                            const tc = coords.tl.y - targetCoords.center.y;
                            const cc = coords.center.y - targetCoords.center.y;
                            const bc = coords.br.y - targetCoords.center.y;
                            const minc = Math.min(Math.abs(tc), Math.abs(cc), Math.abs(bc));
                            if (minc < Math.min(snapDistance, guideLinesTag[4])) {
                                guideLines[4] = obj;
                                guideLinesTag[4] = minc;
                                if (Math.abs(tc) == minc) guideOffset[4] = tc;
                                else if (Math.abs(cc) == minc) guideOffset[4] = cc;
                                else if (Math.abs(bc) == minc) guideOffset[4] = bc;
                                if (minc <= guideLinesTag[3]) guideIndexH = 4;
                            }
                        }

                        /* 判断右辅助线
                           只有在拖的是下边的时候才需要CHECK */
                        if (corner.indexOf('b') >= 0) {
                            const tb = coords.tl.y - targetCoords.br.y;
                            const cb = coords.center.y - targetCoords.br.y;
                            const bb = coords.br.y - targetCoords.br.y;
                            const minb = onlyCheckBounds ? Math.min(Math.abs(tb), Math.abs(bb)) : Math.min(Math.abs(tb), Math.abs(cb), Math.abs(bb));
                            if (minb < Math.min(snapDistance, guideLinesTag[5])) {
                                guideLines[5] = obj;
                                guideLinesTag[5] = minb;
                                if (Math.abs(tb) == minb) guideOffset[5] = tb;
                                else if (Math.abs(cb) == minb) guideOffset[5] = cb;
                                else if (Math.abs(bb) == minb) guideOffset[5] = bb;
                                if (minb <= Math.min(guideLinesTag[3], guideLinesTag[4])) guideIndexH = 5;
                            }
                        }
                    }
                }, this);

                if (openAssistSnap) {
                    const assistOffsetx = Ktu.store.state.msg.assistLinesx;
                    const assistOffsety = Ktu.store.state.msg.assistLinesy;

                    // 对齐水平辅助线
                    assistOffsetx.forEach((item, index) => {
                        const linex = item.x;
                        const gline = { isLine: true, isCanvas: true, key: index };

                        // 判断左边辅助线
                        if (corner.indexOf('l') >= 0) {
                            const minl = linex - targetCoords.tl.x;
                            if (Math.abs(minl) < Math.min(snapDistance, guideLinesTag[0])) {
                                guideLines[0] = gline;
                                guideOffset[0] = minl;
                                guideLinesTag[0] = minl;
                                guideIndexV = 0;
                            }
                        }

                        // 判断横向中辅助线
                        if (!onlyCheckBounds) {
                            const minc = linex - targetCoords.center.x;
                            if (Math.abs(minc) < Math.min(snapDistance, guideLinesTag[1])) {
                                guideLines[1] = gline;
                                guideOffset[1] = minc;
                                guideLinesTag[1] = minc;
                                if (minc <= guideLinesTag[0]) guideIndexV = 1;
                            }
                        }

                        // 判断右辅助线
                        if (corner.indexOf('r') >= 0) {
                            const minr = linex - targetCoords.br.x;
                            if (Math.abs(minr) < Math.min(snapDistance, guideLinesTag[2])) {
                                guideLines[2] = gline;
                                guideOffset[2] = minr;
                                guideLinesTag[2] = minr;
                                if (minr <= Math.min(guideLinesTag[0], guideLinesTag[1])) guideIndexV = 2;
                            }
                        }
                    });

                    // 对齐垂直辅助线
                    assistOffsety.forEach((item, index) => {
                        const liney = item.y;
                        const gline = { isLine: true, isCanvas: true, key: index };
                        // 判断上辅助线
                        if (corner.indexOf('t') >= 0) {
                            const mint = liney - targetCoords.tl.y;
                            if (Math.abs(mint)  < Math.min(snapDistance, guideLinesTag[3])) {
                                guideLines[3] = gline;
                                guideOffset[3] = mint;
                                guideLinesTag[3] = mint;
                                guideIndexH = 3;
                            }
                        }

                        // 判断纵中辅助线
                        if (!onlyCheckBounds) {
                            const minc = liney - targetCoords.center.y;
                            if (Math.abs(minc) < Math.min(snapDistance, guideLinesTag[4])) {
                                guideLines[4] = gline;
                                guideOffset[4] = minc;
                                guideLinesTag[4] = minc;
                                if (minc <= guideLinesTag[3]) guideIndexH = 4;
                            }
                        }

                        // 判断右辅助线
                        if (corner.indexOf('b') >= 0) {
                            const minb = liney - targetCoords.br.y;
                            if (Math.abs(minb)  < Math.min(snapDistance, guideLinesTag[5])) {
                                guideLines[5] = gline;
                                guideOffset[5] = minb;
                                guideLinesTag[5] = minb;
                                if (minb <= Math.min(guideLinesTag[3], guideLinesTag[4])) guideIndexH = 5;
                            }
                        }
                    });
                }

                for (let g = 0; g < 6; g++) {
                    const guide = guideLines[g];
                    const _coords = guide.coords;

                    if (guide == 0 || guideOffset[g] == undefined) continue;
                    let s; let e;
                    // 画竖线

                    if (g == 0) {
                        s = {
                            x: targetCoords.tl.x + guideOffset[g],
                            y: guide.isCanvas ? 0 : _coords.center.y,
                        };
                        e = {
                            x: targetCoords.tl.x + guideOffset[g],
                            y: guide.isCanvas ? Ktu.edit.size.height : targetCoords.center.y,
                        };
                        target.snapOffsetX = guideOffset[g];
                    } else if (g == 1 && !onlyCheckBounds) {
                        s = {
                            x: targetCoords.center.x + guideOffset[g],
                            y: guide.isCanvas ? 0 : _coords.center.y,
                        };
                        e = {
                            x: targetCoords.center.x + guideOffset[g],
                            y: guide.isCanvas ? Ktu.edit.size.height : targetCoords.center.y,
                        };
                        if (!target.snapOffsetX || Math.abs(target.snapOffsetX) > Math.abs(guideOffset[g])) target.snapOffsetX = guideOffset[g];
                    } else if (g == 2) {
                        s = {
                            x: targetCoords.br.x + guideOffset[g],
                            y: guide.isCanvas ? 0 : _coords.center.y,
                        };
                        e = {
                            x: targetCoords.br.x + guideOffset[g],
                            y: guide.isCanvas ? Ktu.edit.size.height : targetCoords.center.y,
                        };
                        if (!onlyCheckBounds) {
                            if (!target.snapOffsetX || Math.abs(target.snapOffsetX) > Math.abs(guideOffset[g])) target.snapOffsetX = guideOffset[g];
                        } else {
                            target.snapOffsetX = -guideOffset[g];
                        }
                    }
                    // 画横线
                    else if (g == 3) {
                        s = {
                            x: guide.isCanvas ? 0 : _coords.center.x,
                            y: targetCoords.tl.y + guideOffset[g],
                        };
                        e = {
                            x: guide.isCanvas ? Ktu.edit.size.width : targetCoords.center.x,
                            y: targetCoords.tl.y + guideOffset[g],
                        };
                        target.snapOffsetY = guideOffset[g];
                    } else if (g == 4 && !onlyCheckBounds) {
                        s = {
                            x: guide.isCanvas ? 0 : _coords.center.x,
                            y: targetCoords.center.y + guideOffset[g],
                        };
                        e = {
                            x: guide.isCanvas ? Ktu.edit.size.width : targetCoords.center.x,
                            y: targetCoords.center.y + guideOffset[g],
                        };
                        if (!target.snapOffsetY || Math.abs(target.snapOffsetY) > Math.abs(guideOffset[g])) target.snapOffsetY = guideOffset[g];
                    } else if (g == 5) {
                        s = {
                            x: guide.isCanvas ? 0 : _coords.center.x,
                            y: targetCoords.br.y + guideOffset[g],
                        };
                        e = {
                            x: guide.isCanvas ? Ktu.edit.size.width : targetCoords.center.x,
                            y: targetCoords.br.y + guideOffset[g],
                        };
                        if (!onlyCheckBounds) {
                            if (!target.snapOffsetY || Math.abs(target.snapOffsetY) > Math.abs(guideOffset[g])) target.snapOffsetY = guideOffset[g];
                        } else {
                            target.snapOffsetY = -guideOffset[g];
                        }
                    }

                    const isHLine = g >= 3;

                    if (guide.isLine && !isHLine) {
                        this.changeSnapLineState('x', guide.key);
                        continue;
                    }
                    if (guide.isLine && isHLine) {
                        this.changeSnapLineState('y', guide.key);
                        continue;
                    }

                    if (isHLine && g == guideIndexH || !isHLine && g == guideIndexV) {
                        // 处理一下点位置,保证起点在终点的左/上方
                        if (isHLine && s.x > e.x || !isHLine && s.y > e.y) {
                            const tmp = s;
                            s = e;
                            e = tmp;
                        }
                        this.addGuideLine(s, e, isHLine, guide.isCanvas, g);
                    }
                }
            }
        }
    }
    distanceFrom(start, end) {
        const dx = start.x - end.x;
        const dy = start.y - end.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    expand(start, end, _expand) {
        const dis = this.distanceFrom(start, end);
        const { scale } = Ktu.edit;

        const p = {};
        p.x = start.x + _expand * (start.x - end.x) / dis;
        p.y = start.y + _expand * (start.y - end.y) / dis;

        p.x = p.x * scale + Ktu.edit.documentPosition.viewLeft;
        p.y = p.y * scale + Ktu.edit.documentPosition.viewTop;

        return p;
    }

    addGuideLine(start, end, isHLine, isCanvasLine) {
        if (!this.guildLineEnabled) return;

        const guideId = `#guideline${isHLine ? 'H' : 'V'}`;
        const guideLine = $(guideId);

        const step = isCanvasLine ? 5000 : 20;

        const newStart = this.expand(start, end, step);
        const newEnd = this.expand(end, start, step);

        const len = this.distanceFrom(newStart, newEnd);

        guideLine.css({
            left: `${newStart.x}px`,
            top: `${newStart.y}px`,
        });

        if (isHLine) guideLine.css({
            height: '1px',
            width: `${len}px`,
        });
        else guideLine.css({
            width: '1px',
            height: `${len}px`,
        });

        /* if (isCanvasLine && !guideLine.hasClass('solidLine'))
           guideLine.addClass('solidLine');
           else if (!isCanvasLine && guideLine.hasClass('solidLine'))
           guideLine.removeClass('solidLine'); */

        /* if (!this.isShowingGuildLine)
           this.isShowingGuildLine = true; */
        guideLine.css({
            display: 'block',
        });
    }
    hideAllGuides() {
        $('#guidelineH').css({
            display: 'none',
        });
        $('#guidelineV').css({
            display: 'none',
        });

        const assistOffsetx = Ktu.store.state.msg.assistLinesx;
        const assistOffsety = Ktu.store.state.msg.assistLinesy;

        assistOffsetx.forEach(item => {
            item.isSnap = false;
        });
        assistOffsety.forEach(item => {
            item.isSnap = false;
        });
    }

    checkRotate(angle) {
        if ((angle < 5 && angle > 0) || (angle > -5 && angle < 0)) {
            angle = 0;
        } else if (angle > 40 && angle < 50) {
            angle = 45;
        }  else if (angle < -40 && angle > -50) {
            angle = -45;
        } else if (angle > 85 && angle < 95) {
            angle = 90;
        } else if (angle < -85 && angle > -95) {
            angle = -90;
        } else if (angle > 130 && angle < 140) {
            angle = 135;
        } else if (angle < -130 && angle > -140) {
            angle = -135;
        } else if (angle > 175 && angle < 185) {
            angle = 180;
        } else if (angle < -175 && angle > -185) {
            angle = -180;
        } else if (angle > 220 && angle < 230) {
            angle = 225;
        } else if (angle < -220 && angle > -230) {
            angle = -225;
        } else if (angle > 265 && angle < 275) {
            angle = 270;
        } else if (angle < -265 && angle > -275) {
            angle = -270;
        } else if (angle > 310 && angle < 320) {
            angle = 315;
        } else if (angle < -310 && angle > -320) {
            angle = -315;
        } else if (angle > 355 || angle < -355) {
            angle = 0;
        }
        // console.log(angle);
        return angle;
    }
};
