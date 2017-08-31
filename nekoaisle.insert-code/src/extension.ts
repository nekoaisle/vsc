'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {Util, Extension, PathInfo, DateInfo} from './nekoaisle.lib/nekoaisle';

export function activate(context: vscode.ExtensionContext) {
    let ext = new InsertCode(context);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

class ListItem {
    public filename: string;    // ファイル名またはコマンド名
    public position: string;    // 挿入位置
    constructor(filename: string, position: string) {
        this.filename = filename;
        this.position = position;
    }
};

class InsertCode extends Extension {
    // 言語タイプごとの拡張子一覧
    //
    // console.log('enum languages');
    // vscode.languages.getLanguages().then((langs: string[]) => {
    //     langs.forEach( element => {
    //         console.log(`  ${element}`);
    //     });
    // });
    protected langs = {
        'plaintext':        '.txt',
        'Log':              '.log',
        'bat':              '.bat',
        'c':                '.c',
        'cpp':              '.cpp',
        'css':              '.css',
        'html':             '.html',
        'ini':              '.ini',
        'java':             '.java',
        'javascript':       '.js',
        'json':             '.json',
        'perl':             '.pl',
        'php':              '.php',
        'shellscript':      '.sh',
        'sql':              '.sql',
        'typescript':       '.ts',
        'vb':               '.vb',
        'xml':              '.xml',
    };

    /**
	 * 構築
	 */
	constructor(context: vscode.ExtensionContext) {
		super(context, {
            name: 'Insert Code',
            config: 'insertCode',
			commands: [
				{
					command: 'nekoaisle.insertCode',
					callback: () => {
						this.entry()
					}
				}
			]
		});
	}

	/**
	 * エントリー
	 */
	public entry() {
        // 実行されたときの TextEditor
        let editor = vscode.window.activeTextEditor;

        let pinfo = new PathInfo(editor.document.fileName);
        let now = new DateInfo();

       // デフォルトのテンポラリディレクトリ名
        let tempDir = `${Util.getHomeDir()}/Dropbox/documents/vsc`;

        // settings.json よりテンプレートディレクトリを取得
        tempDir = this.getConfig("tempDir", tempDir);

        // 先頭の ~ を置換
        tempDir = Util.normalizePath(tempDir);

        let ext = pinfo.info.ext;
        if ( !ext ) {
            // 拡張子がないときはこのドキュメントの言語から拡張子を決める
            let lang = editor.document.languageId;
            ext = this.langs[lang];
            console.log(`languageId = "${lang}", file.ext = "${ext}"`);
        }
        // 先頭の . を除去
        ext = ext.substr(1);

        // この拡張子のメニューを読み込む
        let menuTSV = Util.loadFile(`${tempDir}/list-${pinfo.info.ext.substr(1)}.tsv`);
//        console.log(menuTSV);
        let rows = menuTSV.split("\n");
//        console.log(rows);

        // TSV ファイルを分解して QuickPickOptions 用のメニューと
        // メニューアイテムに対応するコマンド辞書を作成
        let menu: string[] = [];    // QuickPickOptions 用のメニュー
        let dic: ListItem[] = [];              // メニューアイテムに対応するコマンド辞書
        for ( let row of rows ) {
            let cols = row.split("\t");
//            console.log(cols);
            menu.push( cols[0] );
            dic[cols[0]] = new ListItem(cols[1], cols[2]);
        }
//        console.log(menu);

        // メニュー選択
        let options: vscode.QuickPickOptions = {
            placeHolder: '選択してください。'
        };
        vscode.window.showQuickPick( menu, options ).then((sel: string) => {
            console.log(`command = "${sel}"`);
            if ( !sel ) {
                return;
            }
            let cmd: ListItem = dic[sel];

            // コマンドごとの処理
            let str = '';
            switch (cmd.filename.substr(0, 1)) {
                // 内部変数
                case '@': {
                    switch (cmd.filename) {
                        // 日付
                        case "@now.ymd":    str = `${now.year}-${now.month}-${now.date}`; break;
                        // フルパス名
                        case "@pinfo.path": str = pinfo.path; break;
                        // ディレクトリ名
                        case "@pinfo.dir":  str = pinfo.info.dir; break;
                        // ファイル名+拡張子
                        case "@pinfo.base": str = pinfo.info.base; break;
                        // ファイル名
                        case "@pinfo.name": str = pinfo.info.name; break;
                        // 拡張子
                        case "@pinfo.ext":  str = pinfo.info.ext; break;
                        // ベースクラス
                        case '@class.base': str = this.getClass('base'); break;
                    }
                    break;
                }
                
                // インラインテンプレート
                case '#': {
                    str = this.fromTemplate(cmd.filename.substr(1), editor);
                    break;
                }
                
                // コマンド以外ならテンプレート
                default: {
                    // テンプレートの読み込み
                    let template = Util.loadFile(`${tempDir}/${cmd.filename}`);
                    str = this.fromTemplate(template, editor);
                    break;
                }
            }

            // 現在のカーソル位置に挿入
            if ( str ) {
                let pos = editor.selection.active;
                switch ( cmd.position ) {
                    // ファイルの先頭
                    case 'top':
                    case 'file-start':
                    case 'file-top':
                        pos = new vscode.Position(0, 0); 
                        break;

                    // ファイルの先頭
                    case 'bottom':
                    case 'file-end':
                    case 'file-bottom':
                        pos = new vscode.Position(0, 0); 
                        break;

                    // 行頭
                    case 'home':
                    case 'line-start':
                    case 'line-top':
                        pos = new vscode.Position(pos.line, 0); 
                        break;

                    // 行末
                    case 'end':
                    case 'line-end':
                    case 'line-bottom':
                        pos = new vscode.Position(pos.line, editor.document.lineAt(pos.line).text.length);
                        break;

                    // 前の行
                    case 'before':
                        pos = new vscode.Position(pos.line, 0);
                        if (str.substr(-1) != "\n") {
                            str += "\n";
                        }
                        break;

                    // 次の行
                    case 'new':
                    case 'line-new':
                    case 'new-line':
                        pos = new vscode.Position(pos.line + 1, 0);
                        if (str.substr(-1) != "\n") {
                            str += "\n";
                        }
                        break;
                }

                // console.log(`insert\n${str}`);
                editor.edit(edit => edit.insert(pos, str));
            }
        });
    }

    /**
     * テンプレートから挿入する段落を作成
     * @param editor 
     * @param tempName 
     */
    protected fromTemplate(template: string, editor: vscode.TextEditor): string {
        // テンプレート中で使用されているキーワードを抽出
        // 置換する値を準備する
        // '' や "" で括られている場合はエスケープ処理もする
        let params = this.makeParams(template, editor);

        // 置換を実行
        template = this.replaceKeywords(template, params);

        // 複数行ならばインデントをカーソル位置に合わせる
        if ( template.indexOf("\n") >= 0 ) {
            // カーソル位置を取得
            let cur = editor.selection.active;
            // カーソルの前を取得
            let tab = editor.document.lineAt(cur.line).text.substr(0,cur.character);
            // カーソルの前がホワとスペースのみならば
            if ( /\s+/.test(tab) ) {
                // 改行で分解
                let rows = template.split("\n");
                // 行を合成
                template = rows.join(`\n${tab}`);
            }
        }

        // 
        return template;
    }

    /**
     * 置換用パラメータを作成
     * @param template テンプレート
     * @param editor 
     */
    protected makeParams(template: string, editor: vscode.TextEditor): object {
        // テンプレート中で使用されているキーワードを抽出
        // 置換する値を準備する
        // '' や "" で括られている場合はエスケープ処理もする
        let params = new Object();
        let re = /({{(.*?)}})|('{{(.*?)}}')|("{{(.*?)}}")/g;
        let match;
        while ((match = re.exec(template)) !== null) {
            // match には 2,4,6のいずれかにキーワードが入っている
            let key;
            for (let i = 2; i < match.length; i += 2) {
                if (match[i]) {
                    key = match[i];
                    break;
                }
            }
            // . で分解して最初の単語を取得
            key = key.split('.')[0];
            let val;
            switch (key) {
                case 'author':      val = this.getConfig("author", ""); break;
                case 'pinfo':       val = new PathInfo(editor.document.fileName); break;
                case 'now':         val = new DateInfo(); break;
                case 'selection':   val = Util.getSelectString(editor); break;
                case 'clipboard':   val = Util.execCmd('xclip -o -selection c'); break;
                case 'class':       val = { base: this.getClass('base') }; break;
            }

            if (match[1]) {
                // クオーツなし
                key = match[1];
            } else if (match[3]) {
                // シングルクオーツ付き
                val = val.replace(/\\/g, "\\\\");
                val = val.replace(/'/g, "\\'");
                val = `'${val}'`;
                key = match[3];
            } else if (match[5]) {
                // ダブルクオーツ付き
                val = val.replace(/\\/g, "\\\\");
                val = val.replace(/"/g, '\\"');
                val = `"${val}"`;
                key = match[5];
            }

            // 
            params[key] = val;
        }

        // ※ '' や "" で括られているキーと括られていないキーの同時使用備え
        // キーの長い順に並べ替え
        params = this.sortKeyLength(params);

        //
        return params;
    }

    /**
     * 要素名で検索して値で置換
     * @param str 対象文字列
     * @param params 検索値
     * @param prefix 検索文字列のプレフィックス
     * @return 置換完了後の文字列
     */
    protected replaceKeywords(str: string, params: object, prefix?: string): string {
        for (let k in params) {
            let search = (prefix) ? `${prefix}.${k}` : k;
            if (typeof params[k] == 'object' ) {
                str = this.replaceKeywords(str, params[k], search);
            } else {
                let re = new RegExp( search, "g" );
                str = str.replace( re, params[k] );
            }
        }
        return str;
    }

    // キーの長い順に並べ替え
    protected sortKeyLength(target: object): object {
        // キーの抽出
        let keys = [];
        for (let k in target) {
            keys.push(k);
        }

        // キーの長さでソート
        keys.sort((a: any, b: any): number => {
            return b.length - a.length;
        });

        // 長い順に並べ替えたオブジェクトを再作成
        let sorted = new Object();
        for (let k of keys) {
            sorted[k] = target[k];
        }

        return sorted;
    }
 
    /**
     * クラス情報を返す
     * @param propaty サブキー
     */
    protected getClass(propaty: string): string {
        let ret: string;
        switch (propaty) {
            case 'base': {
                let editor = vscode.window.activeTextEditor;
                let pinfo = new PathInfo(editor.document.fileName);
                let name = pinfo.info.name;
                let c = name.substr(-1);
                if ((c >= '0') && (c <= '9')) {
                    name = name.substr(0, name.length-1);
                }
                ret = Util.toCamelCase(name) + 'Base';
                break;
            }
        }

        return ret;
    }
}