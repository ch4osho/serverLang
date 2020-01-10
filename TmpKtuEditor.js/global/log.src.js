(function () {
    const dogConfig = {
        // ktk-添加系统素材
        addSysMaterial: 8000004,
        // ktk-添加上传素材
        addUploadMaterial: 8000005,
        // kte-点击LOGO
        clickLogo: 8000009,
        // kte-点击文件
        clickFile: 8000010,
        // kte-点击保存
        save: 8000011,
        // kte-点击后退
        back: 8000012,
        // kte-点击前进
        forward: 8000013,
        // kte-点击标题修改
        editTitle: 8000014,
        // kte-点击退出编辑器
        quit: 8000015,
        // kte-点击下载按钮
        download: 8000016,
        downloadSucc: {
            // kte-成功下载222
            id: 8000017,
            src: {
                // jpg
                jpg: 1,
                // png
                png: 2,
                // pdf
                pdf: 3,
                // gif
                gif: 4,
                // psd
                psd: 5,
            },
        },
        collectNPSModalShow: 8000419,
        npsOperator: {
            // nps收集弹窗操作
            id: 8000418,
            src: {
                commit: 1,
                clickPrompt: 2,
            },
        },
        // 聚合
        downloadSuccGroup: {
            // kte-成功下载
            id: 8000197,
            src: {
                // jpg
                jpg: 1,
                // png
                png: 2,
                // pdf
                pdf: 3,
                // gif
                gif: 4,
                // psd
                psd: 5,
            },
        },
        downloadSuccObj: {
            // kte-成功下载--实例统计
            id: 8000147,
            src: {
                // jpg
                jpg: 1,
                // png
                png: 2,
                // pdf
                pdf: 3,
                // psd
                psd: 4,
                // gif
                gif: 5,
            },
        },
        downloadSuccObjGroup: {
            // kte-成功下载--实例统计-聚合
            id: 8000233,
            src: {
                // jpg
                jpg: 1,
                // png
                png: 2,
                // pdf
                pdf: 3,
                // psd
                psd: 4,
                // gif
                gif: 5,
            },
        },
        // 点击另存为
        savaAsClick: 8000268,
        // 成功另存为
        savaAsSuccess: 8000269,
        exportWork: {
            // 下载页面作品导出
            id: 8000322,
            src: {
                // 点击下载到手机
                downloadToPhone: 1,
                // 刷新二维码
                getNewQRCode: 2,
                // [导出到站点]选择轻站
                selectProgram: 3,
                // [导出到站点]选择建站
                selectSite: 4,
                // [导出到站点]选择商城
                selectMall: 5,
                // [导出到站点]选择jpg
                selectJPG: 6,
                // [导出到站点]选择png无背景
                selectPNG_noBg: 7,
                // [导出到站点]选择png有背景
                selectPNG: 8,
                // 点击添加公众号
                addWeChat: 9,
                // 点击图片导出在哪
                clickLink: 10,
                downloadGifToSite: 13,
            },
        },
        clickEle: {
            // kte-左侧导航栏点击
            id: 8000018,
            src: {
                // 点击模板
                template: 1,
                // 点击文本
                text: 2,
                // 点击素材
                material: 3,
                // 点击背景
                background: 4,
                // 点击上传
                upload: 5,
                // 点击搜索
                search: 6,
            },
        },
        // kte-点击使用模板
        useTemplate: 8000019,
        addText: {
            // kte-成功添加文本
            id: 8000020,
            // 标题，副标题，正文
            src: [1, 2, 3],
        },
        clickMaterial: {
            // kte-点击素材大类
            id: 8000021,
            src: {
                // 点击图片
                pic: 1,
                // 点击免抠素材
                png: 2,
                // 点击矢量插图
                svg: 3,
                // 点击文字容器
                banner: 4,
                // 点击线和箭头
                line: 5,
                // 点击装饰
                decoration: 6,
                // 点击形状
                shape: 7,
                // 点击图标
                icon: 8,
                // 点击图表
                chart: 9,
                // 点击二维码
                qrCode: 10,
            },
        },
        addMaterial: {
            // kte-添加素材大类
            id: 8000022,
            src: {
                // 点击图片
                pic: 1,
                // 点击免抠素材
                png: 2,
                // 点击矢量插图
                svg: 3,
                // 点击文字容器
                banner: 4,
                // 点击线和箭头
                line: 5,
                // 点击装饰
                decoration: 6,
                // 点击形状
                shape: 7,
                // 点击图标
                icon: 8,
                // 点击图表
                chart: 9,
            },
        },
        clickPicTopic: {
            // kte-点击图片分类
            id: 8000023,
            src: {
                // key值是主题对应的id

                // 点击全部
                '-1': 1,
                // 点击商务
                0: 2,
                // 点击人物
                1: 3,
                // 点击风景
                2: 4,
                // 点击艺术
                3: 5,
                // 点击美食
                4: 6,
                // 点击建筑
                5: 7,
                // 点击植物
                6: 8,
                // 点击场景
                7: 9,
                // 点击科技
                8: 10,
                // 点击金融
                9: 11,
                // 点击节日
                10: 12,
                // 点击动物
                11: 13,
                // 点击运动
                12: 14,
                // 点击生产
                13: 15,
                // 点击交通
                14: 16,
                // 点击教育
                15: 17,
                // 点击城市
                16: 18,
                // 点击创意
                17: 19,
                // 点击生活
                18: 20,
                // 点击军事
                19: 21,
                // 点击背景
                83: 22,
            },
        },
        addPicTopic: {
            // kte-添加图片分类
            id: 8000024,
            src: {
                // key值是主题对应的id.

                // 点击商务
                1: 1,
                // 点击人物
                2: 2,
                // 点击风景
                3: 3,
                // 点击艺术
                4: 4,
                // 点击美食
                5: 5,
                // 点击建筑
                6: 6,
                // 点击植物
                7: 7,
                // 点击场景
                8: 8,
                // 点击科技
                9: 9,
                // 点击金融
                10: 10,
                // 点击节日
                11: 11,
                // 点击动物
                12: 12,
                // 点击运动
                13: 13,
                // 点击生产
                14: 14,
                // 点击交通
                15: 15,
                // 点击教育
                16: 16,
                // 点击城市
                17: 17,
                // 点击创意
                18: 18,
                // 点击生活
                19: 19,
                // 点击军事
                20: 20,
                // 点击背景
                83: 21,
            },
        },
        clickPngTopic: {
            // kte-点击免抠素材分类
            id: 8000025,
            src: {
                // key值是主题对应的id

                // 点击全部
                '-1': 1,
                // 点击科技
                20: 2,
                // 点击产品
                21: 3,
                // 点击自然
                22: 4,
                // 点击漂浮
                23: 5,
                // 点击特效
                24: 6,
                // 点击美食
                25: 7,
                // 点击建筑
                26: 8,
                // 点击水墨
                27: 9,
                // 点击装饰
                28: 10,
                // 点击人物
                29: 11,
                // 点击动物
                30: 12,
            },
        },
        addPngTopic: {
            // kte-添加免抠素材分类
            id: 8000026,
            src: {
                // key值是主题对应的id

                // 点击科技
                20: 1,
                // 点击产品
                21: 2,
                // 点击自然
                22: 3,
                // 点击漂浮
                23: 4,
                // 点击特效
                24: 5,
                // 点击美食
                25: 6,
                // 点击建筑
                26: 7,
                // 点击水墨
                27: 8,
                // 点击装饰
                28: 9,
                // 点击人物
                29: 10,
                // 点击动物
                30: 11,
            },
        },
        clickSvgTopic: {
            // kte-点击矢量插图分类
            id: 8000027,
            src: {
                // key值是主题对应的id

                // 点击全部
                '-1': 1,
                // 点击生活
                65: 2,
                // 点击节日
                66: 3,
                // 点击人物
                67: 4,
                // 点击建筑
                68: 5,
                // 点击文字
                69: 6,
                // 点击服饰
                70: 7,
                // 点击动物
                71: 8,
                // 点击表情
                72: 9,
                // 点击植物
                73: 10,
                // 点击美食
                74: 11,
                // 点击运动
                75: 12,
                // 点击交通
                76: 13,
                // 点击自然
                77: 14,
                // 点击商务
                78: 15,
                // 点击娱乐
                79: 16,
            },
        },
        addSvgTopic: {
            // kte-添加矢量插图分类
            id: 8000028,
            src: {
                // key值是主题对应的id

                // 点击生活
                65: 1,
                // 点击节日
                66: 2,
                // 点击人物
                67: 3,
                // 点击建筑
                68: 4,
                // 点击文字
                69: 5,
                // 点击服饰
                70: 6,
                // 点击动物
                71: 7,
                // 点击表情
                72: 8,
                // 点击植物
                73: 9,
                // 点击美食
                74: 10,
                // 点击运动
                75: 11,
                // 点击交通
                76: 12,
                // 点击自然
                77: 13,
                // 点击商务
                78: 14,
                // 点击娱乐
                79: 15,
            },
        },
        clickBannerTopic: {
            // kte-点击文字容器分类
            id: 8000029,
            src: {
                // key值是主题对应的id

                // 点击全部
                '-1': 1,
                // 点击条幅
                90: 2,
                // 点击标签
                91: 3,
                // 点击按钮
                92: 4,
                // 点击对话框
                93: 5,
            },
        },
        addBannerTopic: {
            // kte-添加文字容器分类
            id: 8000030,
            src: {
                // key值是主题对应的id

                // 点击条幅
                90: 1,
                // 点击标签
                91: 2,
                // 点击按钮
                92: 3,
                // 点击对话框
                93: 4,
            },
        },
        addLineTopic: 8000031,
        clickDecorationTopic: {
            // kte-点击文字容器分类
            id: 8000032,
            src: {
                // key值是主题对应的id

                // 点击全部
                '-1': 1,
                // 点击花纹
                80: 2,
                // 点击漂浮
                81: 3,
                // 点击边框
                82: 4,
            },
        },
        addDecorationTopic: {
            // kte-添加文字容器分类
            id: 8000033,
            src: {
                // key值是主题对应的id

                // 点击花纹
                80: 1,
                // 点击漂浮
                81: 2,
                // 点击边框
                82: 3,
            },
        },
        clickShapeTopic: {
            // kte-点击形状分类
            id: 8000034,
            src: {
                // key值是主题对应的id

                // 点击全部
                '-1': 1,
                // 点击基础
                52: 2,
                // 点击方形
                53: 3,
                // 点击圆形
                54: 4,
                // 点击心形
                55: 5,
                // 点击星形
                56: 6,
                // 点击花形
                57: 7,
                // 点击多边形
                58: 8,
                // 点击水墨
                60: 9,
                // 点击立体
                61: 10,
                // 点击半圆
                63: 11,
                // 点击祥云
                64: 12,
            },
        },
        addShapeTopic: {
            // kte-添加形状分类
            id: 8000035,
            src: {
                // key值是主题对应的id

                // 点击基础
                52: 1,
                // 点击方形
                53: 2,
                // 点击圆形
                54: 3,
                // 点击心形
                55: 4,
                // 点击星形
                56: 5,
                // 点击花形
                57: 6,
                // 点击多边形
                58: 7,
                // 点击水墨
                60: 8,
                // 点击立体
                61: 9,
                // 点击半圆
                63: 10,
                // 点击祥云
                64: 11,
            },
        },
        clickIconTopic: {
            // kte-点击图标分类
            id: 8000036,
            src: {
                // key值是主题对应的id

                // 点击全部
                '-1': 1,
                // 点击名片
                31: 2,
                // 点击商务
                32: 3,
                // 点击社交
                33: 4,
                // 点击科技
                34: 5,
                // 点击人物
                35: 6,
                // 点击金融
                36: 7,
                // 点击自然
                37: 8,
                // 点击服饰
                38: 9,
                // 点击标识
                39: 10,
                // 点击医疗
                40: 11,
                // 点击交通
                41: 12,
                // 点击动物
                42: 13,
                // 点击运动
                43: 14,
                // 点击教育
                44: 15,
                // 点击美食
                45: 16,
                // 点击表情
                46: 17,
                // 点击地理
                47: 18,
                // 点击建筑
                48: 19,
                // 点击娱乐
                49: 20,
                // 点击生活
                50: 21,
                // 点击学习
                51: 22,
            },
        },
        addIconTopic: {
            // kte-添加图标分类
            id: 8000037,
            src: {
                // key值是主题对应的id

                // 点击名片
                31: 1,
                // 点击商务
                32: 2,
                // 点击社交
                33: 3,
                // 点击科技
                34: 4,
                // 点击人物
                35: 5,
                // 点击金融
                36: 6,
                // 点击自然
                37: 7,
                // 点击服饰
                38: 8,
                // 点击标识
                39: 9,
                // 点击医疗
                40: 10,
                // 点击交通
                41: 11,
                // 点击动物
                42: 12,
                // 点击运动
                43: 13,
                // 点击教育
                44: 14,
                // 点击美食
                45: 15,
                // 点击表情
                46: 16,
                // 点击地理
                47: 17,
                // 点击建筑
                48: 18,
                // 点击娱乐
                49: 19,
                // 点击生活
                50: 20,
                // 点击学习
                51: 21,
            },
        },
        addChartTopic: 8000038,
        background: {
            // kte-背景
            id: 8000039,
            src: {
                // 点击使用颜色
                useDefaultColor: 1,
                // 点击使用系统图片背景
                useDefaultImage: 2,
                // 点击自定义图片
                clickCustomImage: 3,
            },
        },
        upload: {
            // kte-上传操作
            id: 8000040,
            src: {
                // 点击上传图片
                click: 1,
                // 上传成功
                success: 2,
                // 上传失败
                error: 3,
                // 上传异常
                catch: 4,
                // 使用图片
                use: 5,
                // 设为背景
                setBg: 6,
                // 手机上传
                phone: 8,
            },
        },
        uploadType: {
            // kte-上传素材格式
            id: 8000041,
            src: {
                // JPG
                jpg: 1,
                // png
                png: 2,
                // svg
                svg: 3,
            },
        },
        colorPicker: {
            // kte-取色板操作
            id: 8000042,
            src: {
                // 点击添加收藏
                collect: 1,
                // 点击取消收藏
                cancelCollect: 2,
                // 点击取色
                pick: 3,
            },
        },
        // 功能更新入口点击
        functionUpdate: 8000423,
        qrCodeInsideLink: {
            id: 8000429,
            src: {
                flyerShow: 1,
                flyerClick: 2,
                gameShow: 3,
                gameClick: 4,
                homeShow: 5,
                homeClick: 6,
            },
        },
        // 下载按钮点击
        downloadClick: 8000438,
        // 审核按钮点击
        auditClick: 8000439,
        page: {
            // kte-页面操作
            id: 8000043,
            src: {
                // 添加页面
                add: 1,
                // 复制页面
                copy: 2,
                // 删除页面
                remove: 3,
            },
        },
        aside: {
            // kte-侧栏收起展开操作
            id: 8000044,
            src: {
                // 左侧栏页面展开
                openLeft: 1,
                // 左侧栏页面收起
                closeLeft: 2,
                // 右侧栏页面展开
                openRight: 3,
                // 右侧栏页面收起
                closeRight: 4,
            },
        },
        textbox: {
            // kte-文本属性面板操作
            id: 8000045,
            src: {
                // 颜色
                color: 1,
                // 字体
                fontFamily: 2,
                // 字号
                fontSize: 3,
                // 加粗
                bold: 4,
                // 斜体
                italic: 5,
                // 下划线
                underline: 6,
                // 对齐
                align: 7,
                // 间距
                margin: 8,
                // 阴影
                shadow: 9,
                // 透明度
                opacity: 10,
                // 旋转
                rotate: 11,
                // 复制
                copy: 12,
                // 层级
                level: 13,
                // 锁定
                lock: 14,
                // 删除
                remove: 15,
                // 描边
                stroke: 16,
                // 位置
                position: 17,
                // 增加字号
                plus: 18,
                // 减少字号
                cut: 19,
                // 转换大小写
                conversion: 21,
            },
        },
        wordart: {
            id: 8000324,
            src: {
                // 点击样式
                openStyle: 1,
                // 成功更改样式
                alterStyle: 2,
                // 清除效果
                clearStyle: 3,
                // 调整效果
                alterIntensity: 4,
                // 点击配色方案
                openColorScheme: 5,
                // 成功调整配色方案
                alterColorScheme: 6,
                // 单独调整颜色
                alterColor: 7,
                // 字体
                fontFamily: 8,
                // 字号
                fontSize: 9,
                // 增加字号
                plus: 10,
                // 减少字号
                cut: 11,
                // 加粗
                bold: 12,
                // 斜体
                italic: 13,
                // 下划线
                underline: 14,
                // 对齐
                align: 15,
                // 间距
                margin: 16,
            },
        },
        collect: {
            // 素材收藏
            id: 8000325,
            src: {
                // 点击我的收藏
                clickCollection: 1,
                // 点击素材类型
                clickMaterialType: 2,
                // 点击管理
                clickManage: 3,
                // 收藏素材
                collection: 4,
                // 取消收藏
                disCollection: 5,
            },
        },
        cimage: {
            // kte-jpg属性面板操作
            id: 8000046,
            src: {
                // 裁切
                crop: 1,
                // 阴影
                shadow: 2,
                // 透明度
                opacity: 3,
                // 旋转
                rotate: 4,
                // 设为背景
                setBackground: 5,
                // 复制
                copy: 6,
                // 层级
                level: 7,
                // 锁定
                lock: 8,
                // 删除
                remove: 9,
                // 圆角
                radius: 10,
                // 描边
                stroke: 11,
                // 图片尺寸编辑
                size: 12,
                // 更换图片
                change: 13,
                // 滤镜
                filter: 14,
                // 位置
                position: 15,
            },
        },
        gif: {
            // gif图片属性面板操作
            id: 8000414,
            src: {
                // 阴影
                shadow: 1,
                // 透明度
                opacity: 2,
                // 旋转
                rotate: 3,
                // 图片尺寸编辑
                size: 4,
                // 位置
                position: 5,
                // 层级
                level: 6,
                // 锁定
                lock: 7,
                // 删除
                remove: 8,
            },
        },
        'path-group': {
            // kte-SVG属性面板操作
            id: 8000048,
            src: {
                // 颜色
                color: 1,
                // 阴影
                shadow: 2,
                // 透明度
                opacity: 3,
                // 旋转
                rotate: 4,
                // 复制
                copy: 5,
                // 层级
                level: 6,
                // 锁定
                lock: 7,
                // 删除
                remove: 8,
                // 圆角
                radius: 9,
                // 描边
                stroke: 10,
                // 图片尺寸编辑
                size: 11,
                // 更换图片
                change: 12,
                // 位置
                position: 13,
                // 滤镜
                filter: 14,
                // 裁切
                crop: 15,
            },
        },
        tool: {
            // kte-底部工具条操作
            id: 8000049,
            src: {
                // 点击1:1
                origin: 1,
                // 点击全屏
                fit: 2,
                // 点击缩小
                minus: 3,
                // 点击放大
                plus: 4,
                // 点击辅助工具
                assist: 5,
            },
        },
        'assist-tool': {
            id: 8000122,
            src: {
                open: 1,
                close: 2,
                snap: 3,
                color: 4,
            },
        },
        thumb: {
            // kte-右下角缩略图操作
            id: 8000050,
            src: {
                // 点击展开
                open: 1,
                // 点击收起
                close: 2,
                // 拖动
                move: 3,
            },
        },
        keyboard: {
            // kte-快捷键使用
            id: 8000051,
            src: {
                // 拖曳（空格 + 鼠标左键）
                moveCanvas_space: 1,
                // 缩放（空格 + 鼠标滚轮）
                scaleCanvas_space: 2,
                // 拖曳（ALT + 鼠标左键）
                moveCanvas_alt: 3,
                // 缩放（ALT + 鼠标滚轮）
                scaleCanvas_alt: 4,
                // 拖曳（CTRL + 鼠标左键）
                moveCanvas_ctrl: 5,
                // 缩放（CTRL + 鼠标滚轮）
                scaleCanvas_ctrl: 6,
                // 放大（CTRL + +）
                enlarge: 7,
                // 缩小（CTRL + -）
                reduce: 8,
                // 复制（CTRL + C）
                copy: 9,
                // 粘贴（CTRL + V）
                paste: 10,
                // 删除（DELETE）
                remove: 11,
                // 保存（CTRL + S）
                save: 12,
                // 后退（CTRL + Z）
                back: 13,
                // 前进（CTRL + Y）
                forward: 14,
                // 上移一层（CTRL + ]）
                up: 15,
                // 下移一层（CTRL + [）
                down: 16,
                // 置顶（CTRL + SHIFT + ]）
                top: 17,
                // 置底（CTRL + SHIFT + [）
                bottom: 18,
                // 文字加粗（CTRL + B）
                bold: 19,
                // 文字倾斜（CTRL + I）
                italic: 20,
                // 文字下划线（CTRL + U）
                underline: 21,
                // 组合/取消组合（CTRL + G）
                group: 22,
                // 锁定/取消锁定（CTRL + L）
                lock: 23,
                // 打开素材库（CTRL + O）
                imageSource: 24,
                fastMove: 25,
                // 水平垂直拖拽
                dragAndDrop: 26,
            },
        },
        contextmenu: {
            id: 8000052,
            src: {
                lock_textbox: 1,
                up_textbox: 2,
                down_textbox: 3,
                top_textbox: 4,
                bottom_textbox: 5,
                copy_textbox: 6,
                remove_textbox: 7,
                lock_cimage: 8,
                up_cimage: 9,
                down_cimage: 10,
                top_cimage: 11,
                bottom_cimage: 12,
                copy_cimage: 13,
                remove_cimage: 14,
                'lock_path-group': 15,
                'up_path-group': 16,
                'down_path-group': 17,
                'top_path-group': 18,
                'bottom_path-group': 19,
                'copy_path-group': 20,
                'remove_path-group': 21,
                group_multi: 22,
                lock_multi: 23,
                copy_multi: 24,
                remove_multi: 25,
                ungroup_group: 26,
                lock_group: 27,
                up_group: 28,
                down_group: 29,
                top_group: 30,
                bottom_group: 31,
                copy_group: 32,
                remove_group: 33,
                paste_cimage: 34,
                'paste_path-group': 35,
                paste_textbox: 36,
                paste_group: 37,
                paste_multi: 38,
                up_multi: 39,
                down_multi: 40,
                top_multi: 41,
                bottom_multi: 42,
                paste_background: 43,
                // 右键快捷菜单
                hover_textbox_level: 44,
                hover_textbox_position: 45,
                hover_jpg_level: 46,
                hover_jpg_position: 47,
                hover_png_level: 48,
                hover_png_position: 49,
                'hover_path-group_level': 50,
                'hover_path-group_position': 51,
                hover_group_level: 52,
                hover_group_position: 53,
                hover_multi_level: 54,
                hover_multi_position: 55,
                lock_gif: 56,
                hover_gif_level: 57,
                hover_gif_position: 58,
                remove_gif: 59,
            },
        },
        search: 8000053,
        lastestSearch: 8000054,
        searchResult: {
            id: 8000055,
            src: {
                have: 1,
                none: 2,
            },
        },
        // ktk-拖动任意部件
        move: 8000056,
        addTextGroup: {
            // ktk-添加文本组合
            id: 8000057,
            src: {
                0: 1,
                1: 2,
            },
        },
        downloadNum: {
            // kte-下载页面
            id: 8000059,
            src: {
                all: 1,
                single: 2,
            },
        },
        // 下载弹窗修改作品,
        downloadUpdateTitle: 8000060,
        setAlignment: {
            // kte 点击属性面板位置按钮
            id: 8000061,
            src: {
                // 上
                top: 1,
                // 下
                bottom: 2,
                // 左
                left: 3,
                // 右
                right: 4,
                // 完全居中
                center: 5,
                // 上下居中
                topBottomCenter: 6,
                // 左右居中
                leftRightCenter: 7,
                // 修改坐标
                changeCoordinate: 15,
                // 点击快捷菜单操作
                top_contextmenu: 8,
                bottom_contextmenu: 9,
                left_contextmenu: 10,
                right_contextmenu: 11,
                center_contextmenu: 12,
                leftRightCenter_contextmenu: 13,
                topBottomCenter_contextmenu: 14,
                change_coordinate_contextmenu: 16,
            },
        },
        uploadManage: {
            // kte-上传管理
            id: 8000062,
            src: {
                addDir: 1,
                delDir: 2,
                renameDir: 3,
                moveSingle: 4,
                delSingle: 5,
                moveBatch: 6,
                delBatch: 7,
                moreChoose: 11,
            },
        },
        resizePage: {
            id: 8000063,
            src: {
                fshow: 1,
                fCreate: 2,
                mShow: 3,
                mCreate: 4,
                handleR: 5,
                handleB: 6,
                lock: 7,
            },
        },
        eleComp: {
            id: 8000065,
            src: {
                group: 1,
                lock: 2,
                hide: 3,
                del: 4,
                copy: 5,
            },
        },
        // kte 开启/关闭自动更新
        autoSave: 8000095,
        consult: {
            // kte 咨询
            id: 8000096,
            src: {
                // 在线咨询
                online: 1,
                // 功能建议
                feature: 2,
            },
        },
        shortcuts: {
            // kte 快捷键
            id: 8000097,
            src: {
                // 展示
                show: 1,
                // 切换tab
                change: 2,
            },
        },
        qrCodeModal: {
            // kte 成功添加二维码
            id: 8000098,
            src: {
                // 外部链接
                outside_link: 1,
                // 电子卡片
                card: 2,
                // 从图片识别
                scan: 3,
                // 内部链接
                inside_link: 4,
            },
        },
        ceateQrCode: {
            // kte 成功添加二维码
            id: 8000145,
            src: {
                // 外部链接
                link: 1,
                // 电子卡片
                card: 2,
                // 从图片识别
                scan: 3,
            },
        },
        qrCodeStyle: {
            id: 8000251,
            src: {
                // 前景色
                foregroundColor: 1,
                // 背景色
                backgroundColor: 2,
                // 成功上传/更换logo
                logo: 3,
                // 使用/切换艺术二维码
                useStyle: 4,
                // 艺术二维码-更多
                moreStyle: 5,
                // 艺术二维码-默认（清空艺术二维码）
                defaultStyle: 6,
            },
        },
        artQrCodeTimer: {
            id: 8000255,
            src: {
                // time < 2s
                lessTwoSec: 1,
                // 2s <= time <= 3s
                twoToThreeSec: 2,
                // 3s <= time <= 4s
                threeToFourSec: 3,
                // 4s <= time <= 5s
                fourToFiveSec: 4,
                // time > 5s
                overFiveSec: 5,
            },
        },
        artQrCodeTimerKTE: {
            id: 8000253,
            src: {
                // time < 2s
                lessTwoSec: 1,
                // 2s <= time <= 3s
                twoToThreeSec: 2,
                // 3s <= time <= 4s
                threeToFourSec: 3,
                // 4s <= time <= 5s
                fourToFiveSec: 4,
                // time > 5s
                overFiveSec: 5,
            },
        },
        pageArea: {
            // kte 右侧管理tab切换
            id: 8000099,
            src: {
                page: 1,
                level: 2,
            },
        },
        group: {
            // kte 组合属性面板
            id: 8000100,
            src: {
                cancel: 1,
                color: 2,
                // 对齐与分布
                justify: 3,
                shadow: 4,
                opacity: 5,
                rotate: 6,
                copy: 7,
                level: 8,
                lock: 9,
                remove: 10,
                fontFamily: 11,
                fontSize: 12,
            },
        },
        'qr-code': {
            // kte 二维码属性面板
            id: 8000101,
            src: {
                // 信息修改，更改二维码
                changeMsg: 1,
                // 前景色修改
                foreground: 2,
                // 背景色修改
                background: 3,
                // 阴影
                shadow: 4,
                // 透明度
                opacity: 5,
                // 旋转
                rotate: 6,
                // 尺寸编辑
                size: 7,
                // 复制
                copy: 8,
                // 层级
                level: 9,
                // 锁定
                lock: 10,
                // 删除
                remove: 11,
                // 换图
                change: 12,
                // 二维码样式
                style: 13,
            },
        },
        quickDraw: {
            // kte 快速绘制
            id: 8000102,
            src: {
                text: 1,
                line: 2,
                rect: 3,
                // 正方形
                square: 4,
                // 圆形
                circle: 5,
            },
        },
        png: {
            // kte png 图片属性面板
            id: 8000103,
            src: {
                // 描边
                fill: 1,
                // 滤镜
                filter: 2,
                // 裁切
                crop: 3,
                // 阴影
                shadow: 4,
                // 透明度
                opacity: 5,
                // 旋转
                rotate: 6,
                // 更换图片
                change: 7,
                // 设为背景
                setBackground: 8,
                // 图片尺寸编辑
                size: 9,
                // 复制
                copy: 10,
                // 层级
                level: 11,
                // 锁定
                lock: 12,
                // 删除
                remove: 13,
                // 位置
                position: 14,
                // 圆角
                radius: 15,
            },
        },
        filter: {
            id: 8000121,
            src: {
                // 原图
                origin: 1,
                // 胶片
                cali: 2,
                // 戏剧
                drama: 3,
                // 锐化
                edge: 4,
                // 史诗
                epic: 5,
                // 喜庆
                festive: 6,
                // 灰色
                grayscal: 7,
                // 北欧
                nordic: 8,
                // 复古
                retro: 9,
                // 玫瑰
                rosie: 10,
                // 自拍
                selfie: 11,
                // 街头
                street: 12,
                // 夏天
                summer: 13,
                // 蓝调
                blue: 14,
                // 幻想
                whimsical: 15,
                // 亮度
                brightness: 16,
                // 对比度
                contrast: 17,
                // 饱和度
                saturation: 18,
                // 色彩
                tint: 19,
                // 模糊
                blur: 20,
                // X射线
                xProcess: 21,
                // 晕影
                vignette: 22,
            },
        },
        backgroundTool: {
            id: 8000104,
            src: {
                // 缩放
                scale: 1,
                // 透明度
                opacity: 2,
                // 旋转
                rotate: 3,
                // 更换图片
                change: 4,
                // 删除
                remove: 5,
                color: 6,
                detachbackground: 7,
                filter: 8,
            },
        },
        backgroundContextmenu: {
            id: 8000105,
            src: {
                // 透明度
                opacity: 1,
                // 旋转
                rotate: 2,
                // 更换图片
                change: 3,
                // 删除背景
                remove: 4,
                // 颜色
                color: 5,
                // 脱离背景
                detachBackground: 6,

            },
        },
        // 点击地图工具
        clickMapUtil: 8000326,
        addMapSuccess: 8000327,
        map: {
            id: 8000328,
            src: {
                // 编辑地图
                modifyMap: 1,
                // 地图样式
                mapStyle: 2,
                // 裁剪
                crop: 3,
                // 圆角
                radius: 4,
                // 阴影
                shadow: 5,
                // 透明度
                opacity: 6,
                // 旋转
                rotate: 7,
                // 更换图片
                change: 8,
            },
        },
        // 地图弹窗切换样式统计
        changeMapStyle: {
            id: 8000400,
            src: {
                1: 1,
                2: 2,
                3: 3,
                4: 4,
                5: 5,
                6: 6,
                7: 7,
                8: 8,
            },
        },

        cooperateEdit: {
            id: 8000386,
            src: {
                // 弹窗曝光
                show: 1,
                // 按钮点击
                click: 2,
            },
        },

        // 进入编辑器
        into: 8000113,
        // 点击分享按钮
        share: 8000114,
        layerContextmenu: {
            // kte-图层管理右键菜单
            id: 8000120,
            src: {
                group: 1,
                lock: 2,
                rename: 3,
                copy: 4,
                remove: 5,
            },
        },
        chart: {
            // 添加图表
            id: 8000125,
            src: {
                // 单条柱状图（横向）
                rect: 1,
                // 多条柱状图（横向）
                gRect: 2,
                // 单条柱状图（竖向）
                hRect: 3,
                // 多条柱状图（竖向）
                hGRect: 4,
                // 单条折线图
                line: 5,
                // 多条折线图
                gLine: 6,
                // 饼图
                pie: 7,
                // 环图
                donut: 8,
                // 玫瑰图
                rose: 9,
            },
        },
        chartTool: {
            // 图表工具栏统计
            id: 8000126,
            src: {
                // 主题色
                color: 1,
                // 字体颜色
                fontColor: 2,
                // 阴影
                shadow: 3,
                // 透明度
                opacity: 4,
                // 旋转
                rotate: 5,
                // 编辑数据
                editData: 6,
                // 复制
                copy: 7,
                // 层级
                level: 8,
                // 锁定
                lock: 9,
                // 添加行
                addRow: 10,
                // 添加列
                addCol: 11,
                // 添加行（hover）
                hoverRow: 12,
                // 添加列（hover）
                hoverCol: 13,
                // 导入表格
                importExcel: 14,
                // 删除（hover）
                hoverDelete: 15,
                // 删除（右键）
                contextmenuDelete: 16,
            },
        },
        saveTime: {
            id: 8000132,
            src: {
                1: 1,
                2: 2,
                3: 3,
                4: 4,
                5: 5,
            },
        },
        levelManage: {
            // kte-层级管理
            id: 8000138,
            src: {
                // 点击工具栏层级工具
                click_tool: 0,
                // 点击页面侧边栏层级工具
                click_page: 1,
                // 上移（工具栏）
                up_tool: 2,
                // 下移（工具栏）
                down_tool: 3,
                // 置顶（工具栏）
                top_tool: 4,
                // 置底（工具栏）
                bottom_tool: 5,
                // 拉动条（工具栏）
                slide_tool: 6,
                // 上移（页面）
                up_page: 7,
                // 下移（页面）
                down_page: 8,
                // 置顶（页面）
                top_page: 9,
                // 置底（页面）
                bottom_page: 10,
                // 拉动条（页面）
                slide_page: 11,
                // 点击快捷菜单中层级操作
                up_contextmenu: 12,
                down_contextmenu: 13,
                top_contextmenu: 14,
                bottom_contextmenu: 15,
                slide_contextmenu: 16,
            },
        },
        materialModal: {
            // kte 弹窗素材库
            id: 8000143,
            src: {
                // 双击调用
                doubleClick: 0,
                // 点击更换图片调用
                change: 1,
                // 上传图片
                upload: 2,
                // 图片管理
                manage: 3,
                move: 4,
                delete: 5,
                search: 6,
                addSystem: 7,
                addUpload: 8,
                phoneUpload: 9,
            },
        },
        levelTextMenu: {
            // kte-橫狀右鍵菜單（文本）
            id: 8000139,
            src: {
                // 颜色
                color: 0,
                // 描边
                stroke: 1,
                // 字体
                fontFamily: 2,
                // 字号
                fontSize: 3,
                // 增加字號
                addSize: 4,
                // 減少字號
                minusSize: 5,
                // 加粗
                bold: 6,
                // 斜体
                italic: 7,
                // 下划线
                underline: 8,
                // 对齐
                align: 9,
                // 间距
                margin: 10,
                // 阴影
                shadow: 11,
                // 透明度
                opacity: 12,
                // 旋转
                rotate: 13,
                // 位置
                position: 14,
            },
        },
        levelJPGMenu: {
            // kte-橫狀右鍵菜單JPG）
            id: 8000140,
            src: {
                // 描边
                stroke: 0,
                // 裁切
                crop: 1,
                // 圆角
                radius: 2,
                // 阴影
                shadow: 3,
                // 透明度
                opacity: 4,
                // 旋转
                rotate: 5,
                // 位置
                position: 6,
                // 更换图片
                change: 7,
                // 设为背景
                setBg: 8,
                // 滤镜
                filter: 9,
            },
        },
        levelPNGMenu: {
            // kte-橫狀右鍵菜單（PNG）
            id: 8000141,
            src: {
                // 颜色
                color: 0,
                // 裁切
                crop: 1,
                // 圆角
                radius: 2,
                // 阴影
                shadow: 3,
                // 透明度
                opacity: 4,
                // 旋转
                rotate: 5,
                // 位置
                position: 6,
                // 更换图片
                change: 7,
                // 设为背景
                setBg: 8,
                // 滤镜
                filter: 9,
            },
        },
        levelSVGMenu: {
            // kte-橫狀右鍵菜單（SVG）
            id: 8000142,
            src: {
                // 颜色
                color: 0,
                // 描边
                stroke: 1,
                // 阴影
                shadow: 2,
                // 透明度
                opacity: 3,
                // 旋转
                rotate: 4,
                // 位置
                position: 5,
                // 更换图片
                change: 6,
            },
        },
        uploadLog: {
            id: 8000148,
            src: {
                // 成功
                success: 1,
                // 超出限制空间
                limit: 2,
                // 其他失败原因
                other: 3,
            },
        },
        // 搜索模板
        searchModal: 8000150,
        searchModalResult: {
            id: 8000151,
            src: {
                // 有结果
                hasData: 1,
                // 没结果
                noData: 2,
            },
        },
        exportImage: {
            // 右键导出素材（png）
            id: 8000152,
            src: {
                // 成功
                success: 0,
                // 失败
                error: 1,
            },
        },
        error: {
            id: 8000118,
            src: {
                over_size: 9,
            },
        },
        useFontFamily: {
            id: 8000177,
        },
        downloadFontFamily: {
            id: 8000178,
        },
        loadFontFamily: {
            id: 8000183,
        },
        imageContainer: {
            // kte-图片容器
            id: 8000153,
            src: {
                // 添加图片容器
                add: 0,
                // 双击换图
                dlClickChangePic: 1,
                // 通过点击图片换图
                btnChangePic: 2,
                // 通过拖素材区换图
                dragMaterialPic: 3,
                // 通过拖中间区换图
                dragCenterPic: 4,
                // 颜色
                color: 5,
                // 滤镜
                filter: 6,
                // 裁切
                crop: 7,
                // 描边
                stroke: 8,
                // 阴影
                shadow: 9,
                // 透明度
                opacity: 10,
                // 旋转
                rotate: 11,
            },
        },
        // 多选和组合时右键弹出时，选择对齐与分布
        contextmenuAlain: {
            id: 8000137,
            src: {
                // 有结果
                horizontal_left: 1,
                // 没结果
                horizontal_center: 2,
                // 没结果
                horizontal_right: 3,
                // 没结果
                vertical_top: 4,
                // 没结果
                vertical_center: 5,
                // 没结果
                vertical_bottom: 6,
                // 没结果
                horizontal: 7,
                // 没结果
                vertical: 8,
            },
        },

        // 快速绘制形状属性栏
        quickDrawTool: {
            id: 8000182,
            src: {
                // 删除
                remove: 1,
                // 锁定
                lock: 2,
                // 位置
                position: 3,
                // 层级
                level: 4,
                // 复制
                copy: 5,
                // 尺寸
                size: 6,
                // 旋转
                rotate: 7,
                // 透明度
                opacity: 8,
                // 阴影
                shadow: 9,
                // 圆角
                radius: 10,
                // 填充
                fill: 11,
                // 描边
                stroke: 12,
                // 线型
                lineType: 13,
                // 线宽
                lineWidth: 14,
                change: 15,
                arrow: 16,
            },
        },
        // 快速绘制形状右键工具栏
        quickDrawMenu: {
            id: 8000186,
            src: {
                // 填充
                fill: 1,
                // 线型
                lineType: 2,
                // 线宽
                lineWidth: 3,
                // 描边
                stroke: 4,
                // 圆角
                radius: 5,
                // 阴影
                shadow: 6,
                // 旋转
                rotate: 7,
                // 位置
                position: 8,
                // 透明度
                opacity: 9,
            },
        },
        // 设计服务引流
        designDrainage: {
            id: 4000200,
            src: {
                // 下载弹窗-引流曝光
                downloadDrainageS: 303,
                // 下载弹窗-引流点击
                downloadDrainageC: 304,
            },
        },
        // 手机上传
        phoneUploadModal: {
            id: 8000256,
            src: {
                // 弹窗曝光（打开窗口）
                open: 1,
                // 扫码成功
                code: 2,
                // 上传成功
                success: 3,
                // 点击重新扫码
                replace: 4,
                // 点击添加到画板
                add: 5,
            },
        },
        saveFailed: {
            // pckte-保存失败
            id: 8000064,
            src: {
                // 建立本地缓存
                bulidLocalPageData: 1,
                // 弹出刷新提示
                alertRefreshTips: 2,
            },
        },
        reCoverPageData: {
            // pckte-恢复作品
            id: 8000236,
            src: {
                // 恢复完成
                recoverFinish: 1,
                // 弹出作品恢复提示
                alertRecoverTips: 2,
                // 点击恢复
                clickRecoverBtn: 3,
                // 点击放弃
                clickQuitBtn: 4,
            },
        },
        // 保存成功
        saveSuccess: 8000274,
        // 保存成功-聚合
        saveSuccessGroup: 8000273,
        // 保存失败-聚合
        saveFailedGroup: 8000276,
        searchOptions: {
            id: 8000270,
            src: {
                searchByInput: 1,
                searchByClick: 2,
                clearSearchHistory: 3,
                clickBackBtn: 4,
                clickNoResultBtn: 5,
            },
        },
        // 点击绘制提示
        openDrawTips: {
            id: 8000314,
            src: {
                materialBottom: 1,
            },
        },
        // 成功添加艺术字
        addWordart: {
            id: 8000323,
            src: {
                // 直接添加
                add: 1,
                // 普通文本转换成艺术字
                transform: 2,
            },
        },
        addWordCloud: 8000318,
        wordCloud: {
            id: 8000319,
            src: {
                edit: 1,
                opacity: 2,
                rotate: 3,
            },
        },
        wordCloudEdit: {
            id: 8000320,
            src: {
                generate: 1,
                clickImport: 2,
                importSuccess: 3,
                changeDefaultFF: 4,
                addWord: 5,
                changeWordNum: 6,
                changeFF: 7,
                changeColor: 8,
                changeAngle: 9,
                clickSuper: 10,
                delWord: 11,
                clickWordListDefault: 12,
                clickWordListDel: 13,
                clickDefaultFF: 14,
                clickDefaultColor: 15,
                clickWordCloudTips: 16,
                clickImageShape: 17,
                clickTextShape: 18,
                changeTextShapeFF: 19,
                changeTextShapeColor: 20,
                changeTextShapeBold: 21,
                changeTextShapeItalic: 22,
                useTextShape: 23,
                styleDefaultColor: 24,
                styleCustomColor: 25,
                styleCustomAddColor: 26,
                styleCustomAddRandomColor: 27,
                styleCustomDelColor: 28,
                styleCustomClickColor: 29,
                styleBgOpacity: 30,
                styleDefaultRotate: 31,
                styleCustomRotate: 32,
                styleWordCount: 33,
                styleTextDensity: 34,
                styleDefault: 35,
            },
        },
        addWordCloud: {
            id: 8000321,
            src: {
                imageShape: 1,
                textShape: 2,
            },
        },
        previewModalClick: 8000271,
        previewModal: {
            id: 8000272,
            src: {
                download: 1,
                share: 2,
            },
        },
        navMoreClick: 8000352,
        openKouTu: {
            id: 8000316,
            src: {
                toolImage: 2,
            },
        },
        openTemplateType: {
            id: 8000315,
            src: {
                recommendTemplate: 1,
                collectionTemplate: 2,
                exchangeTemplate: 3,
                designTemplate: 4,
            },
        },
        textBgFromEditTool: {
            id: 8000045,
            src: {
                clickIcon: 20,
            },
        },
        table: {
            id: 8000127,
            src: {
                default: 1,
                customize: 2,
                excelSuccess: 3,
                excelFail: 4,
            },
        },
        tableTool: {
            id: 8000128,
            src: {
                themeStyle: 1,
                themeColor: 2,
                fontColor: 3,
                bgColor: 4,
                clickBorder: 5,
                borderColor: 6,
                borderLine: 7,
                fontFamily: 8,
                fontSize: 9,
                bold: 10,
                italic: 11,
                textAlign: 12,
                shadow: 13,
                opacity: 14,
                rotate: 15,
                add: 16,
                delete: 17,
            },
        },
        tableBox: {
            id: 8000130,
            src: {
                addRow: 1,
                deleteRow: 2,
                changeWidth: 3,
                addCol: 4,
                deleteCol: 5,
                changeHeight: 6,
            },
        },
        // pckte-艺术字各样式添加量
        wordart_add: {
            id: 8000396,
        },
        // pckte-艺术字各样式替换量
        wordart_replace: {
            id: 8000397,
        },
        // 3D文字添加
        threeTextAdd: {
            id: 8000436,
            src: {
                add: 1,
                replace: 2,
            },
        },
        // 3D文字属性编辑
        threeTextEdit: {
            id: 8000437,
            src: {
                clearStyle: 1,
                useBasicMaterial: 2,
                useMetalMaterial: 3,
                useNaturalMaterial: 4,
                changeFrontColor: 5,
                changeSideColor: 6,
                changeDepth: 7,
                changeBevelSize: 8,
                changeBevelThickness: 9,
                changeFontFamily: 10,
                changeFontSize: 11,
                plusFontSize: 12,
                cutFontSize: 13,
                changeSpacing: 14,
                changeOpactiy: 15,
                // 2维
                changeAngle: 16,
                // 三维
                changeRotation: 17,
                changeFrontTexture: 18,
                changeSideTexture: 19,
            },
        },
    };
    Ktu.log = async function (idName, srcName) {
        this.logTimer && window.clearTimeout(this.logTimer);
        let dog = 0;

        if (idName === 'cimage' && Ktu.selectedData.imageType === 'png') {
            idName = 'png';
        }

        dog = dogConfig[idName];

        if (dog) {
            const id = typeof dog === 'number' ? dog : dog.id;
            const srcNameValue = srcName ? srcName : 0;
            const whichSrcName = dog.src ? dog.src[srcName] : srcNameValue;
            const src = typeof dog === 'number' ? 0 : whichSrcName;
            if (src !== undefined) {
                this.logTimer = window.setTimeout(() => {
                    axios.get(`/ajax/log_h.jsp?cmd=dog&dogId=${Ktu.encodeUrl(id)}&dogSrc=${Ktu.encodeUrl(src)}`);
                }, 100);
            }
        }
    };
    Ktu.simpleLog = (idName, srcName) => {
        const dog = dogConfig[idName];
        if (dog) {
            const id = typeof dog === 'number' ? dog : dog.id;
            const srcNameValue = srcName ? srcName : 0;
            const whichSrcName = dog.src ? dog.src[srcName] : srcNameValue;
            const src = typeof dog === 'number' ? 0 : whichSrcName;
            if (src !== undefined) {
                axios.get(`/ajax/log_h.jsp?cmd=dog&dogId=${Ktu.encodeUrl(id)}&dogSrc=${Ktu.encodeUrl(src)}`);
            }
        }
    };
    Ktu.simpleLogObjDog = (idName, srcName) => {
        const dog = dogConfig[idName];
        if (dog) {
            const id = typeof dog === 'number' ? dog : dog.id;
            const src = typeof dog === 'number' || !dog.src[srcName] ? 0 : dog.src[srcName];
            if (src !== undefined) {
                axios.get(`/ajax/log_h.jsp?cmd=logObjDog&dogId=${Ktu.encodeUrl(id)}&dogSrc=${Ktu.encodeUrl(src)}&ktuAid=${Ktu.encodeUrl(Ktu.ktuAid)}&ktuId=${Ktu.encodeUrl(Ktu.ktuId)}`);
            }

            /* $.ajax({
               type: 'get',
               url:
               '/ajax/log_h.jsp?cmd=logObjDog&dogId=' +
               Ktu.encodeUrl(id) +
               '&dogSrc=' +
               Ktu.encodeUrl(src) +
               '&ktuAid=' +
               Ktu.encodeUrl(Ktu.ktuAid) +
               '&ktuId=' +
               Ktu.encodeUrl(Ktu.ktuId)
               }); */
        }
    };
}());
