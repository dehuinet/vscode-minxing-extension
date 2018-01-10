// apicloud html5 vue-seed
/**
 * TODO
 * APICloud HTML5 VUE-SEED模版统一处理入口
 */
import * as vscode from 'vscode';
import vueSeed from './vue_seed';

function checkAllTemplateUpdate() {
    
    vueSeed.checkUpdate()
        .then(origin => {
            vscode.window.showWarningMessage(`发现来自${origin}的VUE模版需要更新，是否更新？`, '是')
                .then(select => {
                    if (select) {
                        vueSeed.download()
                            .then(() => {
                                vscode.window.showInformationMessage(`来自${origin}的VUE模版已更新完成`);
                            })
                    }
                })
        })
        .catch(e => console.log('error->', e));
}

export default {
    checkAllTemplateUpdate
}