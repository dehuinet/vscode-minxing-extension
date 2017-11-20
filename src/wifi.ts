'use strict';

import { WifiInfo } from './domain';
import * as vscode from 'vscode';
import * as Utils from './utils';

import * as MXAPI from 'minxing-devtools-core';

import output from './output';
import * as path from 'path';

export default {
    start() {
        const tempPath: string = Utils.getTempPath();
        const port: number =  Utils.getRandomNum(1001, 9999);
        MXAPI.Wifi.start({
            tempPath,
            port
        });
        this.setStatusBarMessage();
    },
    log() {
        MXAPI.Wifi.log(({
            level,
            content
        }) => {
            level = level || 'log';
            if ((level in console) && (console[level] instanceof Function)) {
                output.log(content);
            }
        })
        .then(() => {
            console.log("启动WiFi日志服务...");
        })
    },
    setStatusBarMessage() {
        const {
            port,
            ip,
            connectionCount
        } : WifiInfo = MXAPI.Wifi.info() as WifiInfo;
        const status = `IP:${ip.join(' | ')}, 端口:${port},连接数:${connectionCount}`;
        vscode.window.setStatusBarMessage(status);
    },
    getWifiInfo() {
        const {
            port,
            ip,
            connectionCount
        } : WifiInfo = MXAPI.Wifi.info() as WifiInfo;

        const tip = `IP :${JSON.stringify(ip)} 端口:${port} 设备连接数:${connectionCount}`
        const detail = "还可在下方状态栏查看";
        output.info(`${tip}, ${detail}`);
    },
    getWifiLog() {
        output.showChannel();
    },
    syncWifi(uri) {
        this.syncAllWifi(uri, false);
    },
    syncAllWifi(uri, syncAll: boolean) {
        const filePath = Utils.getActivePathOrProject(uri);
        if (!filePath) {
            output.noActive();
            return;
        }
        const projectRootInfo = MXAPI.Utils.fetchProjectRootInfoByFile(filePath);
        if (!projectRootInfo) {
            output.invalidProject(filePath);
            return;
        };
        
        const {
            port,
            ip,
            connectionCount
        }: WifiInfo = MXAPI.Wifi.info();
        if (0 === connectionCount) {
            output.info("当前网速过慢或没有设备处于连接状态,可能会影响相关同步功能的使用");
        }
        
        const updateAll: number = syncAll ? 1 : 0;
        
        MXAPI.Wifi.sync({
            project: projectRootInfo.project,
            updateAll: syncAll
        });

        const projectName = path.basename(projectRootInfo.project);
        output.info(`${projectName}同步成功,请在手机上查看运行效果!`);
    }
}
