#!/bin/bash
#
# タイトル
#
# filename:  deployment.sh
# 
# @version   1.0.0
# @copyright Copyright (C) 2019 CREANSMAERD CO.,LTD. All rights reserved.
# @date      2019-10-08
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

#==========================================================
# 処理
# @param $1 
# @return 
#==========================================================
function job() {
  rsync -av ./nekoaisl* $1:/home/cpss/.vscode-server/extensions/
}

job campt-kiya
