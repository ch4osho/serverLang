<template>
    <main class="content-wrap">
        <!-- 操作栏 -->
        <div class="content-filters">
            <div class="filter-col">
                <el-input
                    size="small"
                    type="primary"
                    @input="watchInput"
                    v-model="eventCode"
                    clearable
                    placeholder="输入事件类型查看详情"
                ></el-input>
            </div>
            <div class="filter-col">
                <el-popover placement="bottom" title="事件列表" trigger="hover">
                    <el-table :data="eventList" border stripe height="300px">
                        <el-table-column
                            width="150"
                            property="des"
                            label="事件类型"
                        ></el-table-column>
                        <el-table-column
                            width="100"
                            property="code"
                            label="事件码"
                        ></el-table-column>
                    </el-table>
                    <i class="el-icon-question" slot="reference"></i>
                </el-popover>
            </div>
        </div>
        <!-- 内容区域 -->
        <el-main class="content-main">
            <!-- 表格 -->
            <el-table
                ref="table"
                :data="eventData"
                border
                style="width: 99%"
                height="100%"
            >
                <el-table-column
                    prop="logTime"
                    label="事件时间"
                    align="center"
                    min-width="70"
                    key="logTime"
                ></el-table-column>
                <el-table-column
                    prop="eventType"
                    label="事件类型"
                    align="center"
                    min-width="70"
                    key="eventType"
                ></el-table-column>
                <el-table-column
                    prop="phone"
                    label="手机号"
                    align="center"
                    min-width="100px"
                    key="phone"
                ></el-table-column>
                <el-table-column
                    prop="payPhase"
                    label="付费阶段"
                    align="center"
                    min-width="80"
                    key="payPhase"
                >
                    <template slot-scope="scope">
                        <span v-if="scope.row.payPhase == 1" class="done"
                            >已付费</span
                        >
                        <span v-else>未付费</span>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="grade"
                    label="年级"
                    v-if="columnDataTpl.grade"
                    align="center"
                    min-width="40"
                    key="grade"
                ></el-table-column>
                <el-table-column
                    prop="subject"
                    label="科目"
                    v-if="columnDataTpl.subject"
                    align="center"
                    min-width="50"
                    key="subject"
                ></el-table-column>
                <el-table-column
                    prop="subNodeId"
                    label="小节id"
                    v-if="columnDataTpl.subNodeId"
                    align="center"
                    min-width="60"
                    key="subNodeId"
                ></el-table-column>
                <el-table-column
                    prop="goodId"
                    label="商品id"
                    v-if="columnDataTpl.goodId"
                    align="center"
                    min-width="100"
                    key="goodId"
                ></el-table-column>
                <el-table-column
                    prop="goodName"
                    label="商品"
                    v-if="columnDataTpl.goodName"
                    align="center"
                    min-width="70"
                    key="goodName"
                ></el-table-column>
                <el-table-column
                    prop="teacherName"
                    label="教师"
                    v-if="columnDataTpl.teacherName"
                    align="center"
                    min-width="70"
                    key="teacherName"
                ></el-table-column>
                <el-table-column
                    prop="mainTeacherId"
                    label="教师id"
                    v-if="columnDataTpl.mainTeacherId"
                    align="center"
                    min-width="100"
                    key="mainTeacherId"
                ></el-table-column>
                <el-table-column
                    prop="shareType"
                    label="分享方式"
                    v-if="columnDataTpl.shareType"
                    align="center"
                    min-width="100"
                    key="shareType"
                ></el-table-column>
                <el-table-column
                    prop="price"
                    label="价格"
                    v-if="columnDataTpl.price"
                    align="center"
                    min-width="60"
                    key="price"
                >
                    <template slot-scope="scope">
                        <span
                            v-if="
                                scope.row.eventType == '1301' ||
                                    scope.row.eventType == '1302'
                            "
                            >{{ scope.row.price }}</span
                        >
                        <span v-else>{{ scope.row.realAmount }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="payType"
                    label="支付渠道"
                    v-if="columnDataTpl.payType"
                    align="center"
                    key="payType"
                    min-width="70"
                >
                    <template slot-scope="scope">
                        <span
                            v-if="
                                scope.row.payType === 'wx-app' ||
                                    scope.row.payType === 'wx-h5' ||
                                    scope.row.payType === 'wx-mp' ||
                                    scope.row.payType === 'wx-js'
                            "
                            >微信</span
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
                            >苹果余额</span
                        >
                        <span v-else-if="scope.row.payType === 'emp'"
                            >内购支付</span
                        >
                        <span v-else-if="scope.row.payType === 'free'"
                            >免费</span
                        >
                        <span v-else>{{
                            scope.row.payType ? scope.row.payType : '/'
                        }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="networkState"
                    label="网络状态"
                    v-if="columnDataTpl.networkState"
                    align="center"
                    min-width="50"
                    key="networkState"
                ></el-table-column>
                <el-table-column
                    prop="duration"
                    label="参与直播时间"
                    v-if="columnDataTpl.duration"
                    align="center"
                    min-width="100"
                    key="duration"
                ></el-table-column>
                <el-table-column
                    prop="playedProgress"
                    label="时间回放进度"
                    v-if="columnDataTpl.playedProgress"
                    align="center"
                    min-width="120"
                    key="playedProgress"
                ></el-table-column>
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
import eventList from '@util/event';

export default {
    components: {
        pagination
    },
    data() {
        return {
            pageIndex: 1,
            pageSize: 20,
            totalCount: 0,
            eventCode: '',
            eventData: [],
            columnDataTpl: [],
            eventList: eventList
        };
    },
    methods: {
        async getEvents(refresh) {
            // 搜索限制
            if (this.eventCode.length != 4 && this.eventCode.length !== 0)
                return;
            // 如果这里不清空，表格底部会出现一段空白
            this.eventData = [];

            const res = await postFetch(
                this.$api.event +
                    `?event_type=${this.eventCode ? this.eventCode : -1}`,
                {
                    pageNum: refresh ? (this.pageIndex = 1) : this.pageIndex,
                    pageSize: this.pageSize
                }
            );

            if (res.ERROR_CODE) {
                this.$message.error('获取数据失败：' + res.ERROR_DES);
            } else {
                // 事件码筛选
                this.columnDataTpl = this.dataCheck();
                this.eventData = res.data.data.result;
                this.totalCount = res.data.data.total;
            }

            //滚动条置顶
            this.$refs.table.bodyWrapper.scrollTop = 0;
        },
        // 分页
        handleCurrentChange(val, pageSize) {
            this.pageIndex = val;
            if (pageSize) this.pageSize = pageSize;
            this.getEvents();
        },

        // 数据根据当前eventCode处理要显示的字段
        dataCheck() {
            let format = this.dataFormat();
            switch (this.eventCode) {
                case '':
                case '1204':
                    format['goodName'] = false;
                    format['goodId'] = false;
                    format['grade'] = false;
                    format['subject'] = false;
                    format['teacherName'] = false;
                    format['mainTeacherId'] = false;
                    break;
                case '1201':
                    break;
                case '1202':
                    format['teacherId'] = true;
                    format['grade'] = false;
                    format['subject'] = false;
                    format['goodName'] = false;
                    format['goodId'] = false;
                    break;
                case '1203':
                    format['shareType'] = true;
                    break;
                case '1301':
                case '1302':
                    format['price'] = true;
                    break;
                case '1303':
                case '1304':
                    format['payType'] = true;
                    format['price'] = true;
                    break;
                case '1401':
                    format['subNodeId'] = false;
                    format['teacherName'] = false;
                    format['mainTeacherId'] = false;
                    break;
                case '1402':
                case '1403':
                case '1404':
                case '1405':
                case '1406':
                case '1407':
                case '1408':
                case '1413':
                    format['subNodeId'] = true;
                    format['teacherName'] = false;
                    format['mainTeacherId'] = false;
                    break;
                case '1409':
                case '1411':
                    format['networkState'] = true;
                    format['subNodeId'] = true;
                    format['teacherName'] = false;
                    format['mainTeacherId'] = false;
                    break;
                case '1410':
                    format['networkState'] = true;
                    format['duration'] = true;
                    format['subNodeId'] = true;
                    format['teacherName'] = false;
                    format['mainTeacherId'] = false;
                    break;
                case '1412':
                    format['networkState'] = true;
                    format['playedProgress'] = true;
                    format['subNodeId'] = true;
                    format['teacherName'] = false;
                    format['mainTeacherId'] = false;
                    break;
                default:
                    break;
            }

            return format;
        },
        // 默认格式
        dataFormat() {
            return {
                goodName: true,
                goodId: true,
                grade: true,
                subject: true,
                teacherName: true,
                mainTeacherId: true,
                shareType: false,
                price: false,
                payType: false,
                subNodeId: false,
                networkState: false,
                duration: false,
                playedProgress: false
            };
        },
        watchInput() {}
    },
    mounted() {
        // 注册防抖
        this.watchInput = debounce(this.getEvents.bind(this, true), 700);

        // 获取事件
        this.getEvents();
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
    color: #666;
}
.done {
    color: $theme;
}
</style>
