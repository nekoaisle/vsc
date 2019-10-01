#!/bin/bash
#
# タイトル
#
# filename:  link.sh
# 
# @version   1.0.0
# @copyright Copyright (C) 2019 CREANSMAERD CO.,LTD. All rights reserved.
# @date      2019-10-01
# @author    木屋 善夫
#

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


function mod_link {
  pushd "$1"

  # _exec mv package-lock.json package-lock.json.bak
  # _exec mv package.json package.json.bak

  # _exec ln -s ../package-lock.json package-lock.json
  # _exec ln -s ../package.json package.json

  _exec unlink package.json
  _exec mv package.json.bak package.json


  popd
  return
}

mod_link nekoaisle-command-menu
mod_link nekoaisle-jump-to-line-number
mod_link nekoaisle-cpss-wizard
mod_link nekoaisle-open-help.old
mod_link nekoaisle-open-previous-tab
mod_link nekoaisle-insert-code
mod_link nekoaisle.sjis-grep
mod_link nekoaisle.wz-editor-memo-file
mod_link nekoaisle-open-help
mod_link nekoaisle-cpss-log-highlight
mod_link nekoaisle-open-filer
mod_link nekoaisle-disp-char-code
mod_link nekoaisle-select-word
mod_link nekoaisle-highlight-tsv
mod_link nekoaisle-open-file
mod_link nekoaisle-cpss-decorator
mod_link nekoaisle-open-hist.del
mod_link nekoaisle-toggle-char-case
mod_link nekoaisle-mark-jump

