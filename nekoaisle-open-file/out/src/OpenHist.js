'use strict';
const vscode = require("vscode");
const fs = require("fs");
const nekoaisle_1 = require("./nekoaisle.lib/nekoaisle");
/**
 * エクステンション本体
 */
class OpenHist extends nekoaisle_1.Extension {
    /**
     * 構築
     */
    constructor(context) {
        super(context, {
            name: '編集したことのあるファイルを開く',
            config: 'nekoaisle-openHist',
            commands: [
                {
                    command: 'nekoaisle.openHist',
                    callback: () => { this.exec(); }
                }, {
                    command: 'nekoaisle.openHistCompensateDate',
                    callback: () => { this.compensateDate(); }
                }
            ]
        });
        this.lineNos = {};
        // イベントハンドラーを登録
        let subscriptions = [];
        // ファイルが閉じられる時
        vscode.workspace.onDidCloseTextDocument(this.onDidCloseTextDocument, this, subscriptions);
        // カーソル位置が変わった(ファイルごとのカーソル位置を記憶するため)
        vscode.window.onDidChangeTextEditorSelection(this.onDidChangeTextEditorSelection, this, subscriptions);
        // create a combined disposable from both event subscriptions
        this.disposable = vscode.Disposable.from(...subscriptions);
    }
    /**
     * 履歴ファイルのファイル名取得
     * @return ファイル名
     */
    getHistFilename() {
        return this.getFilenameAccordingConfig('hist-file', 'openHist.json');
    }
    /**
     * 履歴ファイルの読み込み
     * @return 履歴配列
     */
    loadHistFile() {
        let fn = this.getHistFilename();
        // 履歴ファイルの読み込み
        return nekoaisle_1.Util.loadFileJson(fn);
    }
    /**
     * 履歴ファイルの保存
     * @param data 書き込むデータ
     */
    saveHistFile(data) {
        let fn = this.getHistFilename();
        // 履歴ファイルの書き込み
        nekoaisle_1.Util.saveFileJson(fn, data);
    }
    /**
     * カーソル位置が変わった(ファイルごとのカーソル位置を記憶するため)
     * onWillCloseTextDocumentが無いのでカーソル父が取れない
     */
    onDidChangeTextEditorSelection(e) {
        let name = e.textEditor.document.fileName;
        if (name.match(/^Untitled-[0-9]+/)) {
            // ファイル名が決まっていない時は何もしない
            return;
        }
        let lineNo = e.selections[0].anchor.line;
        this.lineNos[name] = lineNo;
    }
    /**
     * ファイルが閉じられたときのイベントハンドラ
     * @param doc テキストドキュメント
     */
    onDidCloseTextDocument(doc) {
        if (doc.fileName.match(/^Untitled-[0-9]+/)) {
            // ファイル名が決まっていない時は何もしない
            return;
        }
        // ファイル名を分解
        let pinfo = new nekoaisle_1.PathInfo(doc.fileName);
        // 行番号を確認
        if (typeof this.lineNos[pinfo.path] === "undefined") {
            /* おそらく[ファイル名+.git]というよくわからないファイル
               ファイルを閉じたあとにこのよくわからないファイルが閉
               じたイベントが発生する
               .git で終わるファイルを無視してもよいのだがこのよくわ
               からないファイルは onDidChangeTextEditorSelection イ
               ベントが発生しないようなので行番号が取れていなければ
               無視するようにした
            */
            return;
        }
        // 履歴ファイルを読み込む
        let list = this.loadHistFile();
        // このファイルの情報を取得
        let item = list[pinfo.path];
        if (!item) {
            // 新規
            item = {
                baseName: pinfo.info.base,
                dirName: pinfo.info.dir,
                lineNo: 0,
            };
            list[pinfo.path] = item;
        }
        // 現在の行番号を設定
        item.lineNo = this.lineNos[pinfo.path];
        // 現在時刻を設定
        item.lastDate = new nekoaisle_1.DateInfo().ymdhis;
        // 履歴を保存
        this.saveHistFile(list);
    }
    /**
     * エントリー
     */
    exec() {
        //
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        // 履歴ファイルの読み込み
        let dic = this.loadHistFile();
        let list = [];
        for (let key in dic) {
            list.push(dic[key]);
        }
        // ソート
        let sortType = this.getConfig('sort', 'modtime');
        let sortDir = (this.getConfig('sortDir', 'desc') === 'asc') ? 1 : -1;
        // modtime: 最終更新日時
        // filename: ファイル名
        // pathname: パス名
        switch (sortType) {
            // 最終更新日時
            case 'modtime': {
                list.sort(function (a, b) {
                    let ret;
                    if (a.lastDate < b.lastDate) {
                        ret = -1;
                    }
                    else if (a.lastDate > b.lastDate) {
                        ret = 1;
                    }
                    else {
                        ret = 0;
                    }
                    return ret * sortDir;
                });
                break;
            }
            // ファイル名
            case 'filename': {
                // 大文字小文字を区別せずファイル名でソート
                // ファイル名が同じならディレクトリー名でソート
                list.sort(function (a, b) {
                    let ret;
                    let a1 = (`${a.baseName} ${a.dirName}`).toUpperCase();
                    let b1 = (`${b.baseName} ${b.dirName}`).toUpperCase();
                    if (a1 < b1) {
                        ret = -1;
                    }
                    else if (a1 > b1) {
                        ret = 1;
                    }
                    else {
                        ret = 0;
                    }
                    return ret * sortDir;
                });
                break;
            }
            // パス名
            case 'pathname': {
                // 大文字小文字を区別せずパス名でソート
                list.sort(function (a, b) {
                    let ret;
                    let a1 = (`${a.dirName}/${a.baseName}`).toUpperCase();
                    let b1 = (`${b.dirName}/${b.baseName}`).toUpperCase();
                    if (a1 < b1) {
                        ret = -1;
                    }
                    else if (a1 > b1) {
                        ret = 1;
                    }
                    else {
                        ret = 0;
                    }
                    return ret * sortDir;
                });
                break;
            }
        }
        // メニューを作成
        let menu = [];
        for (let item of list) {
            menu.push({
                label: item.baseName,
                // detail: key,
                description: item.dirName
            });
        }
        // メニュー選択
        let options = {
            placeHolder: '選択してください。',
            matchOnDetail: false,
            matchOnDescription: false
        };
        vscode.window.showQuickPick(menu, options).then((sel) => {
            if (!sel) {
                // 未選択
                return;
            }
            // ファイル名を復元
            let file = `${sel.description}/${sel.label}`;
            // ファイルを開く
            vscode.workspace.openTextDocument(file).then((doc) => {
                // ファイルが開いた
                vscode.window.showTextDocument(doc).then((editor) => {
                    // 表示された
                    let pos = new vscode.Position(dic[file].lineNo, 0);
                    editor.selection = new vscode.Selection(pos, pos);
                });
            });
        });
    }
    /**
     * 日付を補完する
     */
    compensateDate() {
        let hists = this.loadHistFile();
        let makes = {};
        let mods = 0; // 変更数
        let dels = 0; // 削除
        for (let key in hists) {
            let hist = hists[key];
            // ファイル名を復元
            let fileName = `${hist.dirName}/${hist.baseName}`;
            // ファイル情報を取得
            if (fs.existsSync(fileName)) {
                // 存在する
                if (!hist.lastDate) {
                    // 最終更新日時が記録されていない
                    // ファイル情報を取得
                    let stat = fs.statSync(fileName);
                    // 最終更新日時取得
                    let mtime = new nekoaisle_1.DateInfo(stat.mtime);
                    // 設定
                    hist.lastDate = mtime.format('%Y/%M/%D %H:%I:%S');
                    // 保存
                    makes[fileName] = hist;
                    // 更新数をカウントアップ
                    ++mods;
                }
            }
            else {
                // ファイルが存在しない
                ++dels;
            }
        }
        let messs = [];
        if (mods) {
            let cnt = nekoaisle_1.Util.formatNumber(mods);
            messs.push(`${cnt}個のファイルの最終更新日を設定しました。`);
        }
        if (dels) {
            let cnt = nekoaisle_1.Util.formatNumber(dels);
            messs.push(`${cnt}個のファイルが見つかりませんでした。`);
        }
        let mess;
        if (messs.length > 0) {
            // 変更されているので保存
            this.saveHistFile(makes);
            mess = messs.join("\n");
        }
        else {
            mess = '最終更新日時の設定されていないファイルはありませんでした。';
        }
        nekoaisle_1.Util.putMess(mess);
    }
}
module.exports = OpenHist;
//# sourceMappingURL=OpenHist.js.map