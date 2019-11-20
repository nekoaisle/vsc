'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const nekoaisle_1 = require("./nekoaisle.lib/nekoaisle");
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
 * マルチクリップボード
 *
 * filename:  extension.ts
 *
 * @package
 * @version   1.0.0
 * @copyright Copyright (C) 2019 Yoshio Kiya All rights reserved.
 * @date      2019-11-19
 * @author    木屋善夫
 */
class MyExtention extends nekoaisle_1.Extension {
    /**
     * 構築
     */
    constructor(context) {
        super(context, {
            name: 'マルチクリップボード',
            config: '',
            commands: [
                { command: 'nekoaisle.multiClipboard.menu', callback: () => { this.menu(); } },
                { command: 'nekoaisle.multiClipboard..copy', callback: () => { this.copy(); } },
                { command: 'nekoaisle.multiClipboard..paste', callback: () => { this.paste(); } },
                { command: 'nekoaisle.multiClipboard..push', callback: () => { this.push(); } },
                { command: 'nekoaisle.multiClipboard..pop', callback: () => { this.pop(); } }
            ]
        });
        // クリップボード
        this.clipbords = {};
        for (let n = 0; n < 10; ++n) {
            let key = n.toString();
            this.clipbords[key] = [];
        }
    }
    /**
     * メニューを表示
     */
    menu() {
        let menu = [
            {
                label: 'c',
                description: 'copy コピー'
            },
            {
                label: 'x',
                description: 'cut カット'
            },
            {
                label: 'v',
                description: 'paset ペースト'
            },
            {
                label: 'a',
                description: 'add スロット末尾に追加'
            },
            {
                label: 'u',
                description: 'push スロット末尾に追加して削除'
            },
            {
                label: 'o',
                description: 'pop スロット末尾をペーストして削除'
            },
        ];
        let options = {
            placeHolder: 'コマンドを選択してください。'
        };
        let _this = this;
        const exec = (key) => {
            switch (key) {
                case 'c':
                    _this.copy();
                    return true;
                case 'x':
                    _this.cut();
                    return true;
                case 'v':
                    _this.paste();
                    return true;
                case 'a':
                    _this.add();
                    return true;
                case 'u':
                    _this.push();
                    return true;
                case 'o':
                    _this.pop();
                    return true;
            }
            return false;
        };
        // QuickPick オブジェクトを作成
        const quickPick = vscode.window.createQuickPick();
        quickPick.items = menu;
        quickPick.placeholder = '選択してください。';
        quickPick.matchOnDetail = false;
        quickPick.matchOnDescription = false;
        /**
         * 入力文字列が変更された処理設定
         */
        quickPick.onDidChangeValue((value) => {
            if (value.length === 0) {
                return;
            }
            // 先頭１文字を取得
            let char = value.substr(0, 1);
            // 全角→半角に変換
            char = this.zenToHan(char);
            // 実行
            if (exec(char)) {
                // 実行したのでクイックピックを閉じる
                quickPick.hide();
            }
        });
        /**
         * エンターを押した処理設定
         */
        quickPick.onDidAccept(() => {
            let picks = quickPick.selectedItems;
            if (picks.length === 1) {
                let pick = picks[0];
                if (pick) {
                    // 選択しているので実行
                    exec(pick.label.substr(0, 1));
                }
            }
            // エンター押した場合は必ず閉じる
            quickPick.hide();
        });
        // 非表示にしたら破棄設定
        quickPick.onDidHide(() => quickPick.dispose());
        // 開く
        quickPick.show();
    }
    /**
     * 選択範囲もしくは行を指定スロットにコピー
     */
    copy() {
        /**
         * コピー処理
         * @param slot スロット名
         * @param editor エディター
         */
        const job = (key, editor) => {
            if (this.clipbords[key] === undefined) {
                // そんな名前のスロットはない
                return false;
            }
            // 全カーソル位置の文字列を取得
            let clipbord = this.getText(editor);
            // 保存
            this.clipbords[key] = clipbord;
            // 
            return true;
        };
        // スロットを選択
        this.showQuickPick(true, job);
    }
    /**
     * 選択範囲もしくは行を指定スロットにコピーして削除
     */
    cut() {
        /**
         * コピー処理
         * @param slot スロット名
         * @param editor エディター
         */
        const job = (key, editor) => {
            if (this.clipbords[key] === undefined) {
                // そんな名前のスロットはない
                return false;
            }
            // 全カーソル位置の文字列を取得
            let clipbord = this.getText(editor);
            // 保存
            this.clipbords[key] = clipbord;
            // 対象文字列を削除
            this.delText(editor);
            //
            return true;
        };
        // スロットを選択
        this.showQuickPick(true, job);
    }
    /**
     * 選択範囲もしくは行を指定スロットに追加
     */
    add() {
        /**
         * コピー処理
         * @param slot スロット名
         * @param editor エディター
         */
        const job = (slot, editor) => {
            // 全カーソル位置の文字列を取得
            let clipbord = this.getText(editor);
            // 保存
            this.clipbords[slot] = this.clipbords[slot].concat(clipbord);
            // 
            return true;
        };
        // スロットを選択
        this.showQuickPick(true, job);
    }
    /**
     * 選択範囲もしくは行を指定スロットに追加して削除
     */
    push() {
        /**
         * コピー処理
         * @param slot スロット名
         * @param editor エディター
         */
        const job = (slot, editor) => {
            if (this.clipbords[slot].length === 0) {
                // そのスロットは空
                return false;
            }
            // 全カーソル位置の文字列を取得
            let clipbord = this.getText(editor);
            // 保存
            this.clipbords[slot] = this.clipbords[slot].concat(clipbord);
            // 対象文字列を削除
            this.delText(editor);
            //
            return true;
        };
        // スロットを選択
        this.showQuickPick(true, job);
    }
    /**
     * 指定スロットを貼り付け
     */
    paste() {
        /**
         * コピー処理
         * @param slot スロット名
         * @param editor エディター
         */
        const job = (slot, editor) => {
            let clipboard = this.clipbords[slot];
            if (clipboard.length === 0) {
                // そのスロットは空
                return false;
            }
            // 行を現在のドキュメント改行コードで連結
            const cr = nekoaisle_1.Util.getEndOfLine(editor);
            let text = clipboard.join(cr);
            if (cr !== "\n") {
                // 改行コードが\n でない時は変換
                text = text.replace("\n", cr);
            }
            // 挿入または置換
            this.putText(editor, text);
            //
            return true;
        };
        // スロットを選択
        this.showQuickPick(false, job);
    }
    /**
     * 指定スロットの末尾を貼り付けて削除
     */
    pop() {
        /**
         * コピー処理
         * @param slot スロット名
         * @param editor エディター
         */
        const job = (slot, editor) => {
            let clipboard = this.clipbords[slot];
            if (clipboard.length === 0) {
                // そのスロットは空
                return false;
            }
            // 行を現在のドキュメント改行コードで連結
            let text = clipboard.pop();
            if (text) {
                // 挿入または置換
                let cr = nekoaisle_1.Util.getEndOfLine(editor);
                if (cr !== "\n") {
                    // 改行コードが\n でない時は変換
                    text = text.replace("\n", cr);
                }
                this.putText(editor, text);
            }
            // 
            return true;
        };
        // スロットを選択
        this.showQuickPick(false, job);
    }
    /**
     * カーソル位置の文字列を取得
     *
     * @param editor 対象エディター
     */
    getText(editor) {
        const cr = nekoaisle_1.Util.getEndOfLine(editor);
        // 全カーソル位置を処理
        let ret = [];
        for (let sel of editor.selections) {
            let text;
            if (!sel.isEmpty) {
                // 選択範囲を取得
                text = editor.document.getText(sel);
                // 改行文字が\n 以外ならば変換
                if (cr !== "\n") {
                    text = text.replace(cr, "\n");
                }
            }
            else {
                // 範囲指定がなければ行全体
                text = editor.document.lineAt(sel.anchor.line).text;
            }
            // 追加
            ret.push(text);
        }
        return ret;
    }
    /**
     * カーソル位置に文字列を挿入/置換
     *
     * @param editor 対象エディター
     */
    putText(editor, text) {
        // すべてのカーソルについて処理
        for (let sel of editor.selections) {
            // 選択範囲を置換
            editor.edit(function (edit) {
                if (sel.isEmpty) {
                    // 選択していないので貼り付け
                    edit.insert(sel.anchor, text);
                }
                else {
                    // 選択範囲と置換
                    // edit.replace だと選択されたままになる
                    edit.delete(sel);
                    edit.insert(sel.start, text);
                }
            });
        }
    }
    /**
     * カーソル位置の文字列を削除
     *
     * @param editor 対象エディター
     */
    delText(editor) {
        // すべてのカーソルについて処理
        for (let sel of editor.selections) {
            // 選択範囲を置換
            editor.edit(function (edit) {
                if (sel.isEmpty) {
                    // 選択していないので行を削除
                    let line = sel.anchor.line;
                    let range = new vscode.Range(line, 0, line + 1, 0);
                    edit.delete(range);
                }
                else {
                    // 選択範囲を削除
                    edit.delete(sel);
                }
            });
        }
    }
    /**
     * クリップボードスロット選択
     * @param allowBlank 空行を許可する
     * @return QuickPick
     */
    showQuickPick(allowBlank, callback) {
        // メーニューを作成
        let menu = [];
        for (let key in this.clipbords) {
            let item = {
                label: key,
            };
            let clipbord = this.clipbords[key];
            if (clipbord.length > 0) {
                // 保存されているので説明などを設定
                // 説明は最初の空でない行の先頭64文字
                let desc = "";
                for (let line of clipbord) {
                    // トリム
                    let l = line.trim();
                    if (l.length > 0) {
                        // 空行ではない
                        desc = l;
                        break;
                    }
                }
                switch (desc.length) {
                    case 0: {
                        // 空行のみだった
                        desc = `${clipbord.length}行の空行`;
                        break;
                    }
                    case 1: {
                        // 1行のみ
                        desc = desc.substr(0, 64);
                        break;
                    }
                    default: {
                        // 複数行
                        desc = desc.substr(0, 32);
                        desc = ` ${desc} (${clipbord.length}行)`;
                        break;
                    }
                }
                item.description = desc;
                // 詳細は最初の5行
                // item.detail = lines.slice(0, 5).join("\n");
            }
            else if (!allowBlank) {
                // 空行許可が指定されていない
                continue;
            }
            menu.push(item);
        }
        // QuickPick オブジェクトを作成
        const quickPick = vscode.window.createQuickPick();
        quickPick.placeholder = 'スロットを選択してください。';
        quickPick.items = menu;
        quickPick.matchOnDetail = false;
        quickPick.matchOnDescription = false;
        // エンターを押した処理を設定
        quickPick.onDidAccept(() => {
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                // アクティブエディターは必須
                let picks = quickPick.selectedItems;
                if (picks.length === 1) {
                    let slot = picks[0].label;
                    if (this.clipbords[slot]) {
                        // スロット名は有効なので実行
                        callback(slot, editor);
                    }
                }
            }
            // エンター押した場合は必ず閉じる
            quickPick.hide();
        });
        /**
         * 入力文字列が変更された処理設定
         */
        quickPick.onDidChangeValue((value) => {
            if (value.length === 0) {
                return;
            }
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                // 先頭１文字を取得
                let slot = value.substr(0, 1);
                // 全角→半角に変換
                slot = this.zenToHan(slot);
                if (this.clipbords[slot]) {
                    // スロット名は有効なので実行
                    if (callback(slot, editor)) {
                        // 実行したのでクイックピックを閉じる
                        quickPick.hide();
                    }
                }
            }
        });
        // 非表示にしたら破棄設定
        quickPick.onDidHide(() => quickPick.dispose());
        // 開く
        quickPick.show();
        // 作成した QuickPick を返す
        return quickPick;
    }
    /**
     * 全角文字を半角文字に変換（キー入力専用）
     * @param zen 全角文字
     */
    zenToHan(zen) {
        // 変換辞書
        const zenHanDic = {
            "０": "0", "１": "1", "２": "2", "３": "3", "４": "4",
            "５": "5", "６": "6", "７": "7", "８": "8", "９": "9",
            "ａ": "a", "ｂ": "b", "ｃ": "c", "ｄ": "d", "ｅ": "e", "ｆ": "f",
            "ｇ": "g", "ｈ": "h", "ｉ": "i", "ｊ": "j", "ｋ": "k", "ｌ": "l",
            "ｍ": "m", "ｎ": "n", "ｏ": "o", "ｐ": "p", "ｑ": "q", "ｒ": "r",
            "ｓ": "s", "ｔ": "t", "ｕ": "u", "ｖ": "v", "ｗ": "w", "ｘ": "x",
            "ｙ": "y", "ｚ": "z",
            "ー": "-", "＾": "^", "￥": "\\", "＠": "@", "「": "[", "；": ";",
            "：": ":", "」": "]", "、": ",", "。": ".", "・": "/", "＿": "_",
            "！": "!", "”": "\"", "＃": "#", "＄": "$", "％": "%", "＆": "&",
            "’": "'", "（": "(", "）": ")", "＝": "=", "〜": "~", "｜": "|",
            "｀": "`", "｛": "{", "＋": "+", "＊": "*", "｝": "}", "＜": "<",
            "＞": ">", "？": "?",
            "あ": "a", "い": "i", "う": "u", "え": "e", "お": "o",
        };
        let han = '';
        for (let i = 0; i < zen.length; ++i) {
            let c = zen.charAt(i);
            if (zenHanDic[c]) {
                han += zenHanDic[c];
            }
            else {
                // 辞書にないのでそのまま
                han += c;
            }
        }
        return han;
    }
}
//# sourceMappingURL=extension.js.map