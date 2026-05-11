//=============================================================================
// RPG Maker MZ - GTT_Items Window ES Module
//=============================================================================

import { Items } from "./GTT_Items_Core.js";

export class Window_StackItemList extends Window_Selectable {
    static HOT_BAR_ITEM_WIDTH = 48;
    static NUM_STACK_TEXT_WIDTH = 24;
    static COL_SPACING = 4;
    static ROW_SPACING = 4;
    static ITEM_PADDING = 8;
    static NUM_HOT_BAR_COLS = 10;

    static ITEM_ICON_WIDTH() {
        return Items.standardIconWidth();
    }

    constructor(rect) {
        super(rect);
        this._data = [];
        this._slotContainer = null;
        this.padding = 2;
        this.refresh();
    }

    createContents() {
        const width = this.innerWidth + this.padding * 2;
        const height = this.innerHeight + this.padding * 2;
        this.destroyContents();
        this.contents = new Bitmap(width, height);
        this.contentsBack = new Bitmap(width, height);
        this.resetFontSettings();
    }

    get itemIconWidth() {
        return Window_StackItemList.ITEM_ICON_WIDTH();
    }

    setSlotContainer(container) {
        this._slotContainer = container;
        this.refresh();
    }

    slotContainer() {
        return this._slotContainer;
    }

    updateArrows() {
        this.downArrowVisible = false;
        this.upArrowVisible = false;
    }

    isScrollEnabled() {
        return false;
    }

    maxCols() {
        return Window_StackItemList.NUM_HOT_BAR_COLS;
    }

    maxItems() {
        return this._data ? this._data.length : 0;
    }

    itemAt(index) {
        return this._data && index >= 0 ? this._data[index] : null;
    }

    slotAt(index) {
        return this.itemAt(index);
    }

    currentSlot() {
        return this.slotAt(this.index());
    }

    currentItem() {
        const slot = this.currentSlot();
        return slot ? slot.object() : null;
    }

    item() {
        return this.currentItem();
    }

    makeItemList() {
        this._data = this._slotContainer ? this._slotContainer.slots() : [];
    }

    refresh() {
        this.makeItemList();
        this.createContents();
        this.drawAllItems();
    }

    colSpacing() {
        return Window_StackItemList.COL_SPACING;
    }

    rowSpacing() {
        return Window_StackItemList.ROW_SPACING;
    }

    itemPadding() {
        return Window_StackItemList.ITEM_PADDING;
    }

    scrollBaseY() {
        return 0;
    }

    lineHeight() {
        return this.itemIconWidth + this.itemPadding();
    }

    itemWidth() {
        return this.lineHeight();
    }

    itemHeight() {
        return this.lineHeight();
    }

    drawItem(index) {
        this.drawItemSlot(index);
    }

    drawItemSlot(index) {
        const slot = this.slotAt(index);
        const rect = this.itemRect(index);
        this.drawSlotFrame(rect);
        if (slot && !slot.isEmpty()) {
            const item = slot.object();
            if (item) {
                const iconX = rect.x + 4;
                const iconY = rect.y + 4;
                this.drawIcon(item.iconIndex, iconX, iconY);
                this.drawItemAmount(slot.amount(), rect);
            }
        }
    }

    drawSlotFrame(rect) {
        const color = ColorManager.itemBackColor1();
        this.contentsBack.fillRect(rect.x, rect.y, rect.width, rect.height, color);
    }

    drawItemAmount(amount, rect) {
        const text = String(amount);
        const width = Window_StackItemList.NUM_STACK_TEXT_WIDTH;
        const x = rect.x + rect.width - width - 2;
        const y = rect.y + rect.height - this.lineHeight() + 2;
        this.drawText(text, x, y, width, "right");
    }

