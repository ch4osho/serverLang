<template>
    <main v-loading.fullscreen.lock="fullscreenLoading" class="content-wrap">
        <!-- 操作栏 -->
        <div class="content-filters">
            <div class="filter-col">
                <el-input
                    size="small"
                    type="primary"
                    v-model="searchCourseName"
                    clearable
                    placeholder="请输入课程名称"
                ></el-input>
            </div>
            <div class="filter-col">
                <el-input
                    size="small"
                    type="primary"
                    v-model="searchTeacherName"
                    clearable
                    placeholder="请输入班主任姓名"
                ></el-input>
            </div>
            <div class="filter-col">
                <el-input
                    size="small"
                    type="primary"
                    v-model="searchTel"
                    clearable
                    placeholder="输入手机号"
                ></el-input>
            </div>
            <div class="filter-col">
                <el-select v-model="isLive" placeholder="直播状态" clearable>
                    <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </div>
            <div class="filter-col">
                <el-button
                    @click="search"
                    type="primary"
                    size="small"
                    >搜索</el-button
                >
            </div>
            <div class="filter-col">
                <el-button @click="reset" size="small">刷新</el-button>
            </div>
            <div class="filter-col">
                <el-button @click="exportData" size="small">导出</el-button>
            </div>
            <div class="filter-col">
                <el-switch
                    v-model="mode"
                    active-text="list"
                    inactive-text="card"
                    active-value="2"
                    @change="modeChange"
                    inactive-value="1">
                    </el-switch>
            </div>
            <!-- <div class="filter-col">
                <el-button @click="stop" size="small">测试--暂停请求</el-button>
            </div> -->
        </div>
        <!-- 内容区域模式1 -->
        <el-main class="content-main-full"  v-if="mode == 1">
                <div class="card-container" v-for="liveCourse in courseListObjcet" :key="liveCourse.selfCourseName" @click="showCourseDetail(liveCourse)">
                    <el-card class="box-card"  shadow="always" :class="{'no-live': liveCourse.courseStatus !== 2 ? true : false}">
                        <div slot="header" class="card-title" :class="{'no-live': liveCourse.courseStatus !== 2 ? true : false}">
                            <span>{{liveCourse.courseName}}</span>
                        </div>
                        <div class="card-item">
                            <div class="label">
                                课程时间：
                            </div>
                            <div class="content">
                                {{liveCourse.courseDate}}
                            </div>
                        </div>
                        <div class="card-item">
                            <div class="label">
                                主讲老师：
                            </div>
                            <div class="content">
                                {{liveCourse.mainTeacherName}}
                            </div>
                        </div>
                        <div class="card-item">
                            <div class="label">
                                大节-小节：
                            </div>
                            <div class="content">
                                {{liveCourse.nodeIndex}} - {{liveCourse.subnodeNum}}
                            </div>
                        </div>
                        <div class="card-item">
                            <div class="label">
                                课程人数：
                            </div>
                            <div class="content">
                                {{liveCourse.liveStudents.length}}
                            </div>
                        </div>
                        <div class="card-item">
                            <div class="label">
                                状态：
                            </div>
                            <div class="content">
                                <span v-if="liveCourse.courseStatus == 1" class="no-live">未开播</span>
                                <span v-else-if="liveCourse.courseStatus == 2" class="live">正在直播</span>
                                <span v-else-if="liveCourse.courseStatus == 0" class="no-live">直播结束</span>
                                <span v-else class="no-live">未知的状态</span>
                            </div>
                        </div>
                    </el-card>
                </div>
                <div class="no-course" v-if="noCourse">
                        当前没有相关直播~
                </div>
        </el-main>

        <!-- 内容区域模式2 -->
        <el-main class="content-main"  v-if="mode == 2">
            <el-table
                :data="liveCourseList"
                stripe
                border
                height="100%"
                style="width: 99%"
                ><el-table-column
                    v-for="col in colHead"
                    :key="col.prop"
                    :prop="col.prop"
                    :label="col.label"
                    align="center"
                    min-width="10"
                    style="white-space: nowrap;"
                ></el-table-column>
                <el-table-column
                    key="courseStatus"
                    prop="courseStatus"
                    label="课程开播状态"
                    align="center"
                    min-width="10"
                ><template slot-scope="scope">
                    <span v-if="scope.row.courseStatus == 1" class="no-live">未开播</span>
                    <span v-else-if="scope.row.courseStatus == 2" class="live">正在直播</span>
                    <span v-else-if="scope.row.courseStatus == 0" class="no-live">直播结束</span>
                    <span v-else class="no-live">未知的状态</span>
                </template>
                </el-table-column>
                <el-table-column
                    key="liveStatus"
                    prop="liveStatus"
                    label="是否在直播中"
                    align="center"
                    min-width="10"
                ><template slot-scope="scope">
                    <span v-if="scope.row.liveStatus == 1" class="live">直播中</span>
                    <span v-else class="no-live">不在直播中</span>
                </template>
                </el-table-column>
            </el-table>
        </el-main>

        <!-- 分页 -->
        <pagination :pageSize="pageSize" :currentPage="pageIndex" :totalCount="totalCount" @handleCurrentChange="handleCurrentChange" v-if="mode == 2"></pagination>

        

        <!-- 全屏弹窗 -->
        <el-dialog
            :title="`当前直播课程：${currentFocus.courseName}`"
            :visible.sync="searchDialog"
            :append-to-body="true"
            :close-on-click-modal="false"
            fullscreen
            class="live-dialog"
            id="class-dialog"
            ref="classDialog"
        >
            <div class="dialog-options">
                <div class="label">当前分班：</div>
                <div class="classes-href" v-for="classes in classListObject" :key="classes.groupName" @click="goAnchor(classes)">{{classes.groupName}}</div>
                
                <span class="countDownText" id="top">刷新：({{countDownText}})</span>
            </div>
            <div class="class-container" id="cardContainer" ref="cardContainer" v-if="searchDialog">
                <el-main v-for="classes in classListObject"
                        :key="classes.groupName"
                        class="class-main"
                        :id="classes.groupName"
                >   
                    <div class="courseInfo">
                        <div class="courseInfo-item">主讲老师：{{classes.mainTeacherName}}</div>
                        <div class="courseInfo-item">节数：{{classes.nodeIndex}} - {{classes.subnodeNum}}</div>
                        <div class="courseInfo-item">班名：{{classes.groupName}} - {{classes.teacherName}}</div>
                    </div>
                    
                    <el-table :data="classes.liveStudents" border stripe>
                        <el-table-column
                            label="序号" 
                            type="index"
                            align="center"
                        ></el-table-column>
                        <el-table-column
                            prop="nickName"
                            label="学生姓名"
                            align="center"
                        ></el-table-column>
                        <el-table-column
                            prop="phone"
                            label="手机号码"
                            align="center"
                            min-width="100"
                        ></el-table-column>
                        <el-table-column
                            prop="liveStatus"
                            label="是否在直播中"
                            align="center"
                        >
                        <template slot-scope="slot">
                            <span v-if="slot.row.liveStatus == 1" class="live">直播中</span>
                            <span v-else class="no-live">不在直播中</span>
                        </template>
                        </el-table-column>
                    </el-table>
                </el-main>
            </div>
            <div class="scroll-to-top" @click="scrollTop">
                <i class="el-icon-top"></i>
            </div>
        </el-dialog>
    </main>
