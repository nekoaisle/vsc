'use strict';
import * as vscode from 'vscode';
import {Extention, SelectFile, PathInfo} from './nekoaisle.lib/nekoaisle';
import OpenFile = require( './OpenFile' );
import OpenRelated = require( './OpenRelated' );
import OpenNew = require( './OpenNew' );

/**
 * エクステンション起動
 * @param context 
 */
export function activate(context: vscode.ExtensionContext) {
	let openFile = new OpenFile();
	openFile.registerCommand(context);

	let openRelated = new OpenRelated();
	openRelated.registerCommand(context);

	let openNew = new OpenNew();
	openNew.registerCommand(context);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

