# nekoaisle-command-menu

## 機能

任意のコマンドをメニュー表示し、選択したコマンドを実行します。

コマンドの選択時、メニューの先頭文字と一致する文字を入力すると即コマンドが実行されますので、nekoaisle.commandMenu を任意のキーに割り当てておくことにより２ストロークキーのような動作をさせることができます。

コマンドの選択は、メニュー先頭の1文字を入力した時、または、メニューからコマンドを選択してエンターを押し多彩です。

## 設定

```ts
"nekoaisle-commandMenu.menu": [
  {
    label: string;                  // メニューラベル
    detail?: string;                // 詳細
    description?: string;           // 説明
    command?: string;               // コマンド指定
    args?: { [key: string]: any };  // コマンド引数
    languageID?: string | string[]; // ファイルタイプ指定
    hide?: boolean;                 // メニューに表示しない
    }
]
```
### デフォルトの設定

```ts
  static defaults: ListItem[] = [
    {
      label: "/: ドキュメントをフォーマット",
      command: "editor.action.formatDocument"
    },
    {
      label: "[: 対応するタグにジャンプ" ,
      command: "editor.emmet.action.matchTag",
      languageID: "html",

    },
    {
      label: "\\: 文字コードを変更",
      command: "workbench.action.editor.changeEncoding"
    },
    {
      label: "]: 対応するカッコへジャンプ",
      command: "editor.action.jumpToBracket"
    },
    {
      label: "C: ターミナルにカーソルを移動",
      command: "workbench.action.terminal.focus"
    },
    {
      label: "E: 変換メニューを開く",
      command: "nekoaisle.encode"
    },
    {
      label: "F: ファイルを開く",
      command: "workbench.action.files.openFile"
    },
    {
      label: "H: 関連ファイルを開く",
      command: "nekoaisle.openRelated"
    },
    {
      label: "I: 定型文を挿入",
      command: "nekoaisle.insertCode"
    },
    {
      label: "K: 過去に開いことのあるファイルを開く",
      command: "nekoaisle.openHist"
    },
    {
      label: "L: ファイルを挿入",
      command: "nekoaisle.insertFile"
    },
    {
      label: "P: CPSS ウィザード",
      command: "nekoaisle.cpssWizard"
    },
    {
      label: "Q: 現在のエディタを閉じる",
      command: "workbench.action.closeActiveEditor"
    },
    {
      label: "R: 直前のカーソル位置にジャンプ",
      command: "nekoaisle.markjumpReturn"
    },
    {
      label: "S: 行ソート",
      command: "editor.action.sortLinesAscending"
    },
    {
      label: "T: タスクを実行",
      command: "workbench.action.tasks.runTask"
    },
    {
      label: "W: 一時ファイルを開く",
      command: "nekoaisle.openTemp"
    },
    {
      label: "X: ファイラーを開く",
      command: "nekoaisle.openFiler"
    },
    {
      label: "1〜9: 行ジャンプ",
    },
    {
      label: "1: 行ジャンプ",
      command: "nekoaisle.jumpToLineNumber1",
      hide: true,
    },
    {
      label: "2: 行ジャンプ",
      command: "nekoaisle.jumpToLineNumber2",
      hide: true,
    },
    {
      label: "3: 行ジャンプ",
      command: "nekoaisle.jumpToLineNumber3",
      hide: true,
    },
    {
      label: "4: 行ジャンプ",
      command: "nekoaisle.jumpToLineNumber4",
      hide: true,
    },
    {
      label: "5: 行ジャンプ",
      command: "nekoaisle.jumpToLineNumber5",
      hide: true,
    },
    {
      label: "6: 行ジャンプ",
      command: "nekoaisle.jumpToLineNumber6",
      hide: true,
    },
    {
      label: "7: 行ジャンプ",
      command: "nekoaisle.jumpToLineNumber7",
      hide: true,
    },
    {
      label: "8: 行ジャンプ",
      command: "nekoaisle.jumpToLineNumber8",
      hide: true,
    },
    {
      label: "9: 行ジャンプ",
      command: "nekoaisle.jumpToLineNumber9",
      hide: true,
    },
  ];
```
