'use strict';
import * as vscode from 'vscode';
import {Util, Extention} from './nekoaisle.lib/nekoaisle';

/**
 * エクステンション活性化
 * @param context 
 */
export function activate(context: vscode.ExtensionContext) {
	let ext = new MyExtention();
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
class MyExtention extends Extention {
	/**
	 * 構築
	 */
	constructor() {
		super('PHP Help', 'nekoaisle.phpHelp');
	}

	/**
	 * エントリー
	 */
	public entry() {
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
