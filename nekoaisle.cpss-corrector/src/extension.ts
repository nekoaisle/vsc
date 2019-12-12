/**
 * CPSSコンバーター
 * 
 * filename:  extension.ts
 * 
 * @package   
 * @version   1.0.0
 * @copyright Copyright (C) 2019 Yoshio Kiya All rights reserved.
 * @date      2019-11-28
 * @author    木屋善夫
 */
'use strict';
import * as vscode from 'vscode';
import {Util} from './nekoaisle.lib/Util';
import {Extension} from './nekoaisle.lib/Extension';

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
 * CPSSコンバーター
 */
class MyExtention extends Extension {
	/**
	 * 構築
	 */
	constructor(context: vscode.ExtensionContext) {
		super(context, {
			name: 'CPSSソース訂正',
			config: '',		// 通常はコマンドのサフィックス
			commands: [
				{
					command: 'nekoaisle.cpssCorrector',	// コマンド
					callback: () => { this.exec(); }
				},
				{
					command: 'nekoaisle.cpssCorrector-paren',	// コマンド
					callback: () => { this.paren(); }
				}
			]
		});
	}

	/**
	 * 実行
	 */
	public exec() {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			this.correctMethodHeader(editor);
		}
	}

	public paren() {
		if (!vscode.window.activeTextEditor) {
			return;
		}
		const editor: vscode.TextEditor = vscode.window.activeTextEditor;

		// 全テキストの取得
		let text = editor.document.getText();
		text = this.correctParen(text);
		Util.replaceAllText(editor, text);
	}

	/**
	 * メソッドのヘッダーを修正
	 */
	public correctMethodHeader(editor: vscode.TextEditor) {
		// 全テキストの取得
		let text = editor.document.getText();
		let re, mid;

		// セクションタイトルを削除
		re = new RegExp("^\t//=+$\n\t//!@name .*$\n\t//=+$\n", "gm");
		text = text.replace(re, "");

		// 不要な行の削除
		text = text.replace(new RegExp("^\t//@{$\n", "gm"), "");
		text = text.replace(new RegExp("^\t//@}$\n", "gm"), "");

		// @retval 修正
		re = new RegExp("@retval", "gm");
		text = text.replace(re, "@return");

		// インデントなしのコメントを処理(クラスヘッダーとグローバル変数)
		text = this.correctRem(text, "");

		// クラスメンバーのヘッダー
		text = this.correctRem(text, "\t");

		// コメント
		re = new RegExp("^(\t+)//=== ([^=]*)=*$\n", "gm");
		text = text.replace(re, "$1// $2\n");

		// テキストを差し替える
		let doc = editor.document;
		let range = new vscode.Range(0, 0, doc.lineCount, Number.MAX_SAFE_INTEGER);
		range = doc.validateRange(range);

		editor.edit((edit) => {
			edit.replace(range, text);
		});

	}

	/**
	 * コメントを変換
	 * @param text 処理対象
	 * @param pre 行頭の文字列
	 */
	public correctRem(text: string, pre: string): string {
		let re = new RegExp(`(^${pre}//=+$\n)+(${pre}//!.*$\n)+(${pre}//=+$\n)+`, "mg");
		let mid = new RegExp(`^${pre}//\!`);
		let midLen = pre.length + 3;

		let conv = text;
		let res;
		while ((res = re.exec(text)) !== null) {
			// 一致した全体
			let search = res[0];
			let replace = "";

			let lines = search.split("\n");

			// 最初の行
			replace += `${pre}/**\n`;
			// 最後の行の１つ前まで
			for (let i = 1; i < lines.length - 1; ++i) {
				let line = lines[i];
				if (line.match(mid)) {
					// //! だったので * に変換
					line = line.substr(midLen);
					replace += `${pre} *${line}\n`;
				}
			}
			// 最後の行
			replace += `${pre} */\n`;

			conv = conv.replace(search, replace);
		}

		return conv;
	}

	/**
	 * () を校正
	 * @param text 処理対象
	 * @return 処理後の文字列
	 */
	public correctParen(text: string): string {
		// '( ' -> '(' 開き括弧の後ろのスペースを除去
		text = text.replace(/\(\s+/g, '(');
		// ' )' -> ')' 閉じ括弧の前のスペースを除去
		text = text.replace(/\s+\)/g, ')');
		//
		return text;
	}
}
