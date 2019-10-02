#!/bin/bash
#
# タイトル
#
# filename:  all-push.sh
# 
# @version   1.0.0
# @copyright Copyright (C) 2019 CREANSMAERD CO.,LTD. All rights reserved.
# @date      2019-10-02
# @author    木屋 善夫
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
usage: $ all-push.sh 
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

function git-push {
  pushd $1
  date=`date "+%Y-%m-%d %H:%I:%S"`

  _exec git add --all 
  _exec git commit -a -m "$date"
  _exec git push origin master
  popd
}

git-push nekoaisle-command-menu
git-push nekoaisle-cpss-decorator
git-push nekoaisle-cpss-log-highlight
git-push nekoaisle-cpss-wizard
git-push nekoaisle-disp-char-code
git-push nekoaisle-encode
git-push nekoaisle-highlight-tsv
git-push nekoaisle-insert-code
git-push nekoaisle-jump-to-line-number
git-push nekoaisle-mark-jump
git-push nekoaisle-open-file
git-push nekoaisle-open-filer
git-push nekoaisle-open-help
git-push nekoaisle-open-previous-tab
git-push nekoaisle-select-word
git-push nekoaisle-toggle-char-case
git-push nekoaisle.lib
git-push nekoaisle.sjis-grep
git-push nekoaisle.wz-editor-memo-file
