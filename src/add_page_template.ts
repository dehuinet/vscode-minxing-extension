'use strict';

import * as vscode from 'vscode';
import * as MXAPI from 'minxing-devtools-core';
import output from './output';
import * as path from 'path';
import * as Utils from './utils';


const config = MXAPI.Template.Page.getConfig();
export default (uri) => {
    
    let curType = null;
    const types = Object.keys(config);
    vscode.window.showQuickPick(types, {placeHolder: '请选择页面框架类型'})
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
            const filePath = Utils.getActivePathOrProject(uri);
            if (!filePath) {
                output.noActive();
                return;
            }
            const projectRootInfo = MXAPI.Utils.fetchProjectRootInfoByFile(filePath);
            if (!projectRootInfo) {
                output.invalidProject(filePath);
                return;
            }
            if (curType !== projectRootInfo.type) {
                output.warn(`模版类型与项目类型不符！`);
                return;
            }
            const outputPath = MXAPI.Template.Page.getOutputPath({
                type: curType,
                projectRootPath: projectRootInfo.project,
                filePath
            });
            vscode.window.showInputBox({
                "prompt": `向${outputPath}中添加页面, 请输入页面名称`
            })
            .then(name => {
                if (name) {
                    const err = MXAPI.Template.Page.add({
                        type: curType,
                        name: name,
                        output: outputPath,
                        project: projectRootInfo.project,
                        template: template
                    });
                    if (err) {
                        output.warn(err);
                        return;
                    }
                    output.info('添加成功!');
                }
            }, e => {
                console.log(`show input box error->${e}`);
            });
        })
}
