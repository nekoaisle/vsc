'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    console.log('Start toggleCharCase');
    // The command has been defined in the package.json file
    let disposable = vscode.commands.registerCommand('extension.toggleCharCase', () => {
        // The code you place here will be executed every time your command is executed
        let editor = vscode.window.activeTextEditor;
        let doc = vscode.window.activeTextEditor.document;
        // カーソル位置を取得
        let cursor = editor.selection.start;
        // カーソルの行の内容を取得
        let line = doc.lineAt(cursor.line).text;
        // カーソル位置の文字を取得
        let c = line.substr(cursor.character, 1);
        // カーソル位置が小文字か調べる
        if ((c >= "A") && (c <= "Z")) {
            c = c.toLocaleLowerCase();
        }
        else if ((c >= "a") && (c <= "z")) {
            c = c.toLocaleUpperCase();
        }
        else {
            c = null;
        }
        // 置換できたら
        if (c) {
            // カーソル位置の文字を選択
            let range = new vscode.Range(new vscode.Position(cursor.line, cursor.character), new vscode.Position(cursor.line, cursor.character + 1));
            // 大文字・小文字変換した文字と置換
            editor.edit(edit => edit.replace(range, c));
        }
        // カーソルを右に1文字移動
        editor.selection = new vscode.Selection(new vscode.Position(cursor.line, cursor.character + 1), new vscode.Position(cursor.line, cursor.character + 1));
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map