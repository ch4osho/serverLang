<template>
  <div id="app">
    <app-header></app-header>
    <div class="content">
      <router-view />
    </div>
  </div>
</template>
<script>
import AppHeader from "@/components/AppHeader.vue";
export default {
  components: {
    AppHeader
  }
};
</script>
<style lang="stylus">
@import url('./assets/css/style.css');

#app {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--color-text);
}

.content{
  position :fixed;
  top: 45px;
  left: 0px;
  width :100%;
  height :calc( 100vh - 45px);
  overflow-y :auto;
  background: #f4f5f8
}

</style>
