import dt from "@/utils/date.js";
const log4js = require("log4js");

log4js.configure({
    appenders: {
        log: {
            type: "file",
            filename: `./logs/log-${dt.dateFormat(new Date(), "yyyy-MM-dd")}.log`,
            // 指定编码格式为 utf-8
            encoding: "utf-8",
            // 配置 layout，此处使用自定义模式 pattern
            layout: {
                type: "pattern",
                // 配置模式，下面会有介绍
                pattern: '{"date":"%d","level":"%p","category":"%c","host":"%h","pid":"%z","data":\'%m\'}'
            },
            // 日志文件按日期（天）切割
            pattern: "-yyyy-MM-dd"
        },
        loginfo: {
            type: "file",
            filename: `./logs/info-${dt.dateFormat(new Date(), "yyyy-MM-dd")}.log`,
            // 指定编码格式为 utf-8
            encoding: "utf-8",
            // 配置 layout，此处使用自定义模式 pattern
            layout: {
                type: "pattern",
                // 配置模式，下面会有介绍
                pattern: "[%p]%d:'%m'"
            },
            // 日志文件按日期（天）切割
            pattern: "-yyyy-MM-dd"
        },

        errlog: {
            type: "file",
            filename: `./logs/err_log-${dt.dateFormat(new Date(), "yyyy-MM-dd")}.log`,
            // 指定编码格式为 utf-8
            encoding: "utf-8",
            // 配置 layout，此处使用自定义模式 pattern
            layout: {
                type: "pattern",
                // 配置模式，下面会有介绍
                pattern: '{"date":"%d","level":"%p","category":"%c","host":"%h","pid":"%z","data":\'%m\'}'
            },
            // 日志文件按日期（天）切割
            pattern: "-yyyy-MM-dd"
        },
        errloginfo: {
            type: "file",
            filename: `./logs/err_info-${dt.dateFormat(
        new Date(),
        "yyyy-MM-dd"
      )}.log`,
            // 指定编码格式为 utf-8
            encoding: "utf-8",
            // 配置 layout，此处使用自定义模式 pattern
            layout: {
                type: "pattern",
                // 配置模式，下面会有介绍
                pattern: "[%p]%d:'%m'"
            },
            // 日志文件按日期（天）切割
            pattern: "-yyyy-MM-dd"
        }
    },
    categories: {
        error: { appenders: ["errlog", "errloginfo"], level: "error" },
        default: { appenders: ["log", "loginfo"], level: "info" }
    }
});

export const error = function(msg) {
    log4js.getLogger("error").error(msg);
};
export const info = function(msg) {
    log4js.getLogger().info(msg);
};
export const warn = function(msg) {
    log4js.getLogger().warn(msg);
};