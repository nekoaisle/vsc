# nekoaisle用 VSCode 拡張機能

|        ディレクトリ名         |                      機能                      |
| ----------------------------- | ---------------------------------------------- |
| nekoaisle-command-menu        | メニューから選択してコマンド実行               |
| nekoaisle-disp-char-code      | カーソル位置の文字コード表示                   |
| nekoaisle-encode              | 選択範囲等を各種エンコード                     |
| nekoaisle-highlight-tsv       | TSVファイル用ハイライト                        |
| nekoaisle-insert-code         | コードテンプレートを挿入                       |
| nekoaisle-jump-to-line-number | 行番号ジャンプ                                 |
| nekoaisle-mark-jump           | 行マーク＆ジャンプ                             |
| nekoaisle-open-file           | ファイルを開く関連詰め合わせ                   |
| nekoaisle-open-filer          | 編集中のファイルのディレクトリをファイラで開く |
| nekoaisle-open-help           | 拡張子ごとのURLを開く                          |
| nekoaisle-open-previous-tab   | 前回編集していたタブを開く                     |
| nekoaisle-select-word         | カーソル位置の単語を選択                       |
| nekoaisle-toggle-char-case    | 大文字・小文字変換                             |
| nekoaisle.lib                 | TypeScript用library                            |
| nekoaisle.sjis-grep           | 残骸                                           |
| nekoaisle.wz-editor-memo-file | 残骸                                           |
| User/keybindings.json         | キーバインディング                             |
| User/snippets                 | 各種スニペット                                 |
| nekoaisle-cpss-decorator      | CPSS用Htmlデコレータ                           |
| nekoaisle-cpss-log-highlight  | CPSSログファイル用ハイライト                   |
| nekoaisle-cpss-wizard         | CPSS用コードウィザート                         |

自分用に作成した拡張機能です。ソースごと公開しますのでご自由にお使いください。

インストール例 (Ubuntu 18.04)
```console
$ cd ~/Documents
$ git clone https://github.com/nekoaisle/vsc.git
$ cd ~/.vscode/extentions
$ ln -s ../../Documents/vsc/
$ ln -s ../../Documents/vsc/nekoaisle-command-menu nekoaisle-command-menu
$ ln -s ../../Documents/vsc/nekoaisle-disp-char-code nekoaisle-disp-char-code
$ ln -s ../../Documents/vsc/nekoaisle-encode nekoaisle-encode
$ ln -s ../../Documents/vsc/nekoaisle-highlight-tsv nekoaisle-highlight-tsv
$ ln -s ../../Documents/vsc/nekoaisle-insert-code nekoaisle-insert-code
$ ln -s ../../Documents/vsc/nekoaisle-jump-to-line-number nekoaisle-jump-to-line-number
$ ln -s ../../Documents/vsc/nekoaisle-mark-jump nekoaisle-mark-jump
$ ln -s ../../Documents/vsc/nekoaisle-open-file nekoaisle-open-file
$ ln -s ../../Documents/vsc/nekoaisle-open-filer nekoaisle-open-filer
$ ln -s ../../Documents/vsc/nekoaisle-open-help nekoaisle-open-help
$ ln -s ../../Documents/vsc/nekoaisle-open-previous-tab nekoaisle-open-previous-tab
$ ln -s ../../Documents/vsc/nekoaisle-select-word nekoaisle-select-word
$ ln -s ../../Documents/vsc/nekoaisle-toggle-char-case nekoaisle-toggle-char-case
```