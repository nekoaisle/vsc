'use strict';
import * as vscode from 'vscode';
import {Extension, Util} from './nekoaisle.lib/nekoaisle';

/**
 * エクステンション活性化
 * @param context 
 */
export function activate(context: vscode.ExtensionContext) {
	let ext = new OpenPreviousTab(context);
}

/**
 * 非活性化
 */
export function deactivate() {
}

/**
 * エクステンション本体
 */
class OpenPreviousTab extends Extension {
	/**
	 * 構築
	 */
	constructor(context: vscode.ExtensionContext) {
		super(context, {
			name: '拡張機能名',
			config: 'selectWord',		// 通常はコマンドのサフィックス
			commands: [
				{
					command: 'nekoaisle.selectWord',	// コマンド
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
		let editor = vscode.window.activeTextEditor;

		// 範囲選択されている？
		if (editor.selection.isEmpty) {
			// 範囲選択されていないのでカーソル位置の単語を範囲選択
			// カーソル位置の単語の範囲を取得
			let range = Util.getCursorWordRange(editor);
			// 現在の選択範囲と等しくないので単語を選択
			editor.selection = new vscode.Selection(range.start, range.end);
		} else {
			// 範囲選択されているときは範囲を拡大
			try {
				let sel = editor.selection;
				let range = new vscode.Range(sel.start.translate(0, -1), sel.end.translate(0, 1));
				editor.selection = new vscode.Selection(range.start, range.end);
			} catch (err) {
				// 範囲を広げられなかった
			}
		}
		return;
	}
}
