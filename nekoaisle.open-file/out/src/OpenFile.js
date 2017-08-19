'use strict';
const vscode = require("vscode");
const nekoaisle_1 = require("./nekoaisle.lib/nekoaisle");
/**
 * エクステンション本体
 */
class OpenFile extends nekoaisle_1.Extention {
    constructor() {
        super('Open existing file', 'nekoaisle.openFile');
    }
    /**
     * エントリー
     */
    exec() {
        let selectFile = new nekoaisle_1.SelectFile;
        // アクティブなエディターのファイル名を分解
        let pinfo = new nekoaisle_1.PathInfo(vscode.window.activeTextEditor.document.fileName);
        // ディレクトリー名を取得
        let dirName = pinfo.getDirName();
        let title = 'ファイルを選択してください。';
        selectFile.selectFile(dirName, title).then((file) => {
            if (file.length > 0) {
                vscode.workspace.openTextDocument(file).then((doc) => {
                    return vscode.window.showTextDocument(doc);
                });
            }
        });
    }
}
module.exports = OpenFile;
//# sourceMappingURL=OpenFile.js.map