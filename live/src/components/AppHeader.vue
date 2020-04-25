<template>
  <div id="menu" @dblclick="toggleMaxSize">

    <div class="logo">
      <img src="@/assets/images/logo.jpg" alt />
      <div class="product-name">学得慧-学生端</div>
    </div>

    <div class="operation">
        <i class="icon-arrow-thin-left" @click.stop="backward" title="后退" @dbclick.stop=""></i>
        <i class="icon-cross" @click="closeApp" title="关闭app"></i>
    </div>
  </div>
</template>

<script>
import renderEvent from "@/assets/js/app/RenderEvent.js";
export default {
  methods: {
    closeApp: function() {
      renderEvent("close");
    },
    toggleMaxSize: function() {
      renderEvent("toggleMaximized");
    },
    backward(){
      this.$router.back()
    }
  }
};
</script >

<style lang="stylus" scoped>
#menu {
  -webkit-app-region: drag;
  user-select: none;
  position: fixed;
  width 100%;
  height: 45px;
  line-height: 45px;
  padding: 5px;
  background: var(--header-bg);
  color: var(--header-text);
  border-bottom: 1px solid var(--color-border);
  top: 0;
  left :0;
  display : flex;
  justify-content space-between
  align-items: center;


  .logo {
    display: flex;
    align-items :center;
    img {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      margin-right 10px
    }
    .product-name{
      line-height: 40px;
      font-size: 14px;
    }
  }

  .operation{
    display: flex;
    align-items: center;
      i {
        -webkit-app-region: no-drag;
        margin-right: 20px;
        display:inline-block;
        color: #666666;
        font-size: 1.5rem;
      }
  }
}
</style>