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
exports.PBXTargetDependency = void 0;
const json = __importStar(require("../json/types"));
const AbstractObject_1 = require("./AbstractObject");
class PBXTargetDependency extends AbstractObject_1.AbstractObject {
    static is(object) {
        return object.isa === PBXTargetDependency.isa;
    }
    static create(project, opts) {
        return project.createModel({
            isa: PBXTargetDependency.isa,
            ...opts,
        });
    }
    getObjectProps() {
        return {
            // TODO: idk
            target: String,
            // target: PBXLegacyTarget,
            targetProxy: String,
        };
    }
    /**
     * @return uuid of the target, if the dependency is a native target, otherwise the uuid of the target in the sub-project if the dependency is a target proxy.
     */
    getNativeTargetUuid() {
        if (this.props.target) {
            return this.props.target.uuid;
        }
        if (this.props.targetProxy) {
            return this.props.targetProxy.props.remoteGlobalIDString;
        }
        throw new Error(`Expected target or target_proxy, from which to fetch a uuid for target '${this.getDisplayName()}'. Find and clear the PBXTargetDependency entry with uuid '${this.uuid}' in your .xcodeproj.`);
    }
    getDisplayName() {
        return (this.props.name ??
            this.props.target.props.name ??
            this.props.targetProxy.props.remoteInfo ??
            super.getDisplayName());
    }
}
exports.PBXTargetDependency = PBXTargetDependency;
PBXTargetDependency.isa = json.ISA.PBXTargetDependency;
//# sourceMappingURL=PBXTargetDependency.js.map