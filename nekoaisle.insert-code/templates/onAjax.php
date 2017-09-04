	/**
	 * [GET_] 選択肢を取得するAJAX処理
	 * 
	 * @access public
	 * @param  string $val 
	 * @return boolean コマンドディスパッチを FAILED:継続 SUCCEEDED:終了
	 * @throw  
	 */
	public function onGet( $val )
	{
		// AJAX なので HTML は出力しない
		$this->m_blUseHTML = FALSE;

		// 戻り値用配列
		$data = [];

		// json を出力
		$this->EchoJSON( $data );

		//
		return SUCCEEDED;
	}