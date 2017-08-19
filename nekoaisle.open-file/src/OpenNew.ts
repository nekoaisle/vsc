'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import {Extention, Util, SelectFile, PathInfo} from './nekoaisle.lib/nekoaisle';

/**
 * エクステンション本体
 */
class OpenNew extends Extention {
	constructor() {
		super('Open new file', 'nekoaisle.openNew');
	}

	/**
	 * エントリー
	 */
	public exec() {
		// アクティブなエディターのファイル名を分解
		let pinfo = new PathInfo(vscode.window.activeTextEditor.document.fileName);
		// ディレクトリー名を取得
		let dirName = pinfo.getDirName();

		// ファイル名を入力
		vscode.window.showInputBox({
			placeHolder: '開くファイル名を入力してください。',
			prompt: `絶対パスまたは${pinfo.getDirName()}からの相対で指定してください。`
		}).then((file: string) => {
			if ( file.length <= 0 ) {
				// ファイル名が入力されなかった
				return;
			}

			// ファイル名を正規化
			// 絶対パスならそのまま
			// ~から始まるときは $HOME に置換
			// 相対ディレクトリのときはこのファイルのディレクトリからの相対
			file = Util.normalizePath(file,pinfo.getDirName());

			Util.openFile(file, true);
        });
	}
}

export = OpenNew;