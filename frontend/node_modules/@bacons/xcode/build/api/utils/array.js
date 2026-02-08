"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniqueBy = void 0;
function uniqueBy(array, key) {
    const seen = new Set();
    return array.filter((item) => {
        const k = key(item);
        if (seen.has(k)) {
            return false;
        }
        seen.add(k);
        return true;
    });
}
exports.uniqueBy = uniqueBy;
//# sourceMappingURL=array.js.map