</template>

<script>
import { postFetch } from '@util/request';
import { formatDate } from '@util/vendor';
import pagination from '@components/Pagination'
import FileSaver from 'file-saver';
import XLSX from 'xlsx';
export default {
    components: {
        pagination
    },
    data() {
        return {
            fullscreenLoading: false,
            // realTimeCourseStatusCount: 0,
            pageIndex: 1,
            pageSize: 20,
            // 搜索课程名称
            searchCourseName: '',
            // 搜索手机号
            searchTel: '',
            //搜索班主任
            searchTeacherName: '',
            // 显示分班详情
            searchDialog: false,
            // 课程数组
            courseListObjcet: {
                
            },
            // 分班数组
            classListObject: {

            },
            // 当前打开的分班直播详情
            currentFocus: {
                courseName: '',
                courseDetail: {
                    liveStudents: []
                }
            },
            // 定时器
            interval: null,
            // 文字定时器
            textInterval: null,
            // 倒计时
            countDownText: 60,
            await: 60000,
            startTime: 60,
            // 是否有课程
            noCourse: false,
            isLive: '',
            options: [
                {
                    value: '1',
                    label: '在直播间'
                },
                {
                    value: '0',
                    label: '不在直播间'
                }
            ],
            colHead: [
                {
                    prop: 'courseName',
                    label: '课程名'
                },
                {
                    prop: 'courseDate',
                    label: '课程日期'
                },
                {
                    prop: 'mainTeacherName',
                    label: '主讲老师'
                },
                {
                    prop: 'nodeIndex',
                    label: '大节序号'
                },
                {
                    prop: 'subnodeNum',
                    label: '小节序号'
                },
                // {
                //     prop: 'courseStatus',
                //     label: '课程开播状态'
                // },
                {
                    prop: 'groupName',
                    label: '小班名'
                },
                {
                    prop: 'teacherName',
                    label: '班主任'
                },
                {
                    prop: 'phone',
                    label: '手机号'
                },
                {
                    prop: 'nickName',
                    label: '姓名'
                }
                // {
                //     prop: 'liveStatus',
                //     label: '是否在直播间'
                // }
            ],
            // 当前课程列表
            liveCourseList: [],
            // 模式
            mode: 1
        };
    },
    methods: {
        // 课程数组map
        getCourseNameMap(){
            return Object.keys(this.courseListObjcet)
        },
        // 分班数组map
        getClassNameMap(){
            return Object.keys(this.classListObject)
        },
        // 获取直播数据
        async getRealTimeCourseStatus() {

            this.liveCourseList = []

            // 清空当前课程直播数组
            this.courseListObjcet = {}
            
            let that = this

            // 返回的数据是每一位同学的数据,所以pageSize后端说尽量设大一点
            const res = await postFetch(`${this.$api.liveCourseLog}?course_name=${this.searchCourseName ? this.searchCourseName : 'null'}&teacher_name=${this.searchTeacherName ? this.searchTeacherName : 'null'}&phone=${this.searchTel ? this.searchTel : 'null'}&live_status=${this.isLive ? this.isLive : '-1'}`, {
                pageNum: 1,
                pageSize: this.mode == 1 ? 5000 : this.pageSize
            })

            if(res.ERROR_CODE) this.$message.error('更新失败' + res.ERROR_DES);

            // 无数据
            if(res.data.data.result.length == 0) {
                this.$message.error('暂无相关课程');
                this.noCourse = true
                this.stop()
                return false
            } else {
                this.noCourse = false
            }

            this.liveCourseList = res.data.data.result
            this.totalCount = res.data.data.total;


            // list模式不需要分班
            if(this.mode == 2) {
                that.$message.success('实时更新成功')
                return true
            }

            // 每一位学生的课程归类
            this.liveCourseList.forEach(item=>{

                // if(item.courseStatus == 2) that.noCourse = false

                // 检查当前courseListObjcet数组中是否已经有了这门课
                // 定义一门课：课程名称 = courseName/nodeIndex/subnodeNum
                if(!that.getCourseNameMap().includes(`${item.courseName}/${item.nodeIndex}/${item.subnodeNum}`)) {
                    that.$set(that.courseListObjcet, `${item.courseName}/${item.nodeIndex}/${item.subnodeNum}`, {
                        selfCourseName: `${item.courseName}/${item.nodeIndex}/${item.subnodeNum}`,
                        courseName: item.courseName,
                        courseDate: item.courseDate,
                        mainTeacherName: item.mainTeacherName,
                        nodeIndex: item.nodeIndex,
                        subnodeNum: item.subnodeNum,
                        courseStatus: item.courseStatus,
                        groupName: item.groupName,
                        teacherName: item.teacherName,
                        liveStudents: []
                    })
                }

                // push进数组
                that.courseListObjcet[`${item.courseName}/${item.nodeIndex}/${item.subnodeNum}`].liveStudents.push(item)
            })

            if(this.searchDialog && this.currentFocus.courseName){
                this.$set(this.currentFocus, 'courseDetail', this.courseListObjcet[this.currentFocus.courseName])

                this.divideClass()
            }

            that.$message.success('实时更新成功')

            return true
        },
        // 重置刷新
        reset() {
            this.pageNum = 1;
            this.searchCourseName = ''
            this.searchTeacherName = ''
            this.searchTel = ''
            this.isLive = ''
            this.search();
        },
        // 课程分班
        divideClass(){
            if(!this.currentFocus) return this.$message.success('分班失败')

            let liveCourseList = this.currentFocus.courseDetail.liveStudents

            let that = this
            
            this.classListObject = {}

            // 每一位学生的课程归类
            liveCourseList.forEach(item=>{

                // 检查classListObject中是否已经有了这个分班
                if(!that.getClassNameMap().includes(item.groupName)) {
                    that.$set(that.classListObject, item.groupName, {
                        courseName: item.courseName,
                        courseDate: item.courseDate,
                        mainTeacherName: item.mainTeacherName,
                        nodeIndex: item.nodeIndex,
                        subnodeNum: item.subnodeNum,
                        courseStatus: item.courseStatus,
                        groupName: item.groupName,
                        teacherName: item.teacherName,
                        liveStudents: []
                    })
                }

                // push进数组
                that.classListObject[item.groupName]['liveStudents'].push(item)
            })
        },
        // 打开某一项直播课程详情
        showCourseDetail(course){
            this.searchDialog = true

            // 选择当前课程,设置课程详情和课程名字
            this.$set(this.currentFocus, 'courseDetail', course)
            this.$set(this.currentFocus, 'courseName', `${course.courseName}/${course.nodeIndex}/${course.subnodeNum}`)

            this.divideClass()

            this.waterFall()
        },
        // 暂停请求
        stop(){
            clearInterval(this.interval)
            this.interval = null
            clearInterval(this.textInterval)
            this.textInterval = null
            
            this.countDownText = this.startTime
        },
        // 定时请求
        startInterval(){
            this.interval = setInterval(()=>{
                this.getRealTimeCourseStatus();
            }, this.await)

            this.textInterval = setInterval(()=>{
                this.countDownText--

                if(this.countDownText == 0) {
                    this.countDownText = this.startTime
                }
            }, 1000)
        },
        goAnchor(element){
            document.querySelector(`#${element.groupName}`).scrollIntoView()
        },
        scrollTop(){
            document.querySelector('.el-dialog__header').scrollIntoView()
        },
        async search(){
            this.stop()
            const res = await this.getRealTimeCourseStatus()
            if(res) this.startInterval();
        },
        // 分页
        handleCurrentChange(val, pageSize) {
            this.pageIndex = val;
            if (pageSize) this.pageSize = pageSize;
            this.search();
        },
        exportData(){
            if(!this.liveCourseList.length) return this.$message.success('数据为空，无法导出~')

            let date = formatDate('yyyy-MM-dd hh:mm:ss', new Date());

            // 筛选出不是当前直播的课程
            let temp = this.liveCourseList.filter(item=>{
                return item.courseStatus == 2
            })

            temp = temp.map(item => {
                return {
                    '课程名称': item.courseName,
                    '课程日期': item.courseDate,
                    '主讲老师': item.mainTeacherName,
                    '大节-小节': `${item.nodeIndex} - ${item.subnodeNum}`,
                    '课程直播状态': item.courseStatus == 2 ? '直播中' : item.courseStatus == 0 ? '直播结束' : item.courseStatus == 1 ? '未开播' : '',
                    '班名': item.groupName,
                    '班主任': item.teacherName,
                    '学生昵称':item.nickName,
                    '学生手机': item.phone,
                    '是否在直播间': item.liveStatus == 1 ? '在直播间' : '不在直播间'
                };
            });
            let sheet = XLSX.utils.json_to_sheet(temp);
            let wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, sheet, 'sheet1');
            let wbout = XLSX.write(wb, {
                bookType: 'xlsx',
                bookSST: true,
                type: 'array'
            });
            try {
                FileSaver.saveAs(
                    new Blob([wbout], { type: 'application/octet-stream' }),
                    `${date}实时课程情况.xlsx`
                );
            } catch {}
            return;
        },

        // 瀑布流布局
        waterFall(){
            this.$nextTick(()=>{
                // 容器的宽度
                // let containerWidth = document.getElementById('cardContainer').clientWidth
                let containerWidth = this.$refs['cardContainer'].clientWidth
                // 容器子节点
                let cards = this.$refs['cardContainer'].childNodes
                // 每个子节点的宽度
                let cardsSize = cards[0].clientWidth
                // 每一列排列多少哥子节点
                let colNum = Math.floor(containerWidth / cardsSize)

                cards.forEach((item,index)=>{
                    // 首行
                    if(index - colNum < 0) {
                        item.style.left = index * (cardsSize + 15 ) + 'px'
                        item.style.top = '10px'
                    } else {
                        let forwardCard = cards[index - colNum]
                        // console.log('index:', index, 'left:',(index % colNum) * (cardsSize + 15 ) + 'px', 'top:',forwardCard.clientHeight + forwardCard.offsetTop + 15 + 'px')
                        item.style.left = (index % colNum) * (cardsSize + 15 ) + 'px'
                        item.style.top = forwardCard.offsetHeight + forwardCard.offsetTop + 15 + 'px'
                    }

                })
            })
        },
        modeChange(val){
            this.search()
        }
    },
    mounted() {
        this.search()
        // 注册onresize
        window.onresize = ()=>{
            if(this.searchDialog) this.waterFall()
            
        }
    },
    // 销毁interval
    destroyed(){
        clearInterval(this.interval)
        this.interval = null
        clearInterval(this.textInterval)
        this.textInterval = null

        // 重置窗口resize
        window.onresize = null
    }
};
</script>

