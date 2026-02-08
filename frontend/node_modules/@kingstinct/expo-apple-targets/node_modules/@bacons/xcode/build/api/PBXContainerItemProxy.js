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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PBXContainerItemProxy = void 0;
const assert_1 = __importDefault(require("assert"));
const json = __importStar(require("../json/types"));
const AbstractObject_1 = require("./AbstractObject");
const XcodeProject_1 = require("./XcodeProject");
const PBXFileReference_1 = require("./PBXFileReference");
class PBXContainerItemProxy extends AbstractObject_1.AbstractObject {
    static is(object) {
        return object.isa === PBXContainerItemProxy.isa;
    }
    static create(project, opts) {
        return project.createModel({
            isa: PBXContainerItemProxy.isa,
            ...opts,
        });
    }
    getObjectProps() {
        return {
            containerPortal: String,
            //   remoteGlobalIDString: PBXNativeTarget,
        };
    }
    getProxiedObject() {
        return this.getContainerPortalObject().get(this.props.remoteGlobalIDString);
    }
    getContainerPortalObject() {
        if (this.isRemote()) {
            const containerPortalFileRef = this.getXcodeProject().get(this.props.containerPortal.uuid);
            (0, assert_1.default)(PBXFileReference_1.PBXFileReference.is(containerPortalFileRef), "containerPortal is not a PBXFileReference");
            return XcodeProject_1.XcodeProject.open(containerPortalFileRef.getRealPath());
        }
        return this.getXcodeProject();
    }
    /** @return `true` if this object points to a remote project. */
    isRemote() {
        return (this.getXcodeProject().rootObject.uuid !== this.props.containerPortal.uuid);
    }
}
exports.PBXContainerItemProxy = PBXContainerItemProxy;
PBXContainerItemProxy.isa = json.ISA.PBXContainerItemProxy;
//# sourceMappingURL=PBXContainerItemProxy.js.map