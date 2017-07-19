'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "selectword" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.selectWord', () => {
        let editor = vscode.window.activeTextEditor;
        let doc = vscode.window.activeTextEditor.document;

        // カーソル位置を取得
        let cursor  = editor.selection.start;
        // カーソルの行の内容を取得
        let line = doc.lineAt(cursor.line).text;

        // カーソルの1文字前が単語文字か調べる
        let getCharType = (c: number): number => {
            const re1 = /^[a-zA-z0-9_\$@]$/;
            let s: string = String.fromCharCode(c);
            if ( c < 0x20 ) {
                return 0;
            } else if ( c == 0x20 ) {
                // プログラムに使う文字
                return 1;
            } else if ( re1.test( s ) ) {
                // プログラムに使う文字
                return 2;
            } else if ( c < 0x100 ) {
                // 半角文字
                return 3;
            } else {
                // 全角文字
                return 4;
            }
        }

        // 単語の初めを探す
        let s = cursor.character;
        let t = getCharType(line.charCodeAt(s));   // カーソル位置の文字タイプ
        while ( (s > 0) && (t == getCharType(line.charCodeAt(s-1))) ) {
            -- s;
        }

        // 単語の終わりを探す
        let e = s;
        while ( (e < line.length) && (t == getCharType(line.charCodeAt(e))) ) {
            ++ e;
        }

        // 見つけた単語を選択
        editor.selection = new vscode.Selection( 
            new vscode.Position(cursor.line,s), 
            new vscode.Position(cursor.line,e)
        );
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}