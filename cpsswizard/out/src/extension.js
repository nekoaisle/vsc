'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const process = require("child_process");
const fs = require("fs");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    console.log('CPSS Wizard が起動しました。aaaa');
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
    const param = {
        homeDir: "/home/kiya",
        wizard: "/home/kiya/Dropbox/documents/PHP/CpssWizardUTF8.php",
        //        tempFile: "/home/kiya/temp/CpssWizard.txt",
        outFile: "php://stdout",
        templateDir: "/home/kiya/Dropbox/documents/hidemaru",
        author: "木屋善夫",
        mode: "standard",
        php: "/usr/bin/php",
    };
    // 実行部分
    let execWizard = (title) => {
        console.log(`title = "${title}"`);
        // タイトルが指定されなかったときは何もしない
        if (title.trim().length == 0) {
            return;
        }
        //ドキュメントを取得
        let editor = vscode.window.activeTextEditor;
        // // 出力ウィンドウの生成
        // var overview = vscode.window.createOutputChannel( "quick-filter" );
        // // 出力ウィンドウをクリア
        // overview.clear();
        // 現在編集中のファイル名を解析
        let path = require('path');
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
            pinfo.dir + "/template/template" + pinfo.ext,
            // ファイルの存在するディレクトリ直下の template ファイルを探す
            pinfo.dir + "/template" + pinfo.ext,
            // 拡張仕事に定められたテンプレートを探す
            param.templateDir + "/template" + pinfo.ext,
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
        let cmd = `${param.php} ${param.wizard} "-m=${param.mode}" "-f=${fileName}" "-t=${title}" "-a=${param.author}" "-out=${param.outFile}" "-tmpl=${tmpl}"`;
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
        //     //出力ウィンドウの表示
        //     overview.show(true);
    };
    // 標準ファイルから初期ソースを作成します。
    let disposable = vscode.commands.registerCommand('extension.fromTemplate', () => {
        // InputBoxを表示してタイトルを求める
        var ioption = {
            prompt: "タイトルを入力してください。",
            password: false,
            value: "",
        };
        vscode.window.showInputBox(ioption).then(execWizard);
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map