'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const nekoaisle_1 = require("./nekoaisle.lib/nekoaisle");
/**
 * エクステンション活性化
 * @param context
 */
function activate(context) {
    let ext = new OpenPreviousTab(context);
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
class OpenPreviousTab extends nekoaisle_1.Extension {
    /**
     * 構築
     */
    constructor(context) {
        super(context, {
            name: '拡張機能名',
            config: 'selectWord',
            commands: [
                {
                    command: 'nekoaisle.selectWord',
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
        let editor = vscode.window.activeTextEditor;
        let i = 0;
        let sels = [];
        for (let selection of editor.selections) {
            let sel = this.job(editor, selection);
            if (sel) {
                sels.push(sel);
            }
        }
        vscode.window.activeTextEditor.selections = sels;
    }
    job(editor, selection) {
        // 範囲選択されている？
        if (selection.isEmpty) {
            // 範囲選択されていないのでカーソル位置の単語を範囲選択
            // カーソル位置の単語の範囲を取得
            let range = nekoaisle_1.Util.getCursorWordRange(editor, selection.active);
            // 現在の選択範囲と等しくないので単語を選択
            return new vscode.Selection(range.start, range.end);
        }
        else {
            // 範囲選択されているときは範囲を拡大
            try {
                let range = new vscode.Range(selection.start.translate(0, -1), selection.end.translate(0, 1));
                return new vscode.Selection(range.start, range.end);
            }
            catch (err) {
                // 範囲を広げられなかった
                return null;
            }
        }
    }
}
//# sourceMappingURL=extension.js.map