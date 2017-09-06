## nekoaisle.encode の機能

### 選択範囲またはカーソル位置の単語を各種エンコード/デコードします。
1. HTML encode
1. URL encode
1. Base64 encode
1. C言語文字列 エスケープシーケンス
1. 正規表現構文の特殊文字の前にバックスラッシュを挿入
1. " 括り文字列内の " および \
1. ' 括り文字列内の ' および \

### 単語または選択範囲を下記の文字で括る/外す
1. ""
1. ''
1. ``
1. <>
1. ()
1. []
1. {}
1. {{}}
1. &lt;!-- -->
1. /* */
1. 

範囲選択されている場合は、まず、選択範囲の文字列が指定文字括りか調べ括られていたら外します。  
括られていない場合は選択範囲の外側に括り文字があるかを調べ括られていたら外します。  
上記いずれでもない場合は括ります。

## 使い方
エンコード/デコードしたい文字列を選択し escape e を押します。  
メニューが表示されますのでエンコード/デコードしたい種類を選んで enter を押してください。

## コマンドおよびキーマップ
|コマンド                                 |機能                  |キーマップ|
|-----------------------------------------|----------------------|----------|
|nekoaisle.encode                         |メニューを開く        |escape e  |
|nekoaisle.encodeHtml                     |HTML エンコード       |          |
|nekoaisle.encodeUrl                      |URL エンコード        |          |
|nekoaisle.encodeBase64                   |BASE64 エンコード     |          |
|nekoaisle.encodeCString                  |C言語文字列 エンコード|          |
|nekoaisle.encodePreg                     |正規表現 エンコード   |          |
|nekoaisle.encodeContentsOfSingleQuotation|'' の中身をエンコード |          |
|nekoaisle.encodeContentsOfDoubleQuotation|"" の中身をエンコード |          |
|nekoaisle.decodeHtml                     |HTML デコード         |          |
|nekoaisle.decodeUrl                      |URL デコード          |          |
|nekoaisle.decodeBase64                   |BASE64 デコード       |          |
|nekoaisle.decodeCString                  |C言語文字列 デコード  |          |
|nekoaisle.decodePreg                     |正規表現 デコード     |          |
|nekoaisle.decodeContentsOfSingleQuotation|'' の中身をデコード   |          |
|nekoaisle.decodeContentsOfDoubleQuotation|"" の中身をデコード   |          |
|nekoaisle.encloseInSingleQuotation       |'' で括る/外す        |ctrl+2    |
|nekoaisle.encloseInDoubleQuotation       |"" で括る/外す        |ctrl+7    |
|nekoaisle.encloseInGraveAccen            |`` で括る/外す        |          |
