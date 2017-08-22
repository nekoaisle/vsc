/**
 * @@title@@
 *
 * filename:  @@filename@@
 * 
 * @version   0.1.1
 * @copyright Copyright (C) @@copyright@@ @@author@@ All rights reserved.
 * @date	  @@date@@
 * @author	@@author@@
 */
(function($) {
	//プラグイン定義
	$.fn.@@class@@ = function(options){
		 
		//引数を設定する
		var defaults = {
			text: ''
		};
		var options = $.extend( defaults, options );
		 
		//アラートを表示
		alert(setting.text);
 
		//メソッドチェーン対応(thisを返す)
		return(this);
	};
})(jQuery);
