'use strict';
import * as vscode from 'vscode';
import {Util, Extention} from './nekoaisle.lib/nekoaisle';

/**
 * エクステンション活性化
 * @param context 
 */
export function activate(context: vscode.ExtensionContext) {
	let ext = new OpenPreviousTab();
	let disp = vscode.commands.registerCommand(ext.command, () => {
		ext.entry();
	});

	context.subscriptions.push(disp);
}

/**
 * 非活性化
 */
export function deactivate() {
}

/**
 * エクステンション本体
 */
class OpenPreviousTab extends Extention {
	/**
	 * 構築
	 */
	constructor() {
		super('Select Word', 'nekoaisle.selectWord');
	}

	/**
	 * エントリー
	 */
	public entry() {
		let editor = vscode.window.activeTextEditor;
		let doc = vscode.window.activeTextEditor.document;

		// カーソル位置を取得
		let cursor  = editor.selection.start;
		// カーソルの行の内容を取得
		let line = doc.lineAt(cursor.line).text;

		// 単語の初めを探す
		let s = cursor.character;
		let t = Util.getCharType(line.charCodeAt(s));   // カーソル位置の文字タイプ
		while ( (s > 0) && (t == Util.getCharType(line.charCodeAt(s-1))) ) {
			-- s;
		}

		// 単語の終わりを探す
		let e = s;
		while ( (e < line.length) && (t == Util.getCharType(line.charCodeAt(e))) ) {
			++ e;
		}

		// 見つけた単語を選択
		editor.selection = new vscode.Selection( 
			new vscode.Position(cursor.line,s), 
			new vscode.Position(cursor.line,e)
		);
	}
}
