import * as _ from 'underscore';
import * as path from 'path';
import * as vscode from 'vscode';
import * as MXAPI from 'minxing-devtools-core';
import * as fs from 'fs';
import co from 'co';
import {WifiInfo, LocalStorage} from '../domain';
import * as Utils from '../utils';
import output from '../output';
import start, {statusBarItem} from './start';

const readFile = (filePath, encoding) => new Promise((resolve, reject) => {
    fs.readFile(filePath, encoding, function(err, ret) {
        err ? reject(err) : resolve(ret);
    })
})

export default {
    ...start,
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
    getWifiInfo: co.wrap(function*(){
        const logDebug = Utils.loggerBuilder.debug('Wifi:getWifiInfo');
        const logErr = Utils.loggerBuilder.error('Wifi:getWifiInfo');
        const qrCodeTitle = '扫一扫 手机连接二维码';
        try {
            statusBarItem.update();
            const {port, ip, connectionCount, qrcodeFilePath}: WifiInfo = (yield MXAPI.Wifi.info(qrCodeTitle)) as WifiInfo;
            const tip = `IP :${JSON.stringify(ip)} 端口:${port} 设备连接数:${connectionCount}`;
            const detail = "还可在下方状态栏查看";
            output.info(`${tip}, ${detail}`);
            logDebug('qrcodeFilePath: %s', qrcodeFilePath);
            if (!_.isEmpty(qrcodeFilePath)) {
                const htmlStr = yield readFile(qrcodeFilePath, 'utf-8');
                const panel = vscode.window.createWebviewPanel(qrCodeTitle, qrCodeTitle, vscode.ViewColumn.One, {
                    enableScripts: true
                });
                panel.webview.html = htmlStr;
            }
        } catch (error) {
            logErr(error);
            throw error;
        }
    }),
    getWifiLog() {
        output.showChannel();
    },
    syncWifi(uri) {
        this.syncAllWifi(uri, false);
    },
    syncAllWifi(uri, syncAll: boolean = true){
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

        const {port, ip, connectionCount}: WifiInfo = MXAPI.Wifi.info();
        if (0 === connectionCount) {
            output.info("当前网速过慢或没有设备处于连接状态,可能会影响相关同步功能的使用");
        }

        const updateAll: number = syncAll ? 1 : 0;

        MXAPI.Wifi.sync({
            projectRootInfo,
            project: projectRootInfo.project,
            updateAll: updateAll
        });

        const projectName = path.basename(projectRootInfo.project);
        output.info(`${projectName}同步成功,请在手机上查看运行效果!`);
    },
    webPreview: co.wrap(function *(){
        const logDebug = Utils.loggerBuilder.debug('wifi:webPreview');
        const logErr = Utils.loggerBuilder.error('wifi:webPreview');
        const CANCEL_ITEM = '录入新URL...', PROMPT = '请输入本地web工程页面,以端口开始',
              STORAGE_KEY = 'webPreview-url-history';
        try {
            const {port, ip, connectionCount}: WifiInfo = MXAPI.Wifi.info();
            const DEFAULT_URL = `${ip}:9200/index.html`;
            const localstorage: LocalStorage = yield MXAPI.Utils.getLocalStorage();
            let history: Array<string> = localstorage.getItem(STORAGE_KEY) == null ? [] :
                JSON.parse(localstorage.getItem(STORAGE_KEY));
            let src;
            if ( _.isEmpty(history)) {
                src = yield vscode.window.showInputBox({prompt: PROMPT, value: DEFAULT_URL});
            } else {
                let value = yield vscode.window.showQuickPick([CANCEL_ITEM, ...history], {
                    ignoreFocusOut: true,
                    placeHolder: '请选择WEB预览访问URL'
                });
                if (_.isEmpty(value) || value === CANCEL_ITEM) {
                    src = yield vscode.window.showInputBox({prompt: PROMPT, value: history[0]});
                } else {
                    src = value;
                }
            }
            logDebug('src: %s', src);
            if (!_.isEmpty(src)) {
                if (history.indexOf(src) > -1) {
                    history = history.filter(h => h !== src);
                }
                history.unshift(src);
                localstorage.setItem(STORAGE_KEY, JSON.stringify(history));
                if (0 === connectionCount) {
                    output.info("当前网速过慢或没有设备处于连接状态,可能会影响相关同步功能的使用");
                }
                const err = MXAPI.Wifi.webPreview({src});
                if (err) {
                    output.warn(err);
                    return;
                }
                output.info('预览成功!');
            }
        } catch (err) {
            logErr(err);
        }
    }),
    singlePagePreview(uri){
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
        const {port, ip, connectionCount} = MXAPI.Wifi.info()
        if (0 === connectionCount) {
            output.warn("当前网速过慢或没有设备处于连接状态,可能会影响相关同步功能的使用")
        }
        MXAPI.Wifi.preview({
            file: filePath
        })
        output.info(`${fileName}同步成功,请在手机上查看运行效果!`);
    }
}
