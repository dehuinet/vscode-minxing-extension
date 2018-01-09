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
            port,
            onConnection: () => {
                this.setStatusBarMessage();
            },
            onClose: () => {
                this.setStatusBarMessage();
            }
        });
        this.setStatusBarMessage();
    },
    clearTempCache() {
        const tempPath: string = Utils.getTempPath();
        MXAPI.clearTemp(tempPath);
    },
    log() {
        MXAPI.Wifi.log(({
            level,
            content
        }) => {
            if (!(level in console) || !(console[level] instanceof Function)) {
                level = 'log'
            }
            try{
                console[level](JSON.parse(content));
                output.log(JSON.parse(content));
            } catch(e) {
                console[level](content);
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
            connectionCount,
            remoteIps
        } : WifiInfo = MXAPI.Wifi.info() as WifiInfo;
        const ips = remoteIps.map(ip => ip.replace(/^::ffff:/i, ''));
        const ipStr = ips.length === 0 ? '' : `,客户端:${ips.join(', ')}`;
        const status = `IP:${ip.join(' | ')}, 端口:${port},连接数:${connectionCount}${ipStr}`;
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
    syncAllWifi(uri, syncAll: boolean = true) {
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
            updateAll: updateAll
        });

        const projectName = path.basename(projectRootInfo.project);
        output.info(`${projectName}同步成功,请在手机上查看运行效果!`);
    },
    webPreview() {
        const {
            port,
            ip,
            connectionCount
        }: WifiInfo = MXAPI.Wifi.info();


        vscode.window.showInputBox({
            "value": `${ip}:9200/index.html`,
            "prompt": `请输入本地web工程页面,以端口开始`
        })
        .then(src => {
            console.log('src-->', src);
            if (src) {
                if (0 === connectionCount) {
                    output.info("当前网速过慢或没有设备处于连接状态,可能会影响相关同步功能的使用");
                }
                const err = MXAPI.Wifi.webPreview({
                    src
                })
                if (err) {
                    output.warn(err);
                    return;
                }
                output.info('预览成功!');
            }
        }, e => {
            console.log(`show input box error->${e}`);
        });
    },
    singlePagePreview(uri) {

        const filePath = Utils.getPathOrActive(uri);
        if (!filePath) {
            output.warn("似乎没有可供预览的文件")
            return;
        }
        const fileName = path.basename(filePath);
        const htmlReg = /(.*\.html)$/;
        if (!htmlReg.test(fileName)) {
            output.warn("似乎没有可供预览的文件");
            return;
        }
        const {
            port,
            ip,
            connectionCount
        } = MXAPI.Wifi.info()
        if (0 === connectionCount) {
            output.warn("当前网速过慢或没有设备处于连接状态,可能会影响相关同步功能的使用")
        }
        MXAPI.Wifi.preview({
            file: filePath
        })
        output.info(`${fileName}同步成功,请在手机上查看运行效果!`);
    }
}
