<template>
    <main class="main">
        <div class="card">
            <p class="title">直播热门课程</p>
            <div class="lives-container">
                <div v-for="course in currentLives" class="lives-course-item" :key="course.name" @click="goLiveRoot">
                    <div class="pic-container" @mouseenter="showMask(course)" @mouseleave="hideMask">
                        <img :src="course.bgPic" alt="">
                        <div class="mask" v-show="currentFocusCourse == course.courseName">
                            <i class="icon-media-play"></i>
                        </div>
                    </div>
                    <div class="course-des">
                        <div class="course-name">
                            {{course.courseName}}
                        </div>
                        <div class="course-info">
                            <div class="teacher-info">
                                <div class="teacher-avatar">
                                    <img src="http://chaosho.com/mp/catdog.png" alt="">
                                </div>
                                <span class="teacher-name">
                                    李承兴老师
                                </span>
                            </div>
                            <div class="course-detail">
                                <span class="live-num">
                                    <i class="icon-user"></i>
                                    285
                                </span>
                                <span class="course-type">
                                    高三数学
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        

        <div class="card">
            <p class="title">你的课程</p>
            <div class="lives-container">
                <div v-for="course in yourCourses" class="lives-course-item" :key="course.name" @click="goLiveRoot">
                    <div class="pic-container" @mouseenter="showMask(course)" @mouseleave="hideMask">
                        <img :src="course.bgPic" alt="">
                        <div class="mask" v-show="currentFocusCourse == course.courseName">
                            <i class="icon-media-play"></i>
                        </div>
                    </div>
                    <div class="course-des">
                        <div class="course-name">
                            {{course.courseName}}
                        </div>
                        <div class="course-info">
                            <div class="teacher-info">
                                <div class="teacher-avatar">
                                    <img src="http://chaosho.com/mp/catdog.png" alt="">
                                </div>
                                <span class="teacher-name">
                                    李承兴老师
                                </span>
                            </div>
                            <div class="course-detail">
                                <span class="live-num">
                                    <i class="icon-user"></i>
                                    285
                                </span>
                                <span class="course-type">
                                    高三数学
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    </main>
</template>

