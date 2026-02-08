"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setColorAsync = exports.withIosColorset = void 0;
const config_plugins_1 = require("expo/config-plugins");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const customColorFromCSS_1 = require("./customColorFromCSS");
const withIosColorset = (config, { cwd, color, darkColor, name }) => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        "ios",
        async (config) => {
            await setColorAsync({ color, darkColor }, node_path_1.default.join(config.modRequest.projectRoot, cwd, `Assets.xcassets/${name}.colorset`));
            return config;
        },
    ]);
};
exports.withIosColorset = withIosColorset;
const DARK_APPEARANCE = {
    appearance: "luminosity",
    value: "dark",
};
function createColor(color) {
    return {
        "color-space": "display-p3",
        components: (0, customColorFromCSS_1.customColorFromCSS)(color),
    };
}
async function setColorAsync({ color, darkColor }, colorsetFilePath) {
    // Ensure the Images.xcassets/AppIcon.appiconset path exists
    await node_fs_1.default.promises.mkdir(colorsetFilePath, { recursive: true });
    // Store the image JSON data for assigning via the Contents.json
    const colorsJson = [];
    if (color) {
        colorsJson.push({
            color: createColor(color),
            idiom: "universal",
        });
    }
    if (darkColor) {
        colorsJson.push({
            appearances: [DARK_APPEARANCE],
            color: createColor(darkColor),
            idiom: "universal",
        });
    }
    // Finally, write the Config.json
    await writeContentsJsonAsync(colorsetFilePath, {
        colors: colorsJson,
    });
}
exports.setColorAsync = setColorAsync;
async function writeContentsJsonAsync(directory, { colors }) {
    await node_fs_1.default.promises.mkdir(directory, { recursive: true });
    await node_fs_1.default.promises.writeFile(node_path_1.default.join(directory, "Contents.json"), JSON.stringify({
        colors,
        info: {
            version: 1,
            // common practice is for the tool that generated the icons to be the "author"
            author: "expo",
        },
    }, null, 2));
}
