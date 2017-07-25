'use strict';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    console.log('Start "jumpToLineNumber" is now active!');

    let jump = (line: string) => {
        let l = parseInt(line);
        //ドキュメントを取得
        let editor = vscode.window.activeTextEditor;
        const range = editor.document.lineAt(l - 1).range;
        editor.selection = new vscode.Selection(range.start, range.start);
        editor.revealRange(range);
    }

    let jumpAfterInput = (top: string) => {
        // InputBoxを表示して行番号を求める
        var option:vscode.InputBoxOptions = {
            prompt: "ジャンプする行番号を入力してください。",
            password:false,
            value: top,
            valueSelection: [1,1]
        };
        vscode.window.showInputBox(option).then(jump);
    }

    // 拡張機能を登録
    for ( let i = 1; i <= 9; ++ i ) {
        context.subscriptions.push(
            vscode.commands.registerCommand(`jumpToLineNumber.jump${i}`, () => {
                jumpAfterInput(`${i}`);
            })
        );
        console.log(`register jumpToLineNumber.jump${i}`);
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
}