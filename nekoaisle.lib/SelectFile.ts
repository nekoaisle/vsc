import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {Util} from './Util';

/**
 * ファイル選択
 */
export class SelectFile {
	/**
	 * ファイル選択
	 * @param dirName ディレクトリー名
	 */
	public selectFile(dirName: string, title: string): Promise<string> {
		return new Promise<string>((resolve: (value?: string) => void, reject: (reason?: any) => void) => {
			// 非同期の処理
			let files: string[];
			try {
				files = fs.readdirSync(dirName)
				// ディレクトリ名の末尾に / を付ける
				.map((name: string): string => {
					let statas = fs.statSync(path.join(dirName, name));
					if ( statas.isDirectory() ) {
						name += '/';
					}
					return name;
				})
				// 並べ替える
				.sort((a: string, b: string): number => {
					// ディレクトリーか調べる
					let da: boolean = a.substr(-1) === '/';
					let db: boolean = b.substr(-1) === '/';
					if ( da != db ) {
						// どちらかかがディレクトリ
						return da ? -1 : 1;
					} else {
						// 両方ディレクトリかファイルなので名前で比較
						a = a.toLocaleUpperCase();
						b = b.toLocaleUpperCase();
						return (a < b) ? -1: (a > b) ? 1 : 0;
					}
				});
				if ( dirName != '/' ) {
					// ルートディレクトリでなければ先頭に ../ を追加
					files.unshift('../');
				}
			} catch (e) {
				Util.putMess(`${dirName} が開けませんでした。`);
				return;
			}
			// ファイルを選択
			let popt = {
				prompt: title,
				placeHolder: dirName,

			};
			vscode.window.showQuickPick(files, popt)
			.then((sel: string | undefined) => {
				if (!sel) {
					// ファイルが指定されなかったときは完了(then()を実行)
					resolve('');
				} else {
					// ディレクトリ名と結合
					let fn: string = path.join(dirName, sel);
					// 絶対パスに変換
					fn = Util.normalizePath(fn);  // 絶対パスにする

					// ディレクトリーか調べる
					let stats: fs.Stats = fs.statSync(fn);
					if ( !stats.isDirectory() ) {
						// ファイルなので完了(then()を実行)
						resolve(fn);
					} else {
						// ディレクトリーなら選択を続行
						this.selectFile(fn, title).then((value:string) => {
							resolve(value);
						});
					}
				}
			});
		});
	};
};
