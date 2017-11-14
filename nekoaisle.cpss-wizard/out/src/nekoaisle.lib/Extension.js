"use strict";
const vscode = require("vscode");
const path = require("path");
const Util_1 = require("./Util");
;
;
;
/**
 * 拡張機能基本クラス
 */
class Extension {
    /**
     * 構築
     * @param name 拡張機能名
     * @param cmd  contributes.commands.command
     */
    constructor(context, options) {
        //		console.log(`${options.name} が起動しました。`);
        // この拡張機能が格納されているディレクトリ名
        this.extensionRoot = context.extensionPath;
        // 設定の読み込み
        if (options.config) {
            this.config = vscode.workspace.getConfiguration(options.config);
        }
        // コマンドがあれば登録
        if (options.commands) {
            this.registerCommands(context, options.commands);
        }
    }
    /**
     * settings.json からこの拡張機能用の設定を取得
     * @param key 設定名
     * @param def 設定されていないときに返す値
     * @return string 設定
     */
    getConfig(key, def) {
        let ret = this.config.get(key, def);
        if (ret) {
            return ret;
        }
        return def;
    }
    /**
     * コマンドを登録
     * @param context
     * @param ext
     */
    registerCommand(context, command, callback) {
        let disp = vscode.commands.registerCommand(command, callback);
        context.subscriptions.push(disp);
    }
    /**
     * コマンドを登録
     * @param context
     * @param ext
     */
    registerCommands(context, commands) {
        for (let cmd of commands) {
            let disp = vscode.commands.registerCommand(cmd.command, cmd.callback);
            context.subscriptions.push(disp);
        }
    }
    /**
     * 拡張機能フォルダー内に格納されているファイル名をフルパスにする
     * @param filename ファイル名
     */
    joinExtensionRoot(filename) {
        return path.join(this.extensionRoot, filename);
    }
    /**
     * テンプレート格納ディレクトリ名を取得
     * @param dirName ディレクトリ名
     * @param settingsKey settings.json のサブキー
     * @return string テンプレート格納ディレクトリ名
     */
    getConfigDir(dirName, settingsKey) {
        // デフォルトのテンポラリディレクトリ名
        let res = this.joinExtensionRoot(dirName);
        // settings.json よりテンプレートディレクトリを取得
        res = this.getConfig(settingsKey, res);
        // 先頭の ~ を置換
        res = Util_1.Util.normalizePath(res);
        //
        return res;
    }
    /**
     * 複数挿入
     * @param editor 対象エディター
     * @param pos 編集座標
     * @param str 挿入文字列
     * @param ary 編集情報配列
     */
    syncInsert(editor, ary) {
        // 非同期編集を実行
        let i = 0;
        let e = (pos, str) => {
            // 大文字・小文字変換した文字と置換
            editor.edit(edit => edit.insert(pos, str)).then((val) => {
                if (val) {
                    ++i;
                    if (ary[i]) {
                        e(ary[i].pos, ary[i].str);
                    }
                }
            });
        };
        e(ary[i].pos, ary[i].str);
    }
    /**
     * 複数置換
     * @param editor 対象エディター
     * @param pos 編集座標
     * @param str 挿入文字列
     * @param ary 編集情報配列
     */
    syncReplace(editor, ary) {
        // 非同期編集を実行
        let i = 0;
        let e = (sel, str) => {
            // 大文字・小文字変換した文字と置換
            editor.edit(edit => edit.replace(sel, str)).then((val) => {
                if (val) {
                    ++i;
                    if (ary[i]) {
                        e(ary[i].range, ary[i].str);
                    }
                }
            });
        };
        e(ary[i].range, ary[i].str);
    }
}
exports.Extension = Extension;
//# sourceMappingURL=Extension.js.map