#!/bin/bash
# 
# @@title@@
#
# filename:  @@filename@@
# 
# @version   0.1.1
# @copyright Copyright (C) @@copyright@@ @@author@@ All rights reserved.
# @date	  @@date@@
# @author	@@author@@
# 

# 使用法を表示
# 
# @params number リターンコード
# @params string エラーメッセージ(省略可)
# @return シェルスクリプトを終了するので戻りません
function help() {
	if [ "$2" ] ; then
		echo ${2}
	fi

	echo 'usage: $ @@filename@@ '

	exit $1;
}

# 引数が指定されなかったときはエラー
if [ $# -eq 0 ]; then
	help 0;
fi

# グローバル変数
