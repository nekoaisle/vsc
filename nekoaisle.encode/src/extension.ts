/**
 * 選択範囲をエンコード
 * 
 * filename:  extension.ts
 * 
 * @package   
 * @version   1.0.0
 * @copyright Copyright (C) 2017 Yoshio Kiya All rights reserved.
 * @date      2017-08-23
 * @author    木屋善夫
 */
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
 * 選択範囲をエンコード
 */
class MyExtention extends Extension {
	/**
	 * 構築
	 */
	constructor(context: vscode.ExtensionContext) {
		super(context, {
			name: '選択範囲をエンコード',
			config: 'encode',		// 通常はコマンドのサフィックス
			commands: [
				{
					command: 'nekoaisle.encode',	// コマンド
					callback: () => {
						this.exec()
					}
				}
			]
		});
	}

	/**
	 * 実行
	 */
	public exec() {
		let menu = [
			'1 HTML',
			'2 URL',
			'3 BSE64',
			'4 \\',
			'5 HTML decode',
			'6 URL decode',
			'7 BSE64 decode',
			'8 \\ decode',
		];
		// ファイルを選択
		let popt = {
			placeHolder: 'エンコードの種類を選択してください。',
		};
		vscode.window.showQuickPick(menu, popt)
		.then((sel: string) => {
			// 選択範囲の文字列を取得
			let editor = vscode.window.activeTextEditor;
			let s = Util.getSelectString(editor);

			// 変換
			switch ( sel.substr(2) ) {
				case 'HTML': {
					s = Util.encodeHtml(s);
					break;
				}
				case 'HTML decode': {
					s = Util.decodeHtml(s);
					break;
				}

				case 'URL': {
					s = encodeURIComponent(s);
					break;
				}
				case 'URL decode': {
					s = decodeURIComponent(s);
					break;
				}

				case 'BASE64': {
					s = new Buffer(s).toString('base64');
					break;
				}
				case 'BASE64 decode': {
					s = new Buffer(s, 'base64').toString();
					break;
				}

				case '\\':
					s = s.replace(/\\/g,'\\\\');
					break;
				case '\\ decode':
					s = s.replace(/\\\\/g,'\\');
					break;

			}

			// 結果に置換
			editor.edit(edit => edit.replace(editor.selection, s));
		});
	}
}
