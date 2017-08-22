'use strict';
import * as vscode from 'vscode';
import {Extension, SelectFile, PathInfo} from './nekoaisle.lib/nekoaisle';
import OpenFile = require( './OpenFile' );
import OpenRelated = require( './OpenRelated' );
import OpenNew = require( './OpenNew' );
import OpenTemp = require( './OpenTemp' );

/**
 * エクステンション起動
 * @param context 
 */
export function activate(context: vscode.ExtensionContext) {
	let openFile = new OpenFile(context);
	let openRelated = new OpenRelated(context);
	let openNew = new OpenNew(context);
	let openTemp = new OpenTemp(context);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

