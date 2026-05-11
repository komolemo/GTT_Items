//=============================================================================
// RPG Maker MZ - GTT_Items Scene ES Module
//=============================================================================

import { Items } from "./GTT_Items_Core.js";
import { Window_HotBar } from "./GTT_Items_Windows.js";

export function setupScenes() {
    const { HOT_BAR_USE_KEY } = Items.constants;

    const _Scene_Map_update = Scene_Map.prototype.update;
    const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
    const _Scene_Map_isMapTouchOk = Scene_Map.prototype.isMapTouchOk;

    Scene_Map.prototype.update = function() {
        _Scene_Map_update.apply(this, arguments);
        this.updateHotBarUseInput();
    };

    Scene_Map.prototype.isMapTouchOk = function() {
        return (
            _Scene_Map_isMapTouchOk.apply(this, arguments) &&
            !this.isPointerOverHotBar()
        );
    };

    Scene_Map.prototype.createAllWindows = function() {
        _Scene_Map_createAllWindows.apply(this, arguments);
        this.createHotBar();
    };

    Scene_Map.prototype.createHotBar = function() {
        this.createHotBarWindow();
    };

    Scene_Map.prototype.createHotBarWindow = function() {
        const rect = this.hotBarWindowRect();
        this._hotBarWindow = new Window_HotBar(rect);
        this.addWindow(this._hotBarWindow);
        this._hotBarWindow.activate();
    };

    Scene_Map.prototype.hotBarWindowRect = function() {
        const w = Window_HotBar.WINDOW_WIDTH();
        const h = Window_HotBar.WINDOW_HEIGHT();
        const x = (Graphics.boxWidth - w) / 2;
        const y = Graphics.boxHeight - h - 20;
        return new Rectangle(x, y, w, h);
    };

    Scene_Map.prototype.updateHotBarUseInput = function() {
        if (!this.canProcessHotBarUse()) {
            return;
        }
        if (this.isHotBarTouchTriggered()) {
            this.selectHotBarTouchSlot();
            this.onItemOk();
        } else if (this.isHotBarUseTriggered()) {
            this.onItemOk();
        }
    };

    Scene_Map.prototype.isHotBarUseTriggered = function() {
        return Input.isTriggered(HOT_BAR_USE_KEY);
    };

    Scene_Map.prototype.isHotBarTouchTriggered = function() {
        return TouchInput.isTriggered() && this.isPointerOverHotBar();
    };

    Scene_Map.prototype.isPointerOverHotBar = function() {
        return this._hotBarWindow && this._hotBarWindow.hitIndex() >= 0;
    };

    Scene_Map.prototype.selectHotBarTouchSlot = function() {
        const index = this._hotBarWindow.hitIndex();
        if (index >= 0) {
            this._hotBarWindow.select(index);
        }
    };

    Scene_Map.prototype.canProcessHotBarUse = function() {
        return (
            this._hotBarWindow &&
            this._hotBarWindow.active &&
            this.isActive() &&
            !SceneManager.isSceneChanging() &&
            !$gameMessage.isBusy() &&
            !$gameMap.isEventRunning()
        );
    };

    Scene_Map.prototype.item = function() {
        return this._hotBarWindow ? this._hotBarWindow.item() : null;
    };

    Scene_Map.prototype.user = function() {
        const members = $gameParty.movableMembers();
        if (members.length <= 0) {
            return null;
        }
        const bestPha = Math.max(...members.map(member => member.pha));
        return members.find(member => member.pha === bestPha);
    };

    Scene_Map.prototype.onItemOk = function() {
        const item = this.item();
        if (item) {
            $gameParty.setLastItem(item);
            this.determineItem();
        } else {
            SoundManager.playBuzzer();
            this.activateItemWindow();
        }
    };

    Scene_Map.prototype.determineItem = function() {
        if (this.canUse()) {
            this.useItem();
        } else {
            SoundManager.playBuzzer();
        }
        this.activateItemWindow();
    };

    Scene_Map.prototype.canUse = function(item = this.item(), user = this.user()) {
        return user && user.canUse(item) && this.isItemEffectsValid(item, user);
    };

    Scene_Map.prototype.isItemEffectsValid = function(
        item = this.item(),
        user = this.user()
    ) {
        const action = new Game_Action(user);
        action.setItemObject(item);
        const targets = this.itemTargetActors(item, user);
        return targets.length <= 0 || targets.some(target => action.testApply(target));
    };

    Scene_Map.prototype.itemTargetActors = function(
        item = this.item(),
        user = this.user()
    ) {
        const action = new Game_Action(user);
        action.setItemObject(item);
        if (!item || !user || !action.isForFriend()) {
            return [];
        } else if (action.isForAll()) {
            return $gameParty.members();
        } else {
            return [user];
        }
    };

    Scene_Map.prototype.useItem = function() {
        const item = this.item();
        const user = this.user();
        this.playSeForItem();
        user.useItem(item);
        this.applyItem(item, user);
        this.checkCommonEvent();
        this.checkGameover();
        this._hotBarWindow.refresh();
    };

    Scene_Map.prototype.applyItem = function(item = this.item(), user = this.user()) {
        const action = new Game_Action(user);
        action.setItemObject(item);
        for (const target of this.itemTargetActors(item, user)) {
            for (let i = 0; i < action.numRepeats(); i++) {
                action.apply(target);
            }
        }
        action.applyGlobal();
    };

    Scene_Map.prototype.playSeForItem = function() {
        SoundManager.playUseItem();
    };

    Scene_Map.prototype.activateItemWindow = function() {
        if (this._hotBarWindow) {
            this._hotBarWindow.refresh();
            this._hotBarWindow.activate();
        }
    };

    Scene_Map.prototype.checkCommonEvent = function() {
        if ($gameTemp.isCommonEventReserved()) {
            SceneManager.goto(Scene_Map);
        }
    };
}
