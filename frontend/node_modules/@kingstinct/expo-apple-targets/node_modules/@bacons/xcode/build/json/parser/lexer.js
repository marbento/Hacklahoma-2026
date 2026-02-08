"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lexer = exports.tokens = void 0;
const chevrotain_1 = require("./chevrotain");
const identifiers_1 = __importDefault(require("./identifiers"));
// The order of tokens is important
exports.tokens = [...identifiers_1.default];
exports.lexer = new chevrotain_1.Lexer(exports.tokens);
//# sourceMappingURL=lexer.js.map