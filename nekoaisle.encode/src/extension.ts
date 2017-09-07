/**
 * 選択範囲をエンコード
 * 
 * filename:  extension.ts
 * 
 * @package   
 * @version   1.0.0
 * @copyright Copyright (C) 2017 Yoshio Kiya All rights reserved.
 * @date      2017-08-23
 * @author    木屋善夫
 */
'use strict';
import * as vscode from 'vscode';
import { Util, Extension } from './nekoaisle.lib/nekoaisle';

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
 * 選択範囲をエンコード
 */
class MyExtention extends Extension {
	/**
	 * 構築
	 */
	constructor(context: vscode.ExtensionContext) {
		super(context, {
			name: '選択範囲をエンコード',
			config: 'encode',		// 通常はコマンドのサフィックス
			commands: [
				{
					// メニュー表示
					command: 'nekoaisle.encode',
					callback: () => {
						this.menu()
					}
				}, {
					// HTML エンコード
					command: 'nekoaisle.encodeHtml',
					callback: () => {
						this.encodeSelection('HTML');
					}
				}, {
					// URL エンコード
					command: 'nekoaisle.encodeUrl',
					callback: () => {
						this.encodeSelection('URL');
					}
				}, {
					// BASE64 エンコード
					command: 'nekoaisle.encodeBase64',
					callback: () => {
						this.encodeSelection('BASE64');
					}
				}, {
					// C言語文字列
					command: 'nekoaisle.encodeCString',
					callback: () => {
						this.encodeSelection('c-string');
					}
				}, {
					// 正規表現
					command: 'nekoaisle.encodePreg',
					callback: () => {
						this.encodeSelection('preg');
					}
				}, {
					// '' の中身
					command: 'nekoaisle.encodeContentsOfSingleQuotation',
					callback: () => {
						this.encodeSelection("'");
					}
				}, {
					// "" の中身
					command: 'nekoaisle.encodeContentsOfDoubleQuotation',
					callback: () => {
						this.encodeSelection("'");
					}
				}, {
					// HTML デコード
					command: 'nekoaisle.decodeHtml',
					callback: () => {
						this.decodeSelection('HTML');
					}
				}, {
					// URL デコード
					command: 'nekoaisle.decodeUrl',
					callback: () => {
						this.decodeSelection('URL');
					}
				}, {
					// BASE64 デコード
					command: 'nekoaisle.decodeBase64',
					callback: () => {
						this.decodeSelection('BASE64');
					}
				}, {
					// C言語文字列
					command: 'nekoaisle.decodeCString',
					callback: () => {
						this.decodeSelection('c-string');
					}
				}, {
					// 正規表現
					command: 'nekoaisle.decodePreg',
					callback: () => {
						this.decodeSelection('preg');
					}
				}, {
					// '' の中身
					command: 'nekoaisle.decodeContentsOfSingleQuotation',
					callback: () => {
						this.decodeSelection("'");
					}
				}, {
					// "" の中身
					command: 'nekoaisle.decodeContentsOfDoubleQuotation',
					callback: () => {
						this.decodeSelection("'");
					}
				}, {
					// '' 括り
					command: 'nekoaisle.encloseInSingleQuotation',
					callback: () => {
						this.enclose("'", "'");
					}
				}, {
					// "" 括り
					command: 'nekoaisle.encloseInDoubleQuotation',
					callback: () => {
						this.enclose('"', '"');
					}
				}, {
					// `` 括り
					command: 'nekoaisle.encloseInGraveAccent',
					callback: () => {
						this.enclose('\u0060', '\u0060');
					}
				}
			]
		});
	}

