/**
 * 構築
 */
constructor(context, vscode.ExtensionContext);
{
    super(context, {
        name: '拡張機能名',
        config: '',
        commands: [
            {
                command: 'nekoaisle.',
                callback: () => {
                    this.exec();
                }
            }
        ]
    });
}
//# sourceMappingURL=constructor.js.map