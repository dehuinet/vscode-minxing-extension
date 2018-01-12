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

function add() {
    vscode.window.showSaveDialog({
        "saveLabel": "创建 vue种子 项目模板"
    })
    .then(project => {
        if (!project) {
            console.log("用户取消操作");
            return
        }
        const projectRootPath = project.fsPath;
        const workspacePath = path.resolve(projectRootPath, "../");
        const name = path.basename(projectRootPath)
        addTemplate({
            origin: getTemplateOrigin(),
            name,
            output: workspacePath
        })
    }, e => {
        console.warn(`add project template error->${e}`);
    })
}

function addTemplate({
    origin = null,
    name,
    output
}) {
    const newAppProjectPath = path.resolve(output, name);
    const uri = vscode.Uri.file(newAppProjectPath);
    
    var err = MXAPI.VueSeed.add({
        origin,
        name,
        output
    })

    if (err) {
        vscode.window.showWarningMessage(`${err}。是否采用默认模版？`, '是')
            .then(confirm => {
                if (confirm) {
                    addTemplate({name, output});
                }
            })
    } else {
        vscode.commands.executeCommand('vscode.openFolder', uri, false);
    }
}


export default {
    checkUpdate: () => MXAPI.VueSeed.checkUpdate(getTemplateOrigin()),
    download: () => MXAPI.VueSeed.download(getTemplateOrigin()),
    add,
}
