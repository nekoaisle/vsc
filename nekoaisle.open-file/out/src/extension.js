'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const OpenFile = require("./OpenFile");
const OpenRelated = require("./OpenRelated");
const OpenNew = require("./OpenNew");
const OpenTemp = require("./OpenTemp");
/**
 * エクステンション起動
 * @param context
 */
function activate(context) {
    let openFile = new OpenFile(context);
    let openRelated = new OpenRelated(context);
    let openNew = new OpenNew(context);
    let openTemp = new OpenTemp(context);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map