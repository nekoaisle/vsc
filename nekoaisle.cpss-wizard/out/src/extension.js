'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const chproc = require("child_process");
const nekoaisle_1 = require("./nekoaisle.lib/nekoaisle");
function activate(context) {
    let extention = new CpssWizard();
    let disp = vscode.commands.registerCommand(extention.command, () => {
        extention.entry();
    });
    context.subscriptions.push(disp);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
/**
 * オプションの定義
 */
class Options {
    /**
     * 構築
     * @param config 設定オブジェクト
     */
    constructor(config, defaults) {
        // モード
        this.mode = '';
        this.title = '';
        this.name = '';
        this.sqlFile = '';
        // ファイル名
        this.wizard = nekoaisle_1.Util.normalizePath(config.get('wizard', defaults.wizard));
        this.templateDir = nekoaisle_1.Util.normalizePath(config.get('templateDir', defaults.templateDir));
        this.sqlDir = nekoaisle_1.Util.normalizePath(config.get('sqlDir', defaults.sqlDir));
        this.php = nekoaisle_1.Util.normalizePath(config.get('php', defaults.php));
        this.outFile = nekoaisle_1.Util.normalizePath(config.get('outFile', defaults.outFile));
        // 
        this.author = config.get('author', defaults.author);
    }
}
;
class CpssWizard extends nekoaisle_1.Extention {
    /**
     * 構築
     */
    constructor() {
        super('Cpss Wizard', 'nekoaisle.cpssWizard');
        // メニューに対応するモードとファイル名
        this.modeInfos = {
            '1 標準テンプレート': {
                mode: 'standard',
                name: 'template',
            },
            '2 トランザクション基本クラス': {
                mode: 'TransBase',
                name: 'TransBase',
            },
            '3 トランザクション初期化ページ': {
                mode: 'TransInit',
                name: 'TransInit',
            },
            '4 トランザクション編集ページ': {
                mode: 'TransEdit',
                name: 'TransEdit',
            },
            '5 トランザクション確認ページ': {
                mode: 'TransConfirm',
                name: 'TransConfirm',
            },
            '6 トランザクション完了ページ': {
                mode: 'TransCompleted',
                name: 'TransCompleted',
            },
            '7 一覧基本クラス': {
                mode: 'ListBase',
                name: 'ListBase',
            },
            '8 一覧初期化ページ': {
                mode: 'ListInit',
                name: 'ListInit',
            },
            '9 一覧ページ': {
                mode: 'ListList',
                name: 'ListList',
            },
            'A CCamRow 派生クラス': {
                mode: 'Row',
                name: 'Row',
            },
        };
        this.defaultOptions = {
            wizard: "~/Dropbox/documents/PHP/CpssWizardUTF8.php",
            templateDir: "~/Dropbox/documents/hidemaru",
            sqlDir: '~/network/campt-kiya/Installer/CREATE_TABLE',
            php: '/usr/bin/php7.1',
            outFile: "php://stdout",
            author: "木屋善夫",
        };
    }
    /**
     * エントリー
     */
    entry() {
        // 設定を取得
        const config = vscode.workspace.
            getConfiguration(this.extentionKey[1]);
        // 設定取得
        let options = new Options(config, this.defaultOptions);
        // 一覧からモードを選択
        // 情報配列からメニューを作成
        let menu = [];
        for (let key in this.modeInfos) {
            menu[menu.length] = key;
        }
        let opt = {
            placeHolder: '選択してください。'
        };
        vscode.window.showQuickPick(menu, opt).then((mode) => {
            console.log(`mode = "${mode}"`);
            // モードが指定されなかったら終了
            if (!mode) {
                return;
            }
            let info = this.modeInfos[mode];
            if (!info) {
                return;
            }
            options.mode = info.mode;
            options.name = info.name;
            // InputBoxを表示してタイトルを求める
            var ioption = {
                prompt: "タイトルを入力してください。",
                password: false,
                value: "",
            };
            return vscode.window.showInputBox(ioption);
        }).then((title) => {
            console.log(`title = "${title}"`);
            // タイトルが指定されなかったときは何もしない
            if (title.trim().length == 0) {
                return;
            }
            options.title = title;
            // SQLファイルを選択
            if (fs.existsSync(options.sqlDir)) {
                let sel = new nekoaisle_1.SelectFile();
                return sel.selectFile(`${options.sqlDir}`, 'SQLファイルを選択してください。(不要な場合はESC)');
            }
            else {
                return new Promise((resolve, reject) => {
                    resolve('');
                });
            }
        }).then((sqlFile) => {
            console.log(`sqlFile = "${sqlFile}"`);
            options.sqlFile = sqlFile;
            this.execWizard(options);
        });
    }
    execWizard(options) {
        //ドキュメントを取得
        let editor = vscode.window.activeTextEditor;
        // // 出力ウィンドウの生成
        // var overview = vscode.window.createOutputChannel( "quick-filter" );
        // // 出力ウィンドウをクリア
        // overview.clear();
        // 現在編集中のファイル名を解析
        let fileName = editor.document.fileName;
        let pinfo = path.parse(fileName);
        // console.log( "dir  = " + pinfo.dir  );
        // console.log( "base = " + pinfo.base );
        // console.log( "name = " + pinfo.name );
        // console.log( "ext  = " + pinfo.ext  );
        if (!pinfo.ext) {
            // 拡張子がない
            nekoaisle_1.Util.putMess("拡張子のないファイルには対応していません。");
            return false;
        }
        // テンプレートファイルを探す
        let t = [
            // ファイルの存在するディレクトリの template ディレクトリを探す
            `${pinfo.dir}/template/${options.name}${pinfo.ext}`,
            `${pinfo.dir}/template/template${pinfo.ext}`,
            // ファイルの存在するディレクトリ直下の template ファイルを探す
            `${pinfo.dir}/${options.name}${pinfo.ext}`,
            `${pinfo.dir}/template${pinfo.ext}`,
            // デフォルトのテンプレートを探す
            `${options.templateDir}/${options.name}${pinfo.ext}`,
            `${options.templateDir}/template${pinfo.ext}`,
        ];
        let tmpl;
        for (var k in t) {
            if (nekoaisle_1.Util.isExistsFile(t[k])) {
                tmpl = t[k];
                break;
            }
        }
        console.log("template = " + tmpl);
        if (!tmpl) {
            var s = "テンプレートファイルが見つかりませんでした。\n";
            for (var k in t) {
                s += t[k] + "\n";
            }
            nekoaisle_1.Util.putMess(s);
            return false;
        }
        // コマンドラインを作成
        let cmd = `${options.php} ${options.wizard} "-m=${options.mode}" "-f=${fileName}" "-t=${options.title}" "-a=${options.author}" "-out=${options.outFile}" "-tmpl=${tmpl}" "-sql=${options.sqlFile}"`;
        console.log(cmd);
        // 実行
        chproc.exec(cmd, (err, stdout, stderr) => {
            if (err == null) {
                console.log(stdout);
                editor.edit(function (edit) {
                    edit.insert(new vscode.Position(0, 0), stdout);
                });
            }
            else {
                // エラーが発生
                console.log("error: " + err.message);
                console.log("stderr:");
                console.log(stderr);
                console.log("stdout:");
                console.log(stdout);
                nekoaisle_1.Util.putMess(err.message);
                return false;
            }
        });
    }
}
//# sourceMappingURL=extension.js.map