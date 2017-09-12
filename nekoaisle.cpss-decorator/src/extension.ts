'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import { Util, PathInfo, DateInfo } from './nekoaisle.lib/nekoaisle';

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
    const configKey = "cpssDecorator";

    let disp = vscode.commands.registerCommand('nekoaisle.cpssDecoratorRefresh', () => {
        // 読み込み済みのデザインをクリア
        designs = {};
        // 読み込み済みの強調表示をクリア
        highlights = {};

        // 現在編集中のファイル用のデザインと強調表示を読み込む
        loadSettingByExtension();
        if (activeEditor) {
            // 強調表示の設定
            triggerUpdateDecorations();
        }
    });
    context.subscriptions.push(disp);


    /**
     * 強調表示情報
     */
    interface Highlight {
        regexp: string,     // 対象を特定する正規表現
        design: string,   // 装飾名
    };

	/**
	 * settings.json からこの拡張機能用の設定を取得
	 * @param key 設定名
	 * @param def 設定されていないときに返す値
	 * @return string 設定
	 */
	function getConfig<TYPE>(key: string, def: TYPE): TYPE {
        if (!config) {
            // まだ読み込まれていないので読み込む
            config = vscode.workspace.getConfiguration(configKey);
        }
        let ret = config.get(key, def);
		if (ret) {
			return ret;
		}
		return def;
	}

	/**
     * テンプレート格納ディレクトリ名を取得
	 * @param dirName ディレクトリ名
	 * @param settingsKey settings.json のサブキー
     * @return string テンプレート格納ディレクトリ名
	 */
	function getConfigDir(dirName: string, settingsKey: string): string {
        // デフォルトのテンポラリディレクトリ名
        // 拡張機能フォルダー内に格納されているファイル名をフルパスにする
        let res = path.join(context.extensionPath, dirName);

        // settings.json よりテンプレートディレクトリを取得
        res = getConfig(settingsKey, res);

        // 先頭の ~ を置換
        res = Util.normalizePath(res);

        //
        return res;
    }

    /**
     * デザイン用 JSON ファイルを読み込む
     * @param fileName ファイル名
     */
    function loadDesign(fileName: string): object {
        // json ファイルの読み込み
        let json = Util.loadFileJson(fileName);

        // JSONにかけない変数は文字列として記述されているので変換
        for (let name in json) {
            for (let key in json[name]) {
                switch (key) {
                    case 'overviewRulerLane': {
                        let m = /vscode\.OverviewRulerLane\.(.*)/.exec(json[name][key]);
                        switch (m[1]) {
                            case 'Left': json[name][key] = vscode.OverviewRulerLane.Left; break;
                            case 'Center': json[name][key] = vscode.OverviewRulerLane.Center; break;
                            case 'Right': json[name][key] = vscode.OverviewRulerLane.Right; break;
                            case 'Full': json[name][key] = vscode.OverviewRulerLane.Full; break;
                        }
                        break;
                    }
                    case 'rangeBehavior': {
                        let m = /vscode\.DecorationRangeBehavior\.(.*)/.exec(json[name][key]);
                        switch (m[1]) {
                            case 'OpenOpen': json[name][key] = 'OpenOpen'; break;
                            case 'ClosedClosed': json[name][key] = 'ClosedClosed'; break;
                            case 'OpenClosed': json[name][key] = 'OpenClosed'; break;
                            case 'ClosedOpen': json[name][key] = 'ClosedOpen'; break;
                        }    
                        break;
                    }    
                }
            }
        }

        //
        return json;
    }

    /**
     * 現在の拡張子に対応するデザインとハイライトの読み込み
     * @param force true を指定すると強制的に読み込みます
     */
    function loadSettingByExtension() {
        // まずは共通設定の読み込み
        if (!designs['common']) {
            let fn = `${configDir}/designs.json`;
            let json = {};
            if (Util.isExistsFile(fn)) {
                json = loadDesign(fn);
            }
            designs['common'] = json;
        }
        if (!highlights['common']) {
            let fn = `${configDir}/highlights.json`;
            let json = [];
            if (Util.isExistsFile(fn)) {
                json = Util.loadFileJson(fn);
            }
            highlights['common'] = json;
        }

        // 現在編集中のファイルの拡張子を取得
        let ext = Util.getDocumentExt(activeEditor.document, true);
        if (!designs[ext]) {
            // まず共通設定を設定
            designs[ext] = Util.cloneObject( designs['common'] );

            // 拡張子別設定をマージ
            let fn = `${configDir}/designs-${ext}.json`;
            if (Util.isExistsFile(fn)) {
                let json = loadDesign(fn);
                for (let key in json) {
                    designs[ext][key] = json[key];
                }
            }
        }
        // 未読み込みならばハイライトの読み込み
        if (!highlights[ext]) {
            // まず共通設定を設定
            highlights[ext] = Util.cloneObject( highlights['common'] );
            
            // 拡張子別設定をマージ
            let fn = `${configDir}/highlights-${ext}.json`;
            if (Util.isExistsFile(fn)) {
                let json = Util.loadFileJson(fn);
                for (let key in json) {
                    highlights[ext].push(json[key]);
                }
            }
        }
    }

    // config のキャッシュ
    let config;

	// テンプレート格納ディレクトリ名を取得
	let configDir = getConfigDir("data", "dataDir");

    let timeout = null;

    /**
     * デザインキャッシュ
     * { "デザイン名": DecorationRenderOptions, ... }
     */
    let designs = {};

    /**
     * 強調表示リストを読み込む
     * Hilight[]
     */
    let highlights = {};

    // getConfigDir

    /**
     * 最初の装飾処理
     */
    let activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        loadSettingByExtension();
        triggerUpdateDecorations();
    }

    /**
     * エディータ切り替えイベントハンドラ
     */
    vscode.window.onDidChangeActiveTextEditor(editor => {
        activeEditor = editor;
        if (editor) {
            // 拡張子ごとの設定を読み込む
            let ext = Util.getDocumentExt(activeEditor.document, true);
            if (!designs[ext] || !highlights[ext]) {
                loadSettingByExtension();
            }

            // 実行
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

    /**
     * ドキュメント変更イベントハンドラ
     */
    vscode.workspace.onDidChangeTextDocument(event => {
        if (activeEditor && event.document === activeEditor.document) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

    /**
     * 遅延装飾処理
     * １文字ごとにやっていたのでは大量変更時に重くなるので 0.5 秒ごとに処理している
     */
    function triggerUpdateDecorations() {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(updateDecorations, 500);
    }

    /**
     * 設定した装飾
     */
    let attachedDecorations: vscode.TextEditorDecorationType[] = [];

    /**
     * 装飾処理
     */
    function updateDecorations() {
        if (!activeEditor) {
            return;
        }

        let ext = Util.getDocumentExt(activeEditor.document, true);
        if (!designs[ext] || !highlights[ext]) {
            return;
        }

        // 前回設定した装飾をクリア
        for (let deco of attachedDecorations) {
            deco.dispose();
        }
        attachedDecorations = [];

        for (let key in highlights[ext]) {
            let info = highlights[ext][key];
            if (!designs[ext][info.design]) {
                // デザインがないので無視
                continue;
            }

            // 強調する範囲を格納する配列
            const ranges: vscode.Range[] = [];
            // 全テキストを取得
            const text = activeEditor.document.getText();
            // const re = new RegExp(info.regexp, 'g');
            const re = new RegExp(info.regexp, 'g');
            let match;
            while (match = re.exec(text)) {
                ranges.push(new vscode.Range(
                    activeEditor.document.positionAt(match.index),
                    activeEditor.document.positionAt(match.index + match[0].length)
                ));
            }
            if (ranges.length > 0) {
                // 装飾を作成
                let deco = vscode.window.createTextEditorDecorationType(designs[ext][info.design]);
                // 装飾を設定
                activeEditor.setDecorations(deco, ranges);
                // 今回設定した装飾を記憶
                attachedDecorations.push(deco);
            }
        }
    }
}
