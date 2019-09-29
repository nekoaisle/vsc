"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const nekoaisle_1 = require("./nekoaisle.lib/nekoaisle");
function activate(context) {
    let myExtension = new MyExtension(context);
    context.subscriptions.push(myExtension);
}
exports.activate = activate;
/**
 * ファイルごとの情報
 */
class Data {
    normalizePos(pos) {
        if (pos) {
            return pos;
        }
        else {
            return null;
        }
    }
    get mark() {
        return this.normalizePos(this._mark);
    }
    get last() {
        return this.normalizePos(this._last);
    }
    get cursor() {
        return this.normalizePos(this._cursor);
    }
    set mark(pos) {
        this._mark = new vscode.Position(pos.line, 0);
    }
    set last(pos) {
        this._last = new vscode.Position(pos.line, 0);
    }
    set cursor(pos) {
        this._cursor = new vscode.Position(pos.line, 0);
    }
}
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
class MyExtension extends nekoaisle_1.Extension {
    /**
     * 構築
     */
    constructor(context) {
        super(context, {
            name: 'Mark jump',
            config: 'markJump',
            commands: [
                // カーソル位置を記憶
                {
                    command: 'nekoaisle.markjumpMark',
                    callback: () => {
                        this.markCursor();
                    }
                },
                // 記憶した位置にジャンプ
                {
                    command: 'nekoaisle.markjumpJump',
                    callback: () => { this.jumpMark(); }
                },
                // 前回のカーソル位置に戻る
                {
                    command: 'nekoaisle.markjumpReturn',
                    callback: () => { this.jumpLast(); }
                }
            ]
        });
        // ファイル名ごとのマークした位置
        this.data = {};
        // イベントハンドラーを登録
        let subscriptions = [];
        vscode.window.onDidChangeTextEditorSelection(this.onChangeSelection, this, subscriptions);
        // create a combined disposable from both event subscriptions
        this.disposable = vscode.Disposable.from(...subscriptions);
        // このファイルのデータを取得
        if (vscode.window.activeTextEditor) {
            let data = this.getData();
            // 現在のカーソル位置を記憶
            data.cursor = this.getCsrPos();
        }
    }
    /**
     * 現在のカーソル位置を取得
     * @return 現在のカーソル位置
     */
    getCsrPos() {
        let pos = vscode.window.activeTextEditor.selection.anchor;
        return new vscode.Position(pos.line, pos.character);
    }
    /**
     * 指定位置にジャンプ
     * @param pos ジャンプする位置
     */
    setCsrPos(pos) {
        let range = new vscode.Range(pos, pos);
        vscode.window.activeTextEditor.selection = new vscode.Selection(pos, pos);
        vscode.window.activeTextEditor.revealRange(range);
        console.log(`jump = ${pos.character}, ${pos.line}`);
    }
    /**
     * 指定したファイルに関するデータを取得
     * @param filename ファイル名
     */
    getData(filename) {
        // ファイル名が省略されたら現在アクティブなエディタのファイル名
        if (!filename) {
            let filename = vscode.window.activeTextEditor.document.fileName;
        }
        // まだデータオブジェクトが構築されていなければ作成
        if (!this.data[filename]) {
            this.data[filename] = new Data();
        }
        return this.data[filename];
    }
    // カーソル位置を記憶
    markCursor() {
        // このファイルのデータを取得
        let data = this.getData();
        // 現在位置を記憶
        data.mark = this.getCsrPos();
    }
    // カーソル位置にジャンプ
    jumpMark() {
        // このファイルのデータを取得
        let data = this.getData();
        // マークした位置を取得
        if (data.mark) {
            // 同じ位置へはジャンプしない
            let cur = this.getCsrPos();
            if (!cur.isEqual(data.mark)) {
                // ジャンプ前の位置を記憶
                data.last = cur;
                // 記憶していた位置にジャンプ
                this.setCsrPos(data.mark);
            }
        }
    }
    // 最後にジャンプした位置に戻る
    jumpLast() {
        // このファイルのデータを取得
        let data = this.getData();
        if (data.last) {
            // 最後にジャンプした位置にジャンプ
            this.setCsrPos(data.last);
        }
    }
    /**
     * 選択範囲変更イベントハンドラ
     * @param e イベント情報
     */
    onChangeSelection(e) {
        // 現在のカーソル位置を取得
        let cur = e.selections[0].active;
        // このファイルのデータを取得
        let data = this.getData();
        if (data.cursor) {
            if (data.cursor.line != cur.line) {
                // 行が移動したので前回位置として記憶
                data.last = data.cursor;
            }
        }
        data.cursor = cur;
    }
    /**
     * 処分
     */
    dispose() {
        this.disposable.dispose();
    }
}
//# sourceMappingURL=extension.js.map