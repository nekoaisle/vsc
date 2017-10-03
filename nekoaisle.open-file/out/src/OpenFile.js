'use strict';
const vscode = require("vscode");
const nekoaisle_1 = require("./nekoaisle.lib/nekoaisle");
/**
 * エクステンション本体
 */
class OpenFile extends nekoaisle_1.Extension {
    /**
     * 構築
     */
    constructor(context) {
        super(context, {
            name: 'メニューからファイルを選択して開く',
            config: 'openFile',
            commands: [
                {
                    command: `nekoaisle.openFile`,
                    callback: () => {
                        this.exec();
                    }
                }
            ]
        });
    }
    /**
     * エントリー
     */
    exec() {
        // 開始ディレクトリを取得
        let start;
        if (vscode.window.activeTextEditor) {
            // アクティブなエディターのファイル名を分解
            start = vscode.window.activeTextEditor.document.fileName;
        }
        else if (vscode.workspace.rootPath) {
            start = vscode.workspace.rootPath;
        }
        else {
            start = '~/';
        }
        // ファイル名情報を取得
        const pinfo = new nekoaisle_1.PathInfo(start);
        ;
        // ディレクトリー名を取得
        const dirName = pinfo.getDirName();
        const title = 'ファイルを選択してください。';
        const selectFile = new nekoaisle_1.SelectFile();
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