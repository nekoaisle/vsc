"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const chproc = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");
var Util;
(function (Util) {
    /**
     * メッセージを出力
     * @param str 出力するメッセージ
     */
    function putMess(str) {
        vscode.window.showInformationMessage(str);
        return str;
    }
    Util.putMess = putMess;
    /**
     * ログを出力
     * @param str 出力する文字列
     */
    function putLog(str) {
        console.log(str);
        return str;
    }
    Util.putLog = putLog;
    // 指定文字でパディング
    function pad(str, pad, cols) {
        pad = pad.repeat(cols);
        return (pad + str).slice(-cols);
    }
    Util.pad = pad;
    function padNum(num, cols) {
        return pad(num.toString(), "0", cols);
    }
    Util.padNum = padNum;
    /**
     * 指定文字コードの文字種を取得
     * @param c 調べる文字コード
     */
    function getCharType(c) {
        const re1 = /^[a-zA-z0-9_\$@]$/;
        let s = String.fromCharCode(c);
        if ((c == 0x20) || (c == 9)) {
            // 空白
            return 1;
        }
        else if (c < 0x20) {
            // 制御文字
            return 0;
        }
        else if (re1.test(s)) {
            // プログラムに使う文字
            return 2;
        }
        else if (c < 0x100) {
            // 半角文字
            return 3;
        }
        else {
            // 全角文字
            return 4;
        }
    }
    Util.getCharType = getCharType;
    /**
     * カーソル位置の単語を取得
     * @param editor 対象とするエディタ
     */
    function getCursorWord(editor) {
        // カーソル位置を取得
        let pos = editor.selection.active;
        // カーソル行を取得
        let line = editor.document.lineAt(pos.line).text;
        let s = pos.character;
        let t = Util.getCharType(line.charCodeAt(s)); // カーソル位置の文字タイプ
        while ((s > 0) && (t == Util.getCharType(line.charCodeAt(s - 1)))) {
            --s;
        }
        // 単語の終わりを探す
        let e = s;
        while ((e < line.length) && (t == Util.getCharType(line.charCodeAt(e)))) {
            ++e;
        }
        return line.substr(s, e - s);
    }
    Util.getCursorWord = getCursorWord;
    /**
     * 選択中の文字列を取得
     * @param editor 対象とするエディタ
     */
    function getSelectString(editor) {
        let range = editor.selection;
        let line = editor.document.lineAt(range.active.line).text;
        return line.substring(range.start.character, range.end.character);
    }
    Util.getSelectString = getSelectString;
    /**
     * ホームディレクトリを取得
     */
    //	let homeDir: string;	// キャッシュ
    function getHomeDir() {
        // if ( !homeDir ) {
        // 	homeDir = ("" + chproc.execSync('echo $HOME')).trim();
        // }
        // return homeDir;
        return os.userInfo().homedir;
    }
    Util.getHomeDir = getHomeDir;
    /**
     * shell コマンドを実行
     * @param cmd
     */
    function execCmd(cmd) {
        return ("" + chproc.execSync(cmd)).trim();
    }
    Util.execCmd = execCmd;
    /**
     * 指定uriをブラウザーで開く
     * @param uri 開く uri
     * @param query 追加の query
     */
    function browsURL(uri, query) {
        if (query) {
            // queryが指定されているので整形
            let a = [];
            for (let k in query) {
                let v = encodeURIComponent(query[k]);
                a.push(`${k}=${v}`);
            }
            // uri にオプションの query を追加
            if (uri.indexOf('?') < 0) {
                // uri に query を含まないので ? で始める
                uri += '?';
            }
            else {
                // uri に query を含むので & で始める
                uri += '&';
            }
            uri += a.join('&');
        }
        // Chromium を実行
        Util.execCmd(`chromium-browser '${uri}'`);
    }
    Util.browsURL = browsURL;
    /**
     * touchする
     * @param fileName ファイル名
     */
    function touch(fileName) {
        execCmd(`touch ${fileName}`);
    }
    Util.touch = touch;
    /**
     * ファイルが存在するか調べる
     * @param path 調べるファイルの名前
     */
    function isExistsFile(path) {
        if (!path) {
            // ファイル名が指定されなかったときは「存在しない」を返す
            return false;
        }
        try {
            fs.accessSync(path);
        }
        catch (e) {
            // エラーが発生したので「存在しない」を返す
            //		console.log(`catch ${e}`);
            return false;
        }
        // 正常終了したので「存在する」を返す
        return true;
    }
    Util.isExistsFile = isExistsFile;
    /**
     * テキストファイルの読み込み
     * @param fileName 読み込むファイル名
     * @return string 読み込んだファイルの内容
     */
    function loadFile(fileName) {
        console.log(`loadFile = "${fileName}"`);
        if (!isExistsFile(fileName)) {
            putMess(`${fileName} が見つかりませんでした。`);
            return null;
        }
        return fs.readFileSync(fileName, "utf-8");
    }
    Util.loadFile = loadFile;
    /**
     * 指定ファイルを開く
     * create に true を指定するとファイルが存在しないときは作成する
     * @param fileName ファイル名
     * @param create true:新規作成する
     */
    function openFile(fileName, create) {
        // すでに開いていればそれをアクティブに
        for (let doc of vscode.workspace.textDocuments) {
            let fn = doc.fileName;
            if (doc.fileName == fileName) {
                vscode.window.showTextDocument(doc);
                return true;
            }
        }
        if (!isExistsFile(fileName)) {
            // ファイルが存在しない
            if (!create) {
                // 新規構築しないが指定されている
                return false;
            }
            // 新規作成
            touch(fileName);
        }
        // 新たに開く
        vscode.workspace.openTextDocument(fileName).then((doc) => {
            return vscode.window.showTextDocument(doc);
        });
        // 上記は非同期処理なのでファイルが開く前に true が返る
        return true;
    }
    Util.openFile = openFile;
    /**
     * ~ で始まるときにホームディレクトリ名と置換
     * @param name
     */
    function normalizeHome(name) {
        // ディレクトリ名が ~ で始まるときは環境変数 $HOME に置き換える
        if (name.substr(0, 1) == '~') {
            name = path.join(getHomeDir(), name.substr(1));
        }
        return name;
    }
    Util.normalizeHome = normalizeHome;
    /**
     * パスを正規化
     * 1. 先頭の ~ を home ディレクトリに変更
     * 2. 相対パスならばを絶対パスに変更
     *
     * @param name 正規化するパス名
     * @param cwd? カレントディレクトリ
     */
    function normalizePath(name, cwd) {
        // スキーマがあれば何もしない
        // ※ php://stdout 対策
        if (name.indexOf('://') >= 0) {
            return name;
        }
        // ~ で始まるときは環境変数 $HOME に置き換える
        name = normalizeHome(name);
        // 絶対パスに変換
        if (!cwd) {
            cwd = '.';
        }
        name = path.resolve(cwd, name);
        // 
        return name;
    }
    Util.normalizePath = normalizePath;
    ;
})(Util = exports.Util || (exports.Util = {}));
//# sourceMappingURL=Util.js.map