/**
 * SJIS Grep
 * 
 * filename:  extension.ts
 * 
 * @package   
 * @version   1.0.0
 * @copyright Copyright (C) 2017 Yoshio Kiya All rights reserved.
 * @date      2017-08-30
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
 * SJIS Grep
 */
class MyExtention extends Extension {
	/**
	 * 構築
	 */
	constructor(context: vscode.ExtensionContext) {
		super(context, {
			name: 'SJIS Grep',
			config: '',		// 通常はコマンドのサフィックス
			commands: [
				{
					command: 'nekoaisle.grepSjis',	// コマンド
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
		// 出力ウィンドウの生成
		var overview = vscode.window.createOutputChannel( "grep-sjis" );
		// 出力ウィンドウをクリア
		overview.clear();

		let opt: vscode.InputBoxOptions = {
			placeHolder: '検索するキーワード'
		};
		vscode.window.showInputBox(opt).then((keyword: string) => {
			let cmd = `LANG=ja_JP.sjis;find ./ -name *.php | xargs grep -rn \`echo "${keyword}" | nkf -s\` * | nkf -w`;
			Util.putLog(cmd);

			let res = Util.execCmd(cmd);
			overview.append( res );
			overview.show();
		});
	}

	public test() {
	}
}
