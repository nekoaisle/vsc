import * as path from 'path';
import * as fs from 'fs';
import {Util} from './Util';
import {PathInfoArgs} from './PathInfoArgs';

/**
 * パス情報クラス
 */
export class PathInfo {
	public path: string;	// 引数で与えられたファイル名
	public info: path.ParsedPath; 

	/**
	 * 構築
	 * @param fileName ファイル名
	 * @param cwd カレントディレクトリ
	 */
	public constructor(fileName: string, cwd?: string) {
		// 〜で始まるときは環境変数 $HOME に置き換える
		fileName = Util.normalizePath(fileName, cwd);

		// 記憶
		this.path = fileName;
		// ファイル名を分解
		this.info = path.parse(fileName);
	}

	/**
	 * このオブジェクトが保持しているディレクトリからの相対ディレクトリ名を取得
	 * ※引数に絶対パス名を与えたときにはそれを返す
	 * @param dir 相対ディレクトリ名
	 */
	public getDirName(dir?: string): string {
		if (!dir) {
			// 省略されたので現在のディレクトリを返す
			dir = this.info.dir;
		} else if (dir.substr(0, 1) != '/') {
			// /で始まらないときは相対ディレクトリなので現在のディレクトリ結合
			dir = path.join(this.info.dir, dir);
			// 絶対パスに変換
			dir = path.resolve(dir);
		}

		return dir;
	}

	/**
	 * このオブジェクトが保持しているパス情報からファイル名を作成
	 * @param ext 付け替える拡張子
	 * @param dir 相対ディレクトリ名
	 */
	public getFileName(ext?: string, dir?: string) {
		if (!ext) {
			ext = this.info.ext;
		}

		dir = this.getDirName(dir);

		return path.join(dir, this.info.name + ext);
	}

	/**
	 * ファイルが存在するか調べる
	 * @param path 調べるファイルの名前
	 */
	public isExistsFile(param: PathInfoArgs): boolean {
		// ファイル名を作成
		let path = this.getFileName(param.ext, param.dir);

		// 空文字列チェック
		if (path.length <= 0) {
			// ファイル名が指定されなかったときは「存在しない」を返す
			if (param.error) {
				param.error(path);
			}
			return false;
		} else {
			try {
				fs.accessSync(path);
				// 正常終了した
				if (param.exists) {
					param.exists(path);
				}
				return true;
			} catch (e) {
				// エラーが発生したのでreject
				console.log(`catch ${e}`);
				if (param.not) {
					param.not(path);
				}
				return false;
			}
		}
	}
};
