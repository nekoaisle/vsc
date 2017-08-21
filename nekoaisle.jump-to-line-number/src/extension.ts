'use strict';
import * as vscode from 'vscode';
import {Util, Extension, ExtensionCommand} from './nekoaisle.lib/nekoaisle';

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
		// 登録するコマンド配列を作成
		let commands: ExtensionCommand[] = [];
		// 拡張機能を登録
		for ( let i = 1; i <= 9; ++ i ) {
			commands.push({
				command: `nekoaisle.jumpToLineNumber${i}`,
				callback: () => {
					this.jumpAfterInput(`${i}`)
				}
			});
		}

		super(context, {
			name: '行番号ジャンプ',
			config: 'jumpToLineNumber',
			commands: commands
		});
	}

	/**
	 * 指定行番号へジャンプ
	 * @param line ジャンプする行番号
	 */
	protected jump(line: string) {
		// 行が指定されていないときは何もしない
		if ( line.length <= 0 ) {
			return;
		}
		let l = parseInt(line);
		//ドキュメントを取得
		let editor = vscode.window.activeTextEditor;
		// 指定行の範囲を取得
		const range = editor.document.lineAt(l - 1).range;
		// 指定行の開始位置にカーソルを移動
		editor.selection = new vscode.Selection(range.start, range.start);
		// 指定レンジが画面に表示される位置にスクロール
		editor.revealRange(range);
	}

	/**
	 * 行番号指定ジャンプ
	 * @param top 行版の先頭の数字 
	 */
	protected jumpAfterInput(top: string) {
		// InputBoxを表示して行番号を求める
		var option:vscode.InputBoxOptions = {
			prompt: "ジャンプする行番号を入力してください。",
			password:false,
			value: top,
			valueSelection: [1,1]
		};
		vscode.window.showInputBox(option).then(this.jump);
	}
}
