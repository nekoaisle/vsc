<?php
class CpssWizard
{
	/**
	 * コマンドラインよりオプションを取得
	 * 
	 * @param array $cmd コマンドライン引数配列
	 * @return array オプション配列
	 */
	function procOption( $cmd )
	{
		$ret = array( );

		foreach ( $cmd as $s ) {
			if ( $s[0] == '-' ) {
				if ( preg_match( '/^-([^=]+)(=(.*))?$/', $s, $a ) == 1 ) {
					$ret[trim($a[1])] = trim($a[3]);
//					echo trim($a[1]), " ", trim($a[3]), "\n";
				}
			}
		}

		return $ret;
	}

	/**
	 * オプションの取得
	 * 
	 * @param string  $option オプション名
	 * @param boolean $error === TRUE 取得出来なかったときにはエラーにする
	 * @return string オプション
	 */
	function getOption( $option, $error = NULL )
	{
		if ( !empty( $this->options[$option] ) ) {
			return $this->options[$option];
		}

		if ( !empty( $error ) ) {
			echo $option, ' は省略できません。' . PHP_EOL;
			$this->usage( 1 );
		}

		return '';
	}

	/**
	 * ヘルプ表示
	 * 
	 * @param  int $exitCode 終了コード
	 */
	function usage( $exitCode = NULL )
	{
		echo <<<__USAGE__
>php CpssWizard.php -m=[モード] -f=[生成ファイル名] -a=[作成者名] -t=[タイトル] <-out=[出力ファイル名]> <-sql=[SQLファイル名]>

__USAGE__;

	//print_r( $_SERVER['argv'] );
	//var_dump( debug_backtrace( ) );

		if ( isset( $exitCode ) ) {
			exit( $exitCode );
		}
	}

	/**
	 * フィールド名から変数名を作成
	 * 
	 * @param  string $field フィールド名
	 * @param  string $type  型 (INT)
	 * @return 
	 */
	function makeVariableName( $field, $type )
	{
		// _で分解 (最初の文字が種類を表している
		$b = explode( '_', $field );
		switch ( $b[0] ) {
			// 数値
		case 'N':
			if ( $type == 'INT' )
				$n = 'm_i';
			else
				$n = 'm_f';
			for ( $j = 1; $j < count( $b ); ++ $j ) {
				$n .= $this->makeRowNameWord( $b[$j] );
			}
			break;

			// 日時
		case 'D':
			$n = 'm_str';
			for ( $j = 1; $j < count( $b ) -1 ; ++ $j ) {
				$n .= $this->makeRowNameWord( $b[$j] );
			}
			$n .= 'Date';
			break;

			// 文字列
		case 'V':
		case 'C':
		default:
			$n = 'm_str';
			for ( $j = 1; $j < count( $b ); ++ $j ) {
				$n .= $this->makeRowNameWord( $b[$j] );
			}
			break;
		}

		//
		return $n;
	}


	/**
	 * 先頭文字のみを大文字にした単語を作成
	 * 
	 * @param  string $str プレフィックスを除いたフィールド名
	 * @return 
	 */
	function makeRowNameWord( $str )
	{
		if ( $str == 'ID' )
			return $str;

		return ucfirst( strtolower( $str ) );
	}

	/**
	 * スネークケースを分解
	 * 
	 * @param  string $str 処理対象文字列
	 * @return array 分解した文字列を格納する配列
	 */
	function splitSnake( $str )
	{
		return explode( '_', $str );
	}

	/**
	 * キャメルケースを分解
	 * 
	 * @param  string $str 処理対象文字列
	 * @return array 分解した文字列を格納する配列
	 */
	function splitCamel( $str )
	{
		if ( preg_match_all( '/[A-Z][^A-Z]*/s', $str, $m ) > 0 ) {
			return $this->toLowwer( $m[0] );
		} else {
			return array( strtolower( $str ) );
		}
	}

	/**
	 * １次元配列のすべての要素を小文字に変換
	 * 
	 * @param  array $ary 分解した文字列が格納された配列
	 * @return array 小文字に変換した配列
	 */
	function toLowwer( $ary )
	{
		foreach ( $ary as $k => $v ) {
			$ary[$k] = strtolower( $v );
		}
		return $ary;
	}

	/**
	 * １次元配列のすべての要素を先頭文字のみを大文字に変換
	 * 
	 * @param  array $ary 分解した文字列が格納された配列
	 * @return array 先頭文字のみ大文字にした文字列
	 */
	function toUcfirst( $ary )
	{
		foreach ( $ary as $k => $v ) {
			$ary[$k] = ucfirst( $v );
		}
		return $ary;
	}

	/**
	 * 配列をスネークケースに変換
	 * 
	 * @param  array $ary 分解した文字列が格納された配列
	 * @return string スネークケースに変換した文字列
	 */
	function makeSnake( $ary )
	{
		// すべて小文字に変換
		$ary = $this->toLowwer( $ary );
		// _でつなぐ
		return implode( '_', $ary );
	}

