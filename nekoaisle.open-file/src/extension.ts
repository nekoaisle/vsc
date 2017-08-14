'use strict';
import * as vscode from 'vscode';
import {Util, Extention, SelectFile} from './nekoaisle.lib/nekoaisle';

/**
 * エクステンション起動
 * @param context 
 */
export function activate(context: vscode.ExtensionContext) {
    let openFile = new OpenFile();
    let disp = vscode.commands.registerCommand(openFile.command, () => {
        openFile.exec();
    });
    context.subscriptions.push(disp);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

/**
 * エクステンション本体
 */
class OpenFile extends Extention {
	constructor() {
		super('Open File', 'nekoaisle.openFile');
	}

	/**
	 * エントリー
	 */
	public exec() {
		let selectFile = new SelectFile;
		let dirName = process.cwd();
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
