'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import { Util, PathInfo, DateInfo } from './nekoaisle.lib/nekoaisle';

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
    const configKey = "cpssDecorator";

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
     * 現在の拡張子に対応するデザインとハイライトの読み込み
     */
    function loadSettingByExtension() {
        // 現在編集中のファイルの拡張子を取得
        let ext = Util.getDocumentExt(activeEditor.document, true);
        // 未読み込みならばデザインの読み込み
        if (!designs[ext]) {
            let fn = `${configDir}/designs-${ext}.json`;
            if (Util.isExistsFile(fn)) {
                designs[ext] = Util.loadFileJson(fn);
            }
        }
        // 未読み込みならばハイライトの読み込み
        if (!highlights[ext]) {
            let fn = `${configDir}/highlights-${ext}.json`;
            if (Util.isExistsFile(fn)) {
                highlights[ext] = Util.loadFileJson(fn);
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

        for (let info of highlights[ext]) {
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
                const start = activeEditor.document.positionAt(match.index);
                const end = activeEditor.document.positionAt(match.index + match[0].length);
                ranges.push(new vscode.Range(start, end));
            }
            if (ranges.length > 0) {
                let deco = vscode.window.createTextEditorDecorationType(designs[ext][info.design]);
                activeEditor.setDecorations(deco, ranges);
            }
        }
    }
}
