# vsc
これは自分用に作成した Visual Studio Code 用拡張機能です。  
誠に申し訳ございませんが、英語が苦手なので基本的にドキュメントは日本語となっております。他言語の方は自動翻訳等をご利用ください。

私自身がまだまだ勉強中なので日々新しい発見をしておりますが、それなりにやりたいことは実現できるようになってきております。  
TypeScript のソースファイルごとまるまるアップしておりますので、拡張機能作成の参考にはなるかと思います。

各拡張機能の詳細はそれぞれのディレクトリ内の `README.md` をご覧ください。

いまのところ branch `0815` が最新版です。master はめったに更新しません。参考ソースとしては `0815` が有用な情報が多いかと思います。

|フォルダー名|機能|
|--|--|
|nekoaisole.cpss-wizer|私が作成たPHPフレームワーク用のウィザードですので一般の方には関係ありません|
|nekoaisole.disp-char-code|ステータスバーのカーソル位置の文字コードを表示します|
|nekoaisole.encode|選択範囲またはカーソル位置の単語をエンコードします(HTML, BASE64, URL, preg, etc)|
|nekoaisole.insert-code|スニペットをより強力にします|
|nekoaisole.jump-to-line-number|行番号を入力してジャンプします|
|nekoaisole.lib|全拡張機能で使用している共通ライブラリです|
|nekoaisole.mark-jump|カーソル位置を記憶/ジャンプ(残念ながらファイルを編集すると記憶が失われます…対策検討中)|
|nekoaisole.open-file|ファイルを開く、メニュー選択｜関連ファイル｜新規ファイル|
|nekoaisole.open-help|カーソル位置の単語をネットで検索|
|nekoaisole.open-prebious-tab|前回開いていたタブを開く|
|nekoaisole.open^thunar|現在のファイルが格納されているフォルダーを Thunar で開く|
|nekoaisole.select-word|カーソル位置の単語を選択する|
|nekoaisole.toggle-char-case|選択範囲またはカーソル位置の単語の大文字/小文字を切り替える|
