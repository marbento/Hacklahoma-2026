"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PBXVariantGroup = void 0;
const json = __importStar(require("../json/types"));
const AbstractGroup_1 = require("./AbstractGroup");
class PBXVariantGroup extends AbstractGroup_1.AbstractGroup {
    static is(object) {
        return object.isa === PBXVariantGroup.isa;
    }
    static create(project, opts) {
        return project.createModel({
            isa: PBXVariantGroup.isa,
            children: [],
            sourceTree: "<group>",
            ...opts,
        });
    }
}
exports.PBXVariantGroup = PBXVariantGroup;
PBXVariantGroup.isa = json.ISA.PBXVariantGroup;
//# sourceMappingURL=PBXVariantGroup.js.map