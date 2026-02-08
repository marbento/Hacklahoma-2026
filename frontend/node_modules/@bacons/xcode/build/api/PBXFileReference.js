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
exports.PBXFileReference = exports.getPossibleDefaultSourceTree = void 0;
const path_1 = __importDefault(require("path"));
const constants_1 = require("./utils/constants");
const json = __importStar(require("../json/types"));
const AbstractGroup_1 = require("./AbstractGroup");
const PBXBuildFile_1 = require("./PBXBuildFile");
const AbstractObject_1 = require("./AbstractObject");
const paths_1 = require("./utils/paths");
const PBXContainerItemProxy_1 = require("./PBXContainerItemProxy");
const PBXReferenceProxy_1 = require("./PBXReferenceProxy");
const PBXTargetDependency_1 = require("./PBXTargetDependency");
const debug = require("debug")("xcparse:models");
function getPossibleDefaultSourceTree(fileReference) {
    const possibleSourceTree = fileReference.lastKnownFileType
        ? constants_1.SOURCETREE_BY_FILETYPE[fileReference.lastKnownFileType]
        : undefined;
    if (!possibleSourceTree && fileReference.explicitFileType) {
        return "BUILT_PRODUCTS_DIR";
    }
    return possibleSourceTree ?? "<group>";
}
exports.getPossibleDefaultSourceTree = getPossibleDefaultSourceTree;
/**
 * Sets the path of the given object according to the provided source
 * tree key. The path is converted to relative according to the real
 * path of the source tree for group and project source trees, if both
 * paths are relative or absolute. Otherwise the path is set as
 * provided.
 *
 * @param object The object whose path needs to be set.
 */
