'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const OpenFile = require("./OpenFile");
const OpenRelated = require("./OpenRelated");
const OpenNew = require("./OpenNew");
/**
 * エクステンション起動
 * @param context
 */
function activate(context) {
    let openFile = new OpenFile();
    openFile.registerCommand(context);
    let openRelated = new OpenRelated();
    openRelated.registerCommand(context);
    let openNew = new OpenNew();
    openNew.registerCommand(context);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map