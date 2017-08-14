'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {Util, Extention, PathInfo, DateInfo} from './nekoaisle.lib/nekoaisle';

export function activate(context: vscode.ExtensionContext) {
    let extention = new InsertPhpCode();
    let disp = vscode.commands.registerCommand(extention.command, () => {
        extention.entry();
    });

    context.subscriptions.push(disp);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

class InsertPhpCode extends Extention {
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
	constructor() {
		super('Insert Code', 'nekoaisle.insertCode');
	}

	/**
	 * エントリー
	 */
	public entry() {
        // 実行されたときの TextEditor
        let editor = vscode.window.activeTextEditor;

        // 実行されたときの日時情報
        let now = new DateInfo();

        // settings.json より編集者名を取得
        let author = this.getConfig("author", "");

       // デフォルトのテンポラリディレクトリ名
        let tempDir = `${Util.getHomeDir()}/Dropbox/documents/vsc`;

        // settings.json よりテンプレートディレクトリを取得
        tempDir = this.getConfig("tempDir", tempDir);

        // 先頭の ~ を置換
        tempDir = Util.normalizePath(tempDir);

        // ファイル名情報
        let pinfo  = new PathInfo(editor.document.fileName);
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
        let cmds = {};              // メニューアイテムに対応するコマンド辞書
        for ( let row of rows ) {
            let cols = row.split("\t");
//            console.log(cols);
            menu.push( cols[0] );
            cmds[cols[0]] = cols[1];
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

            // コマンドごとの処理
            let str = '';
            switch ( cmds[sel] ) {
                // 日付
                case "@now.ymd":
                    str = `${now.year}-${now.month}-${now.date}`; 
                    break;
                
                // フルパス名
                case "@pinfo.path":
                    str = editor.document.fileName;
                    break;

                // ディレクトリ名
                case "@pinfo.dir":
                    str = pinfo.info.dir;
                    break;

                // ファイル名+拡張子
                case "@pinfo.base":
                    str = pinfo.info.base;
                    break;
                
                // ファイル名
                case "@pinfo.name":
                    str = pinfo.info.name;
                    break;
                
                // 拡張子
                case "@pinfo.ext":
                    str = pinfo.info.ext;
                    break;
                
                // コマンド以外ならテンプレート
                default:
                    // テンプレートのファイル名
                    let fn = `${tempDir}/${cmds[sel]}`;
                    str = this.fromTemplate(editor, fn, author, pinfo, now);
                    break;
            }

            // 現在のカーソル位置に挿入
            if ( str ) {
                console.log(`insert\n${str}`);
                editor.edit(edit => edit.insert(editor.selection.start, str));
            }
        });
    }

    /**
     * テンプレートから挿入する段落を作成
     * @param editor 
     * @param tempName 
     */
    protected fromTemplate(editor: vscode.TextEditor, tempName: string, author: string, pinfo: PathInfo, now: DateInfo): string {
        // テンプレートの読み込み
        let tempText = Util.loadFile(tempName);

        // 変換データを準備
        // テンプレート中に ${} を書くバージョン
        // このバージョンではエラーがあると一切変換されない…
    //    return Function(`return \`${tempText}\``).toString();

        // 置換情報を作成
        let rep = {
            "author"    : author,
            "pinfo.path": pinfo.path,
            "pinfo.dir" : pinfo.info.dir,
            "pinfo.base": pinfo.info.base,
            "pinfo.name": pinfo.info.name,
            "pinfo.ext" : pinfo.info.ext,
            "now.year"  : now.year,
            "now.month" : now.month,
            "now.date"  : now.date,
            "now.hour"  : now.hour,
            "now.min"   : now.min,
            "now.sec"   : now.sec,
        };    

        for ( let s in rep ) {
            let re = new RegExp( `{{${s}}}`, "g" );
            tempText = tempText.replace( re, rep[s] );
        };

        return tempText;
    }
}