function setPathWithSourceTree(object, _path, sourceTree) {
    let nPath = path_1.default.resolve(_path);
    object.props.sourceTree = sourceTree;
    if (sourceTree === "<absolute>") {
        if (!path_1.default.isAbsolute(nPath)) {
            throw new Error("[Xcodeproj] Attempt to set a relative path with an " +
                `absolute source tree: ${_path}`);
        }
        object.props.path = nPath;
    }
    else if (sourceTree == "<group>" || sourceTree == "SOURCE_ROOT") {
        const sourceTreeRealPath = (0, paths_1.getSourceTreeRealPath)(object);
        if (sourceTreeRealPath && path_1.default.resolve(sourceTreeRealPath) === nPath) {
            let relativePath = path_1.default.relative(sourceTreeRealPath, nPath);
            object.props.path = relativePath;
        }
        else {
            object.props.path = nPath;
        }
    }
    else {
        object.props.path = nPath;
    }
}
class PBXFileReference extends AbstractObject_1.AbstractObject {
    static is(object) {
        return object.isa === PBXFileReference.isa;
    }
    static create(project, opts) {
        // @ts-expect-error
        return project.createModel({
            isa: PBXFileReference.isa,
            ...opts,
        });
    }
    getObjectProps() {
        return {};
    }
    setupDefaults() {
        if (this.props.fileEncoding == null) {
            this.props.fileEncoding = 4;
        }
        // if (this.sourceTree == null) {
        //   this.sourceTree = "SOURCE_ROOT";
        // }
        if (!this.props.lastKnownFileType &&
            // Xcode clears the lastKnownFileType for explicitFileType if it exists.
            !this.props.explicitFileType) {
            this.setLastKnownFileType();
        }
        if (this.props.includeInIndex == null) {
            this.props.includeInIndex = 0;
        }
        if (this.props.name == null && this.props.path) {
            const name = path_1.default.basename(this.props.path);
            // If the values are the same then skip setting name.
            if (name !== this.props.path) {
                this.props.name = name;
            }
        }
        if (!this.props.sourceTree) {
            this.props.sourceTree = getPossibleDefaultSourceTree(this.props);
        }
        // Clear the includeInIndex flag for framework files
        if (this.props.path && path_1.default.extname(this.props.path) === ".framework") {
            this.props.includeInIndex = undefined;
        }
    }
    getParent() {
        return (0, paths_1.getParent)(this);
    }
    getParents() {
        return (0, paths_1.getParents)(this);
    }
    move(parent) {
        AbstractGroup_1.PBXGroup.move(this, parent);
    }
    getRealPath() {
        return (0, paths_1.getRealPath)(this);
    }
    getFullPath() {
        return (0, paths_1.getFullPath)(this);
    }
    setLastKnownFileType(type) {
        if (type) {
            this.props.lastKnownFileType = type;
        }
        else if (this.props.path) {
            let extension = path_1.default.extname(this.props.path);
            if (extension.startsWith(".")) {
                extension = extension.substring(1);
            }
            this.props.lastKnownFileType = constants_1.FILE_TYPES_BY_EXTENSION[extension];
            debug(`setLastKnownFileType (ext: ${extension}, type: ${this.props.lastKnownFileType})`);
        }
    }
    setExplicitFileType(type) {
        if (type) {
            this.props.explicitFileType = type;
        }
        else if (this.props.path) {
            let extension = path_1.default.extname(this.props.path);
            if (extension.startsWith(".")) {
                extension = extension.substring(1);
            }
            this.props.explicitFileType = constants_1.FILE_TYPES_BY_EXTENSION[extension];
            debug(`setExplicitFileType (ext: ${extension}, type: ${this.props.explicitFileType})`);
        }
        if (this.props.explicitFileType) {
            // clear this out like Xcode
            this.props.lastKnownFileType = undefined;
        }
    }
    getDisplayName() {
        if (this.props.name) {
            return this.props.name;
        }
        else if (this.props.path &&
            this.props.sourceTree === "BUILT_PRODUCTS_DIR") {
            return this.props.path;
        }
        else if (this.props.path) {
            return path_1.default.basename(this.props.path);
        }
        // Probably never happens
        return this.isa.replace(/^(PBX|XC)/, "");
    }
    getProxyContainers() {
        return Array.from(this.getXcodeProject().values()).filter((object) => PBXContainerItemProxy_1.PBXContainerItemProxy.is(object) &&
            object.props.containerPortal.uuid === this.uuid);
    }
    // Set the path according to the source tree of the reference.
    setPath(path) {
        if (path) {
            setPathWithSourceTree(this, path, this.props.sourceTree);
        }
        else {
            this.props.path = undefined;
        }
    }
    getBuildFiles() {
        return this.getReferrers().filter((ref) => PBXBuildFile_1.PBXBuildFile.is(ref));
    }
    /**
     * If this file reference represents an external Xcode project reference
     * then this will return dependencies on targets contained in the
     * external Xcode project.
     *
     * @return [Array<PBXTargetDependency>] The dependencies on targets
     *         located in the external Xcode project.
     */
    getTargetDependencyProxies() {
        const containers = this.getProxyContainers();
        if (!containers.length) {
            return [];
        }
        return Array.from(this.getXcodeProject().values()).filter((object) => {
            return (PBXTargetDependency_1.PBXTargetDependency.is(object) &&
                containers.some((container) => container.uuid === object.props.targetProxy.uuid));
        });
    }
    removeFromProject() {
        this.getFileReferenceProxies().forEach((proxy) => {
            proxy.removeFromProject();
        });
        this.getTargetDependencyProxies().forEach((proxy) => {
            proxy.removeFromProject();
        });
        this.getBuildFiles().forEach((file) => file.removeFromProject());
        return super.removeFromProject();
    }
    getFileReferenceProxies() {
        const containers = this.getProxyContainers();
        if (!containers.length) {
            return [];
        }
        return [...this.getXcodeProject().values()].filter((object) => {
            if (!PBXReferenceProxy_1.PBXReferenceProxy.is(object)) {
                return false;
            }
            return !!containers.find((container) => PBXContainerItemProxy_1.PBXContainerItemProxy.is(object.props.remoteRef) &&
                container.uuid === object.props.remoteRef.uuid);
        });
    }
    /** @returns `true` if the file refers to an app extension, widget, etc. */
    isAppExtension() {
        const type = this.props.lastKnownFileType ?? this.props.explicitFileType;
        return !!(type &&
            ["wrapper.extensionkit-extension", "wrapper.app-extension"].includes(type) &&
            this.props.sourceTree === "BUILT_PRODUCTS_DIR");
    }
    getTargetReferrers() {
        return this.getReferrers().filter((ref) => {
            return (isPBXNativeTarget(ref) && ref.props.productReference?.uuid === this.uuid);
        });
    }
}
exports.PBXFileReference = PBXFileReference;
PBXFileReference.isa = json.ISA.PBXFileReference;
function isPBXNativeTarget(object) {
    return object.isa === json.ISA.PBXNativeTarget;
}
//# sourceMappingURL=PBXFileReference.js.map