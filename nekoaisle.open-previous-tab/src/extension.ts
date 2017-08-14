import * as vscode from 'vscode';
import {Util, Extention} from './nekoaisle.lib/nekoaisle';

export function activate(context: vscode.ExtensionContext) {
    let openPreviousTab = new OpenPreviousTab();
	context.subscriptions.push(openPreviousTab);

    let disposable = vscode.commands.registerCommand('nekoaisle.toggleTab', () => {
        openPreviousTab.entry();
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
}

class OpenPreviousTab extends Extention {
	private fileNames: string[] = [null, null];
    private _disposable: vscode.Disposable;

	/**
	 * 構築
	 */
	constructor() {
		super('Open previous tab', 'nekoaisle.openPreviousTab');

		// エントリーを登録
		let subscriptions: vscode.Disposable[] = [];
		vscode.window.onDidChangeActiveTextEditor(this.onEvent, this, subscriptions);

        // create a combined disposable from both event subscriptions
		this._disposable = vscode.Disposable.from(...subscriptions);
	}

	public dispose() {
        this._disposable.dispose();
	}

	/**
	 * エントリー
	 */
	public entry() {
		if ( !this.fileNames[1] ) {
			return;
		}

		let fileName = this.fileNames[1];
		for ( let doc of vscode.workspace.textDocuments ) {
			let fn = doc.fileName;
			if ( doc.fileName == fileName ) {
				vscode.window.showTextDocument(doc);
				break;
			}
		}
	}

	/**
	 * イベントハンドラ
	 */
	protected onEvent() {
		// 前回のアクティブタブを記憶
		this.fileNames[1] = this.fileNames[0];
		// 現在のアクティブタブを記憶
		this.fileNames[0] = vscode.window.activeTextEditor.document.fileName;
	}

}