	/**
	 * 配列をキャメルケースに変換
	 * 
	 * @param  array $ary 分解した文字列が格納された配列
	 * @return string キャメルケースに変換した文字列
	 */
	function makeCamel( $ary )
	{
		// 先頭文字のみを大文字に変換
		$ary = $this->toUcfirst( $ary );

		// 結合
		return implode( '', $ary );
	}

	/**
	 * テンプレートの読み込み
	 * 
	 * @param string $mode 処理モード (-m オプション)
	 * @param string $ext  拡張子
	 * @param string $dir  対象ディレクトリ名
	 * @return string テンプレートファイル
	 */
	function loadTemplate( $mode, $ext, $dir )
	{
		// 読み込むファイル候補
		$files = array();

		if ( !empty( $t = $this->getOption( 'tmpl' ) ) ) {
			// テンプレートが指定されている
			$files[] = $t;
		} else {
			// テンプレートが指定されていなかった
			// テンプレートが指定されていなかった
			$list = array(
				// 標準テンプレート
				// ./template フォルダーを探しなければ同一フォルダーを探す
				  'standard'       => array( "{$dir}\\template\\template{$ext}", "{$dir}\\template{$ext}" )
				// トランザクション基本クラス
				, 'TransBase'      => array( "{$dir}\\template\\TransBase{$ext}" )
				// トランザクション初期化ページ
				, 'TransInit'      => array( "{$dir}\\template\\TransInit{$ext}" )
				// トランザクション編集ページ
				, 'TransEdit'      => array( "{$dir}\\template\\TransEdit{$ext}" )
				// トランザクション確認ページ
				, 'TransConfirm'   => array( "{$dir}\\template\\TransConfirm{$ext}" )
				// トランザクション完了ページ
				, 'TransCompleted' => array( "{$dir}\\template\\TransCompleted{$ext}" )
				// 一覧初期化ページ
				, 'ListInit'       => array( "{$dir}\\template\\ListInit{$ext}" )
				// 一覧ページ
				, 'ListList'       => array( "{$dir}\\template\\ListList{$ext}" )
				// CCamRow 派生クラス
				, 'Row'            => array( "{$dir}\\template\\Row{$ext}" )
			);
			if ( empty( $list[$mode] ) ) {
				$this->usage( 1 );
			};

			$files = $list[$mode];
	//print_r( $files );
		}

		// テンプレートを開く
		foreach ( $files as $t ) {
	//		echo "check $t" . PHP_EOL;
			if ( file_exists( $t ) ) {
	//			echo "load $t" . PHP_EOL;
				$template = $this->loadTextFile( $t );
				break;
			}
		}

		if ( empty( $template )  ) {
			echo 'テンプレート', implode( ', ', $files ), ' が開けませんでした', "\n";
			exit( 1 );
		}

		//
		return $template;
	}

	/**
	 * テキストファイルを読み込む
	 * 
	 * @access public
	 * @param  string $filename ファイル名
	 * @return string 読み込んだファイルの内容
	 */
	function loadTextFile( $filename )
	{
		$text = file_get_contents( $filename );
		$enc = mb_detect_encoding( $text, "SJIS-win, UTF-8" );
		if ( $enc != 'UTF-8' ) {
			$text = mb_convert_encoding( $text, 'UTF-8', $enc );
		}

		return $text;
	}

