const autoUpdate = () => {
    // 新的打包机制下，win和mac都采用该更新方式
    const { autoUpdater } = require("electron-updater");
    autoUpdater.on("checking-for-update", () => {
        log.info("Checking for update...");
    });

    autoUpdater.on("update-available", (ev, info) => {
        log.info("Update available.");
    });

    autoUpdater.on("update-not-available", (ev, info) => {
        log.info("Update not available.");
    });

    autoUpdater.on("error", (ev, err) => {
        log.error("Error in auto-updater." + err + "|" + ev);
        const updateWindow = glb.get(cfg.GLB.UPDATE_WINDOW);
        const option = glb.get(cfg.GLB.SHOW_UPDATE_WINODW, {});
        const errDesc = cfg.CONST.VERSION ?
            "版本更新下载出错，请联系学得慧团队" :
            "版本更新下载出错，建议前往官网手动下载, https://www.xuexiyuansu.com/";
        _.assign(option, {
            downloading: false,
            desc: errDesc
        });
        updateWindow.webContents.send(
            cfg.CHANNEL.LOCAL.UPDATE.UPDATE_OPTION,
            option
        );
    });

    autoUpdater.on("download-progress", progress => {
        log.info("Download progress...", progress.percent);
        const mainWindow = glb.get(cfg.GLB.MAIN_WINDOW);
        if (!!mainWindow) {
            mainWindow.setProgressBar(progress.percent / 100);
        }
    });

    autoUpdater.on("update-downloaded", (ev, info) => {
        log.info("update downloaded...");

        const updateWindow = glb.get(cfg.GLB.UPDATE_WINDOW);
        const option = glb.get(cfg.GLB.SHOW_UPDATE_WINODW, {});
        _.assign(option, {
            downloading: false,
            downloaded: true
        });
        updateWindow.webContents.send(
            cfg.CHANNEL.LOCAL.UPDATE.UPDATE_OPTION,
            option
        );
    });
    autoUpdater.checkForUpdates();
};