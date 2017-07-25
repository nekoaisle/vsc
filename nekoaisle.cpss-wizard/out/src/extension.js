'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const process = require("child_process");
const fs = require("fs");
const path = require("path");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    console.log('CPSS Wizard が起動しました。');
    const extentionKey = "cpssWizard";
    /**
     * メッセージを出力
     * @param str 出力するメッセージ
     */
    let putMess = (str) => {
        vscode.window.showInformationMessage(str);
    };
    /**
     * ファイルが存在するか調べる
     * @param path 調べるファイルの名前
     */
    let isExistsFile = (path) => {
        if (!path) {
            // ファイル名が指定されなかったときは「存在しない」を返す
            return false;
        }
        try {
            fs.accessSync(path);
        }
        catch (e) {
            // エラーが発生したので「存在しない」を返す
            return false;
        }
        // 正常終了したので「存在する」を返す
        return true;
    };
    // メニューに対応するモードとファイル名
    const modeInfos = {
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
    /**
     * オプションの定義
     */
    class Options {
        /**
         * 構築
         * @param config 設定オブジェクト
         */
        constructor(config, defaults) {
            this.homeDir = ("" + process.execSync('echo $HOME')).trim();
            this.homeDir = config.get('homeDir', this.homeDir);
            this.wizard = config.get('wizard', defaults.wizard);
            this.outFile = config.get('outFile', defaults.outFile);
            this.templateDir = config.get('templateDir', defaults.templateDir);
            this.sqlDir = config.get('sqlDir', defaults.sqlDir);
            this.author = config.get('author', defaults.author);
            this.mode = config.get('mode', defaults.mode);
            this.php = config.get('php', defaults.php);
            this.title = '';
            this.name = '';
            this.sqlFile = '';
        }
    }
    ;
    const defaultOptions = {
        homeDir: "",
        wizard: "~/Dropbox/documents/PHP/CpssWizardUTF8.php",
        outFile: "php://stdout",
        templateDir: "~/Dropbox/documents/hidemaru",
        sqlDir: '~/network/campt-kiya/Installer/CREATE_TABLE',
        author: "木屋善夫",
        mode: "standard",
        php: '/usr/bin/php',
    };
    // 実行部分
    let execWizard = (options) => {
        //ドキュメントを取得
        let editor = vscode.window.activeTextEditor;
        // // 出力ウィンドウの生成
        // var overview = vscode.window.createOutputChannel( "quick-filter" );
        // // 出力ウィンドウをクリア
        // overview.clear();
        // 現在編集中のファイル名を解析
        let fileName = editor.document.fileName;
        let pinfo = path.parse(fileName);
        console.log("dir  = " + pinfo.dir);
        console.log("base = " + pinfo.base);
        console.log("name = " + pinfo.name);
        console.log("ext  = " + pinfo.ext);
        if (!pinfo.ext) {
            // 拡張子がない
            putMess("拡張子のないファイルには対応していません。");
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
            if (isExistsFile(t[k])) {
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
            putMess(s);
            return false;
        }
        // コマンドラインを作成
        let cmd = `${options.php} ${options.wizard} "-m=${options.mode}" "-f=${fileName}" "-t=${options.title}" "-a=${options.author}" "-out=${options.outFile}" "-tmpl=${tmpl}" "-sql=${options.sqlFile}"`;
        console.log(cmd);
        // 実行
        process.exec(cmd, (err, stdout, stderr) => {
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
                putMess(err.message);
                return false;
            }
        });
    };
    /**
     * エントリー
     */
    context.subscriptions.push(vscode.commands.registerCommand(`${extentionKey}.fromTemplate`, () => {
        // 設定を取得
        const config = vscode.workspace.getConfiguration(extentionKey);
        let options = new Options(config, defaultOptions);
        /**
         * ファイル選択
         * @param dirName ディレクトリー名
         */
        let selectFile = (dirName) => {
            if (dirName.substr(0, 1) == '~') {
                dirName = `${options.homeDir}${dirName.substr(1)}`;
            }
            return new Promise((resolve, reject) => {
                // 非同期の処理
                let files;
                try {
                    files = fs.readdirSync(dirName);
                }
                catch (e) {
                    putMess(`${dirName} が開けませんでした。`);
                    return;
                }
                let popt = {
                    prompt: 'SQLファイルを選択してください(不要な場合はESC)',
                    placeHolder: dirName,
                };
                vscode.window.showQuickPick(files, popt).then((sel) => {
                    // ファイルが指定されなかったときは完了(then()を実行)
                    if (!sel) {
                        resolve('');
                    }
                    // ディレクトリーか調べる
                    let fn = path.join(dirName, sel);
                    let stats = fs.statSync(fn);
                    if (!stats.isDirectory()) {
                        // ファイルなので完了(then()を実行)
                        resolve(fn);
                    }
                    else {
                        // ディレクトリーなら選択を続行
                        selectFile(fn).then((value) => {
                            resolve(value);
                        });
                    }
                });
            });
        };
        // 一覧からモードを選択
        // 情報配列からメニューを作成
        let menu = [];
        for (let key in modeInfos) {
            menu[menu.length] = key;
        }
        let opt = {
            placeHolder: '選択してください。'
        };
        vscode.window.showQuickPick(menu, opt).then((sel) => {
            // 選択したメニュー文字列の先頭文字を取得
            console.log(`command = "${sel}"`);
            if (!sel) {
                return;
            }
            let info = modeInfos[sel];
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
            vscode.window.showInputBox(ioption).then((title) => {
                console.log(`title = "${title}"`);
                // タイトルが指定されなかったときは何もしない
                if (title.trim().length == 0) {
                    return;
                }
                options.title = title;
                // SQLファイルを選択
                selectFile(`${options.sqlDir}`).then((value) => {
                    options.sqlFile = value;
                    execWizard(options);
                });
            });
        });
    }));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map