//=============================================================================
// RPG Maker MZ - GTT_Items Core ES Module
//=============================================================================

const root = globalThis;
root.GTT = root.GTT || {};
root.GTT.Items = root.GTT.Items || {};

export const Items = root.GTT.Items;

export function setupCore() {
    const pluginName = "GTT_Items";
    const params = PluginManager.parameters(pluginName);

    Items.pluginName = pluginName;
    Items.params = params;
    Items.constants = Object.assign(Items.constants || {}, {
        INVENTORY_SLOT_SIZE: Number(params.inventorySlotSize || 50),
        ITEM_BOX_SLOT_SIZE: Number(params.itemBoxSlotSize || 200),
        DEFAULT_STACK_SIZE: Number(params.defaultStackSize || 99),
        DEFAULT_ICON_SIZE: 32,
        HOT_BAR_USE_KEY: "gttHotBarUse",
        HOT_BAR_SLOT_KEYS: [
            "gttHotBarSlot1",
            "gttHotBarSlot2",
            "gttHotBarSlot3",
            "gttHotBarSlot4",
            "gttHotBarSlot5",
            "gttHotBarSlot6",
            "gttHotBarSlot7",
            "gttHotBarSlot8",
            "gttHotBarSlot9",
            "gttHotBarSlot0"
        ],
        HOT_BAR_WHEEL_THRESHOLD: 20
    });

    Items.cloneMeta = function(meta) {
        if (!meta) {
            return {};
        }
        return JSON.parse(JSON.stringify(meta));
    };

    Items.stableStringify = function(value) {
        if (value === null || typeof value !== "object") {
            return JSON.stringify(value);
        }
        if (Array.isArray(value)) {
            return "[" + value.map(Items.stableStringify).join(",") + "]";
        }
        const keys = Object.keys(value).sort();
        return (
            "{" +
            keys
                .map(key => JSON.stringify(key) + ":" + Items.stableStringify(value[key]))
                .join(",") +
            "}"
        );
    };

    Items.refreshHotBarWindow = function() {
        const scene = SceneManager._scene;
        if (scene && scene._hotBarWindow) {
            scene._hotBarWindow.refresh();
        }
    };

    Items.standardIconWidth = function() {
        const width = ImageManager && ImageManager.standardIconWidth;
        return Number(width || Items.constants.DEFAULT_ICON_SIZE);
    };

    Items.valueOrDefault = function(value, defaultValue) {
        return value !== undefined && value !== null ? value : defaultValue;
    };

    Input.keyMapper[72] = Items.constants.HOT_BAR_USE_KEY;
    for (let i = 0; i < Items.constants.HOT_BAR_SLOT_KEYS.length; i++) {
        const keyCode = i < 9 ? 49 + i : 48;
        Input.keyMapper[keyCode] = Items.constants.HOT_BAR_SLOT_KEYS[i];
    }
}