	/**
	 * CamRow派生クラス用 SQL情報の処理
	 * 
	 * @param  array& $replace 置換情報配列
	 * @param  string $sqlFile SQLファイル名
	 */
	function jobRow( &$replace, $sqlFile )
	{
		// SQL 読み込み
		$sql = $this->loadTextFile( $sqlFile );

		// テーブル名
		if ( preg_match( '/CREATE\s+TABLE\s+([0-9A-Z_]+)/', $sql, $a ) === 1 ) {
			$replace['@@table@@'] = $a[1];
		}

		// SQL 文
		if ( preg_match( '/(CREATE\s+TABLE\s[^;]+;)/', $sql, $a ) === 1 ) {
			$replace['@@sql@@'] = $a[1];

			// フィールド定義の作成
			if ( strstr( $a[1], "\r\n" ) ) {
				$aryCol = explode( "\r\n", $a[1] );
			} else {
				$aryCol = explode( "\n", $a[1] );
			}

			// ( のみの行までスキップ
			for ( $i = 0; $i < count( $aryCol ); ++ $i ) {
				$s = trim( $aryCol[$i] );
				if ( $s == '(' ) {
					++ $i;
					break;
				}
			}

			// ) のみの行まで処理
			$src = array( );
			for ( $i = 0; $i < count( $aryCol ); ++ $i ) {
				$s = trim( $aryCol[$i] );
				if ( $s == ')' )
					break;

				// , V_MAILMAG_ID    VARCHAR(   64, 4 ) NOT NULL DEFAULT '' -- メルマガID ACCOUNT.V_ID
				$pt = 
					  '/^'
					. ',?\s*'									// , 
					. '([^\s]+)\s+'								// V_MAILMAG_ID
					. '([^\s\(]+)\s*'							// VARCHAR
					. '(\(\s*'									// (
					. '([0-9]+)\s*(,\s*([0-9]+)\s*)?'			// 64, 4
					. '\)\s*)?'									// )
					. '((NOT\s*NULL)|(PRIMARY\s*KEY))*\s*'		// NOT NULL, PRIMARY KEY
					. '(DEFAULT\s+(\'[^\']*\'|[0-9]+|NULL))?\s*'	// DEFAULT 64
					. '-- (.*)'
					. '$/'
				;
	//			Array
	//			(
	//			    [0] => , V_MAILMAG_ID    VARCHAR(  64, 4) NOT NULL DEFAULT '' -- メルマガID ACCOUNT.V_ID
	//			    [1] => V_MAILMAG_ID
	//			    [2] => VARCHAR
	//			    [3] => (   64, 4 )
	//			    [4] => 64
	//			    [5] => , 4
	//			    [6] => 4
	//			    [7] => NOT NULL
	//			    [8] => NOT NULL
	//			    [9] =>
	//			    [10] => DEFAULT ''
	//			    [11] => ''
	//			    [12] => メルマガID ACCOUNT.V_ID
	//			)
				if ( preg_match( $pt, $s, $a ) === 1 ) {
	//				print_r( $a );
					if ( $a[1] == 'D_REGIST_DT' )
						continue;
					if ( $a[1] == 'D_UPDATE_DT' )
						continue;
					if ( $a[1] == 'V_NOTE' )
						continue;

					// タイトルを作成
					$b = explode( ' ', $a[12] );
					$t = $b[0];

					// 型を変換
					switch ( $a[2] ) {
					case 'NUMERIC':
						if ( empty( $a[6] ) )
							$a[2] = 'INT';
						else
							$a[2] = 'DOUBLE';
						break;
					
					case 'BLOB':
						$a[2] = 'VARCHAR';
						$a[4] = 4095;
						break;
					}

					// 変数名を作成
					$n = $this->makeVariableName( $a[1], $a[2] );

					// デフォルトが省略されているときは NULL
					if ( $a[1] == 'V_ID' )
						$a[11] = "''";
					else if ( !isset( $a[11] ) || ($a[11] === '') )
						$a[11] = 'NULL';

					// array( 'V_NAME', 'm_strName', 'VARCHAR', TRUE, '', 'メールマガジン名',  64 )
					$src[] = array( $a[1], $n, $a[2], 'TRUE', $a[11], $t, (string)($a[4] + $a[6]) );
				}
			}

			// 各単語の最大長を取得
			$len = array( );
			foreach ( $src as $a ) {
				foreach ( $a as $k => $v ) {
					$l = strlen( $v );
					if ( empty( $len[$k] ) || ($len[$k] < $l) )
						$len[$k] = $l;
				}
			}

			$col = array( );
			$var = array( );
			$dic = array( );
			foreach ( $src as $a ) {
				// 列定義
				$col[] = sprintf( "[ %s, %s, %s, %s, %s, %s, %s ]"
					, str_pad( "'{$a[0]}'", $len[0] + 2 )
					, str_pad( "'{$a[1]}'", $len[1] + 2 )
					, str_pad( "'{$a[2]}'", $len[2] + 2 )
					, str_pad(    $a[3]   , $len[3] )
					, str_pad(    $a[4]   , $len[4] )
					, str_pad( "'{$a[5]}'", $len[5] + 2 )
					, str_pad(    $a[6]   , $len[6], ' ', STR_PAD_LEFT )
				);

				// 変数定義
				$v = str_pad( $a[1], $len[1] );
				$var[] = "\tpublic \$$v;\t// {$a[0]}\r\n";
				
				// 列名→変数名変換辞書
				$dic[] = sprintf( "%s => %s"
					, str_pad( "'{$a[0]}'", $len[0] + 2 )
					, str_pad( "'{$a[1]}'", $len[1] + 2 )
				);
			}

			$replace['@@column@@'  ] = "\t\t  " . implode( "\r\n\t\t, ", $col );
			$replace['@@coldic@@'  ] = "\t\t  " . implode( "\r\n\t\t, ", $dic );
			$replace['@@variable@@'] = implode( '', $var );
		}
	}

