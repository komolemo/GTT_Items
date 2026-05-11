# GTT_Items ES module version

Issue #18 用の ES module 版です。

## 構成

| ファイル | 役割 |
| --- | --- |
| `GTT_Items.js` | ES module 版の入口 |
| `GTT_Items_Core.js` | 名前空間、定数、共通ヘルパー、入力キー登録 |
| `GTT_Items_Game.js` | `Game_ItemSlot`、`Game_ItemSlotContainer`、`Game_Party` 拡張 |
| `GTT_Items_Windows.js` | `Window_StackItemList`、`Window_HotBar` |
| `GTT_Items_Scenes.js` | `Scene_Map` 接続 |

## 初期化

```js
import setupGttItems from "./GTT_Items.js";

setupGttItems();
```

`setupGttItems()` は次の順番で初期化します。

1. `setupCore()`
2. `setupGame()`
3. `setupWindows()`
4. `setupScenes()`

## 注意

- 通常の RPG Maker MZ プラグイン登録用ファイルは、従来どおり親ディレクトリの `GTT_Items.js` です。
- この `modules/` 配下は ES module として読み込む用途の並行版です。
- 各 module は必要なクラスと `setup...()` 関数を `export` します。
