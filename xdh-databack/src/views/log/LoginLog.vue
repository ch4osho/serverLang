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
                ref="loginList"
                :data="loginList"
                border
                tooltip-effect="dark"
                style="width: 99%"
                height="100%"
                :row-class-name="tableRowClassName"
            >
                <el-table-column
                    align="center"
                    prop="loginTime"
                    label="登陆时间"
                    min-width="10"
                    :formatter="dateFormat"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="phone"
                    label="手机号"
                    min-width="6"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="nickName"
                    label="昵称"
                    min-width="8"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="ip"
                    label="IP"
                    min-width="8"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="deviceId"
                    label="设备ID"
                    min-width="10"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="devModelName"
                    label="设备名称"
                    min-width="6"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="networkState"
                    label="登录网络"
                    min-width="6"
                ></el-table-column>
            </el-table>
        </el-main>


        <!-- 分页 -->
        <pagination :pageSize="pageSize" :currentPage="pageIndex" :totalCount="loginListCount" @handleCurrentChange="handleCurrentChange"></pagination>


        <!-- 弹窗 -->
        <el-dialog
            title="搜索"
            :visible.sync="searchDialog"
            :append-to-body="true"
            width="50%"
            :close-on-click-modal="false"
        >
            <div class="no-global-dialog-form-container">
                <el-form
                    :model="searchForm"
                    ref="searchForm"
                    label-width="130px"
                    style="height: 80%;"
                >
                    <el-row>
                        <el-col :span="10">
                            <el-form-item label="渠道">
                                <el-input
                                    v-model="searchForm.channelName"
                                    size="small"
                                    clearable
                                ></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="10">
                            <el-form-item label="登陆时间">
                                <el-date-picker
                                    v-model="searchForm.loginTime"
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
                            <el-form-item label="昵称">
                                <el-input
                                    v-model="searchForm.nickName"
                                    size="small"
                                    clearable
                                ></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="10">
                            <el-form-item label="手机号">
                                <el-input
                                    v-model="searchForm.phone"
                                    size="small"
                                    clearable
                                ></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="10">
                            <el-form-item label="设备ID">
                                <el-input
                                    v-model="searchForm.deviceId"
                                    size="small"
                                    clearable
                                ></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="10">
                            <el-form-item label="IP">
                                <el-input
                                    v-model="searchForm.ip"
                                    size="small"
                                    clearable
                                ></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="10">
                            <el-form-item label="设备名称">
                                <el-input
                                    v-model="searchForm.devModelName"
                                    size="small"
                                    clearable
                                ></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="10">
                            <el-form-item label="登录网络">
                                <el-input
                                    v-model="searchForm.networkState"
                                    size="small"
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
                            getLoginList(true);
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
            searchDialog: false,
            searchForm: {
                channelName: null,
                loginTime: null,
                phone: null,
                nickName: null,
                deviceId: null,
                ip: null,
                devModelName: null,
                networkState: null
            },
            loginList: [],
            loginListCount: 0
        };
    },
    methods: {
        async getLoginList(refresh) {
            this.fullscreenLoading = true;
            const res = await postFetch(
                `${this.$api.loginLog}?channel_name=${this.searchForm.channelName}&login_time=${this.searchForm.loginTime}&phone=${this.searchForm.phone}&nick_name=${this.searchForm.nickName}&device_id=${this.searchForm.deviceId}&ip=${this.searchForm.ip}&dev_model_name=${this.searchForm.devModelName}&net_work_state=${this.searchForm.networkState}`,
                {
                    pageNum: refresh ? (this.pageIndex = 1) : this.pageIndex,
                    pageSize: this.pageSize
                }
            );

            if (res.ERROR_CODE) {
                this.searchDialog = false;
                this.fullscreenLoading = false;
                this.$message.error('获取登录日志失败：' + res.ERROR_DES);
            } else {
                this.fullscreenLoading = false;
                this.searchDialog = false;
                this.$message.success(`获取登录日志成功`);
                this.loginList = res.data.data.result;
                this.loginListCount = res.data.data.total;
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
            this.getLoginList();
        },

        reset() {
            this.pageSize = 20;
            this.pageIndex = 1;
            this.$set(this, `searchForm`, {
                channelName: null,
                loginTime: null,
                phone: null,
                nickName: null,
                deviceId: null,
                ip: null,
                devModelName: null,
                networkState: null
            });
            this.getLoginList();
        },
        init() {
            this.getLoginList();
        }
    },
    mounted() {
        this.init();
    }
};
</script>
