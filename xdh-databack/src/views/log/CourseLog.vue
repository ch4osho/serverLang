<template>
    <main v-loading.fullscreen.lock="fullscreenLoading" class="content-wrap">
        <!-- 操作栏 -->
        <div class="content-filters">
            <div class="filter-col">
                <el-button
                    @click.prevent.native="searchDialog = true"
                    size="small"
                    type="primary"
                    >搜索</el-button
                >
            </div>
            <div class="filter-col">
                <el-button @click.prevent.native="reset" size="small"
                    >刷新</el-button
                >
            </div>
        </div>
        <!-- 内容区域 -->
        <el-main class="content-main">
            <el-table
                ref="courseDetailsList"
                :data="courseDetailsList"
                border
                tooltip-effect="dark"
                style="width: 99%"
                height="100%"
                :row-class-name="tableRowClassName"
            >
                <el-table-column
                    align="center"
                    prop="courseStartTime"
                    label="上课时间"
                    min-width="15"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="nickName"
                    label="用户昵称"
                    min-width="10"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="phone"
                    label="手机号"
                    min-width="10"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="courseName"
                    label="课程名"
                    min-width="15"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="nodeIndex"
                    label="大节序号"
                    min-width="5"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="subnodeNum"
                    label="小节序号"
                    min-width="5"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="subnodeName"
                    label="小节名称"
                    min-width="10"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="mainTeacherName"
                    label="主讲老师"
                    min-width="8"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="teacherName"
                    label="班主任"
                    min-width="8"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="courseBuyTime"
                    label="购课时间"
                    min-width="15"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="courseUseType"
                    label="上课方式"
                    min-width="8"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="courseTime"
                    label="上课时长"
                    min-width="10"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="devType"
                    label="设备类型"
                    min-width="10"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="screen"
                    label="分辨率"
                    min-width="10"
                ></el-table-column>
            </el-table>
        </el-main>

        <!-- 分页 -->
        <pagination :pageSize="pageSize" :currentPage="pageIndex" :totalCount="courseDetailsListCount" @handleCurrentChange="handleCurrentChange"></pagination>

        <!-- 弹窗 -->
        <el-dialog
            title="搜索"
            :visible.sync="searchDialog"
            :append-to-body="true"
            width="50%"
            :close-on-click-modal="false"
        >
            <div class="no-global-dialog-form-container">
                <el-form :model="searchForm" ref="searchForm" label-width="130px">
                <el-row>
                    <el-col :span="10">
                        <el-form-item label="上课日期">
                            <el-date-picker
                                v-model="searchForm.courseStartTime"
                                type="date"
                                size="small"
                                placeholder="上课日期"
                                value-format="yyyy-MM-dd"
                                clearable
                            ></el-date-picker>
                        </el-form-item>
                    </el-col>
                    <el-col :span="10">
                        <el-form-item label="购课日期">
                            <el-date-picker
                                v-model="searchForm.courseBuyTime"
                                type="date"
                                placeholder="选择日期"
                                size="small"
                                value-format="yyyy-MM-dd"
                                clearable
                            ></el-date-picker>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="10">
                        <el-form-item label="手机号">
                            <el-input
                                size="small"
                                v-model="searchForm.phone"
                                clearable
                            ></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="10">
                        <el-form-item label="用户名称">
                            <el-input
                                size="small"
                                v-model="searchForm.nickName"
                                clearable
                            ></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="10">
                        <el-form-item label="课程名称">
                            <el-input
                                size="small"
                                v-model="searchForm.courseName"
                                clearable
                            ></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="10">
                        <el-form-item label="大节序号">
                            <el-input
                                size="small"
                                v-model="searchForm.nodeIndex"
                                clearable
                                type="number"
                            ></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="10">
                        <el-form-item label="小节序号">
                            <el-input
                                size="small"
                                v-model="searchForm.subNodeNum"
                                clearable
                                type="number"
                            ></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="10">
                        <el-form-item label="小节名称">
                            <el-input
                                size="small"
                                v-model="searchForm.subNodeName"
                                clearable
                            ></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="10">
                        <el-form-item label="主讲老师">
                            <el-input
                                size="small"
                                v-model="searchForm.mainTeacherName"
                                clearable
                            ></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="10">
                        <el-form-item label="班主任">
                            <el-input
                                size="small"
                                v-model="searchForm.teacherName"
                                clearable
                            ></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>


                <el-row>
                    <el-col :span="10">
                        <el-form-item label="上课时长">
                            <el-input
                                size="small"
                                v-model="searchForm.courseTime"
                                clearable
                            ></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="10">
                        <el-form-item label="上课方式">
                            <el-input
                                size="small"
                                v-model="searchForm.courseUseType"
                                clearable
                            ></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>


                <el-row>
                    <el-col :span="10">
                        <el-form-item label="设备">
                            <el-input
                                size="small"
                                v-model="searchForm.devType"
                                clearable
                            ></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="10">
                        <el-form-item label="分辨率">
                            <el-input
                                size="small"
                                v-model="searchForm.screen"
                                clearable
                            ></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            </div>
            <div slot="footer">
                <el-button @click.prevent.native="searchDialog = false"
                    >取 消</el-button
                >
                <el-button
                    @click.prevent.native="
                        () => {
                            getCourseDetails(true);
                        }
                    "
                    type="primary"
                    >确 认</el-button
                >
            </div>
        </el-dialog>
    </main>
