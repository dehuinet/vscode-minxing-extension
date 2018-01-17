'use strict'
import * as vscode from 'vscode';
import { clearTimeout } from 'timers';

export default {
    _channel: null,
    init() {
        if (this._channel) return;
        this._channel = vscode.window.createOutputChannel('敏行');
        this._channel.appendLine(`vscode-minxing-devtools已启动！`);
    },
    log(str: string) {
        this._channel.appendLine(str);
    },
    showChannel() {
        this._channel.show();
    },
    info(msg: string) {
        vscode.window.showInformationMessage(msg);
    },
    warn(msg: string) {
        vscode.window.showErrorMessage(msg);
    },
    noActive() {
        this.warn(`检测不到活动的敏行项目！`);
    },
    invalidProject(filePath: string) {
        this.warn(`${filePath}不在一个有效的敏行项目中!`);
    }
}