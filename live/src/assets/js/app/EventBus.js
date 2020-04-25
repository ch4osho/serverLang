import { app, BrowserWindow, ipcMain } from "electron";

const { webContents } = require("electron");
const events = ["close", "toggleConsole", "toggleMaximized"];

for (let i in events) {
    ipcMain.on(events[i], (event, arg) => {
        switch (events[i]) {
            case "close":
                closed();
                break;
            case "toggleConsole":
                toggleConsole();
                break;
            case "toggleMaximized":
                toggleMaximized();
                break;
            default:
                break;
        }
    });
}

//TODO：添加事件

//关闭应用事件
function closed() {
    app.quit();
}

//切换控制台
function toggleConsole() {
    webContents.getFocusedWebContents().toggleDevTools();
}

//切换最大化
function toggleMaximized() {
    let win = BrowserWindow.getFocusedWindow(); //获取当前屏幕
    win.center(); //当前屏幕居中
    if (win.isMaximized()) {
        win.unmaximize();
    } else {
        win.maximize();
    }
}
export default ipcMain;