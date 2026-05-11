//=============================================================================
// RPG Maker MZ - GTT_Items Game ES Module
//=============================================================================

import { Items } from "./GTT_Items_Core.js";

export class Game_ItemSlot {
    static DATA_CLASSES = ["item", "weapon", "armor"];

    constructor(item = null, amount = 0, meta = {}) {
        this._dataClass = "";
        this._itemId = 0;
        this._amount = 0;
        this._meta = {};
        if (item) {
            this.put(item, amount, meta);
        }
    }

    dataClass() {
        return this._dataClass;
    }

    itemId() {
        return this._itemId;
    }

    amount() {
        return this._amount;
    }

    meta() {
        return this._meta;
    }

    setAmount(amount) {
        this._amount = Game_ItemSlot.normalizeAmount(amount);
        if (this._amount <= 0) {
            this.clear();
        }
    }

    isEmpty() {
        return (
            !Game_ItemSlot.isValidDataClass(this._dataClass) ||
            this._itemId <= 0 ||
            this._amount <= 0
        );
    }

    clear() {
        this._dataClass = "";
        this._itemId = 0;
        this._amount = 0;
        this._meta = {};
    }

    setObject(item) {
        if (DataManager.isItem(item)) {
            this._dataClass = "item";
        } else if (DataManager.isWeapon(item)) {
            this._dataClass = "weapon";
        } else if (DataManager.isArmor(item)) {
            this._dataClass = "armor";
        } else {
            this._dataClass = "";
        }
        this._itemId = this._dataClass ? item.id : 0;
    }

    object() {
        if (this._dataClass === "item") {
            return $dataItems[this._itemId];
        } else if (this._dataClass === "weapon") {
            return $dataWeapons[this._itemId];
        } else if (this._dataClass === "armor") {
            return $dataArmors[this._itemId];
        } else {
            return null;
        }
    }

    hasSameItem(item) {
        if (!item) {
            return false;
        }
        return (
            this._dataClass === Game_ItemSlot.dataClassOf(item) &&
            this._itemId === item.id
        );
    }

    hasSameStackData(item, meta) {
        return (
            this.hasSameItem(item) &&
            this.metaKey() === Game_ItemSlot.metaKey(meta)
        );
    }

    metaKey() {
        return Game_ItemSlot.metaKey(this._meta);
    }

    stackKey() {
        if (this.isEmpty()) {
            return "";
        }
        return [this._dataClass, this._itemId, this.metaKey()].join(":");
    }

    maxAmount() {
        const item = this.object();
        return item ? $gameParty.maxItems(item) : Items.constants.DEFAULT_STACK_SIZE;
    }

    remainingAmount() {
        return Math.max(this.maxAmount() - this._amount, 0);
    }

    canStack(item, meta) {
        return (
            !this.isEmpty() &&
            this.hasSameStackData(item, meta) &&
            this.remainingAmount() > 0
        );
    }

    put(item, amount, meta) {
        this.setObject(item);
        if (!Game_ItemSlot.isValidDataClass(this._dataClass)) {
            this.clear();
            return;
        }
        this._amount = Game_ItemSlot.normalizeAmount(amount);
        this._meta = Game_ItemSlot.normalizeMeta(meta);
        if (this._amount <= 0) {
            this.clear();
        }
    }

    gain(amount) {
        const value = Game_ItemSlot.normalizeAmount(amount);
        const add = Math.min(value, this.remainingAmount());
        this._amount += add;
        return value - add;
    }

    lose(amount) {
        const value = Game_ItemSlot.normalizeAmount(amount);
        const lost = Math.min(value, this._amount);
        this._amount -= lost;
        if (this._amount <= 0) {
            this.clear();
        }
        return value - lost;
    }

    toData() {
        return {
            dataClass: this._dataClass,
            itemId: this._itemId,
            amount: this._amount,
            meta: Game_ItemSlot.normalizeMeta(this._meta)
        };
    }

    static dataClassOf(item) {
        if (DataManager.isItem(item)) {
            return "item";
        } else if (DataManager.isWeapon(item)) {
            return "weapon";
        } else if (DataManager.isArmor(item)) {
            return "armor";
        } else {
            return "";
        }
    }

    static isValidDataClass(dataClass) {
        return Game_ItemSlot.DATA_CLASSES.includes(dataClass);
    }

    static normalizeAmount(amount) {
        const value = Number(amount || 0);
        return Number.isFinite(value) ? Math.max(Math.floor(value), 0) : 0;
    }

    static normalizeMeta(meta) {
        return Items.cloneMeta(meta);
    }

    static metaKey(meta) {
        return Items.stableStringify(Game_ItemSlot.normalizeMeta(meta));
    }

