<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" session="false"%>
<%@ page import="fai.comm.util.*"%>
<%@ page import="fai.web.*"%>
<%@ page import="fai.web.inf.*"%>
<%@ page import="java.util.*"%>
<%@ page import="java.net.*"%>
<%@ page import="java.io.*"%>
<%@ page import="java.text.SimpleDateFormat"%>
<%@ page import="fai.app.*"%>
<%@ page import="fai.cli.*"%>
<%@ page import="java.nio.*"%>
<%@ page import="fai.web.KtuFileTool"%>
<%@ page import="fai.webktu.*"%>
<%@ page import="fai.webktu.app.*"%>

<%
  String secret="ab4v53320hs1o26illo4lvtvkstr5lgqdn0iips98ue1to37hnga";
  int id = 49937868;
  boolean test = false;

%>



<!DOCTYPE html>
<html lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="renderer" content="webkit" />
      <meta content="always" name="referrer">
        <%=Web.getToken()%>
        <style>
          #upload {
            position:relative;
          }
          #upload .uploadify-button {
            position:absolute;
            width:100%;
            height:100%;
            top:0;
            left:0;
            z-index : 2;
          }
        </style>
    </head>

    <body>
      <button id="upload">上传</button>
        
      <script src="<%=KtuResDef.getResPath("jquery")%>"></script>
      <script src="<%=KtuResDef.getResPath("newUploadify")%>"></script>
      <script type="text/javascript">
        let token = document.getElementById("_TOKEN").getAttribute("value");
        var self = {
            file_setting_type: '*.jpg;*.jpeg;*.png;*.svg;',
            file_setting_type_list: ["jpg", "jpeg", "png", "svg"],
            file_size_limit: 10,
            file_setting_multi: true,
            file_setting_maxUploadList: 10,
            file_setting_maxChoiceList: 10,
            file_setting_imgMode: -1,
            file_setting_imgMaxWidth: 16384,
            file_setting_imgMaxHeight: 16384,
            upload : null,

            totalUploadNum : 0,
            currentUploadIndex : 0,
        }
    
        var advance_setting = {
            auto: true,
            isJudgePush : true,
            isSvgToPng : true,
            isResizeImg : false, //快图的图片都不压缩
            isConcurrent : true,
            fileTypeExts: self.file_setting_type,
            multi: true,
            fileSizeLimit: self.file_size_limit * 1024 * 1024,
            file_queue_limit: self.file_setting_maxUploadList,
            post_params: {
                "imgMode": self.file_setting_imgMode,
                "maxWidth": self.file_setting_imgMaxWidth,
                "maxHeight": self.file_setting_imgMaxHeight,
                "_TOKEN": token,
            },
            breakPoints: true,
            removeTimeout: 9999999,
            resizeImg: {
                "maxWidth": 2000,
                "maxHeight": 2000
            },
            getMaxSize : function() {
                return 100*1024*1024;
            },
            getStatSize : function() {
                return 0;
            },
            getFileSizeUrl: "/ajax/advanceUpload_h.jsp?cmd=_getUploadSize", //获取文件大小url
            uploader: '/ajax/advanceUpload_h.jsp?cmd=_upload', //这个url需要在文件上传前修改 暂时写在组件中
            msgInfo : function(type,msg) {
            },
            onSelect: function(files) {
              
                    return true;
            },
            onUploadProgress: function(data,file) {
                self.uploadProgress && self.uploadProgress(data,file);
            },
            onUploadSuccess: function(file, text) {
                // var data = jQuery.parseJSON(text);
                // var tmpFile = Ktu.tempResFilesList.splice(0, 1)[0];

                // self.report(file, self.TYPE_ADVANCE_UPLOAD, data.success);

                // if (data.success) {
                //     //全部上传完后，才可以再上传
                //     if (file.index == self.totalUploadNum) {
                //         self.upload.enable(self.upload.instanceID);
                //         $target.off('click.busy');
                //     }
                //     Ktu.log("upload","success");
                //     Ktu.simpleLog("uploadLog","success");
                //     self.uploadSuccess && self.uploadSuccess(data,file);
                // } else {
                //     self.upload.enable(self.upload.instanceID);
                //     $target.off('click.busy');
                //     Ktu.log("upload","error");
                //     self.uploadError && self.uploadError(data,file);
                // }
            },
            onUploadError: function(file, text) {
                // self.upload.enable(self.upload.instanceID);
                // $target.off('click.busy');
                // Ktu.log("upload","catch");
                // self.uploadError && self.uploadError(file.name,file);
                // self.report(file, self.TYPE_ADVANCE_UPLOAD, false);
            },

        };

        let $target = $("#upload");
        $target.uploadify(advance_setting);
      </script>
    </body>
</html>
