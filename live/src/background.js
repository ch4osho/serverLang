"use strict";

import { app, protocol, BrowserWindow, globalShortcut } from "electron";
import ipcMain from "./assets/js/app/EventBus.js";

import {
    createProtocol,
    installVueDevtools
} from "vue-cli-plugin-electron-builder/lib";

const isDevelopment = process.env.NODE_ENV !== "production";

let win;

protocol.registerSchemesAsPrivileged([
    { scheme: "app", privileges: { secure: true, standard: true } }
]);

function createWindow() {
    win = new BrowserWindow({
        title: "学生端",
        show: false,
        resizable: true,
        movable: true,
        frame: false,
        minWidth: 1200,
        minHeight: 800,
        minimizable: true,
        maximizable: true,
        width: 1200,
        height: 900,
        fullscreen: false,
        webPreferences: {
            nodeIntegration: true
        }
    });

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
        // if (!process.env.IS_TEST)
        // win.openDevTools();
    } else {
        createProtocol("app");
        win.loadURL("app://./index.html");
    }
    win.once("ready-to-show", () => {
        win.show();
    });
    win.on("closed", () => {
        win = null;
    });
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (win === null) {
        createWindow();
    }
});

app.on("ready", async() => {
    if (isDevelopment && !process.env.IS_TEST) {
        try {
            await installVueDevtools();
        } catch (e) {
            console.error("Vue Devtools failed to install:", e.toString());
        }

        // 在开发环境和生产环境均可通过快捷键打开devTools
        globalShortcut.register("CommandOrControl+f12", function() {
            win.webContents.openDevTools();
        });
    }
    createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === "win32") {
        process.on("message", data => {
            if (data === "graceful-exit") {
                app.quit();
            }
        });
    } else {
        process.on("SIGTERM", () => {
            app.quit();
        });
    }
}