import * as vscode from 'vscode';
/**
 * 拡張機能基本クラス
 */
export class Extention {
	public extentionName: string;
	public command: string;
	public extentionKey: string[];

    protected config: vscode.WorkspaceConfiguration;
	
	/**
	 * 構築
	 * @param name 拡張機能名
	 * @param cmd  contributes.commands.command
	 */
	constructor(name: string, cmd: string) {
		this.extentionName = name;
		this.command = cmd;
		this.extentionKey  = cmd.split('.');
	    console.log( `${this.extentionName} が起動しました。` );

		this.config = vscode.workspace.getConfiguration(this.extentionKey[0]);
	}

	/**
	 * エントリー
	 */
	public exec() {
	}

	/**
	 * settings.json からこの拡張機能用の設定を取得
	 * @param key 設定名
	 * @param def 設定されていないときに返す値
	 * @return string 設定
	 */
	public getConfig(key: string, def: string): string {
		return this.config.get(key, def);
	}

	/**
	 * コマンドを登録
	 * @param context 
	 * @param ext 
	 */
	public registerCommand(context: vscode.ExtensionContext) {
		let disp = vscode.commands.registerCommand(this.command, () => {
			this.exec();
		});
		context.subscriptions.push(disp);
	}
}
