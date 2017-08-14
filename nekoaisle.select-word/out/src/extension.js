'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const nekoaisle_1 = require("./nekoaisle.lib/nekoaisle");
/**
 * エクステンション活性化
 * @param context
 */
function activate(context) {
    let ext = new OpenPreviousTab();
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
class OpenPreviousTab extends nekoaisle_1.Extention {
    /**
     * 構築
     */
    constructor() {
        super('Select Word', 'nekoaisle.selectWord');
    }
    /**
     * エントリー
     */
    entry() {
        let editor = vscode.window.activeTextEditor;
        let doc = vscode.window.activeTextEditor.document;
        // カーソル位置を取得
        let cursor = editor.selection.start;
        // カーソルの行の内容を取得
        let line = doc.lineAt(cursor.line).text;
        // 単語の初めを探す
        let s = cursor.character;
        let t = nekoaisle_1.Util.getCharType(line.charCodeAt(s)); // カーソル位置の文字タイプ
        while ((s > 0) && (t == nekoaisle_1.Util.getCharType(line.charCodeAt(s - 1)))) {
            --s;
        }
        // 単語の終わりを探す
        let e = s;
        while ((e < line.length) && (t == nekoaisle_1.Util.getCharType(line.charCodeAt(e)))) {
            ++e;
        }
        // 見つけた単語を選択
        editor.selection = new vscode.Selection(new vscode.Position(cursor.line, s), new vscode.Position(cursor.line, e));
    }
}
//# sourceMappingURL=extension.js.map