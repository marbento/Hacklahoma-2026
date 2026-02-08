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
exports.PBXBuildRule = void 0;
const json = __importStar(require("../json/types"));
const AbstractObject_1 = require("./AbstractObject");
class PBXBuildRule extends AbstractObject_1.AbstractObject {
    static is(object) {
        return object.isa === PBXBuildRule.isa;
    }
    static create(project, opts) {
        return project.createModel({
            isa: PBXBuildRule.isa,
            ...opts,
        });
    }
    getObjectProps() {
        return {
            inputFiles: [String],
            outputFiles: [String],
        };
    }
    setupDefaults() {
        if (this.props.isEditable == null) {
            this.props.isEditable = 1;
        }
    }
    /**
     * Adds an output file with the specified compiler flags.
     */
    addOutputFile(file, compilerFlags = "") {
        if (!this.props.outputFiles) {
            this.props.outputFiles = [];
        }
        this.props.outputFiles.push(file);
        if (!this.props.outputFilesCompilerFlags) {
            this.props.outputFilesCompilerFlags = [];
        }
        this.props.outputFilesCompilerFlags.push(compilerFlags);
    }
    getOutputFilesAndFlags() {
        return zip(this.props.outputFiles, this.props.outputFilesCompilerFlags);
    }
}
exports.PBXBuildRule = PBXBuildRule;
PBXBuildRule.isa = json.ISA.PBXBuildRule;
function zip(arr = [], arr2 = []) {
    return arr.map((a, i) => [a, arr2[i]]);
}
//# sourceMappingURL=PBXBuildRule.js.map