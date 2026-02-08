"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customColorFromCSS = void 0;
// @ts-expect-error
const normalize_colors_1 = __importDefault(require("@react-native/normalize-colors"));
function customColorFromCSS(color) {
    let colorInt = (0, normalize_colors_1.default)(color);
    colorInt = ((colorInt << 24) | (colorInt >>> 8)) >>> 0;
    const red = ((colorInt >> 16) & 255) / 255;
    const green = ((colorInt >> 8) & 255) / 255;
    const blue = (colorInt & 255) / 255;
    const alpha = ((colorInt >> 24) & 255) / 255;
    return {
        red,
        green,
        blue,
        alpha,
    };
}
exports.customColorFromCSS = customColorFromCSS;
