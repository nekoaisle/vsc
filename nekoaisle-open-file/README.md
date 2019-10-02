# nekoaisle用ファイルオープン関連

## 機能

|             コマンド             |                     機能                     |
| -------------------------------- | -------------------------------------------- |
| nekoaisle.openFile               | ファイルを選択して開く                       |
| nekoaisle.openRelated            | 関連ファイルを開く                           |
| nekoaisle.openNew                | ファイル名を指定して開く                     |
| nekoaisle.openTemp               | 一時ファイルを開く                           |
| nekoaisle.insertFile             | カーソル位置にファイルを読み込む             |
| nekoaisle.openHist               | 過去に編集したことのあるファイルを選択し開く |
| nekoaisle.openHistCompensateDate | 編集履歴からすでに存在しないファイルを除去   |
| nekoaisle.openTag                | タグジャンプ                                 |
| nekoaisle.findOpen               | 検索して開く                                 |

### ■ `ファイルを選択して開く` nekoaisle.openFile
メニューからファイルを選択して開く

workbench.action.files.openFile は GUI にてファイルを選択できてよいのですが、ファイル名をキーボードから入力できず、GUI にこだわった Windows 的な使いにくさ(Windowsはテキスト入力もできるの100万倍マシですが…)があるので、コマンドラインとしてみました。

### ■ `関連ファイルを開く` nekoaisle.openRelated 
現在編集中のファイルと対になるファイルを開く、ファイルが存在しないときは作成してから開く

### ■ `ファイル名を指定して開く`  nekoaisle.openNew 
ファイル名を入力して新規ファイルを開く、ファイルが存在しないときには作成してから開く

### ■ `一時ファイルを開く` nekoaisle.openTemp
拡張子をメニューから選択して一時ファイルを開く、ファイルが存在しないときは作成してから開く

### ■ `カーソル位置にファイルを読み込む` nekoaisle.insertFile
選択したファイルをカーソル位置に読み込みます。  
※ iconv-lite にて文字コードを判定していますが、SHIFT_JIS を ISO-8859-2 などに誤判定するので、UTF-8, ascii 以外はすべて SHIFT_JIS として処理します。

### ■ `過去に編集したことのあるファイルを選択し開く` nekoaisle.openHist
ファイルを閉じる際に履歴ファイルに記録します。  
このコマンドを実行すると履歴を一覧表示し、選択したファイルを開きます。

### ■ `タグジャンプ` nekoaisle.openTag

選択範囲またはInputBoxにて入力した文字列を調べてタグジャンプします。  
対応する形式は下記の４種です。
* ファイル名(行番号)
* ファイル名 (行番号)
* ファイル名:行番号
* ファイル名: 行番号

### ■ `検索して開く` nekoaisle.findOpen
InputBox に入力したファイルをワークスペース内で検索し一覧表示します。  
一覧からファルを選択すると開きます。

入力されたパス名をディレクトリ名とベース名に分離し、ディレクトリ内に存在するすべてのファイル名を一覧表示します。また、ベース名にはワイルドカードも使用できます。

## 設定

|           設定名           |                 機能                 | デフォルト値 |
| -------------------------- | ------------------------------------ | ------------ |
| nekoaisle-openHist.dir     | 一時ファイルを格納するディレクトリ名 | ~/temp       |
| nekoaisle-openHist.base    | 一時ファイルのベース名               | temp         |
| nekoaisle-openHist.sort    | ソート方法                           | modtime      |
| nekoaisle-openHist.sortDir | ソート方向                           | desc         |

ソート方法
|    値    |  ソート方法  |
| -------- | ------------ |
| modtime  | 最終更新日時 |
| filename | ファイル名   |
| pathname | パス名       |

ソート方向
|  値  | ソート方向 |
| ---- | ---------- |
| asc  | 小さい順   |
| desc | 大きい順   |

例:
* "nekoaisle-openTemp.dir": "~/temp"  
* "nekoaisle-openTemp.base": "temp"  

