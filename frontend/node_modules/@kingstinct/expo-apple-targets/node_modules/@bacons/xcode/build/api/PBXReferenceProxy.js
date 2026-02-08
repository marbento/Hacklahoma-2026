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
exports.PBXReferenceProxy = void 0;
const json = __importStar(require("../json/types"));
const AbstractObject_1 = require("./AbstractObject");
const PBXBuildFile_1 = require("./PBXBuildFile");
class PBXReferenceProxy extends AbstractObject_1.AbstractObject {
    static is(object) {
        return object.isa === PBXReferenceProxy.isa;
    }
    static create(project, opts) {
        return project.createModel({
            isa: PBXReferenceProxy.isa,
            sourceTree: "<group>",
            ...opts,
        });
    }
    getObjectProps() {
        return {
            remoteRef: String,
        };
    }
    /** Removes self and all PBXBuildFiles that this proxy is referencing. */
    removeFromProject() {
        this.getBuildFiles().forEach((file) => {
            file.removeFromProject();
        });
        return super.removeFromProject();
    }
    getBuildFiles() {
        return this.getReferrers().filter(PBXBuildFile_1.PBXBuildFile.is);
    }
}
exports.PBXReferenceProxy = PBXReferenceProxy;
PBXReferenceProxy.isa = json.ISA.PBXReferenceProxy;
//# sourceMappingURL=PBXReferenceProxy.js.map