</template>

<script>
import { formatDate } from '@util/vendor';
import { postFetch } from '@util/request';
import pagination from '@components/Pagination'

export default {
    components: {
        pagination
    },
    data() {
        return {
            fullscreenLoading: false,
            pageIndex: 1,
            pageSize: 20,
            courseDetailsList: [],
            courseDetailsListCount: 0,
            searchDialog: false,
            searchForm: {
                courseStartTime: null,
                phone: null,
                nickName: null,
                courseName: null,
                nodeIndex: null, // null 发-1
                subNodeNum: null, // null 发-1
                subNodeName: null,
                mainTeacherName: null,
                teacherName: null,
                courseBuyTime: null, // 发int
                courseUseType: null,
                courseTime: null, // null 发-1
                devType: null,
                screen: null
            }
        };
    },
    methods: {
        async getCourseDetails(refresh) {
            this.fullscreenLoading = true;
            const res = await postFetch(
                `${this.$api.course}?course_start_time=${
                    this.searchForm.courseStartTime
                }&phone=${this.searchForm.phone}&nick_name=${
                    this.searchForm.nickName
                }&course_name=${this.searchForm.courseName}&node_index=${
                    this.searchForm.nodeIndex ? this.searchForm.nodeIndex : -1
                }&subnode_num=${
                    this.searchForm.subNodeNum ? this.searchForm.subNodeNum : -1
                }&subnode_name=${
                    this.searchForm.subNodeName
                }&main_teacher_name=${
                    this.searchForm.mainTeacherName
                }&teacher_name=${this.searchForm.teacherName}&course_buy_time=${
                    this.searchForm.courseBuyTime
                }&course_use_type=${
                    this.searchForm.courseUseType
                }&course_time=${
                    this.searchForm.courseTime ? this.searchForm.courseTime : -1
                }&dev_type=${this.searchForm.devType}&screen=${
                    this.searchForm.screen
                }`,
                {
                    pageSize: this.pageSize,
                    pageNum: refresh ? (this.pageIndex = 1) : this.pageIndex
                }
            );

            if (res.ERROR_CODE) {
                this.fullscreenLoading = false;
                this.searchDialog = false;
                this.$message.error('获取上课日志失败：' + res.ERROR_DES);
            } else {
                this.fullscreenLoading = false;
                this.searchDialog = false;
                this.$message.success(`获取上课日志成功`);
                this.courseDetailsList = res.data.data.result;
                this.courseDetailsListCount = res.data.data.total;
            }
        },
        tableRowClassName({ row }) {},
        handleCurrentChange(val, pageSize) {
            this.pageIndex = val;
            if (pageSize) this.pageSize = pageSize;
            this.getCourseDetails();
        },
        reset() {
            this.$set(this, `searchForm`, {
                courseStartTime: null,
                phone: null,
                nickName: null,
                courseName: null,
                nodeIndex: null,
                subNodeNum: null,
                subNodeName: null,
                mainTeacherName: null,
                teacherName: null,
                courseBuyTime: null,
                courseUseType: null,
                courseTime: null,
                devType: null,
                screen: null
            });
            this.getCourseDetails();
        },
        init() {
            this.getCourseDetails();
        }
    },
    mounted() {
        this.init();
    }
};
</script>
