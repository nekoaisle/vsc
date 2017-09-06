'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const nekoaisle_1 = require("./nekoaisle.lib/nekoaisle");
function activate(context) {
    let ext = new InsertCode(context);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
class InsertCode extends nekoaisle_1.Extension {
    /**
     * 構築
     */
    constructor(context) {
        super(context, {
            name: 'Insert Code',
            config: 'insertCode',
            commands: [
                {
                    command: 'nekoaisle.insertCode',
                    callback: () => {
                        this.entry();
                    }
                }
            ]
        });
        // 言語タイプごとの拡張子一覧
        //
        // console.log('enum languages');
        // vscode.languages.getLanguages().then((langs: string[]) => {
        //     langs.forEach( element => {
        //         console.log(`  ${element}`);
        //     });
        // });
        this.langs = {
            'plaintext': '.txt',
            'Log': '.log',
            'bat': '.bat',
            'c': '.c',
            'cpp': '.cpp',
            'css': '.css',
            'html': '.html',
            'ini': '.ini',
            'java': '.java',
            'javascript': '.js',
            'json': '.json',
            'perl': '.pl',
            'php': '.php',
            'shellscript': '.sh',
            'sql': '.sql',
            'typescript': '.ts',
            'vb': '.vb',
            'xml': '.xml',
        };
    }
    /**
     * エントリー
     */
    entry() {
        // 実行されたときの TextEditor
        let editor = vscode.window.activeTextEditor;
        let pinfo = new nekoaisle_1.PathInfo(editor.document.fileName);
        // テンプレートディレクトリ名を取得
        let tempDir = this.getTemplatesDir();
        // 現在編集中のファイルの拡張子を取得
        // ※新規作成の場合ファイル名が [Untitled-1] などになり拡張子がないので
        let ext = this.getCurrentExt(pinfo.info.ext);
        // 先頭の . を除去
        ext = ext.substr(1);
        // この拡張子のメニューを読み込む
        let menuFN = `${tempDir}/list-${pinfo.info.ext.substr(1)}.json`;
        let menuJson = nekoaisle_1.Util.loadFile(menuFN);
        let menuItems;
        try {
            menuItems = JSON.parse(menuJson);
        }
        catch (err) {
            nekoaisle_1.Util.putMess(`${menuFN}: ${err}`);
            return;
        }
        // QuickPickOptions 用のメニューを作成
        let menu = [];
        for (let key in menuItems) {
            let item = menuItems[key];
            menu.push({
                label: (item.label) ? item.label : key,
                detail: (item.detail) ? item.detail : '',
                description: (item.description) ? item.description : ''
            });
        }
        // メニュー選択
        let options = {
            placeHolder: '選択してください。',
            matchOnDetail: true,
            matchOnDescription: false
        };
        vscode.window.showQuickPick(menu, options).then((sel) => {
            console.log(`command = "${sel.label}"`);
            if (!sel) {
                return;
            }
            // デフォルト値
            let item = {
                label: '',
                detail: '',
                description: '',
                filename: '',
                command: '',
                inline: '',
                position: '',
                method: 'insert',
            };
            for (let key in menuItems) {
                let i = menuItems[key];
                if (i.label == sel.label) {
                    // 見つけたので undefined 以外の要素を複写
                    for (let k in item) {
                        if (typeof i[k] != undefined) {
                            item[k] = i[k];
                        }
                    }
                }
            }
            // 挿入する文字列格納用変数
            let str = '';
            // タイプ別処理
            if (item.filename) {
                // テンプレートファイル名指定
                str = this.doFile(`${tempDir}/${item.filename}`, editor);
            }
            else if (item.inline) {
                // インラインテンプレート
                str = this.doInline(item.inline, editor);
            }
            else if (item.command) {
                // コマンド
                str = this.doCommand(item.command, editor);
            }
            else {
                // 処理が何も指定されていないので何もしない
                return;
            }
            // 挿入位置を決める
            let res = this.getInsertPos(item.position, str, editor);
            // 処理実行
            switch (item.method) {
                // 挿入(デフォルト動作)
                default:
                case 'insert': {
                    editor.edit(edit => edit.insert(res.pos, res.str));
                    break;
                }
                // ※ 置換動作してくれない＞＜；
                case 'replace': {
                    editor.edit(edit => edit.replace(editor.selection, res.str));
                    break;
                }
                // スニペット挿入
                case 'snippet': {
                    let snippet = new vscode.SnippetString(res.str);
                    editor.insertSnippet(snippet, res.pos);
                    break;
                }
            }
        });
    }
    /**
     * コマンド実行
     * @param command コマンド文字列
     * @return 挿入する文字列
     */
    doCommand(command, editor) {
        // 戻り値
        let ret = '';
        let cmds = command.split('.');
        switch (cmds[0]) {
            // 日付
            case 'now': {
                let now = new nekoaisle_1.DateInfo();
                switch (cmds[1]) {
                    case "year":
                        ret = now.year;
                        break;
                    case "month":
                        ret = now.month;
                        break;
                    case "date":
                        ret = now.date;
                        break;
                    case "hour":
                        ret = now.hour;
                        break;
                    case "min":
                        ret = now.min;
                        break;
                    case "sec":
                        ret = now.sec;
                        break;
                    case "ymdhis":
                        ret = now.ymdhis;
                        break;
                    case "ymd":
                        ret = now.ymd;
                        break;
                    case "his":
                        ret = now.his;
                        break;
                }
                break;
            }
            // パス
            case 'pinfo': {
                let pinfo = new nekoaisle_1.PathInfo(editor.document.fileName);
                switch (cmds[1]) {
                    // フルパス名
                    case "path": ret = pinfo.path;
                    // ディレクトリ名
                    case "dir":
                        ret = pinfo.info.dir;
                        break;
                    // ファイル名+拡張子
                    case "base":
                        ret = pinfo.info.base;
                        break;
                    // ファイル名
                    case "name":
                        ret = pinfo.info.name;
                        break;
                    // 拡張子
                    case "ext":
                        ret = pinfo.info.ext;
                        break;
                }
                break;
            }
            // クラス
            case 'class': {
                ret = this.getClass(cmds[1]);
                break;
            }
        }
        //
        return ret;
    }
    /**
     * ファイルテンプレート処理
     * @param filename テンプレートファイル名
     * @param editor 編集するエディター
     */
    doFile(filename, editor) {
        let template = nekoaisle_1.Util.loadFile(filename);
        return this.fromTemplate(template, editor);
    }
    /**
     * インラインテンプレート処理
     * @param inline テンプレート文字列
     * @param editor 編集するエディター
     */
    doInline(inline, editor) {
        return this.fromTemplate(inline, editor);
    }
    /**
     * 挿入位置を取得
     * @param position
     * @param str
     * @param editor
     */
    getInsertPos(position, str, editor) {
        let pos = editor.selection.active;
        switch (position) {
            // ファイルの先頭
            case 'top':
            case 'file-start':
            case 'file-top': {
                pos = new vscode.Position(0, 0);
                break;
            }
            // ファイルの先頭
            case 'bottom':
            case 'file-end':
            case 'file-bottom': {
                pos = new vscode.Position(0, 0);
                break;
            }
            // 行頭
            case 'home':
            case 'line-start':
            case 'line-top': {
                pos = new vscode.Position(pos.line, 0);
                break;
            }
            // 行末
            case 'end':
            case 'line-end':
            case 'line-bottom': {
                pos = new vscode.Position(pos.line, editor.document.lineAt(pos.line).text.length);
                break;
            }
            // 前の行
            case 'before': {
                pos = new vscode.Position(pos.line, 0);
                if (str.substr(-1) != "\n") {
                    str += "\n";
                }
                break;
            }
            // 次の行
            case 'new':
            case 'line-new':
            case 'new-line': {
                pos = new vscode.Position(pos.line + 1, 0);
                if (str.substr(-1) != "\n") {
                    str += "\n";
                }
                break;
            }
        }
        // 
        return {
            pos: pos,
            str: str
        };
    }
    /**
     * テンプレートから挿入する段落を作成
     * @param editor
     * @param tempName
     */
    fromTemplate(template, editor) {
        // 不要行の削除
        // "nekoaisle.insert-code delete line" が含まれる行を削除
        let match = template.match(/^.*\bnekoaisle\.insert-code\sdelete\sline\b.*$\r?\n?/gm);
        if (match) {
            for (let line of match) {
                template = template.replace(line, '');
            }
        }
        // テンプレート中で使用されているキーワードを抽出
        // 置換する値を準備する
        // '' や "" で括られている場合はエスケープ処理もする
        let params = this.makeParams(template, editor);
        // 置換を実行
        template = this.replaceKeywords(template, params);
        // 複数行ならばインデントをカーソル位置に合わせる
        if ((template.indexOf("\n") >= 0) && this.doAutoIndent()) {
            // カーソル位置を取得
            let cur = editor.selection.active;
            // カーソルの前を取得
            let tab = editor.document.lineAt(cur.line).text.substr(0, cur.character);
            // カーソルの前がホワイトスペースのみならば
            if (/\s+/.test(tab)) {
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
    makeParams(template, editor) {
        // キャッシュ
        let pinfo;
        let now;
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
            let keys = key.split('.');
            let val;
            switch (keys[0]) {
                case 'author':
                    val = this.getConfig("author", "");
                    break;
                case 'selection':
                    val = nekoaisle_1.Util.getSelectString(editor);
                    break;
                case 'clipboard':
                    val = nekoaisle_1.Util.execCmd('xclip -o -selection c');
                    break;
                case 'class':
                    val = this.getClass(keys[1]);
                    break;
                case 'pinfo': {
                    if (!pinfo) {
                        pinfo = new nekoaisle_1.PathInfo(editor.document.fileName);
                    }
                    val = pinfo[keys[1]];
                    break;
                }
                case 'now': {
                    if (!now) {
                        now = new nekoaisle_1.DateInfo();
                    }
                    val = now[keys[1]];
                    break;
                }
            }
            if (match[1]) {
                // クオーツなし
                key = match[1];
            }
            else if (match[3]) {
                // シングルクオーツ付き
                val = val.replace(/\\/g, "\\\\");
                val = val.replace(/'/g, "\\'");
                val = `'${val}'`;
                key = match[3];
            }
            else if (match[5]) {
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
    replaceKeywords(str, params, prefix) {
        for (let k in params) {
            let search = (prefix) ? `${prefix}.${k}` : k;
            if (typeof params[k] == 'object') {
                str = this.replaceKeywords(str, params[k], search);
            }
            else {
                let re = new RegExp(search, "g");
                str = str.replace(re, params[k]);
            }
        }
        return str;
    }
    // キーの長い順に並べ替え
    sortKeyLength(target) {
        // キーの抽出
        let keys = [];
        for (let k in target) {
            keys.push(k);
        }
        // キーの長さでソート
        keys.sort((a, b) => {
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
    getClass(propaty) {
        let editor = vscode.window.activeTextEditor;
        let pinfo = new nekoaisle_1.PathInfo(editor.document.fileName);
        let ret = '';
        switch (propaty) {
            // CPSS トランザクション用ベースクラス
            case 'base': {
                let name = pinfo.info.name;
                // 名前の末尾が数字ならば除去
                for (;;) {
                    let c = name.substr(-1);
                    if ((c < '0') && (c > '9')) {
                        break;
                    }
                    name = name.substr(0, name.length - 1);
                }
                ;
                ret = nekoaisle_1.Util.toCamelCase(name) + 'Base';
                break;
            }
            // C++ クラス名
            case 'cpp': {
                ret = pinfo.info.name;
                break;
            }
            // SQL テーブル名
            case 'sql': {
                let editor = vscode.window.activeTextEditor;
                let doc = editor.document;
                for (let l = 0; l < doc.lineCount; ++l) {
                    let str = doc.lineAt(0).text;
                    let res = /CREATE\sTABLE\s([0-9A-Z_]+)/i.exec(str);
                    if (res && res[0]) {
                        // 見つけた
                        ret = res[0];
                        break;
                    }
                }
                if (!ret) {
                    // CREATE TABLE が見つからなかったのでファイル名から
                    ret = pinfo.info.name;
                }
                break;
            }
        }
        return ret;
    }
    /**
     * テンプレート格納ディレクトリ名を取得
     * @return テンプレート格納ディレクトリ名
     */
    getTemplatesDir() {
        // デフォルトのテンポラリディレクトリ名
        let tempDir = this.joinExtensionRoot("templates");
        // settings.json よりテンプレートディレクトリを取得
        tempDir = this.getConfig("tempDir", tempDir);
        // 先頭の ~ を置換
        tempDir = nekoaisle_1.Util.normalizePath(tempDir);
        //
        return tempDir;
    }
    /**
     * 現在編集中のファイルの拡張子を取得
     * @param ext すでに拡張子を取得済みなら指定する
     * @return 拡張子
     */
    getCurrentExt(ext) {
        if (typeof ext == undefined) {
            // 拡張子が省略されたので現在のファイル名から取得
            let pinfo = new nekoaisle_1.PathInfo(vscode.window.activeTextEditor.document.fileName);
            let now = new nekoaisle_1.DateInfo();
            // テンプレートディレクトリ名を取得
            let tempDir = this.getTemplatesDir();
            let ext = pinfo.info.ext;
        }
        if (!ext) {
            // 拡張子がないときはこのドキュメントの言語から拡張子を決める
            let lang = vscode.window.activeTextEditor.document.languageId;
            ext = this.langs[lang];
            console.log(`languageId = "${lang}", file.ext = "${ext}"`);
        }
        return ext;
    }
    /**
     * オートインデントする？
     * vsc のオートインデントがONの場合2行目移行が2重にインデントされてしまう
     */
    doAutoIndent() {
        // エディターの autoIndent が true ならばインデントしない
        let config = vscode.workspace.getConfiguration('editor');
        let editorOption = config.get("autoIndent", true);
        if (editorOption) {
            return false;
        }
        // 自身の設定を取得
        return this.getConfig("autoIndent", false);
    }
}
//# sourceMappingURL=extension.js.map