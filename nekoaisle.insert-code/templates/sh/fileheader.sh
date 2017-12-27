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

	cat << _EOL_
usage: $ {{pinfo.base}} 
_EOL_

	exit $1;
}

# コマンドをエコーして実行
# $DEBUG が TRUE のときは実行しない
# 
# @param $1 コマンド
# @param $2〜$9 引数
function _exec {
	local cmd=$1
	local res=0;
	shift
	echo -e "\e[33;1m\$ ${cmd}" "$@" "\e[m"

	if [ ! "$DEBUG" ]; then
		# $DEBUG が空なのでコマンドを実行
		$cmd "$@"
		res=$?
	fi
	return $res
}

# 引数が指定されなかったときはエラー
if [ $# -eq 0 ]; then
	usage_exit 1;
fi

# グローバル変数
