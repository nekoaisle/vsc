"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const Util_1 = require("./Util");
/**
 * ファイル選択
 * @param dirName ディレクトリー名
 * @param title タイトル
 * @return プロミス
 */
class SelectFile {
    /**
     * ファイル選択
     * @param dirName ディレクトリー名
     */
    selectFile(dirName, title) {
        return new Promise((resolve, reject) => {
            // 非同期の処理
            let files;
            try {
                files = fs.readdirSync(dirName)
                    // ディレクトリ名の末尾に / を付ける
                    .map((name) => {
                    let statas = fs.statSync(path.join(dirName, name));
                    if (statas.isDirectory()) {
                        name += '/';
                    }
                    return name;
                })
                    // 並べ替える
                    .sort((a, b) => {
                    // ディレクトリーか調べる
                    let da = a.substr(-1) === '/';
                    let db = b.substr(-1) === '/';
                    if (da !== db) {
                        // どちらかかがディレクトリ
                        return da ? -1 : 1;
                    }
                    else {
                        // 両方ディレクトリかファイルなので名前で比較
                        a = a.toLocaleUpperCase();
                        b = b.toLocaleUpperCase();
                        return (a < b) ? -1 : (a > b) ? 1 : 0;
                    }
                });
                if (dirName !== '/') {
                    // ルートディレクトリでなければ先頭に ../ を追加
                    files.unshift('../');
                }
            }
            catch (e) {
                Util_1.Util.putMess(`${dirName} が開けませんでした。`);
                return;
            }
            // ファイルを選択
            let popt = {
                prompt: title,
                placeHolder: dirName,
            };
            vscode.window.showQuickPick(files, popt)
                .then((sel) => {
                if (!sel) {
                    // ファイルが指定されなかったときは完了(then()を実行)
                    resolve('');
                }
                else {
                    // ディレクトリ名と結合
                    let fn = path.join(dirName, sel);
                    // 絶対パスに変換
                    fn = Util_1.Util.normalizePath(fn); // 絶対パスにする
                    // ディレクトリーか調べる
                    let stats = fs.statSync(fn);
                    if (!stats.isDirectory()) {
                        // ファイルなので完了(then()を実行)
                        resolve(fn);
                    }
                    else {
                        // ディレクトリーなら選択を続行
                        this.selectFile(fn, title).then((value) => {
                            resolve(value);
                        });
                    }
                }
            });
        });
    }
}
exports.SelectFile = SelectFile;
//# sourceMappingURL=SelectFile.js.map