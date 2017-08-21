'use strict';
import * as vscode from 'vscode';
import {Extension, SelectFile, PathInfo} from './nekoaisle.lib/nekoaisle';

/**
 * エクステンション本体
 */
class OpenFile extends Extension {
	/**
	 * 構築
	 */
	constructor(context: vscode.ExtensionContext) {
		super(context, {
			name: 'メニューからファイルを選択して開く',
			config: 'openFile',
			commands: [
				{
					command: `nekoaisle.openFile`,
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
		let selectFile = new SelectFile;
		// アクティブなエディターのファイル名を分解
		let pinfo = new PathInfo( vscode.window.activeTextEditor.document.fileName );
		// ディレクトリー名を取得
		let dirName = pinfo.getDirName();
		let title = 'ファイルを選択してください。';
		selectFile.selectFile(dirName, title).then((file: string) => {
			if ( file.length > 0 ) {
	            vscode.workspace.openTextDocument(file).then((doc: vscode.TextDocument) => {
					return vscode.window.showTextDocument(doc);
        		});
			}
        });
	}
}

export = OpenFile;