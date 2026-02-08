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
exports.XcodeProject = void 0;
const assert_1 = __importDefault(require("assert"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const json_1 = require("../json");
const json = __importStar(require("../json/types"));
const constants_1 = require("./utils/constants");
const debug = require("debug")("xcparse:model:XcodeProject");
function uuidForPath(path) {
    return (
    // Xcode seems to make the first 7 and last 8 characters the same so we'll inch toward that.
    "XX" +
        crypto_1.default
            .createHash("md5")
            .update(path)
            .digest("hex")
            .toUpperCase()
            .slice(0, 20) +
        "XX");
}
const KNOWN_ISA = {
    [json.ISA.PBXBuildFile]: () => require("./PBXBuildFile")
        .PBXBuildFile,
    [json.ISA.PBXAppleScriptBuildPhase]: () => require("./PBXSourcesBuildPhase")
        .PBXAppleScriptBuildPhase,
    [json.ISA.PBXCopyFilesBuildPhase]: () => require("./PBXSourcesBuildPhase")
        .PBXCopyFilesBuildPhase,
    [json.ISA.PBXFrameworksBuildPhase]: () => require("./PBXSourcesBuildPhase")
        .PBXFrameworksBuildPhase,
    [json.ISA.PBXHeadersBuildPhase]: () => require("./PBXSourcesBuildPhase")
        .PBXHeadersBuildPhase,
    [json.ISA.PBXResourcesBuildPhase]: () => require("./PBXSourcesBuildPhase")
        .PBXResourcesBuildPhase,
    [json.ISA.PBXShellScriptBuildPhase]: () => require("./PBXSourcesBuildPhase")
        .PBXShellScriptBuildPhase,
    [json.ISA.PBXSourcesBuildPhase]: () => require("./PBXSourcesBuildPhase")
        .PBXSourcesBuildPhase,
    [json.ISA.PBXContainerItemProxy]: () => require("./PBXContainerItemProxy")
        .PBXContainerItemProxy,
    [json.ISA.PBXFileReference]: () => require("./PBXFileReference")
        .PBXFileReference,
    [json.ISA.PBXGroup]: () => require("./AbstractGroup")
        .PBXGroup,
    [json.ISA.PBXVariantGroup]: () => require("./PBXVariantGroup")
        .PBXVariantGroup,
    [json.ISA.XCVersionGroup]: () => require("./XCVersionGroup")
        .XCVersionGroup,
    [json.ISA.PBXFileSystemSynchronizedRootGroup]: () => require("./PBXFileSystemSynchronizedRootGroup")
        .PBXFileSystemSynchronizedRootGroup,
    [json.ISA.PBXFileSystemSynchronizedBuildFileExceptionSet]: () => require("./PBXFileSystemSynchronizedBuildFileExceptionSet")
        .PBXFileSystemSynchronizedBuildFileExceptionSet,
    [json.ISA.PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet]: () => require("./PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet")
        .PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet,
    [json.ISA.PBXNativeTarget]: () => require("./PBXNativeTarget")
        .PBXNativeTarget,
    [json.ISA.PBXAggregateTarget]: () => require("./PBXAggregateTarget")
        .PBXAggregateTarget,
    [json.ISA.PBXLegacyTarget]: () => require("./PBXLegacyTarget")
        .PBXLegacyTarget,
    [json.ISA.PBXProject]: () => require("./PBXProject")
        .PBXProject,
    [json.ISA.PBXTargetDependency]: () => require("./PBXTargetDependency")
        .PBXTargetDependency,
    [json.ISA.XCBuildConfiguration]: () => require("./XCBuildConfiguration")
        .XCBuildConfiguration,
    [json.ISA.XCConfigurationList]: () => require("./XCConfigurationList")
        .XCConfigurationList,
    [json.ISA.PBXBuildRule]: () => require("./PBXBuildRule")
        .PBXBuildRule,
    [json.ISA.PBXReferenceProxy]: () => require("./PBXReferenceProxy")
        .PBXReferenceProxy,
    [json.ISA.PBXRezBuildPhase]: () => require("./PBXSourcesBuildPhase")
        .PBXRezBuildPhase,
    [json.ISA.XCSwiftPackageProductDependency]: () => require("./XCSwiftPackageProductDependency")
        .XCSwiftPackageProductDependency,
    [json.ISA.XCRemoteSwiftPackageReference]: () => require("./XCRemoteSwiftPackageReference").XCRemoteSwiftPackageReference,
    [json.ISA.XCLocalSwiftPackageReference]: () => require("./XCLocalSwiftPackageReference").XCLocalSwiftPackageReference,
};
class XcodeProject extends Map {
    constructor(filePath, props) {
        super();
        this.filePath = filePath;
        const json = JSON.parse(JSON.stringify(props));
        (0, assert_1.default)(json.objects, "objects is required");
        (0, assert_1.default)(json.rootObject, "rootObject is required");
        this.internalJsonObjects = json.objects;
        this.archiveVersion = json.archiveVersion ?? constants_1.LAST_KNOWN_ARCHIVE_VERSION;
        this.objectVersion = json.objectVersion ?? constants_1.DEFAULT_OBJECT_VERSION;
        this.classes = json.classes ?? {};
        // Sanity
        assertRootObject(json.rootObject, json.objects?.[json.rootObject]);
        // Inflate the root object.
        this.rootObject = this.getObject(json.rootObject);
        // This should never be needed in a compliant project.
        this.ensureAllObjectsInflated();
    }
    /**
     * @param filePath -- path to a `pbxproj` file.
     * @returns a new instance of `XcodeProject`
     */
    static open(filePath) {
        const contents = (0, fs_1.readFileSync)(filePath, "utf8");
        const json = (0, json_1.parse)(contents);
        return new XcodeProject(filePath, json);
    }
    /** The directory containing the `*.xcodeproj/project.pbxproj` file, e.g. `/ios/` in React Native. */
    getProjectRoot() {
        // TODO: Not sure if this is right
        return path_1.default.dirname(path_1.default.dirname(this.filePath));
    }
    getObject(uuid) {
        const obj = this._getObjectOptional(uuid);
        if (obj) {
            return obj;
        }
        throw new Error(`object with uuid '${uuid}' not found.`);
    }
    _getObjectOptional(uuid) {
        if (this.has(uuid)) {
            return this.get(uuid);
        }
        const obj = this.internalJsonObjects[uuid];
        if (!obj) {
            return null;
        }
        // Clear out so we known this model has already been inflated.
        delete this.internalJsonObjects[uuid];
        const model = this.createObject(uuid, obj);
        this.set(uuid, model);
        // Inflate after the model has been registered.
        model.inflate();
        return model;
    }
    createObject(uuid, obj) {
        // @ts-expect-error
        const Klass = KNOWN_ISA[obj.isa]();
        (0, assert_1.default)(Klass, `unknown object type. (isa: ${obj.isa}, uuid: ${uuid})`);
        return new Klass(this, uuid, obj);
    }
    ensureAllObjectsInflated() {
        // This method exists for sanity
        if (Object.keys(this.internalJsonObjects).length === 0)
            return;
        debug("inflating unreferenced objects: %o", Object.keys(this.internalJsonObjects));
        while (Object.keys(this.internalJsonObjects).length > 0) {
            const uuid = Object.keys(this.internalJsonObjects)[0];
            this.getObject(uuid);
        }
    }
    createModel(opts) {
        const uuid = this.getUniqueId(JSON.stringify(canonicalize(opts)));
        const model = this.createObject(uuid, opts);
        this.set(uuid, model);
        return model;
    }
    getReferenceForPath(absolutePath) {
        if (!path_1.default.isAbsolute(absolutePath)) {
            throw new Error(`Paths must be absolute ${absolutePath}`);
        }
        for (const child of this.values()) {
            if (child.isa === "PBXFileReference" &&
                "getRealPath" in child &&
                child.getRealPath() === absolutePath) {
                return child;
            }
        }
        return null;
    }
    getReferrers(uuid) {
        let referrers = [];
        for (const child of this.values()) {
            if (child.isReferencing(uuid)) {
                referrers.push(child);
            }
        }
        return referrers;
    }
    isUniqueId(id) {
        for (const key of this.keys()) {
            if (key === id) {
                return false;
            }
        }
        return true;
    }
    getUniqueId(seed) {
        const id = uuidForPath(seed);
        if (this.isUniqueId(id)) {
            return id;
        }
        return this.getUniqueId(
        // Add a space to the seed to increase the hash.
        seed + " ");
    }
    toJSON() {
        const json = {
            archiveVersion: this.archiveVersion,
            objectVersion: this.objectVersion,
            classes: this.classes,
            objects: {},
            rootObject: this.rootObject.uuid,
        };
        // Inflate all objects.
        for (const [uuid, obj] of this.entries()) {
            json.objects[uuid] = obj.toJSON();
        }
        return json;
    }
}
exports.XcodeProject = XcodeProject;
function assertRootObject(id, obj) {
    if (obj?.isa !== "PBXProject") {
        throw new Error(`Root object "${id}" is not a PBXProject`);
    }
}
function canonicalize(value) {
    // Deep sort serialized `value` object to make it deterministic.
    if (Array.isArray(value)) {
        return value.map(canonicalize);
    }
    else if (typeof value === "object") {
        if ("uuid" in value && typeof value.uuid === "string") {
            return value.uuid;
        }
        const sorted = {};
        for (const key of Object.keys(value).sort()) {
            sorted[key] = canonicalize(value[key]);
        }
        return sorted;
    }
    else {
        return value;
    }
}
//# sourceMappingURL=XcodeProject.js.map