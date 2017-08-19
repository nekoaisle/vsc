"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const nekoaisle_1 = require("./nekoaisle.lib/nekoaisle");
function activate(context) {
    let openPreviousTab = new OpenPreviousTab();
    context.subscriptions.push(openPreviousTab);
    let disposable = vscode.commands.registerCommand('nekoaisle.toggleTab', () => {
        openPreviousTab.entry();
    });
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
class OpenPreviousTab extends nekoaisle_1.Extention {
    /**
     * 構築
     */
    constructor() {
        super('Open previous tab', 'nekoaisle.openPreviousTab');
        this.fileNames = [null, null];
        // エントリーを登録
        let subscriptions = [];
        vscode.window.onDidChangeActiveTextEditor(this.onEvent, this, subscriptions);
        // create a combined disposable from both event subscriptions
        this._disposable = vscode.Disposable.from(...subscriptions);
    }
    dispose() {
        this._disposable.dispose();
    }
    /**
     * エントリー
     */
    entry() {
        if (!this.fileNames[1]) {
            return;
        }
        let fileName = this.fileNames[1];
        for (let doc of vscode.workspace.textDocuments) {
            let fn = doc.fileName;
            if (doc.fileName == fileName) {
                vscode.window.showTextDocument(doc);
                break;
            }
        }
    }
    /**
     * イベントハンドラ
     */
    onEvent() {
        // 前回のアクティブタブを記憶
        this.fileNames[1] = this.fileNames[0];
        // 現在のアクティブタブを記憶
        this.fileNames[0] = vscode.window.activeTextEditor.document.fileName;
    }
}
//# sourceMappingURL=extension.js.map