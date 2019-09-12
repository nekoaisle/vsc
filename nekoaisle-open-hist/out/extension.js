'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const nekoaisle_1 = require("./nekoaisle.lib/nekoaisle");
/**
 * エクステンション活性化
 * @param context
 */
function activate(context) {
    let ext = new MyExtension(context);
}
exports.activate = activate;
/**
 * 非活性化
 */
function deactivate() {
}
exports.deactivate = deactivate;
/**
 * エクステンション本体
 */
class MyExtension extends nekoaisle_1.Extension {
    /**
     * 構築
     */
    constructor(context) {
        super(context, {
            name: 'ここに編集したことのあるファイルを開く',
            config: 'nekoaisle-openHist',
            commands: [
                {
                    command: 'nekoaisle.openHist',
                    callback: () => {
                        this.exec();
                    }
                }
            ]
        });
        this.lineNos = {};
        // イベントハンドラーを登録
        let subscriptions = [];
        // ファイルが閉じられる時
        vscode.workspace.onDidCloseTextDocument(this.onDidCloseTextDocument, this, subscriptions);
        // カーソル位置が変わった(ファイルごとのカーソル位置を記憶するため)
        vscode.window.onDidChangeTextEditorSelection(this.onDidChangeTextEditorSelection, this, subscriptions);
        // create a combined disposable from both event subscriptions
        this.disposable = vscode.Disposable.from(...subscriptions);
    }
    /**
     * 履歴ファイルのファイル名取得
     * @return ファイル名
     */
    getHistFilename() {
        return this.getFilenameAccordingConfig('hist-file', 'openHist.json');
    }
    /**
     * 履歴ファイルの読み込み
     * @return 履歴配列
     */
    loadHistFile() {
        let fn = this.getHistFilename();
        // 履歴ファイルの読み込み
        return nekoaisle_1.Util.loadFileJson(fn);
    }
    /**
     * 履歴ファイルの保存
     * @param data 書き込むデータ
     */
    saveHistFile(data) {
        let fn = this.getHistFilename();
        // 履歴ファイルの書き込み
        nekoaisle_1.Util.saveFileJson(fn, data);
    }
    /**
     * カーソル位置が変わった(ファイルごとのカーソル位置を記憶するため)
     * onWillCloseTextDocumentが無いのでカーソル父が取れない
     */
    onDidChangeTextEditorSelection(e) {
        let name = e.textEditor.document.fileName;
        if (name.match(/^Untitled-[0-9]+/)) {
            // ファイル名が決まっていない時は何もしない
            return;
        }
        let lineNo = e.selections[0].anchor.line;
        this.lineNos[name] = lineNo;
    }
    /**
     * ファイルが閉じられたときのイベントハンドラ
     * @param doc テキストドキュメント
     */
    onDidCloseTextDocument(doc) {
        if (doc.fileName.match(/^Untitled-[0-9]+/)) {
            // ファイル名が決まっていない時は何もしない
            return;
        }
        // ファイル名を分解
        let pinfo = new nekoaisle_1.PathInfo(doc.fileName);
        // 行番号を確認
        if (typeof this.lineNos[pinfo.path] === "undefined") {
            /* おそらく[ファイル名+.git]というよくわからないファイル
               ファイルを閉じたあとにこのよくわからないファイルが閉
               じたイベントが発生する
               .git で終わるファイルを無視してもよいのだがこのよくわ
               からないファイルは onDidChangeTextEditorSelection イ
               ベントが発生しないようなので行番号が取れていなければ
               無視するようにした
            */
            return;
        }
        // 履歴ファイルを読み込む
        let list = this.loadHistFile();
        // このファイルの情報を取得
        let item = list[pinfo.path];
        if (!item) {
            // 新規
            item = {
                baseName: pinfo.info.base,
                dirName: pinfo.info.dir,
                lineNo: 0,
            };
            list[pinfo.path] = item;
        }
        // 現在の行番号を設定
        item.lineNo = this.lineNos[pinfo.path];
        // 履歴を保存
        this.saveHistFile(list);
    }
    /**
     * エントリー
     */
    exec() {
        //
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        // 履歴ファイルの読み込み
        let list = this.loadHistFile();
        // メニューを作成
        let menu = [];
        for (let key in list) {
            let item = list[key];
            menu.push({
                label: item.baseName,
                // detail: key,
                description: item.dirName
            });
        }
        // 大文字小文字を区別せずファイル名でソート
        // ファイル名が同じならディレクトリー名でソート
        menu.sort(function (a, b) {
            let a1 = (a.label + a.description).toUpperCase();
            let b1 = (b.label + b.description).toUpperCase();
            if (a1 < b1) {
                return -1;
            }
            else if (a1 > b1) {
                return 1;
            }
            else {
                return 0;
            }
        });
        // メニュー選択
        let options = {
            placeHolder: '選択してください。',
            matchOnDetail: false,
            matchOnDescription: false
        };
        vscode.window.showQuickPick(menu, options).then((sel) => {
            if (!sel) {
                // 未選択
                return;
            }
            // ファイル名を復元
            let file = `${sel.description}/${sel.label}`;
            // ファイルを開く
            vscode.workspace.openTextDocument(file).then((doc) => {
                vscode.window.showTextDocument(doc).then((editor) => {
                    let pos = new vscode.Position(list[file].lineNo, 0);
                    editor.selection = new vscode.Selection(pos, pos);
                });
            });
        });
    }
}
//# sourceMappingURL=extension.js.map