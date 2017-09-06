'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const nekoaisle_1 = require("./nekoaisle.lib/nekoaisle");
/**
 * エクステンション活性化
 * @param context
 */
function activate(context) {
    let ext = new MyExtension(context);
}
exports.activate = activate;
/**
 * 非活性化
 */
function deactivate() {
}
exports.deactivate = deactivate;
/**
 * エクステンション本体
 */
class MyExtension extends nekoaisle_1.Extension {
    /**
     * 構築
     */
    constructor(context) {
        super(context, {
            name: 'カーソル位置の単語でマニュアルなどを開く',
            config: 'openHelp',
            commands: [
                {
                    command: 'nekoaisle.openHelp',
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
        //
        let editor = vscode.window.activeTextEditor;
        // カーソル位置の単語を取得
        let word = nekoaisle_1.Util.getCursorWord(editor);
        // デフォルトのリストファイル名
        let listFN = this.joinExtensionRoot("openHelp.json");
        // settings.json よりテンプレートディレクトリを取得
        listFN = this.getConfig("list-file", listFN);
        // 設定ファイルの読み込み
        let source = nekoaisle_1.Util.loadFile(listFN);
        // 読み込んだファイル中の {{word}} をカーソル位置の単語に置換
        source = source.replace(/{{word}}/g, word);
        // json に変換
        let list = nekoaisle_1.Util.decodeJson(source);
        // 設定ファイルの読み込み
        // 継承を解決
        for (let key in list) {
            if (list['inherit']) {
                // このアイテムは継承が指定されている
                let link = list['inherit'];
                // このオブジェクトで定義されていない要素は継承元から取得
                for (let key in link) {
                    if (typeof list[key] == "undefined") {
                        // このオブジェクトでは指定されていない
                        list[key] = link[key];
                    }
                }
            }
        }
        let addr;
        let query;
        if (list[editor.document.languageId]) {
            let item = list[editor.document.languageId];
            switch (item.method) {
                case 'chrome': {
                    nekoaisle_1.Util.browsURL(item.path, item.options);
                    break;
                }
                default: {
                    break;
                }
            }
        }
    }
}
//# sourceMappingURL=extension.js.map