	/**
	 * ListBaseクラス用 SQL情報の処理
	 * 
	 * @param  string& $template テンプレート
	 * @param  array& $replace   置換情報配列
	 * @param  string $sqlFile SQLファイル名
	 */
	function jobListSQL( &$template, &$replace, $sqlFile )
	{
		// テンプレートから列タイプごとのテンプレートを取得
		$temple = array();
		$temple['V_ID'] = <<<_EOL_
			'V_ID' => [ 
				  'CLASS'   => 'string'
				, 'TAG'     => 'input'
				, 'TYPE'    => 'text'
				, 'DEFAULT' => ''
				, 'TITLE'   => 'ID'
				, 'LESS'    => TRUE
				, 'MAXLEN'  => 64
				, 'ATTRIB'  => 'size="48"'
				, 'search'  => 'like'
			]
_EOL_;
	$temple['C_STATUS'] = <<<_EOL_
			'C_STATUS' => [ 
				  'CLASS'   => 'string'
				, 'TAG'     => 'select'
				, 'DEFAULT' => ''
				, 'TITLE'   => '状態'
				, 'MAXLEN'  =>   3
				, 'LESS'    => TRUE
				, 'OPTION'  => array( ''=>'' )
				, 'search'  => 'status'
			]
_EOL_;
	$temple['NUMERIC'] = <<<_EOL_
			'@@name@@' => [
				  'CLASS'   => 'number'
				, 'TAG'     => 'input'
				, 'TYPE'    => 'text'
				, 'DEFAULT' => @@default@@
				, 'TITLE'   => '@@title@@'
				, 'LESS'    => FALSE
				, 'MINNUM'  => 0
				, 'MAXNUM'  => 9999999
				, 'search'  => 'like'
			]
_EOL_;
	$temple['BLOB'] = <<<_EOL_
			'@@name@@' => [
				  'CLASS'   => 'string'
				, 'TAG'     => 'textarea'
				, 'DEFAULT' => @@default@@
				, 'TITLE'   => '@@title@@'
				, 'LESS'    => FALSE
				, 'MAXLEN'  => 4096
				, 'ATTRIB'  => 'rows="5"'
				, 'CTRL'    => "\t\r\n"
				, 'HTML'    => TRUE			// <>"' を許可
				, 'search'  => 'like'
			]
_EOL_;
	$temple['VARCHAR'] = <<<_EOL_
			'@@name@@' => [
				  'CLASS'   => 'string'
				, 'TAG'     => 'input'
				, 'TYPE'    => 'text'
				, 'DEFAULT' => @@default@@
				, 'TITLE'   => '@@title@@'
				, 'LESS'    => FALSE
				, 'search'  => 'like'
			]
_EOL_;
	$temple['CHAR'] = <<<_EOL_
			'@@name@@' => [
				  'CLASS'   => 'string'
				, 'TAG'     => 'select'
				, 'DEFAULT' => @@default@@
				, 'TITLE'   => '@@title@@'
				, 'MAXLEN'  =>   3
				, 'LESS'    => TRUE
				, 'OPTION'  => array( ''=>'' )
				, 'search'  => 'status'
			]
_EOL_;
	$temple['DATE'] = <<<_EOL_
			'@@name@@' => [
				  'CLASS'   => 'date'
				, 'TAG'     => 'input'
				, 'TYPE'    => 'text'
				, 'DEFAULT' => ''
				, 'TITLE'   => '@@title@@(最小)'
				, 'DTFMT'   => 'YmdHis'
				, 'DSPFMT'  => 'Y/m/d H:i:s'
				, 'LESS'    => TRUE
				, 'ATTRIB'  => 'data-cpss="datetime"'
				, 'search'  => 'between @@name@@_END'
				, 'head'    => '開始日時'
				, 'style'   => 'width:12em;'
			],
			'@@name@@' => [
				  'CLASS'   => 'date'
				, 'TAG'     => 'input'
				, 'TYPE'    => 'text'
				, 'DEFAULT' => ''
				, 'TITLE'   => '@@title@@(最大)'
				, 'DTFMT'   => 'YmdHis'
				, 'DSPFMT'  => 'Y/m/d H:i:s'
				, 'LESS'    => TRUE
				, 'ATTRIB'  => 'data-cpss="datetime"'
				, 'search'  => 'between'
				, 'combine' => TRUE
				, 'style'   => 'width:12em;'
				, 'prefix'  => ' ～ '
			]
_EOL_;

	/*     記述例
	//@@row_form_temple NUMERIC {
				'@@name@@'      => [ 
					  'CLASS'   => 'string'
					, 'TAG'     => 'input'
					, 'TYPE'    => 'text'
					, 'DEFAULT' => 848635851342 
					, 'TITLE'   => '@@title@@'              
					, 'MAXLEN'  => 19
					, 'ACCEPT'  => '0-9'
				],
	//}@@
	*/
		$re = 
			  '`'
			. '//@@row_form_temple\s+'
			. '([A-Z0-9_]+)'				// $m[1] テンプレート名
			. '\s*{[^\n]*\n'
			. '(.*?)'						// $m[3] テンプレート
			. '//}@@[^\n]*\n'
			. '`s'
		;
		if ( preg_match_all( $re, $template, $m, PREG_SET_ORDER ) >= 1 ) {		
			// テンプレートを取得
			unset( $m[0] );
			foreach ( $m as $p ) {
				$temple[$p[1]] = $p[2];
			}

			// テンプレートを削除
			$template = preg_replace( $re, '', $template );
		}

		// SQL 読み込み
		$sql = $this->loadTextFile( $sqlFile );

		// テーブル名
		if ( preg_match( '/CREATE\s+TABLE\s+([0-9A-Z_]+)/', $sql, $a ) === 1 ) {
			$replace['@@table@@'] = $a[1];
		}

		// SQL 文
		if ( preg_match( '/(CREATE\s+TABLE\s[^;]+;)/', $sql, $a ) === 1 ) {
			$replace['@@sql@@'] = $a[1];

			// フィールド定義の作成
			if ( strstr( $a[1], "\r\n" ) ) {
				$aryCol = explode( "\r\n", $a[1] );
			} else {
				$aryCol = explode( "\n", $a[1] );
			}

			// ( のみの行までスキップ
			for ( $i = 0; $i < count( $aryCol ); ++ $i ) {
				$s = trim( $aryCol[$i] );
				if ( $s == '(' ) {
					++ $i;
					break;
				}
			}

			// ) のみの行まで処理
			$search = array( );
			$sort   = array( '' => '' );
			for ( $i = 0; $i < count( $aryCol ); ++ $i ) {
				$s = trim( $aryCol[$i] );
				if ( $s == ')' )
					break;

				// , V_MAILMAG_ID    VARCHAR(   64, 4 ) NOT NULL DEFAULT '' -- メルマガID ACCOUNT.V_ID
				$pt = 
					  '/^'
					. ',?\s*'									// , 
					. '([^\s]+)\s+'								// [1] V_MAILMAG_ID
					. '([^\s\(]+)\s*'							// [2] VARCHAR
					. '(?:\(\s*'
						. '([0-9]+)\s*'							// [3] 64
						. '(?:,\s*'
							. '([0-9]+)\s*'						// [4] 4
						. ')?'
						. '\)\s*'
					. ')?'
					. '(?:'
						. '(NOT\s*NULL)'						// [5] NOT NULL
						. '|'
						. '(PRIMARY\s*KEY)'						// [6] 
					. ')*\s*'
					. '(?:'
						. 'DEFAULT\s+'
							. '(\'[^\']*\'|[0-9]+|NULL)'		// [7] ''
					. ')?\s*'
					. '-- '
					. '(.*)'									// [8] メルマガID ACCOUNT.V_ID
					. '$/'
				;

				if ( preg_match( $pt, $s, $a ) !== 1 ) {
					// 行定義ではない
					continue;
				}
				$a['name'   ] = $a[1];		// 名前
				$a['type'   ] = $a[2];		// 型
				$a['size'   ] = (int)$a[3] + (int)$a[4] + ((int)$a[4] ? 1 : 0);	// サイズ
				$a['default'] = $a[7];
				$b = explode( ' ', $a[8] );
				$a['title'  ] = $b[0];

	//			print_r( $a );
				switch ( $a['name'] ) {
				case 'D_REGIST_DT':
				case 'D_UPDATE_DT':
				case 'V_NOTE':
					continue 2;
				}

				if ( !empty( $temple[$a['name']] ) ) {
					$search[] = rtrim( $temple[$a['name']] );
					continue;
				}

				// 型を変換
				switch ( $a['type'] ) {
				case 'BLOB':
					$a['type'] = 'VARCHAR';
					$a['size'] = 4095;
					break;
				}

				// デフォルトが省略されているときは ''
				if ( !isset( $a[11] ) ) {
					$a[11] = '';
				}

				// この列型のテンプレートを取得
				if ( substr( $a['name'], 0, 2 ) == 'D_' ) {
					// D_ ではじまるカラムは日付
					$tmp = rtrim( $temple['DATE'] );
				} else {
					// カラムの型ごとのテンプレ
					$tmp = rtrim( $temple[$a['type']] );
				}

				// 置換
				$rep = array( 
					  '@@name@@'    => $a['name']
					, '@@default@@' => $a['default']
					, '@@title@@'   => $a['title']
					, '@@maxlen@@'  => (string)($a['size'])
				);
				
				$search[] = str_replace( array_keys( $rep ), array_values( $rep ), $tmp );

				// ソート用
				$sort[$a['name']] = $a['title'];
			}

			$replace['//@@row_form@@'] = implode( ",\r\n", $search );

			// ソート用
			// 最大の長さを取得
			$len = 0;
			foreach ( $sort as $k => $v ) {
				$l = strlen( $k );
				if ( $len < $l ) {
					$len = $l;
				}
			}
			$len += strlen( $replace['@@table@@'] ) + 2 + 1;	// 2='' 1=.

			$sort2 = array( );
			foreach ( $sort as $k => $v ) {
				if ( empty( $k ) ) {
					$k = str_pad( "''", $len, ' ' );
				} else {
					$k = str_pad( "'{$replace['@@table@@']}.{$k}'", $len, ' ' );
				}
				$sort2[] = "\t\t\t{$k} => '{$v}'";
			}

			$replace['@@sort@@'] = implode( ",\r\n", $sort2 );
		}
	}

