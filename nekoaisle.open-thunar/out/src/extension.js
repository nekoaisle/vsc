'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const chproc = require("child_process");
const nekoaisle_1 = require("./nekoaisle.lib/nekoaisle");
function activate(context) {
    let extention = new OpenThunar(context);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
class OpenThunar extends nekoaisle_1.Extension {
    /**
     * 構築
     */
    constructor(context) {
        super(context, {
            name: 'Open Thunar',
            config: 'openThunar',
            commands: [
                {
                    command: 'nekoaisle.openThunar',
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
        // settings.json からファイラーの名前を取得
        let filer = this.getConfig('nekoaisle.filer', 'thunar');
        //ドキュメントを取得
        let editor = vscode.window.activeTextEditor;
        // ファイル名を取得
        let fileName = editor.document.fileName;
        let pinfo = path.parse(fileName);
        // コマンドラインを作成
        let cmd = `${filer} ${pinfo.dir}`;
        console.log(cmd);
        // 非同期実行
        chproc.exec(cmd, (err, stdout, stderr) => {
            if (err == null) {
                console.log(stdout);
            }
            else {
                // エラーが発生
                let str = `error:
${err.message}
stderr:
${stderr}
stdout:
${stdout}
trace:
${err.stack}
`;
            }
        });
    }
}
//# sourceMappingURL=extension.js.map