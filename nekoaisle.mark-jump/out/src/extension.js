'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function activate(context) {
    /**
     * 現在のカーソル位置を取得
     * @return 現在のカーソル位置
     */
    let getCsrPos = () => {
        let pos = vscode.window.activeTextEditor.selection.anchor;
        return new vscode.Position(pos.line, pos.character);
    };
    /**
     * 指定位置にジャンプ
     * @param pos ジャンプする位置
     */
    let setCsrPos = (pos) => {
        let range = new vscode.Range(pos, pos);
        vscode.window.activeTextEditor.selection = new vscode.Selection(pos, pos);
        vscode.window.activeTextEditor.revealRange(range);
        console.log(`jump = ${pos.character}, ${pos.line}`);
    };
    // 処理開始
    console.log('Start markJump');
    let mark = null;
    let last = null;
    let disposable;
    // カーソル位置を記憶
    disposable = vscode.commands.registerCommand('markjump.mark', () => {
        // 現在位置を記憶
        mark = getCsrPos();
        console.log(`mark = ${mark.character}, ${mark.line}`);
    });
    context.subscriptions.push(disposable);
    // カーソル位置にジャンプ
    disposable = vscode.commands.registerCommand('markjump.jump', () => {
        if (mark) {
            // 同じ位置へはジャンプしない
            let cur = getCsrPos();
            if (!cur.isEqual(mark)) {
                // ジャンプ前の位置を記憶
                last = cur;
                // 記憶した位置にジャンプ
                setCsrPos(mark);
            }
        }
    });
    context.subscriptions.push(disposable);
    // 最後にジャンプした位置に戻る
    disposable = vscode.commands.registerCommand('markjump.rejump', () => {
        if (last) {
            // 最後にジャンプした位置にジャンプ
            setCsrPos(last);
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map