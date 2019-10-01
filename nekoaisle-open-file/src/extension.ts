'use strict';
import * as vscode from 'vscode';
import {Extension, SelectFile, PathInfo} from './nekoaisle.lib/nekoaisle';
import OpenFile = require( './OpenFile' );
import OpenRelated = require( './OpenRelated' );
import OpenNew = require( './OpenNew' );
import OpenTemp = require('./OpenTemp');
import InsertFile = require('./InsertFile');
import OpenHist = require('./OpenHist');
import OpenTag = require('./OpenTag');
import FindOpen = require('./FindOpen');

/**
 * エクステンション起動
 * @param context 
 */
export function activate(context: vscode.ExtensionContext) {
  let openFile = new OpenFile(context);
  let openRelated = new OpenRelated(context);
  let openNew = new OpenNew(context);
  let openTemp = new OpenTemp(context);
  let insertFile = new InsertFile(context);
  let openHist = new OpenHist(context);
  let openTag = new OpenTag(context);
  let findOpen = new FindOpen(context);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

