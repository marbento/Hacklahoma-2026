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
exports.PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet = void 0;
const json = __importStar(require("../json/types"));
const AbstractObject_1 = require("./AbstractObject");
const paths_1 = require("./utils/paths");
class PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet extends AbstractObject_1.AbstractObject {
    static is(object) {
        return (object.isa ===
            PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet.isa);
    }
    static create(project, opts) {
        return project.createModel({
            isa: PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet.isa,
            ...opts,
        });
    }
    getObjectProps() {
        return {
            buildPhase: String,
        };
    }
    getDisplayName() {
        // NOTE: Only verified against `PBXCopyFilesBuildPhase`
        const name = "name" in this.props.buildPhase.props
            ? this.props.buildPhase.props.name
            : this.props.buildPhase.getDisplayName();
        const targets = (0, paths_1.getReferringTargets)(this.props.buildPhase);
        let displayName = `Exceptions for "${(0, paths_1.getParent)(this).getDisplayName()}" folder in "${name}" phase`;
        if (targets.length === 1) {
            displayName += ` from "${targets[0].getDisplayName()}" target`;
        }
        return displayName;
    }
}
exports.PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet = PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet;
PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet.isa = json.ISA
    .PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet;
//# sourceMappingURL=PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet.js.map