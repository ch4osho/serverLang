<template>
    <main v-loading.fullscreen.lock="fullscreenLoading" class="content-wrap">
        <!-- 操作栏 -->
        <div class="content-filters">
            <div class="filter-col">
                <el-button
                    @click="searchDialog = true"
                    size="small"
                    type="primary"
                    >搜索</el-button
                >
            </div>
            <div class="filter-col">
                <el-button @click="reset" size="small">刷新</el-button>
            </div>
        </div>
        <!-- 内容区域 -->
        <el-main class="content-main">
            <el-table
                ref="purchaseLogList"
                :data="purchaseLogList"
                border
                tooltip-effect="dark"
                style="width: 99%"
                height="100%"
                :row-class-name="tableRowClassName"
            >
                <el-table-column
                    align="center"
                    prop="orderTime"
                    label="订单时间"
                    min-width="15"
                    :formatter="dateFormat"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="orderId"
                    label="订单ID"
                    min-width="15"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="phone"
                    label="手机号"
                    min-width="10"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="deviceId"
                    label="设备ID"
                    min-width="10"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="orderStatus"
                    label="订单状态"
                    min-width="10"
                >
                    <template slot-scope="scope">
                        <span v-if="scope.row.orderStatus === 0">等待支付</span>
                        <span
                            v-if="scope.row.orderStatus === 100"
                            class="global-theme-text"
                            >支付成功</span
                        >
                        <span v-if="scope.row.orderStatus === 101"
                            >支付失败</span
                        >
                        <span v-if="scope.row.orderStatus === 102"
                            >支付取消</span
                        >
                        <span
                            v-if="scope.row.orderStatus === 200"
                            class="global-theme-text"
                            >订单完成</span
                        >
                        <span v-if="scope.row.orderStatus === 201"
                            >订单取消</span
                        >
                        <span v-if="scope.row.orderStatus === 202"
                            >订单关闭</span
                        >
                    </template>
                </el-table-column>
                <el-table-column
                    align="center"
                    prop="payStatus"
                    label="支付状态"
                    min-width="10"
                >
                    <template slot-scope="scope">
                        <span v-if="scope.row.payStatus === 0">支付取消</span>
                        <span
                            v-if="scope.row.payStatus === 2"
                            class="global-theme-text"
                            >支付成功</span
                        >
                        <span v-if="scope.row.payStatus === 3">支付失败</span>
                    </template>
                </el-table-column>
                <el-table-column
                    align="center"
                    prop="payType"
                    label="支付方式"
                    min-width="10"
                >
                    <template slot-scope="scope">
                        <span
                            v-if="
                                scope.row.payType === 'wx-app' ||
                                    scope.row.payType === 'wx-h5' ||
                                    scope.row.payType === 'wx-mp' ||
                                    scope.row.payType === 'wx-js'
                            "
                            >微信App</span
                        >
                        <span v-else-if="scope.row.payType === 'wx-qrc'"
                            >微信扫码</span
                        >
                        <span
                            v-else-if="
                                scope.row.payType === 'ali-app' ||
                                    scope.row.payType === 'ali-h5'
                            "
                            >支付宝</span
                        >
                        <span v-else-if="scope.row.payType === 'ali-qrc'"
                            >支付宝扫码</span
                        >
                        <span v-else-if="scope.row.payType === 'ios-iap'"
                            >苹果内购</span
                        >
                        <span v-else-if="scope.row.payType === 'emp'"
                            >内部购课</span
                        >
                        <span v-else-if="scope.row.payType === 'free'"
                            >免费</span
                        >
                        <span v-else>{{ scope.row.payType }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                    align="center"
                    prop="payOrderCode"
                    label="第三方订单"
                    min-width="10"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="payAmount"
                    label="付款金额"
                    min-width="10"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="channel"
                    label="渠道"
                    min-width="10"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="ip"
                    label="IP"
                    min-width="10"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="goodId"
                    label="商品ID"
                    min-width="10"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="goodName"
                    label="商品名称"
                    min-width="10"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="courseId"
                    label="课程ID"
                    min-width="10"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="teacherName"
                    label="班主任"
                    min-width="10"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="mainTeacherName"
                    label="主讲老师"
                    min-width="10"
                ></el-table-column>
            </el-table>
        </el-main>


        <!-- 分页 -->
        <pagination :pageSize="pageSize" :currentPage="pageIndex" :totalCount="purchaseLogListCount" @handleCurrentChange="handleCurrentChange"></pagination>


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
                >
                    <el-row>
                        <el-col :span="10">
                            <el-form-item label="订单时间">
                                <el-date-picker
                                    type="date"
                                    value-format="yyyy-MM-dd"
                                    size="small"
                                    v-model="searchForm.orderTime"
                                    clearable
                                ></el-date-picker>
                            </el-form-item>
                        </el-col>
                        <el-col :span="10">
                            <el-form-item label="订单ID">
                                <el-input
                                    size="small"
                                    v-model="searchForm.orderId"
                                    clearable
                                ></el-input>
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
                            <el-form-item label="设备ID">
                                <el-input
                                    size="small"
                                    v-model="searchForm.deviceId"
                                    clearable
                                ></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>


                    <el-row>
                        <el-col :span="10">
                            <el-form-item label="订单状态">
                                <el-select
                                    v-model="searchForm.orderStatus"
                                    filterable
                                    clearable
                                    size="small"
                                >
                                    <el-option
                                        v-for="item in orderStatusList"
                                        :key="item.index"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="10">
                            <el-form-item label="支付状态">
                                <el-select
                                    v-model="searchForm.payStatus"
                                    filterable
                                    clearable
                                    size="small"
                                >
                                    <el-option
                                        v-for="item in payStatusList"
                                        :key="`ps` + item.index"
                                        :label="item.label"
                                        :value="item.index"
                                    ></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>


                    <el-row>
                        <el-col :span="10">
                            <el-form-item label="支付方式">
                                <el-select
                                    v-model="searchForm.payType"
                                    filterable
                                    clearable
                                    size="small"
                                >
                                    <el-option
                                        v-for="item in payTypeList"
                                        :key="item.index"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="10">
                            <el-form-item label="渠道">
                                <el-select
                                    v-model="searchForm.channel"
                                    size="small"
                                    clearable
                                >
                                    <el-option
                                        value="android购课"
                                        label="安卓购课"
                                    ></el-option>
                                    <el-option
                                        value="ios购课"
                                        label="苹果购课"
                                    ></el-option>
                                    <el-option
                                        value="内购"
                                        label="内部购课"
                                    ></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>



                    <el-row>
                        <el-col :span="10">
                            <el-form-item label="第三方订单">
                                <el-input
                                    size="small"
                                    v-model="searchForm.payOrderCode"
                                    clearable
                                ></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="10">
                            <el-form-item label="付款金额">
                                <el-input
                                    v-model="searchForm.payAmount"
                                    clearable
                                    size="small"
                                ></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row>
                        <el-col :span="10">
                            <el-form-item label="IP">
                                <el-input
                                    size="small"
                                    v-model="searchForm.ip"
                                    clearable
                                ></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="10">
                            <el-form-item label="商品ID">
                                <el-input
                                    size="small"
                                    v-model="searchForm.goodId"
                                    clearable
                                ></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>


                    <el-row>
                        <el-col :span="10">
                            <el-form-item label="商品名称">
                                <el-input
                                    size="small"
                                    v-model="searchForm.goodName"
                                    clearable
                                ></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="10">
                            <el-form-item label="课程ID">
                                <el-input
                                    size="small"
                                    v-model="searchForm.courseId"
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
                </el-form>
            </div>
            <div slot="footer">
                <el-button @click.prevent.native="searchDialog = false"
                    >取 消</el-button
                >
                <el-button
                    @click.prevent.native="
                        () => {
                            getPurchaseLog(true);
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
import { postFetch } from '@util/request';
import { formatDate } from '@util/vendor';
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
            purchaseLogList: [],
            purchaseLogListCount: 0,
            searchDialog: false,
            searchForm: {
                orderTime: null,
                orderId: null,
                phone: null,
                deviceId: null,
                orderStatus: null, //
                payStatus: null, //
                payType: null,
                payOrderCode: null,
                payAmount: null, //
                channel: null,
                ip: null,
                goodId: null,
                courseId: null,
                goodName: null,
                mainTeacherName: null,
                teacherName: null
            },
            payStatusList: [
                {
                    index: 0,
                    label: '支付取消'
                },
                {
                    index: 2,
                    label: '支付成功'
                },
                {
                    index: 3,
                    label: '支付失败'
                }
            ],
            payTypeList: [
                {
                    index: `pt0`,
                    label: '微信App',
                    value: 'wx-app'
                },
                {
                    index: `pt1`,
                    label: '微信扫码',
                    value: `wx-qrc`
                },
                {
                    index: `pt2`,
                    label: '支付宝App',
                    value: `ali-app`
                },
                {
                    index: `pt3`,
                    label: '支付宝扫码',
                    value: `ali-qrc`
                },
                {
                    index: `pt4`,
                    label: '微信H5',
                    value: `wx-h5`
                },
                {
                    index: `pt5`,
                    label: '支付宝H5',
                    value: 'ali-h5'
                },
                {
                    index: `pt6`,
                    label: '苹果内购',
                    value: `ios-iap`
                },
                {
                    index: `pt7`,
                    label: '微信小程序',
                    value: `wx-mp`
                }
            ],
            orderStatusList: [
                {
                    index: `os0`,
                    label: `订单完成`,
                    value: 200
                },
                {
                    index: `os1`,
                    label: `订单取消`,
                    value: 201
                },
                {
                    index: `os2`,
                    label: `订单关闭`,
                    value: 202
                }
            ]
        };
    },
    methods: {
        async getPurchaseLog(refresh) {
            this.fullscreenLoading = true;
            const res = await postFetch(
                `${this.$api.purchaseLog}?order_time=${
                    this.searchForm.orderTime
                }&order_id=${this.searchForm.orderId}&phone=${
                    this.searchForm.phone
                }&device_id=${this.searchForm.deviceId}&order_status=${
                    this.searchForm.orderStatus
                        ? parseInt(this.searchForm.orderStatus)
                        : -1
                }&pay_status=${
                    typeof this.searchForm.payStatus == 'number'
                        ? this.searchForm.payStatus
                        : -1
                }&pay_type=${this.searchForm.payType}&pay_order_code=${
                    this.searchForm.payOrderCode
                }&pay_amount=${
                    this.searchForm.payAmount
                        ? parseFloat(this.searchForm.payAmount)
                        : -1
                }&channel=${this.searchForm.channel}&ip=${
                    this.searchForm.ip
                }&good_id=${this.searchForm.goodId}&course_id=${
                    this.searchForm.courseId
                }&good_name=${this.searchForm.goodName}&main_teacher_name=${
                    this.searchForm.mainTeacherName
                }&teacher_name=${this.searchForm.teacherName}`,
                {
                    pageNum: refresh ? (this.pageIndex = 1) : this.pageIndex,
                    pageSize: this.pageSize
                }
            );

            if (res.ERROR_CODE) {
                this.fullscreenLoading = false;
                this.searchDialog = false;
                this.$message.error('获取购买日志失败：' + res.ERROR_DES);
            } else {
                this.fullscreenLoading = false;
                this.searchDialog = false;
                this.$message.success(`获取购买日志成功`);
                this.purchaseLogList = res.data.data.result;
                this.purchaseLogListCount = res.data.data.total;
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
            this.getPurchaseLog();
        },
        handleSizeChange(val, num) {
            this.pageSize = val;
            this.getPurchaseLog();
        },
        reset() {
            this.pageSize = 20;
            this.pageIndex = 1;
            this.$set(this, `searchForm`, {
                orderTime: null,
                orderId: null,
                phone: null,
                deviceId: null,
                orderStatus: null,
                payStatus: null,
                payType: null,
                payOrderCode: null,
                payAmount: null,
                channel: null,
                ip: null,
                goodId: null,
                courseId: null,
                goodName: null,
                mainTeacherName: null,
                teacherName: null
            });
            this.getPurchaseLog();
        },
        init() {
            this.getPurchaseLog();
        }
    },
    mounted() {
        this.init();
    }
};
</script>
