import * as MXAPI from 'minxing-devtools-core';
import * as vscode from 'vscode';
import * as _ from 'underscore';
import * as Utils from '../utils';
import {WifiInfo} from '../domain';
let statusBarItem;
function setStatusBarMessage(clientIps:Array<string> = []) {
    const {port, ip, connectionCount} : WifiInfo = MXAPI.Wifi.info() as WifiInfo;
    const ips = clientIps.map(ip => ip.replace(/^::ffff:/i, ''));
    const ipStr = _.isEmpty(ips) ? '' : `,客户端:${ips.join(', ')}`;
    const status = `IP:${ip.join(' | ')}, 端口:${port},连接数:${connectionCount}${ipStr}`;
    statusBarItem.text = status;
    return statusBarItem;
}
export default {
    start(context) {
        const tempPath: string = Utils.getTempPath();
        const port: number =  Utils.getRandomNum(1001, 9999);
        MXAPI.Wifi.start({
            tempPath, port,
            onConnection(clientIps:Array<string>, clientIp:string){
                setStatusBarMessage(clientIps);
                vscode.window.showInformationMessage(`调试终端 [${clientIp.replace(/^::ffff:/i, '')}] 已连接到 VSCode。可以开始调试了...`);
            },
            onClose(clientIps:Array<string>, clientIp:string){
                setStatusBarMessage(clientIps);
                vscode.window.showInformationMessage(`调试终端 [${clientIp.replace(/^::ffff:/i, '')}] 已断离 VSCode`);
            }
        });
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 2);
        statusBarItem.tooltip = '客户端连接状态';
        statusBarItem.command = 'Minxing.getWifiInfo';
        context.subscriptions.push(statusBarItem);
        setStatusBarMessage();
        statusBarItem.show();
    },
    stop(){
        statusBarItem && statusBarItem.dispose();
    }
};
