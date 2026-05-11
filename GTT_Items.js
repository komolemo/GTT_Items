//=============================================================================
// RPG Maker MZ - GTT_Items ES Module Entry
//=============================================================================

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

export function setupGttItems() {
    setupCore();
    setupGame();
    setupWindows();
    setupScenes();
    return Items;
}

export default setupGttItems;
