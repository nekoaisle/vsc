import * as vscode from 'vscode';
import {Util, Extension} from './nekoaisle.lib/nekoaisle';

export function activate(context: vscode.ExtensionContext) {
    let openPreviousTab = new OpenPreviousTab(context);
	context.subscriptions.push(openPreviousTab);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

class OpenPreviousTab extends Extension {
	private fileNames: string[] = [null, null];
    private disposable: vscode.Disposable;

	/**
	 * 構築
	 */
	constructor(context: vscode.ExtensionContext) {
		super(context, {
			name: '拡張機能名',
			config: 'toggleTab',
			commands: [
				{
					command: 'nekoaisle.toggleTab',
					callback: () => {
						this.exec()
					}
				}
			]
		});

		// イベントハンドラーを登録
		let subscriptions: vscode.Disposable[] = [];
		vscode.window.onDidChangeActiveTextEditor(this.onEvent, this, subscriptions);

        // create a combined disposable from both event subscriptions
		this.disposable = vscode.Disposable.from(...subscriptions);

		// 現在のアクティブタブを記憶
		if (vscode.window.activeTextEditor) {
			this.fileNames[0] = vscode.window.activeTextEditor.document.fileName;
		}
	}

	/**
	 * エントリー
	 */
	public exec() {
		if (!this.fileNames[1]) {
			return;
		}

		let fileName = this.fileNames[1];
		// for (let doc of vscode.workspace.textDocuments) {
		// 	let fn = doc.fileName;
		// 	if (doc.fileName == fileName) {
		// 		vscode.window.showTextDocument(doc);
		// 		break;
		// 	}
		// }
		for (let editor of vscode.window.visibleTextEditors) {
			if (editor.document.fileName == fileName) {
	            vscode.workspace.openTextDocument(fileName).then((doc: vscode.TextDocument) => {
					return vscode.window.showTextDocument(doc);
        		});
				break;
			}
		}
	}

	/**
	 * イベントハンドラ
	 */
	protected onEvent(e: vscode.TextEditor) {
		// 前回のアクティブタブを記憶
		this.fileNames[1] = this.fileNames[0];
		// 現在のアクティブタブを記憶
		this.fileNames[0] = vscode.window.activeTextEditor.document.fileName;
	}

	public dispose() {
        this.disposable.dispose();
	}
}
