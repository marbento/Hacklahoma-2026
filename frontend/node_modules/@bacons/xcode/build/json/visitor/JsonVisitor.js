"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonVisitor = void 0;
const parser_1 = require("../parser/parser");
/** Converts a CST for `pbxproj` into a JSON representation. */
class JsonVisitor extends parser_1.BaseVisitor {
    constructor() {
        super();
        this.context = {};
        // The "validateVisitor" method is a helper utility which performs static analysis
        // to detect missing or redundant visitor methods
        this.validateVisitor();
    }
    head(ctx) {
        if (ctx.array) {
            this.context = this.visit(ctx.array);
        }
        else if (ctx.object) {
            this.context = this.visit(ctx.object);
        }
    }
    object(ctx) {
        return (ctx.objectItem?.reduce((prev, item) => ({
            ...prev,
            ...this.visit(item),
        }), {}) ?? {});
    }
    array(ctx) {
        return ctx.value?.map((item) => this.visit(item)) ?? [];
    }
    objectItem(ctx) {
        // Object keys must always be strings, even if they're numeric
        const key = this.visitIdentifierAsString(ctx.identifier);
        return {
            [key]: this.visit(ctx.value),
        };
    }
    /** Visit an identifier and ensure the result is always a string (used for object keys) */
    visitIdentifierAsString(identifierCtx) {
        // Extract the actual context - identifierCtx is an array with a single item containing children
        const ctx = identifierCtx[0]?.children || identifierCtx;
        if (ctx.QuotedString) {
            return ctx.QuotedString[0].payload ?? ctx.QuotedString[0].image;
        }
        else if (ctx.StringLiteral) {
            return ctx.StringLiteral[0].payload ?? ctx.StringLiteral[0].image;
        }
        throw new Error("unhandled identifier: " + JSON.stringify(identifierCtx));
    }
    identifier(ctx) {
        if (ctx.QuotedString) {
            return ctx.QuotedString[0].payload ?? ctx.QuotedString[0].image;
        }
        else if (ctx.StringLiteral) {
            const literal = ctx.StringLiteral[0].payload ?? ctx.StringLiteral[0].image;
            return parseType(literal);
        }
        throw new Error("unhandled identifier: " + JSON.stringify(ctx));
    }
    value(ctx) {
        if (ctx.identifier) {
            return this.visit(ctx.identifier);
        }
        else if (ctx.DataLiteral) {
            return ctx.DataLiteral[0].payload ?? ctx.DataLiteral[0].image;
        }
        else if (ctx.object) {
            return this.visit(ctx.object);
        }
        else if (ctx.array) {
            return this.visit(ctx.array);
        }
        throw new Error("unhandled value: " + JSON.stringify(ctx));
    }
}
exports.JsonVisitor = JsonVisitor;
function parseType(literal) {
    // Preserve octal literals with leading zeros
    if (/^0\d+$/.test(literal)) {
        return literal;
    }
    // Handle integers - check if they're safe to convert
    if (/^\d+$/.test(literal)) {
        const num = parseInt(literal, 10);
        // Only convert to number if it's within JavaScript's safe integer range
        // Xcode UUIDs are often 24 characters which exceed MAX_SAFE_INTEGER
        if (!isNaN(num) && Number.isSafeInteger(num)) {
            return num;
        }
        // Preserve as string if too large
        return literal;
    }
    // Handle decimal numbers but preserve trailing zeros
    if (/^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/.test(literal)) {
        if (/0$/.test(literal)) {
            return literal; // Preserve trailing zero
        }
        const num = parseFloat(literal);
        if (!isNaN(num))
            return num;
    }
    return literal;
}
//# sourceMappingURL=JsonVisitor.js.map