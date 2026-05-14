//=============================================================================
// RPG Maker MZ - GTT_Items ES Module Entry
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Slot based item management system.
 * @author Getatumuri
 *
 * @param inventorySlotSize
 * @text Inventory Slot Size
 * @type number
 * @min 1
 * @default 50
 *
 * @param itemBoxSlotSize
 * @text Item Box Slot Size
 * @type number
 * @min 0
 * @default 200
 *
 * @param defaultStackSize
 * @text Default Stack Size
 * @type number
 * @min 1
 * @default 99
 *
 * @help GTT_Items.js
 *
 * This plugin replaces party item counts with slot based stacks.
 * It does not modify any rmmz_xxxx.js file.
 *
 * This file is the plugin entry point. It loads the layer files in this order:
 * 1. GTT_Items_Core.js
 * 2. GTT_Items_Game.js
 * 3. GTT_Items_Windows.js
 * 4. GTT_Items_Scenes.js
 */

/*:ja
 * @target MZ
 * @plugindesc スロット式のアイテム管理システムを追加します。
 * @author Getatumuri
 *
 * @param inventorySlotSize
 * @text インベントリ枠数
 * @type number
 * @min 1
 * @default 50
 *
 * @param itemBoxSlotSize
 * @text アイテムボックス枠数
 * @type number
 * @min 0
 * @default 200
 *
 * @param defaultStackSize
 * @text 標準スタック数
 * @type number
 * @min 1
 * @default 99
 *
 * @help GTT_Items.js
 *
 * アイテムを ID ごとの総数ではなく、スロットごとのスタックとして管理します。
 * rmmz_xxxx.js は変更せず、このプラグインからクラス追加と prototype 拡張だけを
 * 行います。
 *
 * このファイルはプラグインのエントリポイントです。
 * 次の順番でレイヤー別ファイルを読み込みます。
 * 1. GTT_Items_Core.js
 * 2. GTT_Items_Game.js
 * 3. GTT_Items_Windows.js
 * 4. GTT_Items_Scenes.js
 */

import { Items, setupCore } from "./GTT_Items_Core.js";
import {
    Game_ItemSlot,
    Game_ItemSlotContainer,
    setupGame
} from "./GTT_Items_Objects.js";
import {
    Window_StackItemList,
    Window_HotBar,
    setupWindows
} from "./GTT_Items_Windows.js";
import { setupScenes } from "./GTT_Items_Scenes.js";

export const pluginName = "GTT_Items";

export {
    Items,
    Game_ItemSlot,
    Game_ItemSlotContainer,
    Window_StackItemList,
    Window_HotBar,
    setupCore,
    setupGame,
    setupWindows,
    setupScenes
};

export function registerPlugin() {
    return setupGttItems();
}

export function setupGttItems() {
    setupCore();
    setupGame();
    setupWindows();
    setupScenes();
    return Items;
}

export default setupGttItems;
