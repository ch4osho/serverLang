<template>
  <div @click="changeTheme" class="header-nav">切换主题</div>
</template>

<script>
export default {
  name: "Theme",
  data: () => {
    return {
      themeIndex: 0
    };
  },
  methods: {
    changeTheme: function() {
      this.themeIndex++;
      var css = document.getElementById("app-skin");
      if (this.themeIndex % 2 == 0) {
        css.setAttribute(
          "href",
          css.getAttribute("href").replace("skin02", "skin01")
        );
      }
      if (this.themeIndex % 2 == 1) {
        css.setAttribute(
          "href",
          css.getAttribute("href").replace("skin01", "skin02")
        );
      }
    }
  }
};
</script>

<style lang="stylus">
.header-nav {
  width: 100px;
  font-size: 14px;
  position: fixed;
  top: 20px;
  right: 20px;
  color: var(--theme-text);
  text-align: right;
  cursor: pointer;
  user-select: none;
}
</style>