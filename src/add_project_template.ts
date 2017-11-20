'use strict';

import * as vscode from 'vscode';
import * as MXAPI from 'minxing-devtools-core';
import output from './output';
import * as path from 'path';

const config = MXAPI.Template.Project.getConfig();
export default () => {
    let curType = null;
    const types = Object.keys(config);
    vscode.window.showQuickPick(types, {placeHolder: '请选择项目模版类型'})
        .then(type => {
            if (!type) return;
            curType = type;
            const templateEntities = config[type];
            const templateKeys = Object.keys(templateEntities);
            const templatePickItems = templateKeys.map(key => {
                return  {
                    label: templateEntities[key],
                    description: '',
                    detail: key,
                    templateName: key
                }
            })
            return vscode.window.showQuickPick(templatePickItems, {placeHolder: '请选择模版'})
        })
        .then(templateEntity => {
            if (!templateEntity) return;
            const template = templateEntity.templateName;
            vscode.window.showSaveDialog({
                "saveLabel": "创建 敏行项目 项目模板"
            })
            .then(project => {
                if (!project) {
                    console.log("用户取消操作");
                    return
                }
                const projectRootPath = project.fsPath;
                const workspacePath = path.resolve(projectRootPath, "../");
                const name = path.basename(projectRootPath)
                MXAPI.Template.Project.add({
                    type: curType,
                    name: name,
                    template: template,
                    output: workspacePath
                })
                const newAppProjectPath = path.resolve(workspacePath, name);
                const uri = vscode.Uri.file(newAppProjectPath);
                vscode.commands.executeCommand('vscode.openFolder', uri, false);
            }, e => {
                console.warn(`add project template error->${e}`);
            })
        })
}
