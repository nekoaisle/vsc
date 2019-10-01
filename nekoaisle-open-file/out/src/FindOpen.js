'use strict';
const vscode = require("vscode");
const nekoaisle_1 = require("./nekoaisle.lib/nekoaisle");
/**
 * エクステンション本体
 */
class FindOpen extends nekoaisle_1.Extension {
    /**
     * 構築
     */
    constructor(context) {
        super(context, {
            name: '検索して開く',
            config: 'nekoaisle-findOpen',
            commands: [
                {
                    command: 'nekoaisle.findOpen',
                    callback: () => { this.exec(); }
                }
            ]
        });
    }
    /**
     * エントリー
     */
    exec() {
        // アクティブなエディター取得
        // let editor = vscode.window.activeTextEditor;
        let cwd = vscode.workspace.rootPath;
        // ファイル名を入力
        vscode.window.showInputBox({
            placeHolder: '検索するファイル名を入力してください。',
            prompt: `絶対パスまたは${cwd}からの相対で指定してください。`
        }).then((file) => {
            if (file.length <= 0) {
                return;
            }
            // ファイルを検索
            let files = this.findFile(file);
            if (files.length <= 0) {
                return;
            }
            // メニュ作成
            let menu = [];
            for (let file of files) {
                let pinfo = new nekoaisle_1.PathInfo(file);
                menu.push({
                    label: pinfo.info.base,
                    detail: pinfo.path,
                });
            }
            // メニュー選択
            let options = {
                placeHolder: '選択してください。',
                matchOnDetail: false,
                matchOnDescription: false
            };
            vscode.window.showQuickPick(menu, options).then((sel) => {
                if (!sel) {
                    // 未選択
                    return;
                }
                nekoaisle_1.Util.openFile(sel.detail, false);
            });
        });
    }
    findFile(filename) {
        let pinfo = new nekoaisle_1.PathInfo(filename, vscode.workspace.rootPath);
        // let cmd = `find ${pinfo.info.dir} -type f -name "${pinfo.info.base}" ! -path "*/instemole-php/*"`;
        let cmd = `find ${pinfo.info.dir} -type f -name "${pinfo.info.base}"`;
        let res = nekoaisle_1.Util.execCmd(cmd);
        res = res.trim();
        if (res) {
            return res.split("\n");
        }
        else {
            return [];
        }
    }
}
module.exports = FindOpen;
//# sourceMappingURL=FindOpen.js.map