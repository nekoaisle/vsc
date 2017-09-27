"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const nekoaisle_1 = require("./nekoaisle.lib/nekoaisle");
function activate(context) {
    let openPreviousTab = new OpenPreviousTab(context);
    context.subscriptions.push(openPreviousTab);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
class OpenPreviousTab extends nekoaisle_1.Extension {
    /**
     * 構築
     */
    constructor(context) {
        super(context, {
            name: '拡張機能名',
            config: 'toggleTab',
            commands: [
                {
                    command: 'nekoaisle.toggleTab',
                    callback: () => {
                        this.exec();
                    }
                }
            ]
        });
        this.fileNames = [null, null];
        // イベントハンドラーを登録
        let subscriptions = [];
        vscode.window.onDidChangeActiveTextEditor(this.onEvent, this, subscriptions);
        // create a combined disposable from both event subscriptions
        this.disposable = vscode.Disposable.from(...subscriptions);
        // 現在のアクティブタブを記憶
        if (vscode.window.activeTextEditor) {
            this.fileNames[0] = vscode.window.activeTextEditor.document.fileName;
        }
    }
    /**
     * エントリー
     */
    exec() {
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
    onEvent(e) {
        // 前回のアクティブタブを記憶
        this.fileNames[1] = this.fileNames[0];
        // 現在のアクティブタブを記憶
        this.fileNames[0] = vscode.window.activeTextEditor.document.fileName;
    }
    dispose() {
        this.disposable.dispose();
    }
}
//# sourceMappingURL=extension.js.map