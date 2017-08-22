## 特徴

CPSS 用の初期ファイルを自動生成します。
また、SQLファイルを指定することにより,テーブルの一覧および行の編集機能を実装する際の雛形を作成します。

## 要件

PHP 5.1 以上が必要です。

## 拡張機能の設定

settings.json に下記を記載することにより動作を変更できます。

* `cpssWizard.wizard`     : PHP で作成された Wizard のファイル名
* `cpssWizard.templateDir`: テンプレートが格納されたディレクトリ名
* `cpssWizard.php`        : PHP の実行ファイル
* `cpssWizard.outFile`    : 出力先 (php://stdoutにすればカーソル位置に挿入されます)
* `cpssWizard.author`     : 著者名

例:
    "cpssWizard.wizard"     : "~/documents/PHP/CpssWizardUTF8.php",
    "cpssWizard.templateDir": "~/documents/templates",
    "cpssWizard.php"        : "/usr/bin/php"
    "cpssWizard.outFile"    : "php://stdout",
    "cpssWizard.author"     : "Yoshio Kiya",

## 既知の問題点
