'use strict';
const vscode = require("vscode");
const nekoaisle_1 = require("./nekoaisle.lib/nekoaisle");
/**
 * エクステンション本体
 */
class OpenNew extends nekoaisle_1.Extention {
    constructor() {
        super('Open new file', 'nekoaisle.openNew');
    }
    /**
     * エントリー
     */
    exec() {
        // アクティブなエディターのファイル名を分解
        let pinfo = new nekoaisle_1.PathInfo(vscode.window.activeTextEditor.document.fileName);
        // ディレクトリー名を取得
        let dirName = pinfo.getDirName();
        // ファイル名を入力
        vscode.window.showInputBox({
            placeHolder: '開くファイル名を入力してください。',
            prompt: `絶対パスまたは${pinfo.getDirName()}からの相対で指定してください。`
        }).then((file) => {
            if (file.length <= 0) {
                // ファイル名が入力されなかった
                return;
            }
            // ファイル名を正規化
            // 絶対パスならそのまま
            // ~から始まるときは $HOME に置換
            // 相対ディレクトリのときはこのファイルのディレクトリからの相対
            file = nekoaisle_1.Util.normalizePath(file, pinfo.getDirName());
            nekoaisle_1.Util.openFile(file, true);
        });
    }
}
module.exports = OpenNew;
//# sourceMappingURL=OpenNew.js.map