	/**
	 * メニューから選択して実行
	 */
	public menu() {
		let menu: vscode.QuickPickItem[] = [
			{ label: 'HTML', description: '特殊文字を HTML エンティティに変換する' },
			{ label: 'URL', description: '文字列を URL エンコードする' },
			{ label: 'BASE64', description: 'MIME base64 方式でデータをエンコードする' },
			{ label: 'c-string', description: 'C 言語と同様にスラッシュで文字列をクォートする' },
			{ label: 'preg', description: '正規表現文字をクオートする' },
			{ label: "'", description: "' を \\' にする" },
			{ label: '"', description: '" を \\" にする' },
			{ label: '<br>', description: '\\n を <br /> にする' },

			{ label: "''", description: '\' で単語または選択範囲を括る/外す' },
			{ label: '""', description: '" で単語または選択範囲を括る/外す' },
			{ label: '``', description: '\u0060 で単語または選択範囲を括る/外す' },
			{ label: '()', description: '() で単語または選択範囲を括る/外す' },
			{ label: '[]', description: '[] で単語または選択範囲を括る/外す' },
			{ label: '<>', description: '<> で単語または選択範囲を括る/外す' },
			{ label: '{}', description: '{} で単語または選択範囲を括る/外す' },
			{ label: '{{}}', description: '{{}} で単語または選択範囲を括る/外す' },
			{ label: '/**/', description: '/**/ で単語または選択範囲を括る/外す' },
			{ label: '<!-- -->', description: 'HTML コメント/外す' },
			{ label: '<div class="">', description: '<div class=""></div> で単語または選択範囲を括る/外す' },

			{ label: 'HTML decode', description: 'HTML エンティティを適切な文字に変換する' },
			{ label: 'URL decode', description: 'URL エンコードされた文字列をデコードする' },
			{ label: 'BASE64 decode', description: 'MIME base64 方式によりエンコードされたデータをデコードする' },
			{ label: 'c-string decode', description: 'C 言語文字列をアンクォートする' },
			{ label: 'preg decode', description: '正規表現文字をアンクオートする' },
			{ label: "' decode", description: "\\' を ' にする" },
			{ label: '" decode', description: '\\" を " にする' },
			{ label: '<br> decode', description: '<br /> を \\n にする' },
		];
		// ファイルを選択
		let popt = {
			placeHolder: 'エンコードの種類を選択してください。',
		};
		vscode.window.showQuickPick(menu, popt)
			.then((sel: vscode.QuickPickItem) => {
				switch (sel.label) {
					case "''": this.enclose("'", "'"); return;
					case '""': this.enclose('"', '"'); return;
					case '``': this.enclose('`', '`'); return;
					case '()': this.enclose('(', ')'); return;
					case '[]': this.enclose('[', ']'); return;
					case '{}': this.enclose('{', '}'); return;
					case '<>': this.enclose('<', '>'); return;
					case '{{}}': this.enclose('{{', '}}'); return;
					case '/**/': this.enclose('/*', '*/'); return;
					case '<!-- -->': this.enclose('<!-- ', ' -->'); return;
					case '<div class="">': this.enclose('<div class="">\n', '\n</div>'); return;
				}

				let cmd = sel.label.split(' ');
				switch (cmd[1]) {
					case '':
					default:
					case 'encode': {
						this.encodeSelection(cmd[0]);
						break;
					}
					case 'decode': {
						this.decodeSelection(cmd[0]);
						break;
					}
				}
			});
	}

	protected encodeJob(sel: string) {
	}

