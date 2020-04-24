<template>
    <main class="content-wrap">
        <!-- 操作栏 -->
        <div class="content-filters">
            <div class="filter-col">
                <el-input
                    size="small"
                    type="primary"
                    v-model="searchPhone"
                    clearable
                    placeholder="请输入用户手机号码"
                ></el-input>
            </div>
            <div class="filter-col">
                <el-input
                    size="small"
                    type="primary"
                    v-model="searchGoodsName"
                    clearable
                    placeholder="课程（商品）名"
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
                    v-model="searchSubnodeName"
                    clearable
                    placeholder="请输入小节名"
                ></el-input>
            </div>
            <div class="filter-col">
                <el-button
                    @click="getUsersData"
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
                :data="usersData"
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
                    key="logTime"
                    prop="logTime"
                    label="上课时间"
                    align="center"
                    min-width="10"
                    style="white-space: nowrap;"
                ><template slot-scope="slot">
                    {{dateFormatter(slot.row.logTime)}}
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
            usersData: [],
            maxCol: 0,
            // 课程(商品)名
            searchGoodsName: '',
            // 班主任姓名
            searchTeacherName: '',
            // 小节名
            searchSubnodeName: '',
            // 手机电话号码
            searchPhone: '',
            colHead: [
                {
                    prop: 'phone',
                    label: '手机号'
                },
                {
                    prop: 'nickName',
                    label: '姓名'
                },
                {
                    prop: 'goodName',
                    label: '商品名称'
                },
                {
                    prop: 'goodId',
                    label: '商品ID'
                },
                {
                    prop: 'orderTime',
                    label: '购课时间'
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
                    prop: 'teacherName',
                    label: '班主任'
                },
                {
                    prop: 'subnodeUseTotalRe',
                    label: '参与课程（含回放）'
                },
                {
                    prop: 'subnodeUseTotal',
                    label: '参与课程（不含回放）'
                },
                {
                    prop: 'nodeIndex',
                    label: '大节'
                },
                {
                    prop: 'subnodeNum',
                    label: '小节'
                },
                {
                    prop: 'subnodeName',
                    label: '小节名'
                },
                {
                    prop: 'devType',
                    label: '设备类型'
                },
                {
                    prop: 'duration',
                    label: '参加直播时长'
                },
                {
                    prop: 'durationRe',
                    label: '参加回放时长'
                }
            ]
        };
    },
    methods: {
        // watchSearch() {},
        async getUsersData(refresh) {
            this.usersData = [];
            const res = await postFetch(
                this.$api.liveCourseUsers +
                    `?phone=${
                        this.searchPhone ? this.searchPhone : 'null'
                    }&good_name=${
                        this.searchGoodsName ? this.searchGoodsName : 'null'
                    }&teacher_name=${
                        this.searchTeacherName ? this.searchTeacherName : 'null'
                    }&subnode_name=${
                        this.searchSubnodeName ? this.searchSubnodeName : 'null'
                    }`,
                {
                    pageNum: refresh ? (this.pageIndex = 1) : this.pageIndex,
                    pageSize: this.pageSize
                }
            );

            if (res.ERROR_CODE) {
                this.$message.error(`获取用户直播情况失败：` + res.ERROR_DES);
            } else {
                this.usersData = res.data.data.result;
                this.totalCount = res.data.data.total;
            }
        },
        // 分页
        handleCurrentChange(val, pageSize) {
            this.pageIndex = val;
            if (pageSize) this.pageSize = pageSize;
            this.getUsersData();
        },
        exportExcel(){
            let date = formatDate('yyyy-MM-dd hh:mm:ss', new Date());
            let temp = this.usersData.map(item => {
                return {
                    '手机号': item.phone,
                    '姓名': item.nickName,
                    '设备类型': item.devType,
                    '大节序号- 小节序号': `${item.nodeIndex} - ${item.subnodeNum}`,
                    '商品ID': item.goodId,
                    '购课时间': item.courseStartTime,
                    '课程日期': item.courseDate,
                    '主讲老师':item.mainTeacherName,
                    '班主任': item.teacherName,
                    '参与课程（含回放）': item.subnodeUseTotalRe,
                    '参与课程（不含回放）': item.subnodeUseTotal,
                    '商品名称': item.goodName,
                    '小节名': item.subnodeName,
                    '上课时间': this.dateFormatter(item.logTime),
                    '参加直播时长': item.duration,
                    '参加回放时长': item.durationRe,
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
                    `${date}直播课程用户数据.xlsx`
                );
            } catch {}
            return;
        },
        dateFormatter(date){
            return formatDate('yyyy-MM-dd hh:mm:ss', new Date(date))
        }
    },
    mounted() {
        // 注册防抖
        // this.watchSearch = debounce(this.getCourseData.bind(this, true), 1000);
        this.getUsersData(true);
    }
};
</script>

<style lang="scss" scoped>
.btn-detail{
    margin: 20rpx;
}
</style>
