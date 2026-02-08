"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubFolder = exports.ProxyType = exports.ISA = void 0;
/**
 * `isa` or 'is a' as in 'object _is a_ `PBXBuildFile`'.
 *
 * The naming is a reference to Objective-C.
 * In objc, when objects are allocated they have an 'isa' pointer which indicates the superclass.
 *
 * - [cite](https://stackoverflow.com/a/3405588/4047926)
 * - [Apple Docs](https://developer.apple.com/documentation/objectivec/objc_object/1418809-isa).
 */
var ISA;
(function (ISA) {
    ISA["PBXBuildFile"] = "PBXBuildFile";
    ISA["PBXAppleScriptBuildPhase"] = "PBXAppleScriptBuildPhase";
    ISA["PBXCopyFilesBuildPhase"] = "PBXCopyFilesBuildPhase";
    ISA["PBXFrameworksBuildPhase"] = "PBXFrameworksBuildPhase";
    ISA["PBXHeadersBuildPhase"] = "PBXHeadersBuildPhase";
    ISA["PBXResourcesBuildPhase"] = "PBXResourcesBuildPhase";
    ISA["PBXShellScriptBuildPhase"] = "PBXShellScriptBuildPhase";
    ISA["PBXSourcesBuildPhase"] = "PBXSourcesBuildPhase";
    ISA["PBXRezBuildPhase"] = "PBXRezBuildPhase";
    ISA["PBXContainerItemProxy"] = "PBXContainerItemProxy";
    ISA["PBXFileReference"] = "PBXFileReference";
    ISA["PBXGroup"] = "PBXGroup";
    ISA["PBXVariantGroup"] = "PBXVariantGroup";
    ISA["XCVersionGroup"] = "XCVersionGroup";
    ISA["PBXFileSystemSynchronizedRootGroup"] = "PBXFileSystemSynchronizedRootGroup";
    ISA["PBXFileSystemSynchronizedBuildFileExceptionSet"] = "PBXFileSystemSynchronizedBuildFileExceptionSet";
    ISA["PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet"] = "PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet";
    ISA["PBXNativeTarget"] = "PBXNativeTarget";
    ISA["PBXAggregateTarget"] = "PBXAggregateTarget";
    ISA["PBXLegacyTarget"] = "PBXLegacyTarget";
    ISA["PBXProject"] = "PBXProject";
    ISA["PBXTargetDependency"] = "PBXTargetDependency";
    ISA["XCBuildConfiguration"] = "XCBuildConfiguration";
    ISA["XCConfigurationList"] = "XCConfigurationList";
    ISA["PBXBuildRule"] = "PBXBuildRule";
    ISA["PBXReferenceProxy"] = "PBXReferenceProxy";
    // spm
    ISA["XCSwiftPackageProductDependency"] = "XCSwiftPackageProductDependency";
    ISA["XCRemoteSwiftPackageReference"] = "XCRemoteSwiftPackageReference";
    ISA["XCLocalSwiftPackageReference"] = "XCLocalSwiftPackageReference";
})(ISA = exports.ISA || (exports.ISA = {}));
var ProxyType;
(function (ProxyType) {
    ProxyType[ProxyType["targetReference"] = 1] = "targetReference";
    ProxyType[ProxyType["reference"] = 2] = "reference";
})(ProxyType = exports.ProxyType || (exports.ProxyType = {}));
// `PBXCopyFilesBuildPhase` destinations.
var SubFolder;
(function (SubFolder) {
    SubFolder[SubFolder["absolutePath"] = 0] = "absolutePath";
    SubFolder[SubFolder["productsDirectory"] = 16] = "productsDirectory";
    SubFolder[SubFolder["wrapper"] = 1] = "wrapper";
    SubFolder[SubFolder["executables"] = 6] = "executables";
    SubFolder[SubFolder["resources"] = 7] = "resources";
    SubFolder[SubFolder["javaResources"] = 15] = "javaResources";
    SubFolder[SubFolder["frameworks"] = 10] = "frameworks";
    SubFolder[SubFolder["sharedFrameworks"] = 11] = "sharedFrameworks";
    SubFolder[SubFolder["sharedSupport"] = 12] = "sharedSupport";
    SubFolder[SubFolder["plugins"] = 13] = "plugins";
    // other,
})(SubFolder = exports.SubFolder || (exports.SubFolder = {}));
//# sourceMappingURL=types.js.map