	/**
	 * EditBaseクラス用 SQL情報の処理
	 * 
	 * @param  string& $template テンプレート
	 * @param  array& $replace   置換情報配列
	 * @param  string $sqlFile SQLファイル名
	 */
	function jobEditSQL( &$template, &$replace, $sqlFile )
	{
		// テンプレートから列タイプごとのテンプレートを取得
		$temple = array();
		$temple['V_ID'] = <<<_EOL_
			'V_ID' => [ 
				  'CLASS'   => 'string'
				, 'TAG'     => 'static'
				, 'DEFAULT' => ''
				, 'TITLE'   => 'ID'
				, 'LESS'    => TRUE
				, 'MAXLEN'  => 64
				, 'ATTRIB'  => 'size="48"'
			]
_EOL_;
	$temple['C_STATUS'] = <<<_EOL_
			'C_STATUS' => [ 
				  'CLASS'   => 'string'
				, 'TAG'     => 'select'
				, 'DEFAULT' => 'VLD'
				, 'TITLE'   => '状態'
				, 'MAXLEN'  => 3
				, 'OPTION'  => array( ''=>'' )
			]
_EOL_;
	$temple['NUMERIC'] = <<<_EOL_
			'@@name@@' => [
				  'CLASS'   => 'string'
				, 'TAG'     => 'text'
				, 'DEFAULT' => @@default@@
				, 'TITLE'   => '@@title@@'
				, 'LESS'    => FALSE
				, 'MINNUM'  => 0
				, 'MAXNUM'  => 9999999
			]
_EOL_;
	$temple['BLOB'] = <<<_EOL_
			'@@name@@' => [
				  'CLASS'   => 'string'
				, 'TAG'     => 'textarea'
				, 'DEFAULT' => @@default@@
				, 'TITLE'   => '@@title@@'
				, 'LESS'    => FALSE
				, 'MAXLEN'  => 4096
				, 'ATTRIB'  => 'rows="5"'
				, 'CTRL'    => "\t\r\n"
				, 'HTML'    => TRUE			// <>"' を許可
			]
_EOL_;
	$temple['VARCHAR'] = <<<_EOL_
			'@@name@@' => [
				  'CLASS'   => 'string'
				, 'TAG'     => 'input'
				, 'TYPE'    => 'text'
				, 'DEFAULT' => @@default@@
				, 'TITLE'   => '@@title@@'
				, 'LESS'    => FALSE
			]
_EOL_;
	$temple['CHAR'] = <<<_EOL_
			'@@name@@' => [
				  'CLASS'   => 'string'
				, 'TAG'     => 'input'
				, 'TYPE'    => 'text'
				, 'DEFAULT' => @@default@@
				, 'TITLE'   => '@@title@@'
				, 'LESS'    => FALSE
			]
_EOL_;

	/*     記述例
	//@@row_form_temple NUMERIC {
				'@@name@@'      => [ 
					  'CLASS'   => 'string'
					, 'TAG'     => 'input'
					, 'TYPE'    => 'text'
					, 'DEFAULT' => 848635851342 
					, 'TITLE'   => '@@title@@'              
					, 'MAXLEN'  => 19
					, 'ACCEPT'  => '0-9'
				],
	//}@@
	*/
		$re = 
			  '`'
			. '//@@row_form_temple\s+'
			. '([A-Z0-9_]+)'				// $m[1] テンプレート名
			. '\s*{[^\n]*\n'
			. '(.*?)'						// $m[3] テンプレート
			. '//}@@[^\n]*\n'
			. '`s'
		;
		if ( preg_match_all( $re, $template, $m, PREG_SET_ORDER ) >= 1 ) {		
			// テンプレートを取得
			unset( $m[0] );
			foreach ( $m as $p ) {
				$temple[$p[1]] = $p[2];
			}

			// テンプレートを削除
			$template = preg_replace( $re, '', $template );
		}

		// SQL 読み込み
		$sql = $this->loadTextFile( $sqlFile );

		// テーブル名
		if ( preg_match( '/CREATE\s+TABLE\s+([0-9A-Z_]+)/', $sql, $a ) === 1 ) {
			$replace['@@table@@'] = $a[1];
		}

		// SQL 文
		if ( preg_match( '/(CREATE\s+TABLE\s[^;]+;)/', $sql, $a ) === 1 ) {
			$replace['@@sql@@'] = $a[1];

			// フィールド定義の作成
			if ( strstr( $a[1], "\r\n" ) ) {
				$aryCol = explode( "\r\n", $a[1] );
			} else {
				$aryCol = explode( "\n", $a[1] );
			}

			// ( のみの行までスキップ
			for ( $i = 0; $i < count( $aryCol ); ++ $i ) {
				$s = trim( $aryCol[$i] );
				if ( $s == '(' ) {
					++ $i;
					break;
				}
			}

			// ) のみの行まで処理
			$src = array( );
			for ( $i = 0; $i < count( $aryCol ); ++ $i ) {
				$s = trim( $aryCol[$i] );
				if ( $s == ')' )
					break;

				// , V_MAILMAG_ID    VARCHAR(   64, 4 ) NOT NULL DEFAULT '' -- メルマガID ACCOUNT.V_ID
				$pt = 
					  '/^'
					. ',?\s*'									// , 
					. '([^\s]+)\s+'								// [1] V_MAILMAG_ID
					. '([^\s\(]+)\s*'							// [2] VARCHAR
					. '(?:\(\s*'
						. '([0-9]+)\s*'							// [3] 64
						. '(?:,\s*'
							. '([0-9]+)\s*'						// [4] 4
						. ')?'
						. '\)\s*'
					. ')?'
					. '(?:'
						. '(NOT\s*NULL)'						// [5] NOT NULL
						. '|'
						. '(PRIMARY\s*KEY)'						// [6] 
					. ')*\s*'
					. '(?:'
						. 'DEFAULT\s+'
							. '(\'[^\']*\'|[0-9]+|NULL)'		// [7] ''
					. ')?\s*'
					. '-- '
					. '(.*)'									// [8] メルマガID ACCOUNT.V_ID
					. '$/'
				;

				if ( preg_match( $pt, $s, $a ) !== 1 ) {
					// 行定義ではない
					continue;
				}
				$a['name'   ] = $a[1];		// 名前
				$a['type'   ] = $a[2];		// 型
				$a['size'   ] = (int)$a[3] + (int)$a[4] + ((int)$a[4] ? 1 : 0);	// サイズ
				$a['default'] = $a[7];
				$b = explode( ' ', $a[8] );
				$a['title'  ] = $b[0];

	//			print_r( $a );
				switch ( $a['name'] ) {
				case 'D_REGIST_DT':
				case 'D_UPDATE_DT':
				case 'V_NOTE':
					continue 2;
				}

				if ( !empty( $temple[$a['name']] ) ) {
					$src[] = rtrim( $temple[$a['name']] );
					continue;
				}

				// 型を変換
				switch ( $a['type'] ) {
				case 'BLOB':
					$a['type'] = 'VARCHAR';
					$a['size'] = 4095;
					break;
				}

				// デフォルトが省略されているときは ''
				if ( !isset( $a[11] ) ) {
					$a[11] = '';
				}

				// この列型のテンプレートを取得
				$tmp = rtrim( $temple[$a['type']] );

				// 置換
				$rep = array( 
					  '@@name@@'    => $a['name']
					, '@@default@@' => $a['default']
					, '@@title@@'   => $a['title']
					, '@@maxlen@@'  => (string)($a['size'])
				);
				
				$src[] = str_replace( array_keys( $rep ), array_values( $rep ), $tmp );
			}

			$replace['//@@row_form@@'] = implode( "\r\n", $src );
		}
	}

