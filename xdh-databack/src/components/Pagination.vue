<template>
  <el-container class="content-pagination">
        <el-pagination
            background
            :layout="layout"
            :total="totalCount"
            :page-size="pageSize"
            :page-sizes="pageSizes"
            :current-page="currentPage"
            @current-change="handleCurrentChange"
            @size-change="size => handleCurrentChange(1, size)"
        >
        </el-pagination>
    </el-container>
</template>

<script>
export default {
    name: 'Pagination',
    props: {
        totalCount: {
            type: Number,
            default: 0
        },
        layout: {
            type: String,
            default: "total, sizes, prev, pager, next, jumper"
        },
        pageSizes: {
            type: Array,
            default: function(){
                return [20, 50, 100, 500, 1000]
            }
        },
        pageSize: {
            type: Number,
            default: 20
        },
        currentPage: {
            type: Number,
            default: 1
        },
    },
    data(){ 
        return {
             
        }
    },
    methods: {
        handleCurrentChange(value, size){
            this.$emit('handleCurrentChange', value, size)
        }
    }
}
</script>

<style>

</style>