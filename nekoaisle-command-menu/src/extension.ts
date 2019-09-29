'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Util, Extension, PathInfo, DateInfo } from './nekoaisle.lib/nekoaisle';

export function activate(context: vscode.ExtensionContext) {
    let ext = new CommandMenu(context);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

interface ListItem {
	label: string;          // メニューラベル
	detail?: string;        // 詳細
	description?: string;   // 説明
	command: string;       	// コマンド指定
	args?: { [key: string]: string }[];        // インラインテンプレート
	fileType?: string|string[];			// ファイルタイプ指定
}

class CommandMenu extends Extension {
	/**
	 * 構築
	 */
	constructor(context: vscode.ExtensionContext) {
		super(context, {
			name: 'コマンドメニュー',
			config: 'nekoaisle-commandMenu',
			commands: [{
				command: 'nekoaisle.commandMenu',
				callback: () => { this.entry(); }
			}]
		});
	}

	static defaults: ListItem[] = [
		{
			label: "/: ドキュメントをフォーマット",
			command: "editor.action.formatDocument"
		},
		{
			label: "[: 対応するタグにジャンプ" ,
			command: "editor.emmet.action.matchTag",
			fileType: "html",

		},
		{
			label: "\\: 文字コードを変更",
			command: "workbench.action.editor.changeEncoding"
		},
		{
			label: "]: 対応するカッコへジャンプ",
			command: "editor.action.jumpToBracket"
		},
		{
			label: "1: 行ジャンプ",
			command: "nekoaisle.jumpToLineNumber1"
		},
		{
			label: "2: 行ジャンプ",
			command: "nekoaisle.jumpToLineNumber2"
		},
		{
			label: "3: 行ジャンプ",
			command: "nekoaisle.jumpToLineNumber3"
		},
		{
			label: "4: 行ジャンプ",
			command: "nekoaisle.jumpToLineNumber4"
		},
		{
			label: "5: 行ジャンプ",
			command: "nekoaisle.jumpToLineNumber5"
		},
		{
			label: "6: 行ジャンプ",
			command: "nekoaisle.jumpToLineNumber6"
		},
		{
			label: "7: 行ジャンプ",
			command: "nekoaisle.jumpToLineNumber7"
		},
		{
			label: "8: 行ジャンプ",
			command: "nekoaisle.jumpToLineNumber8"
		},
		{
			label: "9: 行ジャンプ",
			command: "nekoaisle.jumpToLineNumber9"
		},
		{
			label: "C: ターミナルにカーソルを移動",
			command: "workbench.action.terminal.focus"
		},
		{
			label: "E: 変換メニューを開く",
			command: "nekoaisle.encode"
		},
		{
			label: "F: ファイルを開く",
			command: "workbench.action.files.openFile"
		},
		{
			label: "H: 関連ファイルを開く",
			command: "nekoaisle.openRelated"
		},
		{
			label: "I: 定型文を挿入",
			command: "nekoaisle.insertCode"
		},
		{
			label: "K: 過去に開いことのあるファイルを開く",
			command: "nekoaisle.openHist"
		},
		{
			label: "L: ファイルを挿入",
			command: "nekoaisle.insertFile"
		},
		{
			label: "P: CPSS ウィザード",
			command: "nekoaisle.cpssWizard"
		},
		{
			label: "Q: 現在のエディタを閉じる",
			command: "workbench.action.closeActiveEditor"
		},
		{
			label: "R: 直前のカーソル位置にジャンプ",
			command: "nekoaisle.markjumpReturn"
		},
		{
			label: "S: 行ソート",
			command: "editor.action.sortLinesAscending"
		},
		{
			label: "T: タスクを実行",
			command: "workbench.action.tasks.runTask"
		},
		{
			label: "W: 一時ファイルを開く",
			command: "nekoaisle.openTemp"
		},
		{
			label: "X: ファイラーを開く",
			command: "nekoaisle.openFiler"
		},
	];

	/**
	 * エントリー
	 */
	protected entry() {
		// 実行されたときの TextEditor
		if (!vscode.window.activeTextEditor) {
			return;
		}
		let editor = <vscode.TextEditor>vscode.window.activeTextEditor;

		// コマンドの読み込み
		let menuInfo: ListItem[] = this.getConfig('menu', CommandMenu.defaults);

		// メニューを作成
		let menu: vscode.QuickPickItem[] = [];
		for (let item of menuInfo) {
			menu.push({
				label: item.label,
				description: item.description,
				detail: item.detail,
				
			});
		}

		let options: vscode.QuickPickOptions = {
			placeHolder: '選択してください。',
			matchOnDetail: false,
			matchOnDescription: false
		};
		// vscode.window.showQuickPick(menu, options).then((pick: vscode.QuickPickItem | undefined) => {
		// 	if (!pick) {
		// 		// 未選択
		// 		return;
		// 	}

		// 	let sel: ListItem | null = null;
		// 	for (let item of menuInfo) {
		// 		if (item.label === pick.label) {
		// 			sel = item;
		// 		}
		// 	}
		// 	if (!sel) {
		// 		return;
		// 	}

		// 	vscode.commands.executeCommand(sel.command, sel.args);
		// });

		const quickPick = vscode.window.createQuickPick();
		quickPick.items = menu;
		quickPick.placeholder = '選択してください。';
		quickPick.matchOnDetail = false;
		quickPick.matchOnDescription = false;

		let exec = (label: string): boolean => {
			let len = label.length;
			if (!len) {
				return false;
			}

			let sel: ListItem | null = null;
			for (let item of menuInfo) {
				if (item.label.substr(0, len) === label) {
					sel = item;
				}
			}
			if (!sel) {
				return false;
			}

			vscode.commands.executeCommand(sel.command, sel.args);
			return true;
		};

		/** */
		quickPick.onDidChangeValue((e: string) => {
			if (exec(e.toUpperCase())) {
				quickPick.hide();
			}
		});

		/**
		 * エンターを押した処理
		 */
		quickPick.onDidAccept(() => {
			let picks = quickPick.selectedItems;
			if (picks.length === 1) {
				let pick = picks[0];
				if (pick) {
					// 選択
					exec(pick.label);
				}
			}
			// エンター押した場合は必ず閉じる
			quickPick.hide();
		});

		// 非表示にしたら破棄
		quickPick.onDidHide(() => quickPick.dispose());

		// 開く
		quickPick.show();
	}

}