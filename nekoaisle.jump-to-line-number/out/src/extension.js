'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function activate(context) {
    console.log('Start "jumpToLineNumber" is now active!');
    let jump = (line) => {
        let l = parseInt(line);
        //ドキュメントを取得
        let editor = vscode.window.activeTextEditor;
        const range = editor.document.lineAt(l - 1).range;
        editor.selection = new vscode.Selection(range.start, range.start);
        editor.revealRange(range);
    };
    let jumpAfterInput = (top) => {
        // InputBoxを表示して行番号を求める
        var option = {
            prompt: "ジャンプする行番号を入力してください。",
            password: false,
            value: top,
            valueSelection: [1, 1]
        };
        vscode.window.showInputBox(option).then(jump);
    };
    // 拡張機能を登録
    for (let i = 1; i <= 9; ++i) {
        context.subscriptions.push(vscode.commands.registerCommand(`jumpToLineNumber.jump${i}`, () => {
            jumpAfterInput(`${i}`);
        }));
        console.log(`register jumpToLineNumber.jump${i}`);
    }
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map