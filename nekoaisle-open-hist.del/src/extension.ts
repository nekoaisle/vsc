'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { Util, Extension, PathInfo, DateInfo } from './nekoaisle.lib/nekoaisle';
import { deflateSync } from 'zlib';
/**
 * エクステンション活性化
 * @param context 
 */
export function activate(context: vscode.ExtensionContext) {
  let ext = new MyExtension(context);
}

/**
 * 非活性化
 */
export function deactivate() {
}

interface ListItem {
  baseName: string;
  dirName: string;
  lineNo: number;     // 行番号
  lastDate?: string;   // 最終保存日
}

interface ListItemDic {
  [key: string]: ListItem;
}

/**
 * エクステンション本体
 */
class MyExtension extends Extension {
  protected disposable: vscode.Disposable;

  /**
   * 構築
   */
  constructor(context: vscode.ExtensionContext) {
    super(context, {
      name: '編集したことのあるファイルを開く',
      config: 'nekoaisle-openHist',	// 通常はコマンドのサフィックス
      commands: [
        {
          command: 'nekoaisle.openHist',	// コマンド
          callback: () => { this.exec(); }
        },{
          command: 'nekoaisle.openHistCompensateDate',	// コマンド
          callback: () => { this.compensateDate(); }
        }
      ]
    });

    // イベントハンドラーを登録
    let subscriptions: vscode.Disposable[] = [];

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
  protected getHistFilename(): string {
    return this.getFilenameAccordingConfig('hist-file', 'openHist.json');
  }

  /**
   * 履歴ファイルの読み込み
   * @return 履歴配列
   */
  protected loadHistFile(): ListItemDic {
    let fn = this.getHistFilename();
    // 履歴ファイルの読み込み
    return Util.loadFileJson(fn);
  }

  /**
   * 履歴ファイルの保存
   * @param data 書き込むデータ
   */
  protected saveHistFile(data: any) {
    let fn = this.getHistFilename();
    // 履歴ファイルの書き込み
    Util.saveFileJson(fn, data);
  }

  protected lineNos: { [key: string]: number } = {};
  /**
   * カーソル位置が変わった(ファイルごとのカーソル位置を記憶するため)
   * onWillCloseTextDocumentが無いのでカーソル父が取れない
   */
  protected onDidChangeTextEditorSelection(e: vscode.TextEditorSelectionChangeEvent) {
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
  protected onDidCloseTextDocument(doc: vscode.TextDocument) {
    if (doc.fileName.match(/^Untitled-[0-9]+/)) {
      // ファイル名が決まっていない時は何もしない
      return;
    }

    // ファイル名を分解
    let pinfo = new PathInfo(doc.fileName);
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
    let list: ListItemDic = this.loadHistFile();

    // このファイルの情報を取得
    let item: ListItem = list[pinfo.path];
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
    item.lastDate = new DateInfo().ymdhis;

    // 履歴を保存
    this.saveHistFile(list);
  }

  /**
   * エントリー
   */
  public exec() {
    //
    let editor = <vscode.TextEditor>vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    
    // 履歴ファイルの読み込み
    let dic: ListItemDic = this.loadHistFile();
    let list: ListItem[] = [];
    for (let key in dic) {
      list.push(dic[key]);
    }

    // ソート
    let sortType: string = this.getConfig('sort', 'modtime');
    let sortDir: number = (<string>this.getConfig('sortDir', 'desc') === 'asc') ? 1 : -1;
    // modtime: 最終更新日時
    // filename: ファイル名
    // pathname: パス名
    switch (sortType) {
      // 最終更新日時
      case 'modtime': {
        list.sort(function (a, b): number {
          let ret: number;
          if (a.lastDate < b.lastDate) {
            ret = -1;
          } else if (a.lastDate > b.lastDate) {
            ret = 1;
          } else {
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
        list.sort(function (a, b): number {
          let ret: number;
          let a1 = (`${a.baseName} ${a.dirName}`).toUpperCase();
          let b1 = (`${b.baseName} ${b.dirName}`).toUpperCase();
          if (a1 < b1) {
            ret = -1;
          } else if (a1 > b1) {
            ret = 1;
          } else {
            ret = 0;
          }
          return ret * sortDir;
        });
        break;
      }
      // パス名
      case 'pathname': {
        // 大文字小文字を区別せずパス名でソート
        list.sort(function (a, b): number {
          let ret: number;
          let a1 = (`${a.dirName}/${a.baseName}`).toUpperCase();
          let b1 = (`${b.dirName}/${b.baseName}`).toUpperCase();
          if (a1 < b1) {
            ret = -1;
          } else if (a1 > b1) {
            ret = 1;
          } else {
            ret = 0;
          }
          return ret * sortDir;
        });
        break;
      }
    }

    // メニューを作成
    let menu: vscode.QuickPickItem[] = [];
    for (let item of list) {
      menu.push({
        label: item.baseName,
        // detail: key,
        description: item.dirName
      });
    }

    // メニュー選択
    let options: vscode.QuickPickOptions = {
      placeHolder: '選択してください。',
      matchOnDetail: false,
      matchOnDescription: false
    };
    vscode.window.showQuickPick(menu, options).then((sel: vscode.QuickPickItem) => {
      if (!sel) {
        // 未選択
        return;
      }
      // ファイル名を復元
      let file: string = `${sel.description}/${sel.label}`;

      // ファイルを開く
      vscode.workspace.openTextDocument(file).then((doc: vscode.TextDocument) => {
        // ファイルが開いた
        vscode.window.showTextDocument(doc).then((editor: vscode.TextEditor) => {
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
  public compensateDate() {
    let hists = this.loadHistFile();
    let makes: ListItemDic = {};
    let mods = 0;   // 変更数
    let dels = 0;   // 削除
    for (let key in hists) {
      let hist = hists[key];
      // ファイル名を復元
      let fileName: string = `${hist.dirName}/${hist.baseName}`;
      // ファイル情報を取得
      if (fs.existsSync(fileName)) {
        // 存在する
        if (!hist.lastDate) {
          // 最終更新日時が記録されていない
          // ファイル情報を取得
          let stat = fs.statSync(fileName);
          // 最終更新日時取得
          let mtime = new DateInfo(stat.mtime);
          // 設定
          hist.lastDate = mtime.format('%Y/%M/%D %H:%I:%S');
          // 保存
          makes[fileName] = hist;
          // 更新数をカウントアップ
          ++mods;
        }
      } else {
        // ファイルが存在しない
        ++dels;
      }
    }

    let messs: string[] = [];
    if (mods) {
      let cnt = Util.formatNumber(mods);
      messs.push(`${cnt}個のファイルの最終更新日を設定しました。`);
    }
    if (dels) {
      let cnt = Util.formatNumber(dels);
      messs.push(`${cnt}個のファイルが見つかりませんでした。`);
    }
    
    let mess: string;
    if (messs.length > 0) {
      // 変更されているので保存
      this.saveHistFile(makes);
      mess = messs.join("\n");
    } else {
      mess = '最終更新日時の設定されていないファイルはありませんでした。';
    }
    Util.putMess(mess);
  }
  
}
