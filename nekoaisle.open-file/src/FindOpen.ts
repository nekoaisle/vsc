'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import {Extension, Util, PathInfo} from './nekoaisle.lib/nekoaisle';

/**
 * エクステンション本体
 */
class FindOpen extends Extension {
  /**
   * 構築
   */
  constructor(context: vscode.ExtensionContext) {
    super(context, {
      name: '検索して開く',
      config: 'nekoaisle-findOpen',
      commands: [
        {
          command: 'nekoaisle.findOpen',
          callback: () => { this.exec(); }
        }
      ]
    });
  }

  /**
   * エントリー
   */
  public exec() {
    // 基準ディレクトリを決める
    let cwd = Util.getWorkFolder();

    // ファイル名を入力
    vscode.window.showInputBox({
      placeHolder: '検索するファイル名を入力してください。',
      prompt: `絶対パスまたは ${cwd} からの相対で指定してください。`
    }).then((file: string) => {
      if (!file || (file.length <= 0)) {
        return;
      }

      // ファイル名を補正
      file = Util.normalizePath(file, vscode.workspace.rootPath);

      // ファイルを検索
      let files = this.findFile(file);
      if (files.length <= 0) {
        return;
      }

      // メニュ作成
      let menu: vscode.QuickPickItem[] = [];
      for (let file of files) {
        let pinfo = new PathInfo(file);
        menu.push({
          label: pinfo.info.base,
          description: pinfo.path,
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

        Util.openFile(sel.description, false);
      });
    });
  }

  public findFile(filename: string): string[] {
    let pinfo = new PathInfo(filename, vscode.workspace.rootPath);
    // let cmd = `find ${pinfo.info.dir} -type f -name "${pinfo.info.base}" ! -path "*/instemole-php/*"`;
    let cmd = `find ${pinfo.info.dir} -type f -name "${pinfo.info.base}"`;
    let res = Util.execCmd(cmd);
    res = res.trim();
    if (res) {
      return res.split("\n");
    } else {
      return [];
    }
  }
}

export = FindOpen;