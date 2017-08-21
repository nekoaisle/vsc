"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
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
        return this.config.get(key, def);
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
}
exports.Extension = Extension;
//# sourceMappingURL=Extension.js.map