<script>
export default {
    name: 'index',
    data(){
        return {
            swiperOption:{
                //显示分页
                pagination: {
                    el: '.swiper-pagination'
                },
                //设置点击箭头
                navigation: {
                    nextEl: '.swiper-button-next', 
                    prevEl: '.swiper-button-prev'
                },
                //自动轮播
                autoplay: {
                    delay: 2000,
                    //当用户滑动图片后继续自动轮播
                    disableOnInteraction: false,
                },
                //开启循环模式
                loop: true
            },
            carouselArr: [
                'https://web.xuexiyuansu.com/images/miniprogramimages/-1396342996_1582870292623.png',
                'https://web.xuexiyuansu.com/images/miniprogramimages/-1396342996_1582870292623.png',
                'https://web.xuexiyuansu.com/images/miniprogramimages/-1396342996_1582870292623.png',
                'https://web.xuexiyuansu.com/images/miniprogramimages/-1396342996_1582870292623.png'
            ],
            currentLives: [
                {
                    bgPic: 'https://web.xuexiyuansu.com/images/miniprogramimages/-1396342996_1582870292623.png',
                    courseName: '初二语文课1'
                },
                {
                    bgPic: 'https://web.xuexiyuansu.com/images/miniprogramimages/-1396342996_1582870292623.png',
                    courseName: '初二语文课2'
                },
                {
                    bgPic: 'https://web.xuexiyuansu.com/images/miniprogramimages/-1396342996_1582870292623.png',
                    courseName: '初二语文课3'
                },
                {
                    bgPic: 'https://web.xuexiyuansu.com/images/miniprogramimages/-1396342996_1582870292623.png',
                    courseName: '初二语文课4'
                },
                {
                    bgPic: 'https://web.xuexiyuansu.com/images/miniprogramimages/-1396342996_1582870292623.png',
                    courseName: '初二语文课5'
                },
                {
                    bgPic: 'https://web.xuexiyuansu.com/images/miniprogramimages/-1396342996_1582870292623.png',
                    courseName: '初二语文课6'
                }
            ],
            yourCourses: [
                {
                    bgPic: 'https://web.xuexiyuansu.com/images/miniprogramimages/-1396342996_1582870292623.png',
                    courseName: '高中数学课1'
                },
                {
                    bgPic: 'https://web.xuexiyuansu.com/images/miniprogramimages/-1396342996_1582870292623.png',
                    courseName: '高中数学课2'
                },
                {
                    bgPic: 'https://web.xuexiyuansu.com/images/miniprogramimages/-1396342996_1582870292623.png',
                    courseName: '高中数学课3'
                },
                {
                    bgPic: 'https://web.xuexiyuansu.com/images/miniprogramimages/-1396342996_1582870292623.png',
                    courseName: '高中数学课4'
                },
                {
                    bgPic: 'https://web.xuexiyuansu.com/images/miniprogramimages/-1396342996_1582870292623.png',
                    courseName: '高中数学课5'
                },
                {
                    bgPic: 'https://web.xuexiyuansu.com/images/miniprogramimages/-1396342996_1582870292623.png',
                    courseName: '高中数学课6'
                },
                {
                    bgPic: 'https://web.xuexiyuansu.com/images/miniprogramimages/-1396342996_1582870292623.png',
                    courseName: '高中数学课7'
                },{
                    bgPic: 'https://web.xuexiyuansu.com/images/miniprogramimages/-1396342996_1582870292623.png',
                    courseName: '高中数学课8'
                },
                {
                    bgPic: 'https://web.xuexiyuansu.com/images/miniprogramimages/-1396342996_1582870292623.png',
                    courseName: '高中数学课9'
                },
                {
                    bgPic: 'https://web.xuexiyuansu.com/images/miniprogramimages/-1396342996_1582870292623.png',
                    courseName: '高中数学课10'
                },
                {
                    bgPic: 'https://web.xuexiyuansu.com/images/miniprogramimages/-1396342996_1582870292623.png',
                    courseName: '高中数学课11'
                },
                {
                    bgPic: 'https://web.xuexiyuansu.com/images/miniprogramimages/-1396342996_1582870292623.png',
                    courseName: '高中数学课12'
                }
            ],
            currentFocusCourse: null
        }
    },
    methods: {
        showMask(course){
            this.currentFocusCourse = course.courseName
        },
        hideMask(){
            this.currentFocusCourse = null
        },
        goLiveRoot(){
            this.$router.push('/home')
        }
    }
}
</script>

<style lang="stylus">

    .main
        background #F4F5F8
        display flex
        flex-direction column
        align-items center
        overflow-y auto
    
    .card
        width 100%
        .title
            padding 10px 20px
            font-size 1.5rem
            font-weight bold
        .courese-swiper-container
            margin-top 30px
            width 100%
            text-alig center
        .lives-container
            padding 0 20px
            overflow hidden
            .lives-course-item
                float: left
                border-radius: 10px
                width: 300px
                display:flex
                flex-direction: column
                margin: 0 20px 20px 0
                background: white
                overflow: hidden
                cursor: pointer
                box-shadow: 0 3px 12px 0 #666666
                .pic-container
                    position: relative
                    width: 300px
                    background: #66DDB2
                    img
                        width 100%
                        height 100%
                    .mask
                        width: 100%
                        height: 100%
                        position: absolute
                        z-index: 20
                        background: rgba(0,0,0,.5)
                        left: 0
                        top: 0
                        display:flex
                        justify-content: center
                        align-items: center
                        color: white
                        font-size: 3rem
                .course-des
                    padding: 10px
                    flex:1
                    display: flex
                    flex-direction: column
                    .course-name
                        margin-bottom : 10px
                    .course-info
                        display: flex
                        align-items :center
                        justify-content :space-between
                        .teacher-info
                            display :flex
                            align-items :center
                            .teacher-avatar
                                width: 25px
                                height :25px
                                border-radius: 50%
                                overflow :hidden
                                margin-right :10px
                                img
                                    height :100%
                                    width :100%
                            .teacher-name
                                color: #999999
                        .course-detail
                            .live-num
                                margin-right :10px
                                color: #666666
                            .course-type
                                color: #FF9900
</style>