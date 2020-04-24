<template>
    <main v-loading.fullscreen.lock="fullscreenLoading" class="content-wrap">
        <!-- 操作栏 -->
        <div class="content-filters">
            <div class="filter-col">
                <el-button
                    size="small"
                    @click.prevent.native="searchDialog = true"
                    type="primary"
                    >搜索</el-button
                >
            </div>
            <div class="filter-col">
                <el-button size="small" @click.prevent.native="reset"
                    >刷新</el-button
                >
            </div>
        </div>
        <!-- 内容区域 -->
        <el-main
            class="content-main"
            style="width: 100%; height: calc(100% - 100px)"
        >
            <el-table
                ref="eventLogList"
                :data="eventLogList"
                border
                tooltip-effect="dark"
                style="width: 99%"
                height="100%"
                :row-class-name="tableRowClassName"
            >
                <el-table-column
                    align="center"
                    prop="logTime"
                    label="事件时间"
                    min-width="10"
                    :formatter="dateFormat"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="phone"
                    label="手机号"
                    min-width="10"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="eventType"
                    label="事件类型"
                    min-width="10"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="payPhase"
                    label="付费阶段"
                    min-width="10"
                >
                    <template slot-scope="scope">
                        <span
                            v-if="scope.row.payPhase === 1"
                            class="global-text-theme"
                            >已付费</span
                        >
                        <span v-else>未付费</span>
                    </template>
                </el-table-column>
            </el-table>
        </el-main>

        <!-- 分页 -->
        <!-- <el-container class="content-pagination">
            <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                :total="eventLogListCount"
                :page-sizes="[20, 50, 100]"
                :page-size="20"
                :current-page="pageIndex"
                @current-change="val => handleIndexChange(val, 1)"
                @size-change="val => handleIndexChange(val, 1)"
            ></el-pagination>
        </el-container> -->

        <pagination :pageSize="pageSize" :currentPage="pageIndex" :totalCount="eventLogListCount" @handleCurrentChange="handleCurrentChange"></pagination>

        <!-- 弹窗 -->
        <el-dialog
            title="搜索"
            :visible.sync="searchDialog"
            :append-to-body="true"
            width="40%"
            :close-on-click-modal="false"
        >
            <div class="no-global-dialog-form-container">
                <el-form
                    :model="searchForm"
                    ref="searchForm"
                    label-width="130px"
                >
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="手机号">
                                <el-input
                                    size="small"
                                    v-model="searchForm.phone"
                                    clearable
                                ></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="事件时间">
                                <el-tooltip
                                    effect="dark"
                                    content="传值为选择值的三个月前"
                                    placement="top"
                                >
                                    <el-date-picker
                                        size="small"
                                        v-model="searchForm.logTime"
                                        clearable
                                        type="date"
                                        value-format="yyyy-MM-dd"
                                    ></el-date-picker>
                                </el-tooltip>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="事件类型">
                                <el-input
                                    size="small"
                                    v-model="searchForm.eventType"
                                    clearable
                                ></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="付费阶段">
                                <el-select
                                    size="small"
                                    v-model="searchForm.payPhase"
                                >
                                    <el-option
                                        label="未付费"
                                        :value="0"
                                    ></el-option>
                                    <el-option
                                        label="已付费"
                                        :value="1"
                                    ></el-option>
                                </el-select>
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
                            getEventLog(true);
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
            eventLogList: [],
            eventLogListCount: 0,
            searchDialog: false,
            searchForm: {
                eventType: null, //null -1
                logTime: null,
                payPhase: null, // null -1
                phone: null
            }
        };
    },
    methods: {
        async getEventLog(refresh) {
            this.fullscreenLoading = true;
            let date = new Date();
            date.setMonth(date.getMonth() - 3);
            const res = await postFetch(
                `${this.$api.eventLog}?event_type=${
                    this.searchForm.eventType
                        ? parseInt(this.searchForm.eventType)
                        : -1
                }&log_time=${this.searchForm.logTime}&pay_phase=${
                    this.searchForm.payPhase != null
                        ? parseInt(this.searchForm.payPhase)
                        : -1
                }&phone=${this.searchForm.phone}`,
                {
                    pageNum: refresh ? (this.pageIndex = 1) : this.pageIndex,
                    pageSize: this.pageSize
                }
            );

            if (res.ERROR_CODE) {
                this.fullscreenLoading = false;
                this.searchDialog = false;
                this.$message.error('获取埋点日志失败：' + res.ERROR_DES);
            } else {
                this.fullscreenLoading = false;
                this.searchDialog = false;
                this.$message.success(`获取埋点日志成功`);
                this.eventLogListCount = res.data.data.total;
                this.eventLogList = res.data.data.result;
            }
        },
        dateFormat(row, column, cellValue, index) {
            let date = row[column.property];
            if (!date) {
                return '/';
            }
            return formatDate('yyyy-MM-dd hh:mm:ss', new Date(date));
        },
        tableRowClassName({ row }) {},

        handleCurrentChange(val, pageSize) {
            this.pageIndex = val;
            if (pageSize) this.pageSize = pageSize;
            this.getEventLog();
        },

        reset() {
            this.pageSize = 20;
            this.pageIndex = 1;
            this.$set(this, `searchForm`, {
                eventType: null,
                logTime: null,
                payPhase: null,
                phone: null
            });
            this.getEventLog();
        },
        init() {
            this.getEventLog();
        }
    },
    mounted() {
        this.init();
    }
};
</script>
