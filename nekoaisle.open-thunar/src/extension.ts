'use strict';
import * as vscode from 'vscode';
import * as process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    const extentionKey = "openThunar";
    console.log('Start "OpenThunar"');

    context.subscriptions.push(vscode.commands.registerCommand(`${extentionKey}.open`, () => {
        //ドキュメントを取得
        let editor = vscode.window.activeTextEditor;

        // ファイル名を取得
        let fileName = editor.document.fileName;
        let pinfo = path.parse(fileName);

        // コマンドラインを作成
        let cmd = `thunar ${pinfo.dir}`;
        console.log( cmd );

        // 非同期実行
        process.exec( cmd, (err, stdout: string, stderr: string) => {
            if ( err == null ) {
                console.log(stdout);
            } else {
                // エラーが発生
                console.log("error: " + err.message);
                console.log("stderr:");
                console.log(stderr);
                console.log("stdout:");
                console.log(stdout);
            }
        });
    }));
}

// this method is called when your extension is deactivated
export function deactivate() {
}