    static fromData(data) {
        if (data instanceof Game_ItemSlot) {
            return data;
        }
        const slot = new Game_ItemSlot();
        if (data) {
            slot._dataClass = Items.valueOrDefault(
                data.dataClass,
                data._dataClass || ""
            );
            slot._itemId = Number(
                Items.valueOrDefault(data.itemId, data._itemId || 0)
            );
            slot._amount = Game_ItemSlot.normalizeAmount(
                Items.valueOrDefault(data.amount, data._amount)
            );
            slot._meta = Game_ItemSlot.normalizeMeta(
                Items.valueOrDefault(data.meta, data._meta)
            );
            if (slot.isEmpty()) {
                slot.clear();
            }
        }
        return slot;
    }
}

export class Game_ItemSlotContainer {
    constructor(size = 0) {
        this._slots = [];
        this.resize(size);
    }

    resize(size) {
        const newSize = Game_ItemSlotContainer.normalizeSize(size);
        while (this._slots.length < newSize) {
            this._slots.push(new Game_ItemSlot());
        }
        this._slots.length = newSize;
    }

    slots() {
        return this._slots;
    }

    slot(index) {
        return this._slots[index] || null;
    }

    setSlot(index, slot) {
        if (!this.isValidIndex(index)) {
            return false;
        }
        this._slots[index] = Game_ItemSlot.fromData(slot);
        return true;
    }

    clearSlot(index) {
        const slot = this.slot(index);
        if (!slot) {
            return false;
        }
        slot.clear();
        return true;
    }

    isValidIndex(index) {
        return Number.isInteger(index) && index >= 0 && index < this.maxSlots();
    }

    maxSlots() {
        return this._slots.length;
    }

    emptySlots() {
        return this._slots.filter(slot => slot.isEmpty());
    }

    emptySlotIndexes() {
        const indexes = [];
        for (let i = 0; i < this._slots.length; i++) {
            if (this._slots[i].isEmpty()) {
                indexes.push(i);
            }
        }
        return indexes;
    }

    firstEmptySlotIndex() {
        const indexes = this.emptySlotIndexes();
        return indexes.length > 0 ? indexes[0] : -1;
    }

    stackableSlots(item, meta) {
        return this._slots.filter(slot => slot.canStack(item, meta));
    }

    stackableSlotIndexes(item, meta) {
        const indexes = [];
        for (let i = 0; i < this._slots.length; i++) {
            if (this._slots[i].canStack(item, meta)) {
                indexes.push(i);
            }
        }
        return indexes;
    }

    firstStackableSlotIndex(item, meta) {
        const indexes = this.stackableSlotIndexes(item, meta);
        return indexes.length > 0 ? indexes[0] : -1;
    }

    numItems(item) {
        return this._slots.reduce((count, slot) => {
            return slot.hasSameItem(item) ? count + slot.amount() : count;
        }, 0);
    }

    itemObjects() {
        const result = [];
        for (const slot of this._slots) {
            const item = slot.object();
            if (item && !result.includes(item)) {
                result.push(item);
            }
        }
        return result;
    }

    hasRoomFor(item, meta) {
        return (
            this.emptySlots().length > 0 ||
            this.stackableSlots(item, meta).length > 0
        );
    }

    canGainItem(item, amount, meta) {
        return this.restAmountAfterGain(item, amount, meta) <= 0;
    }

    restAmountAfterGain(item, amount, meta) {
        let rest = Game_ItemSlot.normalizeAmount(amount);
        if (!item || rest <= 0) {
            return rest;
        }
        for (const slot of this.stackableSlots(item, meta)) {
            rest -= Math.min(rest, slot.remainingAmount());
            if (rest <= 0) {
                return 0;
            }
        }
        rest -= this.emptySlots().length * $gameParty.maxItems(item);
        return Math.max(rest, 0);
    }

    gainItem(item, amount, meta) {
        let rest = Game_ItemSlot.normalizeAmount(amount);
        if (!item || rest <= 0) {
            return rest;
        }
        for (const slot of this.stackableSlots(item, meta)) {
            rest = slot.gain(rest);
            if (rest <= 0) {
                return 0;
            }
        }
        for (const slot of this.emptySlots()) {
            const add = Math.min(rest, $gameParty.maxItems(item));
            slot.put(item, add, meta);
            rest -= add;
            if (rest <= 0) {
                return 0;
            }
        }
        return rest;
    }

    canLoseItem(item, amount) {
        return this.numItems(item) >= Game_ItemSlot.normalizeAmount(amount);
    }

    loseItem(item, amount) {
        let rest = Game_ItemSlot.normalizeAmount(amount);
        if (!item || rest <= 0) {
            return rest;
        }
        for (const slot of this._slots) {
            if (slot.hasSameItem(item)) {
                rest = slot.lose(rest);
                if (rest <= 0) {
                    return 0;
                }
            }
        }
        return rest;
    }

