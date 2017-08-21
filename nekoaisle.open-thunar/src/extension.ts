'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import * as chproc from 'child_process';
import {Util, Extension} from './nekoaisle.lib/nekoaisle';

export function activate(context: vscode.ExtensionContext) {
    let extention = new OpenThunar(context);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

class OpenThunar extends Extension {
	/**
	 * 構築
	 */
	constructor(context: vscode.ExtensionContext) {
		super(context, {
			name: 'Open Thunar',
			config: 'openThunar',		// 通常はコマンドのサフィックス
			commands: [
				{
					command: 'nekoaisle.openThunar',	// コマンド
					callback: () => {
						this.exec()
					}
				}
			]
		});
	}

	/**
	 * エントリー
	 */
	public exec() {
        // settings.json からファイラーの名前を取得
        let filer = this.getConfig('nekoaisle.filer', 'thunar');

        //ドキュメントを取得
        let editor = vscode.window.activeTextEditor;

        // ファイル名を取得
        let fileName = editor.document.fileName;
        let pinfo = path.parse(fileName);

        // コマンドラインを作成
        let cmd = `${filer} ${pinfo.dir}`;
        console.log( cmd );

        // 非同期実行
        chproc.exec( cmd, (err, stdout: string, stderr: string) => {
            if ( err == null ) {
                console.log(stdout);
            } else {
                // エラーが発生
                let str = `error:
${err.message}
stderr:
${stderr}
stdout:
${stdout}
trace:
${err.stack}
`
            }
        });
    }
}
