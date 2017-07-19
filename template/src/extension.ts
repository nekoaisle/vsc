'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// import * as process from 'child_process';
// import * as fs from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Kya template が起動しました。');

    /**
     * メッセージを出力
     * @param str 出力するメッセージ
     */
    var message = function ( str ) {
        vscode.window.showInformationMessage( str );
    }

    /**
     * ファイルが存在するか調べる
     * @param path 調べるファイルの名前
     */
    // function isExistsFile( path ) {
    //     if ( !path ) {
    //         // ファイル名が指定されなかったときは「存在しない」を返す
    //         return false;
    //     }
    //     try {
    //         fs.accessSync( path );
    //     } catch ( e ) {
    //         // エラーが発生したので「存在しない」を返す
    //         return false;
    //     }
    //     // 正常終了したので「存在する」を返す
    //     return true;
    // }

    var param = {
        homeDir    : "/home/kiya",
        wizard     : "/home/kiya/Dropbox/documents/PHP/CpssWizardUTF8.php",
//        tempFile: "/home/kiya/temp/CpssWizard.txt",
        outFilename: "stdout",
        templateDir: "/home/kiya/Dropbox/documents/hidemaru",
        author     : "木屋善夫",
        mode       : "standard",
        php        : "/usr/bin/php",
    };

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand( 'extension.makeInitial', () => {
        // The code you place here will be executed every time your command is executed

        // フィルタして出力
        var execWizard = function ( title ) {
        //     //ドキュメントを取得
        //     var editor = vscode.window.activeTextEditor;

        //     // 出力ウィンドウの生成
        //     var overview = vscode.window.createOutputChannel( "quick-filter" );
        //     // 出力ウィンドウをクリア
        //     overview.clear();

        //     // 現在編集中のファイル名を解析
        //     var path = require('path');
        //     var fileName = editor.document.fileName;
        //     var pinfo = path.perse( fileName );

        //     // テンプレートファイルを探す
	    //     var t = [
        //         // ファイルの存在するディレクトリの template ディレクトリを探す
        //         pinfo.dir + "/template/template" + pinfo.ext,
        //         // ファイルの存在するディレクトリ直下の template ファイルを探す
        //         pinfo.dir + "/template" + pinfo.ext,
        //         // 拡張仕事に定められたテンプレートを探す
        //         param.templateDir + "/template" + pinfo.ext,
        //     ];
        //     var tmpl;
        //     for ( var k in t ) {
        //         if ( isExistsFile( t[k] ) ) {
        //             tmpl = t[k];
        //             break;
        //         }
        //     }

        //     if ( !tmpl ) {
        //         var s = "テンプレートファイルが見つかりませんでした。\n";
        //         for ( var k in t ) {
        //             s += t[k] + "\n";
        //         }
        //         message( s );
        //     }

        //     // コマンドラインを作成
        //     var cmd = 
        //           param.php
        //         + ' ' + param.wizard
        //           ' -m=' + param.mode
        //         + ' "-f=' + param.outFilename
        //         + ' "-t=' + title
        //         + ' "-a=' + param.author
        //         + ' "-tmpl=' + tmpl
        //     ;

        //     overview.appendLine( "filename: " + fileName + "\n" );
        //     process.exec( cmd, function ( err, stdout, stderr ) {
        //         if ( !err ) {
        //             overview.appendLine( stdout );
        //         } else {
        //             overview.appendLine( stderr );
        //             //出力ウィンドウの表示
        //             overview.show(true);
        //             message( err );
        //         }
        //     });

        //     //出力ウィンドウの表示
        //     overview.show(true);

            //     for ( var i =0; i < _editor_obj.document.lineCount; ++i ) {
            //         if ( ~editor.document.lineAt(i).text.indexOf(search_str) ) {
            //             var oneline = editor.document.lineAt(i).text + "\n";
        }

        //空文字ならInputBoxを表示
        var ioption = {
            password:false,
            value:"",
            comments: "タイトルを入力してください。",
        };
        vscode.window.showInputBox(ioption).then(execWizard);
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}