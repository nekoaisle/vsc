'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import {Extension, Util, SelectFile, PathInfo} from './nekoaisle.lib/nekoaisle';

/**
 * エクステンション本体
 */
class OpenTag extends Extension {
  /**
   * 構築
   */
  constructor(context: vscode.ExtensionContext) {
    super(context, {
      name: 'タグジャンプ',
      config: 'nekoaisle-openTag',
      commands: [
        {
          command: 'nekoaisle.openTag',
          callback: () => { this.exec(); }
        }
      ]
    });
  }

  /**
   * エントリー
   */
  public exec() {
    // アクティブなエディター取得
    let editor = vscode.window.activeTextEditor;
    let cwd = vscode.workspace.rootPath;

    // 文字列が選択されていたらその文字列のファイルを開く
    let range = editor.selection;
    if (!range.isEmpty) {
      // 範囲選択されている
      let file = editor.document.getText(range);
      Util.tagJump(file, cwd);
    } else {
      // ファイル名を入力
      vscode.window.showInputBox({
        placeHolder: 'タグジャンプを入力してください。',
        prompt: `絶対パスまたは${cwd}からの相対で指定してください。`
      }).then((file: string) => {
        if ( file.length > 0 ) {
          Util.tagJump(file, cwd);
        }
      });
    }
  }
}

export = OpenTag;