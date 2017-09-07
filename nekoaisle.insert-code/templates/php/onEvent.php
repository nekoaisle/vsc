<?php /* nekoaisle.insert-code delete line */
	/**
	 * []ボタンを押した処理
	 * 
	 * @access public
	 * @param  string $value name属性値
	 * @return boolean コマンドディスパッチを FAILED:続行, SUCCEEDED:終了
	 */
	protected function on( $value )
	{
		// ページ遷移
		$this->PageRedirect( '' );
		//
		return SUCCEEDED;
	}
/* nekoaisle.insert-code delete line */ ?>