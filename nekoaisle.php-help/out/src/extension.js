'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const nekoaisle_1 = require("./nekoaisle.lib/nekoaisle");
/**
 * エクステンション活性化
 * @param context
 */
function activate(context) {
    let ext = new MyExtention();
    let disp = vscode.commands.registerCommand(ext.command, () => {
        ext.entry();
    });
    context.subscriptions.push(disp);
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
class MyExtention extends nekoaisle_1.Extention {
    /**
     * 構築
     */
    constructor() {
        super('PHP Help', 'nekoaisle.phpHelp');
    }
    /**
     * エントリー
     */
    entry() {
        let editor = vscode.window.activeTextEditor;
        // カーソル位置の単語を取得
        let word = nekoaisle_1.Util.getCursorWord(editor);
        let addr;
        let query;
        switch (editor.document.languageId) {
            case 'typescript':
            case 'javascript':
                addr = 'https://developer.mozilla.org/ja/search';
                query = {
                    locale: 'ja',
                    "q": word
                };
                break;
            case 'php':
                addr = 'http://jp2.php.net/manual-lookup.php';
                query = {
                    lang: 'ja',
                    function: word
                };
                break;
            case 'sql':
                addr = 'https://dev.mysql.com/doc/search/';
                query = {
                    d: 171,
                    q: word
                };
                break;
        }
        nekoaisle_1.Util.browsURL(addr, query);
    }
}
//# sourceMappingURL=extension.js.map