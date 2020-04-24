<template>
    <div class="visited">
        <div
            v-for="(menu, index) in visitedMenus"
            :key="index"
            class="visited-item"
            @click="goMenu(menu)"
            :class="{ active: $route.name === menu.name }"
        >
            {{ menu.meta.label }}
            <i class="my-colse el-icon-close" @click.stop="deleteMenu(menu)"></i>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {};
    },
    computed: {
        visitedMenus() {
            return this.$store.getters.visitedMenus;
        },
        lastMenus() {
            return this.visitedMenus[this.visitedMenus.length - 1];
        }
    },
    methods: {
        goMenu({ name }) {
            if (name === this.$route.name) return;
            this.$router.push({
                name
            });
        },
        async deleteMenu(menu) {
            
            // tab只剩一个时不删除
            if (this.visitedMenus.length <= 1) return;

            await this.$store.dispatch('deleteMenus', menu);

            this.goMenu(this.lastMenus);
        }
    }
};
</script>

<style lang="scss" scoped>
.visited {
    padding: 10px 0;
    top: 0;
    display: flex;
    align-items: center;
    margin: 0 20px;
    border-bottom: 1px solid #ededed;

    .visited-item {
        border: 1px solid #ededed;
        padding: 5px 10px;
        border-radius: 5px;
        margin-right: 10px;
        cursor: pointer;
        font-size: 0.6rem;
        display: flex;
        justify-content: center;
        align-items: center;

        .my-colse {
            margin-left: 0.5rem;
        }

        &.active {
            background: $theme;
            color: $white;
        }
    }
}
</style>
