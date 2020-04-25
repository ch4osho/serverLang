<template>
  <div :class="classType + ' msg'" v-if="isShow" @click="hidden">
    <div class="msg-content">
      <div :class="icon + ' msg-icon'"></div>
      <div class="msg-txt">{{txt}}</div>
    </div>
  </div>
</template>

<script>
export default {
  data: () => {
    return {
      txt: "",
      classType: "info",
      icon: "icon-information",
      isShow: false,
      si: ""
    };
  },
  methods: {
    info: function(txt) {
      this.classType = "info";
      this.icon = "icon-information";
      this.txt = txt;
      this.timeToHidden();
    },
    warn: function(txt) {
      this.classType = "warn";
      this.icon = "icon-question";
      this.txt = txt;
      this.timeToHidden();
    },
    error: function(txt) {
      this.classType = "error";
      this.icon = "icon-warning";
      this.txt = txt;
      this.timeToHidden();
    },
    show: function(options) {
      this.classType = options.type;
      this.txt = options.txt;
    },
    hidden: function() {
      this.isShow = false;
      this.si = "";
      clearInterval(this.si);
    },
    timeToHidden: function() {
      if (!this.si) {
        this.isShow = true;
        this.si = setTimeout(() => {
          this.isShow = false;
          clearInterval(this.si);
          this.si = "";
        }, 2500);
      } else {
        clearInterval(this.si);
        this.isShow = true;
        this.si = setTimeout(() => {
          this.isShow = false;
          clearInterval(this.si);
          this.si = "";
        }, 2500);
      }
    }
  }
};
</script>

<style scoped>
.msg {
  position: absolute;
  z-index: 998;
  top: 50px;
  left: 20%;
  width: 60%;
  height: 50px;
  line-height: 50px;
  border-radius: 10px;
  text-align: center;
  animation: fade 3s linear 1;
  font-size: 18px;
}
.msg-content {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.error {
  background: rgba(247, 2, 2, 0.65);
  color: rgb(255, 255, 255);
}
.info {
  background: rgba(4, 195, 253, 0.65);
  color: rgb(255, 255, 255);
}
.warn {
  background: rgba(255, 118, 5, 0.65);
  color: rgb(255, 255, 255);
}
.msg-icon {
  height: 50px;
  line-height: 50px;
}
.msg-txt {
  height: 50px;
  line-height: 25px;
  padding: 10px;
}
@keyframes fade {
  0% {
    top: -10px;
    opacity: 1;
  }
  2% {
    top: 50px;
    opacity: 1;
  }
  60% {
    top: 50px;
    opacity: 1;
  }
  100% {
    top: 50px;
    opacity: 0;
  }
}
</style>