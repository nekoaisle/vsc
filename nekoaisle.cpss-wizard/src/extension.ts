'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as chproc from 'child_process';
import {Util, Extension, SelectFile} from './nekoaisle.lib/nekoaisle';

export function activate(context: vscode.ExtensionContext) {
	let ext = new CpssWizard(context);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

/**
 * オプションの定義
 */
class Options {
	// wizardファイル名
	public wizard     : string;
	// 標準テンプレート格納ディレクトリ
	public templateDir: string;
	// SQLファイル格納ディレクトリ
	public sqlDir     : string;
	// php格納ディレクトリ
	public php        : string;
	// 出力ファイル名
	public outFile    : string;
	// 著者名
	public author     : string;

	// モード
	public mode?      : string = '';
	public title?     : string = '';
	public name?      : string = '';
	public sqlFile?   : string = '';

	/**
	 * 構築
	 * @param config 設定オブジェクト
	 */
	public constructor (config: vscode.WorkspaceConfiguration, defaults: Options) {
		// ファイル名
		this.wizard      = Util.normalizePath(config.get('wizard'     , defaults.wizard     ));
		this.templateDir = Util.normalizePath(config.get('templateDir', defaults.templateDir));
		this.sqlDir      = Util.normalizePath(config.get('sqlDir'     , defaults.sqlDir     ));
		this.php         = Util.normalizePath(config.get('php'        , defaults.php        ));
		this.outFile     = Util.normalizePath(config.get('outFile'    , defaults.outFile    ));

		// 
		this.author      = config.get('author', defaults.author);
	}
};

/**
 * 必ず解決(resolve)するプロミス
 */
export function resolveSurelyPrimise(str: string): Promise<string> {
	return new Promise<string>((resolve: (value?: string) => void, reject: (reason?: any) => void) => {
		resolve(str);
	});
}
/**
 * 必ず拒否(reject)するプロミス
 */
export function rejectSurelyPrimise(str: string): Promise<string> {
	return new Promise<string>((resolve: (value?: string) => void, reject: (reason?: any) => void) => {
		reject(str);
	});
}

class CpssWizard extends Extension {
	// メニューに対応するモードとファイル名
	protected modeInfos = {
		'1 標準テンプレート': {
			mode: 'standard',
			name: 'template',
		},
		'2 トランザクション基本クラス': {
			mode: 'TransBase',
			name: 'TransBase',
		},
		'3 トランザクション初期化ページ': {
			mode: 'TransInit',
			name: 'TransInit',
		},
		'4 トランザクション編集ページ': {
			mode: 'TransEdit',
			name: 'TransEdit',
		},
		'5 トランザクション確認ページ': {
			mode: 'TransConfirm',
			name: 'TransConfirm',
		},
		'6 トランザクション完了ページ': {
			mode: 'TransCompleted',
			name: 'TransCompleted',
		},
		'7 一覧基本クラス': {
			mode: 'ListBase',
			name: 'ListBase',
		},
		'8 一覧初期化ページ': {
			mode: 'ListInit',
			name: 'ListInit',
		},
		'9 一覧ページ': {
			mode: 'ListList',
			name: 'ListList',
		},
		'A CCamRow 派生クラス': {
			mode: 'Row',
			name: 'Row',
		},
	};

	protected defaultOptions: Options = {
		wizard     : "~/Dropbox/documents/PHP/CpssWizardUTF8.php",
		templateDir: "~/Dropbox/documents/hidemaru",
		sqlDir     : '~/network/campt-kiya/Installer/CREATE_TABLE',
		php        : '/usr/bin/php7.1',
		outFile    : "php://stdout",
		author     : "木屋善夫",
	};

	/**
	 * 構築
	 */
	constructor(context: vscode.ExtensionContext) {
		super(context, {
			name: 'Cpss Wizard',
			config: 'cpssWizard',
			commands: [
				{
					command: 'nekoaisle.cpssWizard',
					callback: () => {
						this.entry();
					}
				}
			]
		});
	}

	/**
	 * エントリー
	 */
	public entry() {
		// 設定を取得
		// 設定取得
		let options: Options = new Options(this.config, this.defaultOptions);

		// 一覧からモードを選択
		// 情報配列からメニューを作成
		let menu: string[] = [];
		for ( let key in this.modeInfos ) {
			menu[menu.length] = key;
		}
		let opt: vscode.QuickPickOptions = {
			placeHolder: '選択してください。'
		};
		vscode.window.showQuickPick(menu, opt).then((mode: string) => {
			// モードが指定されなかったら終了
			if ( !mode ) {
				return rejectSurelyPrimise('');
			}
			let info = this.modeInfos[mode];
			if ( !info ) {
				return rejectSurelyPrimise('');
			}

			console.log(`mode = "${mode}"`);

			options.mode = info.mode;
			options.name = info.name;

			// InputBoxを表示してタイトルを求める
			var ioption = {
				prompt: "タイトルを入力してください。",
				password:false,
				value:"",
			};
			return vscode.window.showInputBox(ioption);
		}).then((title: string) => {
			if ( !title || (title.trim().length == 0) ) {
				// タイトルが指定されなかったときは何もしない
				return rejectSurelyPrimise('');
			}

			console.log(`title = "${title}"`);
			options.title = title;

			// SQLファイルを選択
			if ( fs.existsSync(options.sqlDir) ) {
				let sel = new SelectFile();
				return sel.selectFile(`${options.sqlDir}`, 'SQLファイルを選択してください。(不要な場合はESC)');
			} else {
				return resolveSurelyPrimise('');
			}
		}).then((sqlFile: string) => {
			console.log(`sqlFile = "${sqlFile}"`);
			options.sqlFile = sqlFile;
			this.execWizard(options);
		}); 
	}

	protected execWizard(options: Options) {
		//ドキュメントを取得
		let editor = vscode.window.activeTextEditor;

		// // 出力ウィンドウの生成
		// var overview = vscode.window.createOutputChannel( "quick-filter" );
		// // 出力ウィンドウをクリア
		// overview.clear();

		// 現在編集中のファイル名を解析
		let fileName = editor.document.fileName;
		let pinfo = path.parse( fileName );
		// console.log( "dir  = " + pinfo.dir  );
		// console.log( "base = " + pinfo.base );
		// console.log( "name = " + pinfo.name );
		// console.log( "ext  = " + pinfo.ext  );
		if ( !pinfo.ext ) {
			// 拡張子がない
			Util.putMess( "拡張子のないファイルには対応していません。" );
			return false;
		}

		// テンプレートファイルを探す
		let t = [
			// ファイルの存在するディレクトリの template ディレクトリを探す
			`${pinfo.dir}/template/${options.name}${pinfo.ext}`,
			`${pinfo.dir}/template/template${pinfo.ext}`,
			// ファイルの存在するディレクトリ直下の template ファイルを探す
			`${pinfo.dir}/${options.name}${pinfo.ext}`,
			`${pinfo.dir}/template${pinfo.ext}`,
			// デフォルトのテンプレートを探す
			`${options.templateDir}/${options.name}${pinfo.ext}`,
			`${options.templateDir}/template${pinfo.ext}`,
		];
		let tmpl;
		for ( var k in t ) {
			if ( Util.isExistsFile( t[k] ) ) {
				tmpl = t[k];
				break;
			}
		}
		console.log( "template = " + tmpl );

		if ( !tmpl ) {
			var s = "テンプレートファイルが見つかりませんでした。\n";
			for ( var k in t ) {
				s += t[k] + "\n";
			}
			Util.putMess( s );
			return false;
		}

		// コマンドラインを作成
		let cmd = `${options.php} ${options.wizard} "-m=${options.mode}" "-f=${fileName}" "-t=${
options.title}" "-a=${options.author}" "-out=${options.outFile}" "-tmpl=${tmpl}" "-sql=${options.sqlFile}"`;
		console.log( cmd );

		// 実行
		chproc.exec( cmd, (err, stdout: string, stderr: string) => {
			if ( err == null ) {
				console.log(stdout);
				editor.edit(function(edit) {
					edit.insert( new vscode.Position( 0, 0 ), stdout );
				});
			} else {
				// エラーが発生
				console.log("error: " + err.message);
				console.log("stderr:");
				console.log(stderr);
				console.log("stdout:");
				console.log(stdout);
				Util.putMess(err.message);
				return false;
			}
		});
	}
}

