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
		// 開始ディレクトリを取得
		let start: string;
		if (vscode.window.activeTextEditor) {
			// アクティブなエディターのファイル名を分解
			start = vscode.window.activeTextEditor.document.fileName;
		} else if (vscode.workspace.rootPath) {
			start = vscode.workspace.rootPath;
		} else {
			start = '~/';
		}

		// ファイル名情報を取得
		const pinfo = new PathInfo(start);; 
		// ディレクトリー名を取得
		const dirName = pinfo.getDirName();

		const title = 'ファイルを選択してください。';
		const selectFile = new SelectFile();
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