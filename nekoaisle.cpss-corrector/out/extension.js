/**
 * CPSSコンバーター
 *
 * filename:  extension.ts
 *
 * @package
 * @version   1.0.0
 * @copyright Copyright (C) 2019 Yoshio Kiya All rights reserved.
 * @date      2019-11-28
 * @author    木屋善夫
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const Util_1 = require("./nekoaisle.lib/Util");
const Extension_1 = require("./nekoaisle.lib/Extension");
/**
 * エクステンション活性化
 * @param context
 */
function activate(context) {
    let ext = new MyExtention(context);
}
exports.activate = activate;
/**
 * 非活性化
 */
function deactivate() {
}
exports.deactivate = deactivate;
/**
 * CPSSコンバーター
 */
class MyExtention extends Extension_1.Extension {
    /**
     * 構築
     */
    constructor(context) {
        super(context, {
            name: 'CPSSソース訂正',
            config: '',
            commands: [
                {
                    command: 'nekoaisle.cpssCorrector',
                    callback: () => { this.exec(); }
                },
                {
                    command: 'nekoaisle.cpssCorrector-paren',
                    callback: () => { this.paren(); }
                }
            ]
        });
    }
    /**
     * 実行
     */
    exec() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            this.correctMethodHeader(editor);
        }
    }
    paren() {
        if (!vscode.window.activeTextEditor) {
            return;
        }
        const editor = vscode.window.activeTextEditor;
        // 全テキストの取得
        let text = editor.document.getText();
        text = this.correctParen(text);
        Util_1.Util.replaceAllText(editor, text);
    }
    /**
     * メソッドのヘッダーを修正
     */
    correctMethodHeader(editor) {
        // 全テキストの取得
        let text = editor.document.getText();
        let re, mid;
        // セクションタイトルを削除
        re = new RegExp("^\t//=+$\n\t//!@name .*$\n\t//=+$\n", "gm");
        text = text.replace(re, "");
        // 不要な行の削除
        text = text.replace(new RegExp("^\t//@{$\n", "gm"), "");
        text = text.replace(new RegExp("^\t//@}$\n", "gm"), "");
        // @retval 修正
        re = new RegExp("@retval", "gm");
        text = text.replace(re, "@return");
        // インデントなしのコメントを処理(クラスヘッダーとグローバル変数)
        text = this.correctRem(text, "");
        // クラスメンバーのヘッダー
        text = this.correctRem(text, "\t");
        // コメント
        re = new RegExp("^(\t+)//=== ([^=]*)=*$\n", "gm");
        text = text.replace(re, "$1// $2\n");
        // テキストを差し替える
        let doc = editor.document;
        let range = new vscode.Range(0, 0, doc.lineCount, Number.MAX_SAFE_INTEGER);
        range = doc.validateRange(range);
        editor.edit((edit) => {
            edit.replace(range, text);
        });
    }
    /**
     * コメントを変換
     * @param text 処理対象
     * @param pre 行頭の文字列
     */
    correctRem(text, pre) {
        let re = new RegExp(`(^${pre}//=+$\n)+(${pre}//!.*$\n)+(${pre}//=+$\n)+`, "mg");
        let mid = new RegExp(`^${pre}//\!`);
        let midLen = pre.length + 3;
        let conv = text;
        let res;
        while ((res = re.exec(text)) !== null) {
            // 一致した全体
            let search = res[0];
            let replace = "";
            let lines = search.split("\n");
            // 最初の行
            replace += `${pre}/**\n`;
            // 最後の行の１つ前まで
            for (let i = 1; i < lines.length - 1; ++i) {
                let line = lines[i];
                if (line.match(mid)) {
                    // //! だったので * に変換
                    line = line.substr(midLen);
                    replace += `${pre} *${line}\n`;
                }
            }
            // 最後の行
            replace += `${pre} */\n`;
            conv = conv.replace(search, replace);
        }
        return conv;
    }
    /**
     * () を校正
     * @param text 処理対象
     * @return 処理後の文字列
     */
    correctParen(text) {
        // '( ' -> '(' 開き括弧の後ろのスペースを除去
        text = text.replace(/\(\s+/g, '(');
        // ' )' -> ')' 閉じ括弧の前のスペースを除去
        text = text.replace(/\s+\)/g, ')');
        //
        return text;
    }
}
//# sourceMappingURL=extension.js.map