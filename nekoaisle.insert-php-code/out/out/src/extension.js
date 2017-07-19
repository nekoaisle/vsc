'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function activate(context) {
    console.log('Start InsertPhpCode.');
    // 指定文字でパディング
    let pad = (str, pad, cols) => {
        pad = str.repeat(cols);
        return (pad + str).slice(-cols);
    };
    let padNum = (num, cols) => {
        return pad(num.toString(), "0", cols);
    };
    let disposable = vscode.commands.registerCommand('extension.insertPhpCode', () => {
        // let menu: string[] = [
        //     'D: 今日',
        //     'F: ファイル名',
        //     'P: フルパス名',
        // ];
        // let options: vscode.QuickPickOptions = {
        //     placeHolder: '選択してください。'
        // };
        // let sel;
        // vscode.window.showQuickPick( menu, options ).then( (str: string) => sel = str.substr(0, 1) );
        // // TextEditorを取得
        // let editor = vscode.window.activeTextEditor;
        // let str = '';
        // switch ( sel ) {
        //     // 日付
        //     case 'D': {
        //         let now = new Date();
        //         str = `${now.getFullYear()}-${padNum(now.getMonth(), 2)}-${padNum(now.getDate(), 2)}`; 
        //         break;
        //     }
        //     // ファイル名
        //     case 'F': {
        //         let path = require( 'path' );
        //         let fileName = editor.document.fileName;
        //         let pinfo = path.parse( fileName );
        //         str = pinfo.base;
        //         break;
        //     }
        //     // フルパス名
        //     case 'P': {
        //         str = editor.document.fileName;
        //         break;
        //     }
        // }
        // // 現在のカーソル位置に挿入
        // console.log(str);
        // editor.edit(edit => edit.insert(editor.selection.start, str));
        console.log("Hello");
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map