<style lang="scss" scoped>
    .live{
        color: $theme
    }
    .no-live{
        color: $warming
    }
    .card-container{

        position: relative;
        float: left;

        .box-card{
            margin: 20px;
            height: 300px;
            width: 300px;
            cursor: pointer;

            &.no-live{
                background: grey;
                color: $white;
            }

            &:hover{
                box-shadow: 0 3px 12px 0 $theme-light
            }
            

            .card-title{
                display: flex;
                color: $theme;
                font-size: 1;
                font-size: .9rem;
                align-items: center;
                justify-content: space-between;

                &.no-live{
                    color: $white
                }
            }

            .card-item{
                margin-bottom: 1rem;
                display: flex;
                align-items: center;

                .label{
                    text-align: end;
                    width: 50%;
                }

                .content{
                    font-size: .8rem;
                    
                    .no-live{
                        color: $disable
                    }

                    .live{
                        color: $theme
                    }
                }

                .live-num{
                    font-size: 1.5rem;
                    color: $theme
                }
            }
        }
    
    }

    .class-container{
        position: relative;
    }

    .courseInfo{
        display: flex;
        margin-bottom: 20px;
        flex-direction: column;

        .courseInfo-item{
            // margin-right: 20px;
            margin-bottom: 20px;
            color: $common-grey
        }

        .hight-light{
            color: $theme
        }
    }
    .class-main{
        box-shadow: 0 3px 12px 0 rgba(0,0,0,.1);
        margin: 0 20px 20px 0;
        // position: relative;
        position: absolute;
        width: 600px;
        // float: left;

        .live{
            color: $theme
        }


        .no-live{
            color: $warming
        }


        .scroll-to-top{
            height: 100px;
            width: 100px;
            position: fixed;
            right: 50px;
            bottom: 50px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 50%;

            i{
                font-size: 50px;
            }
        }
    }

    .live-dialog .el-dialog__body {
        padding: 0px 20px 30px 20px !important;
    }

    .live-dialog .scroll-to-top{
            height: 50px;
            width: 50px;
            position: fixed;
            right: 50px;
            bottom: 50px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 50%;
            cursor: pointer;
            background: $theme;
            color: $white;

            i{
                font-size: 30px;
            }
        }

    .no-course{
        height: 50px;
        color: #ededed;
        font-size: 2rem;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
    }

    .classes-href{
        padding: 5px 10px;
        background: $theme;
        color: $white;
        margin-right: 15px;
        border-radius: 5px;
    }


    .dialog-options{
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        position: relative;
        cursor: pointer;
        .countDownText{
            color: red;
            z-index: 100;
            margin-bottom: 10px;
            font-size: 1.5rem;
            position: absolute;
            right: 0;
        }
        .label{
            line-height: 24px;
            font-size: 18px;
            color: #303133;}
        }
</style>
