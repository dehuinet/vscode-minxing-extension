'use strict';

import { window } from 'vscode';
import * as MXAPI from 'minxing-devtools-core';
import * as Utils from './utils';
import output from './output';

export default (uri) => {
    const filePath = Utils.getActivePathOrProject(uri);
    if (!filePath) {
        output.noActive();
        return;
    }
    const projectInfo = MXAPI.Utils.fetchProjectRootInfoByFile(filePath);
    if (!projectInfo) {
        output.invalidProject(filePath);
        return;
    };
    window.showOpenDialog({
        openLabel: "选择打包后的文件存放目录",
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false
    })
    .then((savePathArr) => {
        if (!savePathArr || savePathArr.length === 0) {
            return;
        }
        const savePath = savePathArr[0].fsPath;

        MXAPI.build({
            projectInfo,
            projectRootPath: projectInfo.project,
            savePath
        })
        .then(zipPath => {
            const tip = `已成功打包为敏行插件应用!目录为${zipPath}`;
            const detail = "还可在vscode控制台末尾随时查看";
            output.info(`${tip}, ${detail}`);
        })
        .catch(e => {
            const tip = `打包出错!`;
            output.warn(tip);
            console.log('build to minxing error->', e);
        });
    }, e => {
        console.log('build to minxing error->', e);
    })
}