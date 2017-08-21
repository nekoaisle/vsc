'use strict';
import * as vscode from 'vscode';
import {Util, Extension} from './nekoaisle.lib/nekoaisle';

/**
 * エクステンション活性化
 * @param context 
 */
export function activate(context: vscode.ExtensionContext) {
	let ext = new MyExtention(context);
}

/**
 * 非活性化
 */
export function deactivate() {
}

/**
 * エクステンション本体
 */
class MyExtention extends Extension {
	/**
	 * 構築
	 */
	constructor(context: vscode.ExtensionContext) {
		super(context, {
			name: 'Toggle Char Case',
			commands: [
				{
					command: 'nekoaisle.toggleCharCase',
					callback: () => {
						this.toggleCharCase()
					}
				},{
					command: 'nekoaisle.toggleWordCase',
					callback: () => {
						this.toggleWordCase();
					}
				}
			]
		});
	}

	/**
	 * カーソル位置または選択範囲の個々の文字のケースをトグル
	 */
	public toggleCharCase() {
		let editor = vscode.window.activeTextEditor;
		let doc = vscode.window.activeTextEditor.document;
		// 現在の選択範囲を取得
		let sel = editor.selection;
		let b = sel.start.isEqual(sel.end);
		if ( sel.start.isEqual(sel.end) ) {
			// 範囲選択されていないので１文字変換
			let cursor = sel.active;

			let c = Util.getCharFromPos(editor, cursor);

			// 大文字小文字を変換
			c = Util.toggleCharCase(c);

			// カーソル位置の文字範囲を作成
			let range = new vscode.Range(cursor, cursor.translate(0, 1));

			// 大文字・小文字変換した文字と置換
			editor.edit(edit => edit.replace(range, c));

			// カーソルを右に1文字移動
			vscode.commands.executeCommand('cursorRight');
		} else {
			// 範囲選択されているので一括変換
			let text = doc.getText(sel).split('');

			for ( let i = 0; i < text.length; ++ i ) {
				text[i] = Util.toggleCharCase(text[i]);
			}

			// 大文字・小文字変換した文字と置換
			editor.edit(edit => edit.replace(sel, text.join('')));
		}
	}

	/**
	 * カーソル位置または選択範囲の文字のケースをトグル
	 */
	public toggleWordCase() {
		let editor = vscode.window.activeTextEditor;
		let doc = vscode.window.activeTextEditor.document;
		// 現在の選択範囲を取得
		let sel = editor.selection;
		let b = sel.start.isEqual(sel.end);
		if ( sel.start.isEqual(sel.end) ) {
			// 範囲選択されていないので単語変換
			let range = Util.getCursorWordRange(editor);

			// カーソル位置の単語を取得
			let word = doc.getText(range);

			// 大文字小文字を変換
			word = Util.toggleCharCase(word);

			// 大文字・小文字変換した文字と置換
			editor.edit(edit => edit.replace(range, word));
		} else {
			// 範囲選択されているので一括変換
			// 全文字を先頭文字のケースの逆に設定
			let text = doc.getText(sel);
			switch ( Util.getCharCase(text) ) {
			case 'upper':
				text = text.toLocaleLowerCase();
				break;

			case 'lower':
				text = text.toLocaleUpperCase();
				break;
			}

			// 大文字・小文字変換した文字と置換
			editor.edit(edit => edit.replace(sel, text));
		}
	}
}
