import * as vscode from 'vscode';
import * as chproc from 'child_process';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import {Extension} from './Extension';


export module Util {
	export function getExtensionPath(filename: string) {
		return path.resolve(exports.extensionContext.extensionPath, filename);
	}

	/**
	 * メッセージを出力
	 * @param str 出力するメッセージ
	 */
	export function putMess(str: string): string {
		for ( let s of str.split('\n') ) {
			vscode.window.showInformationMessage(s);
		}
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
		let s: string = String.fromCharCode(c);
		if ( (c == 0x20) || (c==9) ) {
			// 空白
			return 1;
		} else if ( c < 0x20 ) {
			// 制御文字
			return 0;
		} else if ( /^[a-zA-Z0-9_\$@]$/.test( s ) ) {
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
	 * HTMLエンコード
	 * @param s エンコードする文字列
	 * @return string エンコードした文字列
	 */
	export function encodeHtml(s: string): string {
		return s.replace(/[&'`"<>\s]/g, function(match) {
			return {
			  '&': '&amp;',
			  "'": '&#x27;',
			  '`': '&#x60;',
			  '"': '&quot;',
			  '<': '&lt;',
			  '>': '&gt;',
			  ' ': '&nbsp;',
			  '\r\n': '<br />\r\n',
			  '\r': '<br />\r',
			  '\n': '<br />\n',
			}[match];
		});
	}

	export function decodeHtml(s: string): string {
		return s.replace(/&lt;/g, '<') 
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#039;/g, '\'')
		.replace(/&#044;/g, ',')
		.replace(/&amp;/g, '&')
		.replace(/&nbsp;/g, ' ')
		.replace(/<br(\s*\/)?>(\r\n)?/g, '\r\n')
	}

	/**
	 * カーソル位置の単語の範囲を取得
	 * @param editor 対象とするエディタ
	 */
	export function getCursorWordRange(editor?: vscode.TextEditor, pos?: vscode.Position): vscode.Range {
		if (!editor) {
			// 省略されたら現在のエディタ
			editor = vscode.window.activeTextEditor;
		}

		if (!pos) {
			// 省略されたらカーソル位置を取得
			pos = editor.selection.active;
		}
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

		let start = new vscode.Position(pos.line, s);
		let end = new vscode.Position(pos.line, e);
		return new vscode.Range(start, end);
	}

	/**
	 * カーソル位置の単語を取得
	 * @param editor 対象とするエディタ
	 */
	export function getCursorWord(editor: vscode.TextEditor): string {
		// カーソル位置の単語の範囲を取得
		let range = getCursorWordRange(editor);
		// 単語の範囲の文字列を返す
		return editor.document.getText(range);
	}

	/**
	 * 指定文字の大文字・小文字を切り替える
	 * @param c 対象となる文字
	 * @return string 結果
	 */
	export function toggleCharCase(c: string): string {
		switch ( getCharCase(c) ) {
			case 'upper':
				c = c.toLocaleLowerCase();
				break;
			case 'lower':
				c = c.toLocaleUpperCase();
				break;
		}
		return c;
	}

	/**
	 * 指定文字の大文字・小文字を切り替える
	 * @param c 対象となる文字
	 * @return string 結果
	 */
	export function changeCharCase(c: string, mode?: string): string {
		let cas = getCharCase(c);
		if ( cas != '' ) {
			// 変換対象文字
			if ( (mode == 'togge') || (mode != cas) ) {
				// トグルは必ず、それ以外は現在と違う時変換
				if ( cas == 'lower' ) {
					// 小文字なので大文字に変換
					c = c.toLocaleUpperCase();
				} else {
					// 大文字なので小文字に変換
					c = c.toLocaleLowerCase();
				}
			}
		}
		return c;
    }

	/**
	 * 指定した文字列が大文字か小文字か調べる
	 * 文字列の先頭から順に調べ最初に判定できたケースを返す
	 * @param str 調べる文字列
	 * @return 'upper' | 'lower | ''
	 */
	export function getCharCase(str: string): string {
		for ( let i = 0; i < str.length; ++ i ) {
			// １文字抽出
			let c = str.substr(i, 1);
			if ( (c >= "A") && (c <= "Z") ) {
				// 半角アルファベット大文字
				return 'upper';
			} else if ( (c >= "a") && (c <= "z") ) {
				// 半角アルファベット小文字
				return 'lower';
			} else if ( (c >= "Ａ") && (c <= "Ｚ") ) {
				// 全角アルファベット大文字
				return 'upper';
			} else if ( (c >= "ａ") && (c <= "ｚ") ) {
				// 全角アルファベット小文字
				return 'lower';
			}
		}

		// 最後まで判定できなかった
		return '';
	}

	/**
	 * 選択中の文字列を取得
	 * @param editor 対象とするエディタ
	 */
	export function getSelectString(editor?: vscode.TextEditor): string {
		if (!editor) {
			// editor が省略されたので現在のエディタ
			editor = vscode.window.activeTextEditor;
		}

		let range = editor.selection;
		return editor.document.getText(range);
	}

	/**
	 * 指定ポジションの文字を取得
	 * @param editor 対象とするエディタ
	 */
	export function getCharFromPos(editor: vscode.TextEditor, pos: vscode.Position): string {
		let line = editor.document.lineAt(pos.line).text;
		return line.substr(pos.character, 1);
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
	 * create に true を指定するとファイルが存在しないときは作成する
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
	 * ~ で始まるときにホームディレクトリ名と置換
	 * @param name 
	 */
	export function normalizeHome(name: string): string {
		// ディレクトリ名が ~ で始まるときは環境変数 $HOME に置き換える
		if ( name.substr(0, 1) == '~' ) {
			name = path.join(getHomeDir(), name.substr(1));
		}
		return name;
	}

	/**
	 * パスを正規化
	 * 1. 先頭の ~ を home ディレクトリに変更
	 * 2. 相対パスならばを絶対パスに変更
	 * 
	 * @param name 正規化するパス名
	 * @param cwd? カレントディレクトリ
	 */
	export function normalizePath(name: string, cwd?: string): string {
		// スキーマがあれば何もしない
		// ※ php://stdout 対策
		if ( name.indexOf('://') >= 0 ) {
			return name;
		}

		// ~ で始まるときは環境変数 $HOME に置き換える
		name = normalizeHome(name);

		// 絶対パスに変換
		if ( !cwd ) {
			cwd = '.';
		}
		name = path.resolve(cwd, name);
		
		// 
		return name;
	};

}