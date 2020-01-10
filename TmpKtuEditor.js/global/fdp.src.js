(function () {
    class FdpLog {
        constructor(obj) {
            this.terminal = 1;
        }

        track(eventName, properties) {
            if (typeof Fdp != 'undefined') {
                Fdp.track(eventName, properties);
            }
        }
        /**
         * 下载作品	kt_download_work
         * 属性：
         *      kt_app_terminal	应用终端	整数，见属性字典
         *      kt_work_code	作品识别码	文本
         *      kt_work_type	作品类型	整数，传入作品类型ID
         *      kt_file_format	文件格式	文本，传入jpg / png / pdf / gif
         */
        download(format) {
            const eventName = 'kt_download_work';
            const code = Ktu.ktuData.identifier;
            const type = Ktu.ktuData.type;

            const properties = {
                kt_app_terminal: this.terminal,
                kt_work_code: code,
                kt_work_type: type,
                kt_file_format: format,
            };

            this.track(eventName, properties);
        }
    }

    Ktu.fdp = new FdpLog();
}());
