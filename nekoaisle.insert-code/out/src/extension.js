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
class ListItem {
    constructor(filename, position) {
        this.filename = filename;
        this.position = position;
    }
}
;
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
        // 実行されたときの日時情報
        let now = new nekoaisle_1.DateInfo();
        // settings.json より編集者名を取得
        let author = this.getConfig("author", "");
        // デフォルトのテンポラリディレクトリ名
        let tempDir = `${nekoaisle_1.Util.getHomeDir()}/Dropbox/documents/vsc`;
        // settings.json よりテンプレートディレクトリを取得
        tempDir = this.getConfig("tempDir", tempDir);
        // 先頭の ~ を置換
        tempDir = nekoaisle_1.Util.normalizePath(tempDir);
        // ファイル名情報
        let pinfo = new nekoaisle_1.PathInfo(editor.document.fileName);
        let ext = pinfo.info.ext;
        if (!ext) {
            // 拡張子がないときはこのドキュメントの言語から拡張子を決める
            let lang = editor.document.languageId;
            ext = this.langs[lang];
            console.log(`languageId = "${lang}", file.ext = "${ext}"`);
        }
        // 先頭の . を除去
        ext = ext.substr(1);
        // この拡張子のメニューを読み込む
        let menuTSV = nekoaisle_1.Util.loadFile(`${tempDir}/list-${pinfo.info.ext.substr(1)}.tsv`);
        //        console.log(menuTSV);
        let rows = menuTSV.split("\n");
        //        console.log(rows);
        // TSV ファイルを分解して QuickPickOptions 用のメニューと
        // メニューアイテムに対応するコマンド辞書を作成
        let menu = []; // QuickPickOptions 用のメニュー
        let dic = []; // メニューアイテムに対応するコマンド辞書
        for (let row of rows) {
            let cols = row.split("\t");
            //            console.log(cols);
            menu.push(cols[0]);
            dic[cols[0]] = new ListItem(cols[1], cols[2]);
        }
        //        console.log(menu);
        // メニュー選択
        let options = {
            placeHolder: '選択してください。'
        };
        vscode.window.showQuickPick(menu, options).then((sel) => {
            console.log(`command = "${sel}"`);
            if (!sel) {
                return;
            }
            let cmd = dic[sel];
            // コマンドごとの処理
            let str = '';
            switch (cmd.filename) {
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
                    let fn = `${tempDir}/${cmd.filename}`;
                    str = this.fromTemplate(editor, fn, author, pinfo, now);
                    break;
            }
            // 現在のカーソル位置に挿入
            if (str) {
                let pos = editor.selection.active;
                switch (cmd.position) {
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
                    // 次の行
                    case 'new':
                    case 'line-new':
                    case 'new-line':
                        pos = new vscode.Position(pos.line + 1, 0);
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
    fromTemplate(editor, tempName, author, pinfo, now) {
        // テンプレートの読み込み
        let tempText = nekoaisle_1.Util.loadFile(tempName);
        // 変換データを準備
        // テンプレート中に ${} を書くバージョン
        // このバージョンではエラーがあると一切変換されない…
        //    return Function(`return \`${tempText}\``).toString();
        // 置換情報を作成
        let rep = {
            "author": author,
            "pinfo.path": pinfo.path,
            "pinfo.dir": pinfo.info.dir,
            "pinfo.base": pinfo.info.base,
            "pinfo.name": pinfo.info.name,
            "pinfo.ext": pinfo.info.ext,
            "now.year": now.year,
            "now.month": now.month,
            "now.date": now.date,
            "now.hour": now.hour,
            "now.min": now.min,
            "now.sec": now.sec,
            "selection": nekoaisle_1.Util.getSelectString(editor),
            "clipboard": nekoaisle_1.Util.execCmd('xclip -o -selection c'),
        };
        for (let s in rep) {
            let re = new RegExp(`{{${s}}}`, "g");
            tempText = tempText.replace(re, rep[s]);
        }
        ;
        return tempText;
    }
}
//# sourceMappingURL=extension.js.map