    onTouchSelect(trigger) {
        this._doubleTouch = false;
        if (this.isCursorMovable()) {
            const lastIndex = this.index();
            const hitIndex = this.hitIndex();
            if (hitIndex >= 0 && hitIndex === this.index()) {
                this._doubleTouch = true;
            }
            this.select(hitIndex);
            if (trigger && this.index() !== lastIndex) {
                this.playCursorSound();
            }
        }
    }

    hitTest(x, y) {
        if (this.innerRect.contains(x, y)) {
            const cx = this.origin.x + x - this.padding;
            const cy = this.origin.y + y - this.padding;
            const topIndex = this.topIndex();
            for (let i = 0; i < this.maxVisibleItems(); i++) {
                const index = topIndex + i;
                if (index < this.maxItems()) {
                    const rect = this.itemRect(index);
                    if (rect.contains(cx, cy)) {
                        return index;
                    }
                }
            }
        }
        return -1;
    }
}

export class Window_HotBar extends Window_StackItemList {
    static WINDOW_WIDTH() {
        const width = Window_StackItemList.ITEM_ICON_WIDTH();
        const padding = Window_StackItemList.ITEM_PADDING;
        const cs = Window_StackItemList.COL_SPACING;
        return (
            (width + padding) * Window_StackItemList.NUM_HOT_BAR_COLS + cs
        );
    }

    static WINDOW_HEIGHT() {
        const width = Window_StackItemList.ITEM_ICON_WIDTH();
        const padding = Window_StackItemList.ITEM_PADDING;
        const rs = Window_StackItemList.ROW_SPACING;
        return width + padding + rs;
    }

    constructor(rect) {
        super(rect);
        this._selectedIndex = -1;
        this.setupHotBar();
    }

    get configFontSize() {
        return 12;
    }

    setupHotBar() {
        this.setBackgroundType(2);
        this.setSlotContainer($gameParty.gttItemInventory());
        this.select(0);
    }

    maxItems() {
        return Window_StackItemList.NUM_HOT_BAR_COLS;
    }

    processCursorMove() {
        if (this.isCursorMovable()) {
            const lastIndex = this.index();
            this.processNumberKeyMove();
            this.processWheelMove();
            if (this.index() !== lastIndex) {
                this.playCursorSound();
            }
        }
    }

    processNumberKeyMove() {
        const index = this.triggeredNumberKeyIndex();
        if (index >= 0 && index < this.maxItems()) {
            this.smoothSelect(index);
        }
    }

    triggeredNumberKeyIndex() {
        const { HOT_BAR_SLOT_KEYS } = Items.constants;
        for (let i = 0; i < HOT_BAR_SLOT_KEYS.length; i++) {
            if (Input.isTriggered(HOT_BAR_SLOT_KEYS[i])) {
                return i;
            }
        }
        return -1;
    }

    processWheelMove() {
        const { HOT_BAR_WHEEL_THRESHOLD } = Items.constants;
        if (TouchInput.wheelY >= HOT_BAR_WHEEL_THRESHOLD) {
            this.cursorRight(true);
        } else if (TouchInput.wheelY <= -HOT_BAR_WHEEL_THRESHOLD) {
            this.cursorLeft(true);
        }
    }

    selectSlotConfig(index) {
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 0][index];
    }

    drawItem(index) {
        this.drawItemSlot(index);
        this.drawConfig(index);
    }

    drawConfig(index) {
        const rect = this.itemRect(index);
        const text = String(this.selectSlotConfig(index));
        const x = rect.x + 2;
        const y = rect.y - rect.height / 2 + this.configFontSize / 2;
        const width = this.textWidth("0");
        this.contents.fontSize = this.configFontSize;
        this.drawText(text, x, y, width, "left");
        this.resetFontSettings();
    }
}

export function setupWindows() {
    globalThis.Window_StackItemList = Window_StackItemList;
    globalThis.Window_HotBar = Window_HotBar;
    Items.Window_StackItemList = Window_StackItemList;
    Items.Window_HotBar = Window_HotBar;
}
