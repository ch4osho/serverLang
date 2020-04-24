<template>
    <main class="content-wrap">
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
                    v-model="searchNodeIndex"
                    clearable
                    placeholder="请输入大节"
                ></el-input>
            </div>
            <div class="filter-col">
                <el-input
                    size="small"
                    type="primary"
                    v-model="searchSubnodeNum"
                    clearable
                    placeholder="请输入小节"
                ></el-input>
            </div>
            <div class="filter-col">
                <el-input
                    size="small"
                    type="primary"
                    v-model="searchTeacherName"
                    clearable
                    placeholder="请输入班主任"
                ></el-input>
            </div>
            <div class="filter-col">
                <el-input
                    size="small"
                    type="primary"
                    v-model="searchPhone"
                    clearable
                    placeholder="请输入学生手机号"
                ></el-input>
            </div>
            <div class="filter-col">
                <el-button
                    @click="getCourseData"
                    type="primary"
                    size="small"
                    >搜索</el-button
                >
            </div>
            <div class="filter-col">
                <el-button
                    @click="exportExcel"
                    size="small"
                    >导出</el-button
                >
            </div>
        </div>

        <!-- 内容显区域 -->
        <el-main class="content-main">
            <!-- 表格 -->
            <el-table
                :data="courseData"
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
                ></el-table-column>
                <el-table-column
                    key="answerCorrectRatio"
                    prop="answerCorrectRatio"
                    label="答题正确率"
                    align="center"
                    min-width="10"
                ><template slot-scope="scope">
                    <span>{{(scope.row.answerCorrectRatio * 100).toFixed(2) + '%'}}</span>
                </template>
                </el-table-column>
            </el-table>
        </el-main>

        <!-- 分页 -->
        <pagination :pageSize="pageSize" :currentPage="pageIndex" :totalCount="totalCount" @handleCurrentChange="handleCurrentChange"></pagination>

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
            pageIndex: 1,
            pageSize: 20,
            totalCount: 0,
            courseData: [],
            searchCourseName: '',
            searchNodeIndex: '',
            searchSubnodeNum: '',
            searchTeacherName: '',
            searchPhone: '',
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
                {
                    prop: 'subnodeName',
                    label: '小节名'
                },
                {
                    prop: 'courseStartTime',
                    label: '上课时间'
                },
                {
                    prop: 'groupName',
                    label: '小班名'
                },
                {
                    prop: 'teacherName',
                    label: '班主任'
                },
                {
                    prop: 'nickName',
                    label: '姓名'
                },
                {
                    prop: 'phone',
                    label: '手机号'
                },
                {
                    prop: 'duration',
                    label: '参加直播时长'
                },
                {
                    prop: 'durationRe',
                    label: '参加回放时长'
                },
                {
                    prop: 'answerNum',
                    label: '答题数量'
                },
                {
                    prop: 'answerDetail',
                    label: '答题卡情况'
                }
            ]
        };
    },
    methods: {
        // watchSearch() {},
        async getCourseData(refresh) {
            this.courseData = [];
            const res = await postFetch(
                this.$api.liveCourseDetail +
                    `?course_name=${
                        this.searchCourseName ? this.searchCourseName : 'null'
                    }&node_index=${
                        this.searchNodeIndex ? this.searchNodeIndex : -1
                    }&subnode_num=${
                        this.searchSubnodeNum ? this.searchSubnodeNum : -1
                    }&teacher_name=${
                        this.searchTeacherName ? this.searchTeacherName : 'null'
                    }&phone=${
                        this.searchPhone ? this.searchPhone : 'null'
                    }`,
                {
                    pageNum: refresh ? (this.pageIndex = 1) : this.pageIndex,
                    pageSize: this.pageSize
                }
            );

            if (res.ERROR_CODE) {
                this.$message.error(`获取用户直播情况失败：` + res.ERROR_DES);
            } else {
                this.courseData = res.data.data.result;
                this.totalCount = res.data.data.total;
            }
        },
        // 分页
        handleCurrentChange(val, pageSize) {
            this.pageIndex = val;
            if (pageSize) this.pageSize = pageSize;
            this.getCourseData();
        },
        exportExcel(){
            let date = formatDate('yyyy-MM-dd hh:mm:ss', new Date());
            let temp = this.courseData.map(item => {
                return {
                    '课程名': item.courseName,
                    '课程日期': item.courseDate,
                    '主讲老师': item.mainTeacherName,
                    '大节-小节': `${item.nodeIndex} - ${item.subnodeNum}`,
                    '小节名': item.subnodeName,
                    '上课时间': item.courseStartTime,
                    '小班名': item.groupName,
                    '班主任':item.teacherName,
                    '姓名': item.nickName,
                    '手机号': item.phone,
                    '参加直播时长': item.duration,
                    '参加回放时长': item.durationRe,
                    '答题数量': item.answerNum,
                    '答题正确率': (item.answerCorrectRatio * 100).toFixed(2) + '%',
                    '答题卡情况': item.answerDetail,
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
                    `${date}课程参与数据.xlsx`
                );
            } catch {}
            return;
        }
    },
    mounted() {
        // 注册防抖
        // this.watchSearch = debounce(this.getCourseData.bind(this, true), 1000);
        this.getCourseData(true);
    }
};
</script>

<style lang="scss" scoped>
.btn-detail{
    margin: 20rpx;
}
</style>
