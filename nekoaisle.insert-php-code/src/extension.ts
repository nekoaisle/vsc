'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
//var ncp = require("copy-paste");
/**
 * 起動エントリ 
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('Start InsertPhpCode.');
    const extentionKey = "insertPhpCode";
    const config = vscode.workspace.getConfiguration(extentionKey);
    //config.get('format', "");

    // settings.json よりテンプレートディレクトリを取得
    let tempDir = config.get("tempDir", `${os.userInfo().homedir}/Dropbox/documents/vsc`);
    // 先頭の ~ を置換
    if ( tempDir.substr(0,1) == "~" ) {
        tempDir = os.userInfo().homedir + tempDir.substr(1);
    }
    // settings.json より編集者名を取得
    let author = config.get("author", "");

    /**
     * メッセージを出力
     * @param str 出力するメッセージ
     */
    let putMess = (str: string) : void => {
        vscode.window.showInformationMessage( str );
    }

    // 指定文字でパディング
    let pad = (str: string, pad: string, cols: number): string => {
        pad = pad.repeat(cols);
        return (pad + str).slice(-cols);
    }
    let padNum = (num: number, cols: number): string => {
        return pad( num.toString(), "0", cols);
    }

    /**
     * ファイルが存在するか調べる
     * @param path 調べるファイルの名前
     */
    let isExistsFile = (path: string): boolean => {
        if ( !path ) {
            // ファイル名が指定されなかったときは「存在しない」を返す
            return false;
        }
        try {
            fs.accessSync( path );
        } catch ( e ) {
            // エラーが発生したので「存在しない」を返す
            console.log(`catch ${e}`);
            return false;
        }
        // 正常終了したので「存在する」を返す
        return true;
    }

    let loadFile = (fileName: string): string => {
        console.log(`loadFile = "${fileName}"`);
        if ( !isExistsFile(fileName) ) {
            putMess( `${fileName} が見つかりませんでした。` );
            return null;
        }
        return fs.readFileSync(fileName, "utf-8");
    }

    /**
     * パス情報クラス
     */
    class PathInfo {
        public path: string;   // 引数で与えられたファイル名
        public dir : string;   // ディレクトリ名(末尾に/はつきません)
        public base: string;   // ファイル名
        public name: string;   // 名前(拡張子を除くファイル名)
        public ext : string;   // 拡張子 ※先頭に . はつきません

        public constructor(fileName: string) {
            let pinfo = path.parse(fileName);
            this.path = fileName;
            this.dir  = pinfo.dir;
            this.base = pinfo.base;
            this.name = pinfo.name;
            this.ext  = pinfo.ext.substr(1)   // 先頭の.を除去
        }
    };

    /**
     * 日時情報クラス
     */
    class DateInfo {
        public year  : string;     // 年 "YYYY"
        public month : string;     // 月 "MM"
        public date  : string;     // 日 "DD"
        public hour  : string;     // 時 "HH"
        public min   : string;     // 分 "II"
        public sec   : string;     // 秒 "SS"
        public ymd   : string;     // 日付 "YYYY-MM-DD"
        public his   : string;     // 時刻 "HH:II:SS"
        public ymdhis: string;     // 日時 "YYYY-MM-DD HH:II:SS"

        public constructor (date: Date) {
            this.year  = padNum(date.getFullYear(), 4);
            this.month = padNum(date.getMonth()   , 2);
            this.date  = padNum(date.getDate()    , 2);
            this.hour  = padNum(date.getHours()   , 2);
            this.min   = padNum(date.getMinutes() , 2);
            this.sec   = padNum(date.getSeconds() , 2);

            this.ymd    = `${this.year}-${this.month}-${this.date}`;
            this.his    = `${this.hour}-${this.min}-${this.sec}`;
            this.ymdhis = `${this.ymd} ${this.his}`;
        }
    };

    let editor: vscode.TextEditor;  // 実行されたときの TextEditor
    let pinfo: PathInfo;            // 実行されたファイルのパス情報
    let now: DateInfo;              // 実行されたときの日時情報
    /**
     * 実行部分
     */
    let insertPhpCode = () => {
        editor = vscode.window.activeTextEditor;
        let lang = editor.document.languageId;
        console.log(`languageId = "${lang}"`);
        pinfo  = new PathInfo(editor.document.fileName);
        now    = new DateInfo(new Date);

        let menuTSV = loadFile(`${tempDir}/list-${pinfo.ext}.tsv`);
//        console.log(menuTSV);
        let rows = menuTSV.split("\n");
//        console.log(rows);
        let menu: string[] = [];
        let cmds = {};
        for ( let row of rows ) {
            let cols = row.split("\t");
//            console.log(cols);
            menu.push( cols[0] );
            cmds[cols[0]] = cols[1];
        }
        console.log(menu);

        let options: vscode.QuickPickOptions = {
            placeHolder: '選択してください。'
        };
        vscode.window.showQuickPick( menu, options ).then((sel: string) => {
            console.log(`command = "${sel}"`);
            if ( !sel ) {
                return;
            }

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
                    str = pinfo.dir;
                    break;

                // ファイル名+拡張子
                case "@pinfo.base":
                    str = pinfo.base;
                    break;
                
                // ファイル名
                case "@pinfo.name":
                    str = pinfo.name;
                    break;
                
                // 拡張子
                case "@pinfo.ext":
                    str = pinfo.ext;
                    break;
                
                // コマンド以外ならテンプレート
                default:
                    str = fromTemplate(editor, `${tempDir}/${cmds[sel]}`);
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
    let fromTemplate = (editor: vscode.TextEditor, tempName: string): string => {
        // テンプレートの読み込み
        let tempText = loadFile(tempName);

        // 変換データを準備
        // テンプレート中に ${} を書くバージョン
        // このバージョンではエラーがあると一切変換されない…
    //    return Function(`return \`${tempText}\``).toString();

        // 置換情報を作成
        let rep = {
            "author"    : author,
            "pinfo.path": pinfo.path,
            "pinfo.dir" : pinfo.dir,
            "pinfo.base": pinfo.base,
            "pinfo.name": pinfo.name,
            "pinfo.ext" : pinfo.ext,
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

    // コマンドの登録
    let disposable = vscode.commands.registerCommand('extension.insertPhpCode', insertPhpCode );
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}