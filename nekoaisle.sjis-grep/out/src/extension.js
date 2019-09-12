/**
 * SJIS Grep
 *
 * filename:  extension.ts
 *
 * @package
 * @version   1.0.0
 * @copyright Copyright (C) 2017 Yoshio Kiya All rights reserved.
 * @date      2017-08-30
 * @author    木屋善夫
 */
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
 * SJIS Grep
 */
class MyExtention extends nekoaisle_1.Extension {
    /**
     * 構築
     */
    constructor(context) {
        super(context, {
            name: 'SJIS Grep',
            config: '',
            commands: [
                {
                    command: 'nekoaisle.grepSjis',
                    callback: () => {
                        this.exec();
                    }
                }
            ]
        });
    }
    /**
     * 実行
     */
    exec() {
        // 出力ウィンドウの生成
        var overview = vscode.window.createOutputChannel("grep-sjis");
        // 出力ウィンドウをクリア
        overview.clear();
        let opt = {
            placeHolder: '検索するキーワード'
        };
        vscode.window.showInputBox(opt).then((keyword) => {
            let cmd = `LANG=ja_JP.sjis;find ./ -name *.php | xargs grep -rn \`echo "${keyword}" | nkf -s\` * | nkf -w`;
            nekoaisle_1.Util.putLog(cmd);
            let res = nekoaisle_1.Util.execCmd(cmd);
            overview.append(res);
            overview.show();
        });
    }
    test() {
    }
}
//# sourceMappingURL=extension.js.map