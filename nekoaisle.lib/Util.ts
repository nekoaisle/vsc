import * as vscode from 'vscode';
import * as chproc from 'child_process';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

export module Util {
	/**
	 * メッセージを出力
	 * @param str 出力するメッセージ
	 */
	export function putMess(str: string): string {
		vscode.window.showInformationMessage(str);
		return str;
	}

	/**
	 * ログを出力
	 * @param str 出力する文字列
	 */
	export function putLog(str: string): string {
		console.log(str);
		return str;
	}

    // 指定文字でパディング
    export function pad(str: string, pad: string, cols: number): string {
        pad = pad.repeat(cols);
        return (pad + str).slice(-cols);
    }
    export function padNum(num: number, cols: number): string {
        return pad( num.toString(), "0", cols);
    }

	/**
	 * 指定文字コードの文字種を取得
	 * @param c 調べる文字コード
	 */
	export function getCharType(c: number): number {
		const re1 = /^[a-zA-z0-9_\$@]$/;
		let s: string = String.fromCharCode(c);
		if ( (c == 0x20) || (c==9) ) {
			// 空白
			return 1;
		} else if ( c < 0x20 ) {
			// 制御文字
			return 0;
		} else if ( re1.test( s ) ) {
			// プログラムに使う文字
			return 2;
		} else if ( c < 0x100 ) {
			// 半角文字
			return 3;
		} else {
			// 全角文字
			return 4;
		}
	}

	/**
	 * カーソル位置の単語を取得
	 * @param editor 対象とするエディタ
	 */
	export function getCursorWord(editor: vscode.TextEditor): string {
		// カーソル位置を取得
		let pos = editor.selection.active;
		// カーソル行を取得
		let line = editor.document.lineAt(pos.line).text;

		let s = pos.character;
		let t = Util.getCharType(line.charCodeAt(s));   // カーソル位置の文字タイプ
		while ( (s > 0) && (t == Util.getCharType(line.charCodeAt(s-1))) ) {
			-- s;
		}

		// 単語の終わりを探す
		let e = s;
		while ( (e < line.length) && (t == Util.getCharType(line.charCodeAt(e))) ) {
			++ e;
		}

		return line.substr(s,e -s);
	}

	/**
	 * 選択中の文字列を取得
	 * @param editor 対象とするエディタ
	 */
	export function getSelectString(editor: vscode.TextEditor): string {
        let range = editor.selection;
        let line = editor.document.lineAt(range.active.line).text;
		return line.substring(range.start.character, range.end.character);
	}

	/**
	 * ホームディレクトリを取得
	 */
//	let homeDir: string;	// キャッシュ
	export function getHomeDir(): string {
		// if ( !homeDir ) {
		// 	homeDir = ("" + chproc.execSync('echo $HOME')).trim();
		// }
		// return homeDir;
		return os.userInfo().homedir;
	}

	/**
	 * shell コマンドを実行
	 * @param cmd 
	 */
	export function execCmd(cmd: string): string {
		return ("" + chproc.execSync(cmd)).trim();
	}

	/**
	 * 指定uriをブラウザーで開く
	 * @param uri 開く uri
	 * @param query 追加の query
	 */
	export function browsURL(uri: string, query?: object) {
		if ( query ) {
			// queryが指定されているので整形
			let a: string[] = [];
			for ( let k in query ) {
				let v = encodeURIComponent(query[k]);
				a.push(`${k}=${v}` );
			}

			// uri にオプションの query を追加
			if ( uri.indexOf('?') < 0 ) {
				// uri に query を含まないので ? で始める
				uri += '?';
			} else {
				// uri に query を含むので & で始める
				uri += '&';
			}
			uri += a.join('&');
		}

		// Chromium を実行
        Util.execCmd(`chromium-browser '${uri}'`);
	}

	/**
	 * touchする
	 * @param fileName ファイル名
	 */
	export function touch(fileName: string ): void {
		execCmd(`touch ${fileName}`);
	}

	/**
	 * ファイルが存在するか調べる
	 * @param path 調べるファイルの名前
	 */
	export function isExistsFile(path: string): boolean {
		if ( !path ) {
			// ファイル名が指定されなかったときは「存在しない」を返す
			return false;
		}
		try {
			fs.accessSync( path );
		} catch ( e ) {
			// エラーが発生したので「存在しない」を返す
	//		console.log(`catch ${e}`);
			return false;
		}
		// 正常終了したので「存在する」を返す
		return true;
	}

	/**
	 * テキストファイルの読み込み
	 * @param fileName 読み込むファイル名
	 * @return string 読み込んだファイルの内容
	 */
	export function loadFile(fileName: string): string {
        console.log(`loadFile = "${fileName}"`);
        if ( !isExistsFile(fileName) ) {
            putMess( `${fileName} が見つかりませんでした。` );
            return null;
        }
        return fs.readFileSync(fileName, "utf-8");
    }

	/**
	 * 指定ファイルを開く
	 * ※ファイルが存在しないときは作成する
	 * @param fileName ファイル名
	 * @param create true:新規作成する
	 */
	export function openFile(fileName: string, create?: boolean): boolean {
		// すでに開いていればそれをアクティブに
		for ( let doc of vscode.workspace.textDocuments ) {
			let fn = doc.fileName;
			if ( doc.fileName == fileName ) {
				vscode.window.showTextDocument(doc);
				return true;
			}
		}

		if ( !isExistsFile(fileName) ) {
			// ファイルが存在しない
			if ( !create ) {
				// 新規構築しないが指定されている
				return false;
			}
			// 新規作成
			touch(fileName);
		}

		// 新たに開く
		vscode.workspace.openTextDocument(fileName).then((doc: vscode.TextDocument) => {
			return vscode.window.showTextDocument(doc);
		});

		// 上記は非同期処理なのでファイルが開く前に true が返る
		return true;
	}

	/**
	 * パスを正規化
	 * 1. 先頭の ~ を home ディレクトリに変更
	 * 2. 相対パスならばを絶対パスに変更
	 * ※この関数を使用する前に activate.homeDir を初期化して置かなければならない
	 * 
	 * @param name 正規化するパス名
	 */
	export function normalizePath(name: string): string {
		// ディレクトリ名が ~ で始まるときは環境変数 $HOME に置き換える
		if ( name.substr(0, 1) == '~' ) {
			name = path.join(getHomeDir(), name.substr(1));
		}

		// スキーマがなければ絶対パスに変換
		// ※ php://stdout 対策
		if ( name.indexOf('://') < 0 ) {
			name = path.resolve(name);
		}

		// 
		return name;
	};

}