"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const nekoaisle_1 = require("./nekoaisle.lib/nekoaisle");
function activate(context) {
    let myExtension = new MyExtension(context);
    context.subscriptions.push(myExtension);
}
exports.activate = activate;
class Data {
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
    getData(filename) {
        if (!this.data[filename]) {
            this.data[filename] = new Data();
        }
        return this.data[filename];
    }
    /**
     * マークした位置を取得
     */
    getMark(filename) {
        let data = this.getData(filename);
        if (data.mark) {
            return data.mark;
        }
        else {
            return null;
        }
    }
    /**
     * 指定位置をマークする
     * @param pos マークする位置
     */
    setMark(pos, filename) {
        let data = this.getData(filename);
        data.mark = pos;
    }
    /**
     * 前回のカーソル位置を取得
     */
    getLast(filename) {
        let data = this.getData(filename);
        if (data.last) {
            return data.last;
        }
        else {
            return null;
        }
    }
    /**
     * 指定位置を前回位置とする
     * @param pos マークする位置
     */
    setLast(pos, filename) {
        let data = this.getData(filename);
        data.last = pos;
    }
    // カーソル位置を記憶
    markCursor() {
        // 現在編集中のファイル名を取得
        let filename = vscode.window.activeTextEditor.document.fileName;
        // 現在位置を記憶
        this.setMark(this.getCsrPos(), filename);
    }
    // カーソル位置にジャンプ
    jumpMark() {
        // 現在編集中のファイル名を取得
        let filename = vscode.window.activeTextEditor.document.fileName;
        // マークした位置を取得
        let mark = this.getMark(filename);
        if (mark) {
            // 同じ位置へはジャンプしない
            let cur = this.getCsrPos();
            if (!cur.isEqual(mark)) {
                // ジャンプ前の位置を記憶
                this.setLast(cur, filename);
                // 記憶した位置にジャンプ
                this.setCsrPos(mark);
            }
        }
    }
    // 最後にジャンプした位置に戻る
    jumpLast() {
        // 現在編集中のファイル名を取得
        let filename = vscode.window.activeTextEditor.document.fileName;
        let last = this.getLast(filename);
        if (last) {
            // 最後にジャンプした位置にジャンプ
            this.setCsrPos(last);
        }
    }
    onChangeSelection(e) {
        let sel = e.selections[0].active;
        let filename = e.textEditor.document.fileName;
        let data = this.getData(filename);
        if (data.cursor) {
            let last = data.cursor;
            if (Math.abs(last.line - sel.line) > 20) {
                // 20行以上移動したので前回位置として記憶
                this.setLast(last, filename);
            }
        }
        data.cursor = sel;
    }
    dispose() {
        this.disposable.dispose();
    }
}
//# sourceMappingURL=extension.js.map