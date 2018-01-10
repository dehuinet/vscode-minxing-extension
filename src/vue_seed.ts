'use strict';

import * as vscode from 'vscode';
import * as MXAPI from 'minxing-devtools-core';
import output from './output';
import * as path from 'path';
import * as Utils from './utils';
import config from './config';




function getTemplateOrigin() {
    return vscode.workspace.getConfiguration('Minxing')['vue-seed-origin'];
}

export default {
    checkUpdate: () => MXAPI.VueSeed.checkUpdate(getTemplateOrigin()),
    download: () => MXAPI.VueSeed.download(getTemplateOrigin())
}
// export default () => {
//     const tempPath = Utils.getTempPath();
//     vscode.window.showSaveDialog({
//         "saveLabel": "创建 vue种子 项目模板"
//     })
//     .then(project => {
//         if (!project) {
//             console.log("用户取消操作");
//             return
//         }
//         output.info('正在下载项目模版，下载完成后会自动打开项目，请稍等！');
//         const projectRootPath = project.fsPath;
//         const workspacePath = path.resolve(projectRootPath, "../");
//         const name = path.basename(projectRootPath)

//         MXAPI.NewVueSeed.add({
//             template: 'dehuinet/minxing-vue-mobile-seed',
//             tempPath,
//             name,
//             output: workspacePath
//         }).then(() => {
//             const newAppProjectPath = path.resolve(workspacePath, name);
//             const uri = vscode.Uri.file(newAppProjectPath);
//             vscode.commands.executeCommand('vscode.openFolder', uri, false);
//         }).catch(e => {
//             output.warn('下载模版失败，请检测网络！');
//         });
//     }, e => {
//         console.warn(`add project template error->${e}`);
//     })
// }