    canMoveItem(fromIndex, toIndex, amount) {
        const fromSlot = this.slot(fromIndex);
        const toSlot = this.slot(toIndex);
        if (!fromSlot || !toSlot || fromSlot.isEmpty() || fromSlot === toSlot) {
            return false;
        }
        const item = fromSlot.object();
        const meta = fromSlot.meta();
        const value = this.normalizeMoveAmount(fromSlot, amount);
        return (
            value > 0 &&
            (toSlot.isEmpty() || toSlot.canStack(item, meta))
        );
    }

    moveItem(fromIndex, toIndex, amount) {
        const fromSlot = this.slot(fromIndex);
        const toSlot = this.slot(toIndex);
        if (!this.canMoveItem(fromIndex, toIndex, amount)) {
            return 0;
        }
        const item = fromSlot.object();
        const meta = fromSlot.meta();
        const value = this.normalizeMoveAmount(fromSlot, amount);
        const movable = toSlot.isEmpty()
            ? Math.min(value, $gameParty.maxItems(item))
            : Math.min(value, toSlot.remainingAmount());
        if (movable <= 0) {
            return 0;
        }
        if (toSlot.isEmpty()) {
            toSlot.put(item, movable, meta);
        } else {
            toSlot.gain(movable);
        }
        fromSlot.lose(movable);
        return movable;
    }

    normalizeMoveAmount(fromSlot, amount) {
        if (amount === undefined || amount === null) {
            return fromSlot.amount();
        }
        return Math.min(Game_ItemSlot.normalizeAmount(amount), fromSlot.amount());
    }

    toData() {
        return {
            slots: this._slots.map(slot => slot.toData())
        };
    }

    normalizeSlots() {
        for (let i = 0; i < this._slots.length; i++) {
            this._slots[i] = Game_ItemSlot.fromData(this._slots[i]);
        }
    }

    static normalizeSize(size) {
        const value = Number(size || 0);
        return Number.isFinite(value) ? Math.max(Math.floor(value), 0) : 0;
    }

    static fromData(data, size) {
        if (data instanceof Game_ItemSlotContainer) {
            if (size !== undefined && size !== null) {
                data.resize(size);
            }
            data.normalizeSlots();
            return data;
        }
        const slots = data && Array.isArray(data.slots)
            ? data.slots
            : data && Array.isArray(data._slots)
                ? data._slots
                : Array.isArray(data)
                    ? data
                    : [];
        const containerSize = size !== undefined && size !== null
            ? size
            : slots.length;
        const container = new Game_ItemSlotContainer(containerSize);
        for (let i = 0; i < container.slots().length; i++) {
            container.slots()[i] = Game_ItemSlot.fromData(slots[i]);
        }
        return container;
    }
}

