#!/bin/bash
#
# タイトル
#
# filename:  {{pinfo.base}}
# 
# @version   1.0.0
# @copyright Copyright (C) {{now.year}} CREANSMAERD CO.,LTD. All rights reserved.
# @date      {{now.year}}-{{now.month}}-{{now.date}}
# @author    {{author}}
#

# 使用法を表示
# 
# @params number リターンコード
# @params string エラーメッセージ(省略可)
# @return シェルスクリプトを終了するので戻りません
function usage_exit() {
	if [ "$2" ] ; then
		echo ${2}
	fi

	echo << _EOL_
usage: $ {{pinfo.base}} 
_EOL_

	exit $1;
}

# 引数が指定されなかったときはエラー
if [ $# -eq 0 ]; then
	help 0;
fi

# グローバル変数
