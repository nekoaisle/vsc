# nekoaisle-open-hist

## 機能

ファイルが閉じられる際にファイル名と現在のカーソル位置を記憶します。
nekoaisle.openHist コマンドが実行されると上記で記憶したファイルの一覧を表示し選択したファイルを開きます。

* nekoaisle.openHist 過去に編集したことのあるファイルの一覧を表示、選択したファイルを開く。
* nekoaisle.openHistCompensateDate 編集履歴中ですでに存在しないファイル名を除去します。

## 設定

|設定名|機能|デフォルト値|
|-|-|-|
|nekoaisle-openHist.sort|ソート方法|modtime|
|nekoaisle-openHist.sortDir|ソート方向|desc|

ソート方法
|値|ソート方法|
|-|-|
|modtime| 最終更新日時|
|filename| ファイル名|
|pathname| パス名|

ソート方向
|値|ソート方向|
|-|-|
|asc| 小さい順|
|desc| 大きい順|

