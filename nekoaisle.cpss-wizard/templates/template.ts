/**
 * @@title@@
 * 
 * filename:  @@filename@@
 * 
 * @package   
 * @version   1.0.0
 * @copyright Copyright (C) @@copyright@@ Yoshio Kiya All rights reserved.
 * @date      @@date@@
 * @author    @@author@@
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
 * @@title@@
 */
class MyExtention extends Extension {
	/**
	 * 構築
	 */
	constructor(context: vscode.ExtensionContext) {
		super(context, {
			name: '@@title@@',
			config: '',		// 通常はコマンドのサフィックス
			commands: [
				{
					command: 'nekoaisle.',	// コマンド
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
	}
}
