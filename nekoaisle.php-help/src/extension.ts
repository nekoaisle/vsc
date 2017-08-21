'use strict';
import * as vscode from 'vscode';
import {Util, Extension} from './nekoaisle.lib/nekoaisle';

/**
 * エクステンション活性化
 * @param context 
 */
export function activate(context: vscode.ExtensionContext) {
	let ext = new MyExtension(context);
}

/**
 * 非活性化
 */
export function deactivate() {
}

/**
 * エクステンション本体
 */
class MyExtension extends Extension {
	/**
	 * 構築
	 */
	constructor(context: vscode.ExtensionContext) {
		super(context, {
			name: 'カーソル位置の単語でPHPマニュアルを開く',
			config: 'phpHelp',		// 通常はコマンドのサフィックス
			commands: [
				{
					command: 'nekoaisle.phpHelp',	// コマンド
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

        // カーソル位置の単語を取得
        let word = Util.getCursorWord(editor);

        let addr: string;
        let query: object;
        switch ( editor.document.languageId ) {
            case 'typescript':
            case 'javascript':
                addr = 'https://developer.mozilla.org/ja/search';
                query = {
                    locale: 'ja',
                    "q": word
                };
                break;

            case 'php':
                addr = 'http://jp2.php.net/manual-lookup.php';
                query = {
                    lang: 'ja',
                    function: word
                };
                break;

            case 'sql':
                addr = 'https://dev.mysql.com/doc/search/';
                query = {
                    d: 171,
                    q: word
                }
                break;
            }

        Util.browsURL(addr, query);
    }
}