	protected encodeSelection(type: string): void {
		// 選択範囲の文字列を取得
		let editor = vscode.window.activeTextEditor;
		let s = Util.getSelectString(editor);

		// 変換
		switch (type) {
			// HTML encode
			case 'HTML': s = Util.encodeHtml(s); break;
			// URL encode
			case 'URL': s = encodeURIComponent(s); break;
			// BASE64
			case 'BASE64': s = new Buffer(s).toString('base64'); break;
			// C言語文字列
			case 'c-string': s = this.encodeCString(s); break;;
			// 正規表現
			case 'preg': s = this.encodePreg(s); break;
			// ""囲み文字列
			case '"':
				s = s.replace(/\\/g, '\\\\');
				s = s.replace(/"/g, '\\"');
				break;
			// ''囲み文字列
			case "'":
				s = s.replace(/\\/g, '\\\\');
				s = s.replace(/'/g, "\\'");
				break;
			// ``囲み文字列
			case "\u0060":
				s = s.replace(/\u0060/g, "\\u0060");
				break;
			// \n -> <br />
			case '<br>': {
				s = s.replace(/(<br(\s*\/)?>)?(\r?\n)/gi, '<br />\n');
				break;
			}
		}

		// 結果に置換
		editor.edit(edit => edit.replace(editor.selection, s));
	}

	protected decodeSelection(type: string): void {
		// 選択範囲の文字列を取得
		let editor = vscode.window.activeTextEditor;
		let s = Util.getSelectString(editor);

		// 変換
		switch (type) {
			// HTML encode
			case 'HTML': s = Util.decodeHtml(s); break;
			// URL encode
			case 'URL': s = decodeURIComponent(s); break;
			// BASE64
			case 'BASE64': s = new Buffer(s, 'base64').toString(); break;
			// C言語文字列
			case 'c-string': s = this.decodeCString(s); break;
			// 正規表現
			case 'preg': s = this.decodePreg(s); break;
			// ""囲み文字列
			case '"': {
				s = s.replace(/\\"/g, '"');
				s = s.replace(/\\\\"/g, '\\');
				break;
			}
			// ''囲み文字列
			case "'": {
				s = s.replace(/\\'/g, "'");
				s = s.replace(/\\\\"/g, '\\');
				break;
			}
			// ``囲み文字列
			case "\\u0060": {
				s = s.replace(/\\u0060/g, "\u0060");
				break;
			}
			// \n -> <br />
			case '<br>': {
				s = s.replace(/(<br(\s*\/)?>)(\r?\n)?/gi, '\n');
				break;
			}
		}
		// 結果に置換
		editor.edit(edit => edit.replace(editor.selection, s));
	}

	/**
	 * C言語用文字列にエンコード
	 * @param s エンコードする文字列
	 */
	public encodeCString(s: string): string {
		return s.replace(/[\\\x00-\x1f]|/g, (s: string): string => {
			const tbl = {
				0x00: '\\0',		// @ NULL
				0x07: '\\a',		// G BELL 警告音
				0x08: '\\b',		// H BS   後退
				0x09: '\\t',		// I HT   水平タブ
				0x0a: '\\n',		// J LF   改行
				0x0b: '\\v',		// K VT   垂直タブ
				0x0c: '\\f',		// L FF   改ページ
				0x0d: '\\r',		// M CR   復帰
				'\\': '\\\\'		// \
			};
			let c = s.charCodeAt(0);
			if (tbl[c]) {
				// 制御コード
				s = tbl[c];
			}
			return s;
		});
	}

	/**
	 * C言語用文字列をデコードする
	 * @param s デコードする文字列
	 */
	protected decodeCString(s: string): string {
		return s.replace(/\\(?:([0-7]+)|x([0-9a-fA-F]+)|(.))/g, (s: string, p1: string, p2: string, p3: string): string => {
			if (p1) {
				// ８進数
				s = String.fromCharCode(parseInt(p1, 8));
			} else if (p2) {
				// １６進数
				s = String.fromCharCode(parseInt(p2, 16));
			} else if (p3) {
				// \に続く１文字
				const tbl = {
					'a': '\x07',		// G BELL 警告音
					'b': '\x08',		// H BS   後退
					't': '\x09',		// I HT   水平タブ
					'n': '\x0a',		// J LF   改行
					'v': '\x0b',		// K VT   垂直タブ
					'f': '\x0c',		// L FF   改ページ
					'r': '\x0d',		// M CR   復帰
				};
				if (tbl[p3]) {
					s = tbl[p3];
				} else {
					s = p3;
				}
			}
			return s;
		});
	}

	/**
	 * 正規表現構文の特殊文字の前にバックスラッシュを挿入します。
	 * @param s エンコードする文字列
	 */
	protected encodePreg(s: string): string {
		let r = '';
		for (let i = 0; i < s.length; ++i) {
			let c = s.substr(i, 1);
			if ('.\\+*?[^]$(){}=!<>|:-/'.indexOf(c) >= 0) {
				c = '\\' + c;
			}
			r += c;
		}
		return r;
	}

	/**
	 * 正規表現構文のエスケープシーケンスのバックスラッシュを取り除きます
	 * @param s デコードする文字列
	 */
	protected decodePreg(s: string): string {
		return s.replace(/\\(.)/g, (s: string, p1: string): string => {
			return p1;
		});
	}

	/**
	 * 選択範囲もしくはカーソル位置の単語を指定文字で括る
	 * @param start 開始文字
	 * @param end 終了文字
	 */
	// protected encloseAll(start: string, end: string) {
	// 	// カーソル位置の単語の範囲を取得
	// 	let editor = vscode.window.activeTextEditor;
	// 	let sels = editor.selections;
	// 	let newSels: vscode.Selection[];
	// 	for (let key in sels) {
	// 		let sels = this.enclose(start, end);
	// 		newSels.push(sels);
	// 	}
	// 	editor.selections = newSels;
	// }

	protected enclose(start: string, end: string): /*vscode.Selection*/void {
		// カーソル位置の単語の範囲を取得
		let editor = vscode.window.activeTextEditor;
		let sel = editor.selection;
		let range: vscode.Range;
		let newSel: vscode.Selection;
		if (sel.start.isEqual(sel.end)) {
			// 範囲選択されていないのでカーソル位置の単語の範囲を取得
			range = Util.getCursorWordRange(editor, sel.active);
		} else {
			// 範囲選択されているのでその範囲を対象とする
			range = new vscode.Range(sel.start, sel.end);
		}

		// 対象となる文字列取得
		let word = editor.document.getText(range);

		// まずはこの文字列がすでに括られているかチェック
		if ((word.substr(0, start.length) == start) && (word.substr(-end.length) == end)) {
			// 括られているので外す
			word = word.substr(start.length, word.length - (start.length + end.length));
			editor.edit(edit => edit.replace(range, word));
		} else {
			// 括られた中身だけを選択している場合の対応
			// １文字ずつ前後に広げる
			let outRange: vscode.Range;
			try {
				outRange = new vscode.Range(range.start.translate(0, -start.length), range.end.translate(0, end.length));
				let outWord = editor.document.getText(outRange);
				if ((outWord.substr(0, start.length) == start) && (outWord.substr(-end.length) == end)) {
					// すでに括られているの外す
					editor.edit(edit => edit.replace(outRange, word));
					//				newSel = new vscode.Selection(outRange.start, outRange.end);
				} else {
					// 括られていないので括る
					editor.edit(edit => edit.replace(range, `${start}${word}${end}`));
				}
			} catch (err) {
				// 範囲を広げられなかったということは括られていない
				// 括られていないので括る
				editor.edit(edit => edit.replace(range, `${start}${word}${end}`));
			}
		}

		return;
	}
}
