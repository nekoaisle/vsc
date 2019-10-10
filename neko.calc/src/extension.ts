'use strict';
import * as vscode from 'vscode';
import { Util, Extension, EditInsert } from './nekoaisle.lib/nekoaisle';

export function activate(context: vscode.ExtensionContext) {
    let ext = new MyExtension(context);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

class MyExtension extends Extension {
	/**
	 * 構築
	 */
	constructor(context: vscode.ExtensionContext) {
		super(context, {
			name: 'neko 電卓',
			config: 'neko-calc',
			commands: [{
				command: 'neko.calc',
				callback: () => { this.entry(); }
			}]
		});
	}

	/**
	 * エントリー
	 */
	protected async entry() {
		// まずは計算式入力
		let exp = await vscode.window.showInputBox({
			placeHolder: "計算式を入力してください。"
		});
		if (typeof exp !== "string") {
			// キャンセルされた
			return;
		}
		
			// 書式入力
		let format = await vscode.window.showInputBox({
			value: this.getConfig('format', '%d'),
			placeHolder: "出力書式を入力してください。"
		});
		if (typeof format !== "string") {
			// キャンセルされた
			return;
		}

		// 計算
		let value: number = parseInt(eval(`${exp}`));
		if (isNaN(value)) {
			// 計算できない文字列だった
			Util.putMess(`計算できませんでした。 ${exp}`);
			return;
		}

		// フォーマット変換
		let valString: string = Util.execCmd(`printf "${format}" "${value}"`);

		// 現在のエディタを取得
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			// 編集中ではないのでメッセージ出力
			Util.putMess(valString);
		} else {
			// カーソル位置に挿入
			let inserts: EditInsert[] = [];
			for (let sels of editor.selections) {
				inserts.push({
					pos: sels.anchor,
					str: valString,
				});
			}
			this.syncInsert(editor, inserts);
		}
	}
}
