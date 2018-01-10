import * as MXAPI from 'minxing-devtools-core';
import * as vscode from 'vscode';
import * as _ from 'underscore';
import co from 'co';
import * as Utils from '../utils';
import {WifiInfo} from '../domain';
class StatusBarItem{
    static _instance: StatusBarItem;
    static get instance(){
        if (StatusBarItem._instance == null) {
            StatusBarItem._instance = new StatusBarItem();
        }
        return StatusBarItem._instance;
    }
    ctrl: vscode.StatusBarItem;
    constructor(){
        this.ctrl = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 2);
        _.extendOwn(this.ctrl, {
            tooltip: '客户端连接状态',
            command: 'Minxing.getWifiInfo'
        });
        this.setMsg().then(() => this.ctrl.show());
    }
    setMsg = co.wrap(function*(clientIps:Array<string> = []){
        const {port, ip, connectionCount} : WifiInfo = (yield MXAPI.Wifi.info()) as WifiInfo;
        const ips = clientIps.map(ip => ip.replace(/^::ffff:/i, ''));
        const ipStr = _.isEmpty(ips) ? '' : `,客户端:${ips.join(', ')}`;
        const status = `IP:${ip.join(' | ')}, 端口:${port},连接数:${connectionCount}${ipStr}`;
        this.ctrl.text = status;
    });
    dispose(){
        this.ctrl.dispose();
    }
}
export default {
    start(context) {
        const tempPath: string = Utils.getTempPath();
        const port: number =  Utils.getRandomNum(1001, 9999);
        MXAPI.Wifi.start({
            tempPath, port,
            onConnection(clientIps:Array<string>, clientIp:string){
                StatusBarItem.instance.setMsg(clientIps);
                vscode.window.showInformationMessage(`调试终端 [${clientIp.replace(/^::ffff:/i, '')}] 已连接到 VSCode。可以开始调试了...`);
            },
            onClose(clientIps:Array<string>, clientIp:string){
                StatusBarItem.instance.setMsg(clientIps);
                vscode.window.showInformationMessage(`调试终端 [${clientIp.replace(/^::ffff:/i, '')}] 已断离 VSCode`);
            }
        });
        context.subscriptions.push(StatusBarItem.instance.ctrl);
    },
    stop(){
        StatusBarItem.instance.dispose();
    }
};
