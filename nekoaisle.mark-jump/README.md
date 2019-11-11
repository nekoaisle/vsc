# markjump について

現在のカーソル位置を記憶しそこにジャンプすることができます。  
また、前回のカーソル位置に戻ることができます。操作を間違えてわけのわからないところにジャンプしてしまった後などに便利だと思います。

## Features

|コマンド                |機能                          |キー割り当て|
|------------------------|------------------------------|------------|
|nekoaisle.markjumpMark  |現在のカーソル位置をマーク    |escape m    |
|nekoaisle.markjumpJump  |最後にマークした位置にジャンプ|escape j    |
|nekoaisle.markjumpReturn|前回のカーソル位置にジャンプ  |escape r    |


### nekoaisle.markjumpReturn
Ver.1.40 にて cursorUndo が実装されたので廃止予定