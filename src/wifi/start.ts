import * as MXAPI from 'minxing-devtools-core';
import * as vscode from 'vscode';
import * as _ from 'underscore';
import co from 'co';
import * as Utils from '../utils';
import {WifiInfo} from '../domain';
import output from '../output';
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
        this.update();
        this.ctrl.show();
    }
    update(){
        const {port, ip, connectionCount, remoteIps} : WifiInfo = MXAPI.Wifi.info() as WifiInfo;
        const icon = connectionCount > 0 ? 'pulse' : 'radio-tower';
        const ips = remoteIps.map(ip => ip.replace(/^::ffff:/i, ''));
        const portStr = port == null ? '' : `, 端口:${port}`;
        const ipStr = _.isEmpty(ips) ? '' : `, 客户端:${ips.join(', ')}`;
        const status = `$(${icon}) IP:${ip.join(' | ')}${portStr},连接数:${connectionCount}${ipStr}`;
        this.ctrl.text = status;
    }
    dispose(){
        this.ctrl.dispose();
    }
}
const TIMEOUT = 4000;
export const statusBarItem = StatusBarItem.instance;
export default {
    start: co.wrap(function *(context){
        const tempPath: string = Utils.getTempPath();
        const port: number = yield MXAPI.Utils.getServerPort(1001, 9999);
        MXAPI.Wifi.start({
            tempPath, port,
            onConnection: co.wrap(function*(clientIp:string){
                StatusBarItem.instance.update();
            }),
            onClose: co.wrap(function*(clientIp:string){
                StatusBarItem.instance.update();
            })
        });
        StatusBarItem.instance.update();
        context.subscriptions.push(StatusBarItem.instance.ctrl);
    }),
    stop(){
        StatusBarItem.instance.dispose();
    }
};
