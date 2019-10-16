'use strict'
import * as vscode from 'vscode';
import {Util, Extension} from './nekoaisle.lib/nekoaisle';

export function activate(context: vscode.ExtensionContext) {
    let openPreviousTab = new OpenPreviousTab(context);
	context.subscriptions.push(openPreviousTab);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

interface History {
	fileName: string;
	editor: vscode.TextEditor;
}

class OpenPreviousTab extends Extension {
	private history: History[] = [];
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
			this.history[0] = {
				fileName: vscode.window.activeTextEditor.document.fileName,
				editor: vscode.window.activeTextEditor,
			};
		}
	}

	/**
	 * エントリー
	 */
	public exec() {
		if (!this.history[1]) {
			return;
		}

		let fileName = this.history[1].fileName;
		for (let doc of vscode.workspace.textDocuments) {
			let fn = doc.fileName;
			if (doc.fileName == fileName) {
				vscode.window.showTextDocument(doc);
				break;
			}
		}
	}

	/**
	 * イベントハンドラ
	 */
	protected onEvent(e: vscode.TextEditor) {
		if (vscode.window.activeTextEditor) {
			// 現在のアクティブファイル名を取得
			let editor = vscode.window.activeTextEditor;
			let fileName = editor.document.fileName;

			if (this.history.length === 0) {
				// 初
				this.history[0] = {
					fileName: fileName,
					editor: editor,
				};
			} else if (this.history[0].fileName != fileName) {
				// 同違っているので記憶
				// 前回のアクティブタブを記憶
				this.history[1] = this.history[0];
				// 現在のアクティブタブを記憶
				this.history[0] = {
					fileName: fileName,
					editor: editor,
				};
			}
		}
	}

	public dispose() {
        this.disposable.dispose();
	}
}
