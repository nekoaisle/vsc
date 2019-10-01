'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const OpenFile = require("./OpenFile");
const OpenRelated = require("./OpenRelated");
const OpenNew = require("./OpenNew");
const OpenTemp = require("./OpenTemp");
const InsertFile = require("./InsertFile");
const OpenHist = require("./OpenHist");
const OpenTag = require("./OpenTag");
const FindOpen = require("./FindOpen");
/**
 * エクステンション起動
 * @param context
 */
function activate(context) {
    let openFile = new OpenFile(context);
    let openRelated = new OpenRelated(context);
    let openNew = new OpenNew(context);
    let openTemp = new OpenTemp(context);
    let insertFile = new InsertFile(context);
    let openHist = new OpenHist(context);
    let openTag = new OpenTag(context);
    let findOpen = new FindOpen(context);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map