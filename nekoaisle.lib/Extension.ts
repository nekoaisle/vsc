import * as vscode from 'vscode';
import * as path from 'path';
import {Util} from './Util';

export interface ExtensionCallback {
	(...args: any[]): any
};

export interface ExtensionCommand {
	command: string,	// コマンド
	callback: ExtensionCallback		// 実行する関数
}

export interface ExtensionOptions {
	name: string,
	config?: string,
	commands?: ExtensionCommand[]
}

/**
 * 拡張機能基本クラス
 */
export class Extension {
    protected config: vscode.WorkspaceConfiguration;
	protected extensionRoot: string;

	/**
	 * 構築
	 * @param name 拡張機能名
	 * @param cmd  contributes.commands.command
	 */
	constructor(context: vscode.ExtensionContext, options: ExtensionOptions) {
//		console.log(`${options.name} が起動しました。`);

		// この拡張機能が格納されているディレクトリ名
		this.extensionRoot = context.extensionPath;

		// 設定の読み込み
		if ( options.config ) {
			this.config = vscode.workspace.getConfiguration(options.config);
		}

		// コマンドがあれば登録
		if ( options.commands ) {
			this.registerCommands(context, options.commands);
		}
	}

	/**
	 * settings.json からこの拡張機能用の設定を取得
	 * @param key 設定名
	 * @param def 設定されていないときに返す値
	 * @return string 設定
	 */
	public getConfig(key: string, def: string): string {
		let ret = this.config.get(key, def);
		if (ret) {
			return ret;
		}
		return def;
	}

	/**
	 * コマンドを登録
	 * @param context 
	 * @param ext 
	 */
	public registerCommand(context: vscode.ExtensionContext, command: string,callback: ExtensionCallback ) {
		let disp = vscode.commands.registerCommand(command, callback);
		context.subscriptions.push(disp);
	}

	/**
	 * コマンドを登録
	 * @param context 
	 * @param ext 
	 */
	public registerCommands(context: vscode.ExtensionContext, commands: ExtensionCommand[]) {
		for ( let cmd of commands ) {
			let disp = vscode.commands.registerCommand(cmd.command, cmd.callback );
			context.subscriptions.push(disp);
		}
	}

	/**
	 * 拡張機能フォルダー内に格納されているファイル名をフルパスにする
	 * @param filename ファイル名
	 */
	public joinExtensionRoot(filename: string): string {
		return path.join(this.extensionRoot, filename);
	}
}
