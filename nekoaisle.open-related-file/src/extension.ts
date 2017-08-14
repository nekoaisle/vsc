import * as vscode from 'vscode';
import {Util, Extention, PathInfo} from './nekoaisle.lib/nekoaisle';

export function activate(context: vscode.ExtensionContext) {
    let ext = new OpenRelatedFile();
    let disp = vscode.commands.registerCommand(ext.command, () => {
        ext.exec();
    });
    context.subscriptions.push(disp);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

class OpenRelatedFile extends Extention {
	/**
	 * 構築
	 */
	constructor() {
		super('Open Related File', 'nekoaisle.openRelatedFile');
	}

	/**
	 * エントリー
	 */
	public exec() {
		let fileName = vscode.window.activeTextEditor.document.fileName;
		let pinfo = new PathInfo(fileName);

		let candidates : string[] = [];
		switch ( pinfo.info.ext ) {
		// PHP 独自処理
		case '.php':
			this.php(pinfo);
			return;

		// HTML 独自処理
		case '.html':
			this.html(pinfo);
			return;

		// PHTML
		case '.phtml':
			// 同一ディレクトリの .php
			candidates.push(pinfo.getFileName('.php'));
			break;

		// C++
		case '.cpp':
			// 同一ディレクトリの .h
			candidates.push(pinfo.getFileName('.h'));
			break;

		// C or C++
		case '.h':
			// 同一ディレクトリの .cpp | .c
			candidates.push(pinfo.getFileName('.cpp'));
			candidates.push(pinfo.getFileName('.c'));
			break;
		}

		if ( candidates.length > 0 ) {
			// 候補を順に探して存在するものを開く
			for ( let fn of candidates ) {
				if ( Util.openFile(fn) ) {
					return 
				}
			}

			// いずれも見つからなかったら
			// 優先順位の一番高いものを作成して開く
			Util.openFile(candidates[0], true);
		}
	}

	protected php(pinfo: PathInfo) {
		let fn: string;

		// pc ディレクトリの .html
		fn = pinfo.getFileName('.html', 'pc');
		if ( Util.openFile(fn) ) {
			return 
		}

		// sp ディレクトリの .html
		fn = pinfo.getFileName('.html', 'sp');
		if ( Util.openFile(fn) ) {
			return 
		}

		// 同一ディレクトリの .phtml
		fn = pinfo.getFileName('.phtml');
		if ( Util.openFile(fn) ) {
			return 
		}
	}

	protected html(pinfo: PathInfo) {
		let fn: string;

		// 親ディレクトリの .php
		fn = pinfo.getFileName('.php', '..');
		if ( Util.openFile(fn) ) {
			return 
		}

		// 同一ディレクトリの .phtml
		fn = pinfo.getFileName('.phtml');
		if ( Util.openFile(fn) ) {
			return 
		}
	}

}