	/**
	 * オプション
	 * @var array
	 */
	public $options = array();

	/**
	 * 
	 * 
	 * @access public
	 * @param  
	 * @return 
	 * @throw  
	 */
	public function exec( $argc, $argv )
	{
		// オプション取得
		$this->options = $this->procOption( array_slice( $argv, 1 ) );

		// ヘルプ表示
		if ( !empty( $this->options['?'] ) ) {
			$this->usage( 0 );
		}

		// モード
		$mode = $this->getOption( 'm', 'モード' );

		// 生成ファイル名(実際の出力は -out)
		$filename = $this->getOption( 'f', 'ファイル名' );
		$ext = strrchr( $filename, '.' );
		$basename = basename( $filename, $ext );
		$dir = dirname( $filename );

		// 名前を分解
		if ( strpos( $basename, '_' ) === FALSE ) {
			// スネークケースではないのでキャメルケースとして分解
			$splitName = $this->splitCamel( $basename );
			if ( $splitName[count($splitName)-1] == 'base' ) {
				// 末尾の単語が base なら除去
				unset( $splitName[count($splitName)-1] );
			}
		} else {
			$splitName = $this->splitSnake( $basename );
		}

		// タイトル
		$title = $this->getOption( 't' );

		// 作成者名
		$author = $this->getOption( 'a' );

		// 出力先(一時保存ファイル名)
		$output = $this->getOption( 'out' );
		if ( empty( $output ) ) {
			$output = "php://stdout";
		} else {
			exec( "del {$output}" );
		}

		// SQL ファイル名
		$sqlFile = $this->getOption( 'sql' );

		// テーブル名を分解
		if ( strpos( $sqlFile, '_' ) === FALSE ) {
			// スネークケースではないのでキャメルケースとして分解
			$tableName = $this->splitCamel( $sqlFile );
		} else {
			// スネークケース
			$tableName = $this->splitSnake( $sqlFile );
		}

		// テンプレートを読み込む
		$template = $this->loadTemplate( $mode, $ext, $dir );

		$replace = array( );

		// SQL(Row)処理
		if ( !empty( $sqlFile ) ) {
			switch ( $mode ) {
			case 'Row':
				$this->jobRow( $replace, $sqlFile );
				break;

			case 'ListBase':
				$this->jobListSQL( $template, $replace, $sqlFile );
				break;

			case 'TransBase':
				$this->jobEditSQL( $template, $replace, $sqlFile );
				break;
			}
		}

		// ファイル名を設定
		$replace['@@filename@@'] = basename( $filename );

		// ベース名を設定(拡張子を除く)
		$replace['@@basename@@'] = $basename;
		$replace['@@Basename@@'] = $this->makeCamel( $splitName );

		// 拡張子(.を含まない)
		$replace['@@ext@@'] = substr( $ext, 1 );;

		// タイトルを設定
		if ( !empty( $title ) ) {
			$replace['@@title@@'] = $title;
		}

		// 作成者を設定
		if ( !empty( $author ) ) {
			$replace['@@author@@'] = $author;
		}

		// 作成日を設定
		$replace['@@date@@'] = date( 'Y-m-d' );;

		// Coryright の年を設定
		$replace['@@copyright@@'] = date( 'Y' );;

		// Class 名を設定
		// ファイル名にスペースを含むときはその後ろから(sql がこれに当たる)
		$i = strpos( $basename, ' ' );
		if ( $i !== FALSE ) {
			$replace['@@class@@'] = substr( $basename, $i + 1 );
		} else {
			$replace['@@class@@'] = $basename;
		}

		// @@snake@@ はスネークケース名
		// ※末尾の単語が Base の場合は除去される
		$replace['@@snake@@'] = $this->makeSnake( $splitName );

		// ターゲット名を取得
		// member_edit.php -> member
		// MemberEditBase -> member
		$replace['@@target@@'] = $this->makeSnake( array_slice( $splitName, 0, count( $splitName ) - 1 ) );
		$replace['@@Target@@'] = $this->makeCamel( array_slice( $splitName, 0, count( $splitName ) - 1 ) );
		$replace['@@TARGET@@'] = strtoupper( $replace['@@target@@'] );

		// テーブル名
		$replace['@@table@@'] = $this->makeSnake( array_slice( $tableName, 0, count( $tableName ) - 1 ) );
		$replace['@@Table@@'] = $this->makeCamel( array_slice( $tableName, 0, count( $tableName ) - 1 ) );
		$replace['@@TABLE@@'] = strtoupper( $replace['@@table@@'] );


		// グループ名を設定
		$replace['@@group@@'] = $this->makeSnake( array_slice( $splitName, 0, -1 ) );
		$replace['@@Group@@'] = $this->makeCamel( array_slice( $splitName, 0, -1 ) );

		// @@lastpage@@
		$a = explode( '_', $basename ); 
		$n = count( $a ) - 1;
		$iNum = 0;		// 現在のページ番号
		if ( preg_match( '/^([^0-9]*)([0-9]+)$/', $a[$n], $m ) === 1 ) {
			// 末尾の語が数字で終わっている
			// 数字部があるので前のページを設定
			$a[$n] = $m[1];		// 数字より前にだけにする

			$iNum = (int)$m[2];		// 数字を取得
			if ( $iNum == 1 )
				$b = implode( '_', $a );
			else
				$b = implode( '_', $a ) . ($iNum -1);

			$replace['@@lastpage@@'] = $b . $ext;
			$replace['@@last@@'    ] = $b;
		}

		// @@nextpage@@
		$replace['@@nextpage@@'] = implode( '_', $a ) . ($iNum + 1) . $ext;
		$replace['@@next@@'] = implode( '_', $a ) . ($iNum + 1);

		// ベースクラスを設定
		$replace['@@parent@@'] = $this->makeCamel( $a ) . 'Base';

		// 置換
		$str = str_replace( array_keys( $replace ), array_values( $replace ), $template );

		// 出力
		$fp = fopen( $output, 'w' );
		fwrite( $fp, $str );
		fclose( $fp );
	}
}

// 実行
$obj = new CpssWizard( );
$obj->exec( $argc, $argv );
exit( 0 );
?>