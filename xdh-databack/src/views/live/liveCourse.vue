<template>
    <main class="content-wrap">
        <!-- 操作栏 -->
        <div class="content-filters">
            <div class="filter-col">
                <el-input
                    size="small"
                    type="primary"
                    @input="watchInput"
                    v-model="searchCourseName"
                    clearable
                    placeholder="请输入课程名称"
                ></el-input>
            </div>
        </div>

        <!-- 内容显区域 -->
        <el-main class="content-main">
            <!-- 表格 -->
            <el-table
                :data="userData"
                stripe
                border
                height="100%"
                style="width: 99%"
                ><el-table-column
                    label="课程ID"
                    align="center"
                    fixed
                    key="courseId"
                    prop="courseId"
                ></el-table-column>
                <el-table-column
                    prop="courseName"
                    label="课程名"
                    align="center"
                    fixed
                    min-width="180"
                    key="courseName"
                ></el-table-column>
                <el-table-column
                    prop="totalAmount"
                    label="报名数"
                    align="center"
                    fixed
                    key="totalAmount"
                ></el-table-column>

                <el-table-column
                    v-for="item in maxCol"
                    :label="`节${item}`"
                    :key="item"
                    :prop="`course${item}`"
                    align="center"
                >
                    <template slot-scope="scope">
                        <span
                            :class="{
                                high:
                                    scope.row[`course${item}`] /
                                        scope.row['totalAmount'] >
                                    0.8,
                                low:
                                    scope.row[`course${item}`] /
                                        scope.row['totalAmount'] <
                                    0.2
                            }"
                            v-if="
                                scope.row[`course${item}`] ||
                                    scope.row[`course${item}`] === 0
                            "
                        >
                            {{
                                `${scope.row[`course${item}`]} (${parseInt(
                                    (scope.row[`course${item}`] /
                                        scope.row['totalAmount']) *
                                        100
                                )}%)`
                            }}
                        </span>
                        <span class="empty-span" v-else>
                            /
                        </span>
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
import { debounce } from '@util/vendor';
import pagination from '@components/Pagination'

export default {
    data() {
        return {
            pageIndex: 1,
            pageSize: 20,
            totalCount: 0,
            userData: [],
            maxCol: 0,
            searchCourseName: ''
        };
    },
    components: {
        pagination
    },
    methods: {
        watchInput() {},
        async getUserData(refresh) {
            this.userData = [];
            const res = await postFetch(
                this.$api.total +
                    `?course_name=${
                        this.searchCourseName ? this.searchCourseName : 'null'
                    }`,
                {
                    pageNum: refresh ? (this.pageIndex = 1) : this.pageIndex,
                    pageSize: this.pageSize
                }
            );

            if (res.ERROR_CODE) {
                this.$message.error(`获取用户直播情况失败：` + res.ERROR_DES);
            } else {
                this.userData = this.sortCol(res.data.data.result);
                this.totalCount = res.data.data.total;
            }
        },
        // 分页
        handleCurrentChange(val, pageSize) {
            console.log('这是val和pageSize',val, pageSize)
            this.pageIndex = val;
            if (pageSize) this.pageSize = pageSize;
            this.getUserData();
        },

        // 数据处理
        sortCol(col) {
            this.maxCol = 0;
            col.map(course => {
                if (course.subNodeAmounts) {
                    // 获取当前数组中最大节数
                    this.maxCol =
                        course.subNodeAmounts.length > this.maxCol
                            ? course.subNodeAmounts.length
                            : this.maxCol;

                    // 行处理
                    course.subNodeAmounts.map((node, index) => {
                        course['course' + (index + 1)] = node;
                    });
                }
            });

            return col;
        }
    },
    mounted() {
        // 注册防抖
        this.watchInput = debounce(this.getUserData.bind(this, true), 1200);
        this.getUserData();
    }
};
</script>

<style lang="scss" scoped>
.high {
    color: $theme;
}
.low {
    color: $warming;
}
.empty-span {
    color: $common-grey;
}
</style>