export function setupGame() {
    const {
        INVENTORY_SLOT_SIZE,
        ITEM_BOX_SLOT_SIZE,
        DEFAULT_STACK_SIZE
    } = Items.constants;

    const _Game_Party_initAllItems = Game_Party.prototype.initAllItems;
    const _Game_Party_maxItems = Game_Party.prototype.maxItems;
    const _Game_Party_isAnyMemberEquipped =
        Game_Party.prototype.isAnyMemberEquipped;
    const _DataManager_extractSaveContents = DataManager.extractSaveContents;

    globalThis.Game_ItemSlot = Game_ItemSlot;
    globalThis.Game_ItemSlotContainer = Game_ItemSlotContainer;
    Items.Game_ItemSlot = Game_ItemSlot;
    Items.Game_ItemSlotContainer = Game_ItemSlotContainer;

    Game_Party.prototype.initAllItems = function() {
        _Game_Party_initAllItems.apply(this, arguments);
        this.initItemSlots();
    };

    Game_Party.prototype.initItemSlots = function() {
        this._gttItemInventory = new Game_ItemSlotContainer(INVENTORY_SLOT_SIZE);
        this._gttItemBox = new Game_ItemSlotContainer(ITEM_BOX_SLOT_SIZE);
    };

    Game_Party.prototype.gttItemInventory = function() {
        if (!(this._gttItemInventory instanceof Game_ItemSlotContainer)) {
            this._gttItemInventory = Game_ItemSlotContainer.fromData(
                this._gttItemInventory,
                INVENTORY_SLOT_SIZE
            );
        }
        return this._gttItemInventory;
    };

    Game_Party.prototype.gttItemBox = function() {
        if (!(this._gttItemBox instanceof Game_ItemSlotContainer)) {
            this._gttItemBox = Game_ItemSlotContainer.fromData(
                this._gttItemBox,
                ITEM_BOX_SLOT_SIZE
            );
        }
        return this._gttItemBox;
    };

    Game_Party.prototype.gttAllItemSlotContainers = function() {
        return [this.gttItemInventory(), this.gttItemBox()];
    };

    Game_Party.prototype.gttNormalizeItemSlotContainers = function() {
        for (const container of this.gttAllItemSlotContainers()) {
            for (let i = 0; i < container.slots().length; i++) {
                const slot = container.slots()[i];
                if (!(slot instanceof Game_ItemSlot)) {
                    container.slots()[i] = Game_ItemSlot.fromData(slot);
                }
            }
        }
    };

    Game_Party.prototype.maxItems = function(item) {
        if (item && item.meta && item.meta.gttStack) {
            return Math.max(Number(item.meta.gttStack), 1);
        }
        if (item && item.meta && item.meta.stack) {
            return Math.max(Number(item.meta.stack), 1);
        }
        return DEFAULT_STACK_SIZE || _Game_Party_maxItems.apply(this, arguments);
    };

    Game_Party.prototype.items = function() {
        return this.gttItemInventory()
            .itemObjects()
            .filter(item => DataManager.isItem(item));
    };

    Game_Party.prototype.weapons = function() {
        return this.gttItemInventory()
            .itemObjects()
            .filter(item => DataManager.isWeapon(item));
    };

    Game_Party.prototype.armors = function() {
        return this.gttItemInventory()
            .itemObjects()
            .filter(item => DataManager.isArmor(item));
    };

    Game_Party.prototype.equipItems = function() {
        return this.weapons().concat(this.armors());
    };

    Game_Party.prototype.allItems = function() {
        return this.items().concat(this.equipItems());
    };

    Game_Party.prototype.numItems = function(item) {
        return this.gttItemInventory().numItems(item);
    };

    Game_Party.prototype.hasMaxItems = function(item) {
        return (
            !this.gttItemInventory().hasRoomFor(item, {}) &&
            !this.gttItemBox().hasRoomFor(item, {})
        );
    };

    Game_Party.prototype.hasItem = function(item, includeEquip) {
        if (this.numItems(item) > 0) {
            return true;
        } else if (includeEquip && this.isAnyMemberEquipped(item)) {
            return true;
        } else {
            return false;
        }
    };

    Game_Party.prototype.isAnyMemberEquipped = function(item) {
        if (_Game_Party_isAnyMemberEquipped) {
            return _Game_Party_isAnyMemberEquipped.apply(this, arguments);
        }
        return this.members().some(actor => actor.equips().includes(item));
    };

    Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
        if (!item || !this.itemContainer(item)) {
            return;
        }
        const value = Number(amount || 0);
        if (value > 0) {
            const rest = this.gttItemInventory().gainItem(item, value, {});
            if (rest > 0) {
                this.gttItemBox().gainItem(item, rest, {});
            }
        } else if (value < 0) {
            let rest = this.gttItemInventory().loseItem(item, -value);
            if (rest > 0) {
                rest = this.gttItemBox().loseItem(item, rest);
            }
            if (includeEquip && rest > 0) {
                this.discardMembersEquip(item, rest);
            }
        }
        $gameMap.requestRefresh();
        Items.refreshHotBarWindow();
    };

    Game_Party.prototype.loseItem = function(item, amount, includeEquip) {
        this.gainItem(item, -amount, includeEquip);
    };

    Game_Party.prototype.consumeItem = function(item) {
        if (DataManager.isItem(item) && item.consumable) {
            this.gttItemInventory().loseItem(item, 1);
            $gameMap.requestRefresh();
            Items.refreshHotBarWindow();
        }
    };

    Game_Party.prototype.gttInventorySlots = function() {
        return this.gttItemInventory().slots();
    };

    Game_Party.prototype.gttItemBoxSlots = function() {
        return this.gttItemBox().slots();
    };

    Game_Party.prototype.gttNumInventoryItems = function(item) {
        return this.gttItemInventory().numItems(item);
    };

    Game_Party.prototype.gttNumItemBoxItems = function(item) {
        return this.gttItemBox().numItems(item);
    };

    Game_Party.prototype.gttNumAllItems = function(item) {
        return this.gttNumInventoryItems(item) + this.gttNumItemBoxItems(item);
    };

    Game_Party.prototype.gttMoveInventoryItem = function(fromIndex, toIndex, amount) {
        return this.gttItemInventory().moveItem(fromIndex, toIndex, amount);
    };

    DataManager.extractSaveContents = function(contents) {
        _DataManager_extractSaveContents.apply(this, arguments);
        if ($gameParty && $gameParty.gttNormalizeItemSlotContainers) {
            $gameParty.gttNormalizeItemSlotContainers();
        }
    };
}
