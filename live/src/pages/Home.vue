<template>
  <div class="page">
    <div class="home-left">
      <div id="main-video"></div>
    </div>

    <div class="home-right">
      <div id="teacher-video"></div>
      <div id="chat-room">
        <div class="room">
          <div class="room-title">聊天区</div>
          <div class="room-input">
            <input type name value />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",

  mounted: function() {
    var player1 = new TcPlayer("main-video", {
      m3u8: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8", //请替换成实际可用的播放地址
      autoplay: true, //iOS 下 safari 浏览器，以及大部分移动端浏览器是不开放视频自动播放这个能力的
      live: true,
      poster: "http://www.test.com/myimage.jpg",
      width: "100%", //视频的显示宽度，请尽量使用视频分辨率宽度
      height: "100%" //视频的显示高度，请尽量使用视频分辨率高度
    });
    var player2 = new TcPlayer("teacher-video", {
      m3u8:
        "https://oss-live-1.videocc.net/record/record/recordf/0ce69317f41586315874400ae9e/2020-04-22-10-02-22_2020-04-22-10-13-14.m3u8", //请替换成实际可用的播放地址
      autoplay: true, //iOS 下 safari 浏览器，以及大部分移动端浏览器是不开放视频自动播放这个能力的
      live: false,
      poster: "http://www.test.com/myimage.jpg",
      width: "100%", //视频的显示宽度，请尽量使用视频分辨率宽度
      height: "100%" //视频的显示高度，请尽量使用视频分辨率高度
    });
  }
};
</script>
<style lang="stylus" scoped>
.page {
  width: 100%;
  display: flex;
  flex-direction: row;
  overflow: hidden;

  .home-left {
    width: 75%;
    height: 100%;

    #main-video {
      width: 100%;
      height: 100%;
      padding: 5px;
    }
  }

  .home-right {
    width: 25%;
    height: 100%;

    #teacher-video {
      width: 100%;
      height: 30%;
      padding: 5px;
    }

    #chat-room {
      width: 100%;
      height: 70%;
      padding: 5px;

      .room {
        position: relative;
        width: 100%;
        height: 100%;
        color: white;
        background: #c0c0c0;

        .room-title {
          position: absolute;
          top: 0;
          height: 40px;
          line-height: 30px;
          padding: 5px;
          border: 1px solid #c8c8c8;
          background: #fff;
          color: black;
          width: 100%;
        }

        .room-input {
          position: absolute;
          bottom: 0px;
          height: 40px;
          line-height: 30px;
          width: 100%;
        }

        .room-input input {
          height: 100%;
          min-height: 24px;
          max-height: 30px;
          width: 80%;
          margin: auto;
        }
      }
    }
  }
}
</style>