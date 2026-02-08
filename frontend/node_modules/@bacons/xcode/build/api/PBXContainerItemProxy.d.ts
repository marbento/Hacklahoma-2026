import * as json from "../json/types";
import { AbstractObject } from "./AbstractObject";
import type { SansIsa } from "./utils/util.types";
import { XcodeProject } from "./XcodeProject";
import { PBXFileReference } from "./PBXFileReference";
import type { PBXProject } from "./PBXProject";
import type { PBXReferenceProxy } from "./PBXReferenceProxy";
export declare type PBXContainerItemProxyModel = json.PBXContainerItemProxy<
/** containerPortal */
PBXReferenceProxy | PBXProject, 
/** remoteGlobalIDString */
json.UUID>;
export declare class PBXContainerItemProxy extends AbstractObject<PBXContainerItemProxyModel> {
    static isa: json.ISA.PBXContainerItemProxy;
    static is(object: any): object is PBXContainerItemProxy;
    static create(project: XcodeProject, opts: SansIsa<PBXContainerItemProxyModel>): PBXContainerItemProxy;
    protected getObjectProps(): {
        containerPortal: StringConstructor;
    };
    getProxiedObject(): (PBXProject | import("./AbstractGroup").PBXGroup | PBXFileReference | import("./PBXFileSystemSynchronizedBuildFileExceptionSet").PBXFileSystemSynchronizedBuildFileExceptionSet | import("./PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet").PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet | import("./PBXBuildFile").PBXBuildFile | import("./PBXSourcesBuildPhase").PBXAppleScriptBuildPhase | import("./PBXSourcesBuildPhase").PBXCopyFilesBuildPhase | import("./PBXSourcesBuildPhase").PBXFrameworksBuildPhase | import("./PBXSourcesBuildPhase").PBXHeadersBuildPhase | import("./PBXSourcesBuildPhase").PBXResourcesBuildPhase | import("./PBXSourcesBuildPhase").PBXShellScriptBuildPhase | import("./PBXSourcesBuildPhase").PBXSourcesBuildPhase | import("./PBXSourcesBuildPhase").PBXRezBuildPhase | PBXContainerItemProxy | import("./PBXVariantGroup").PBXVariantGroup | import("./XCVersionGroup").XCVersionGroup | import("./PBXFileSystemSynchronizedRootGroup").PBXFileSystemSynchronizedRootGroup | import("./PBXNativeTarget").PBXNativeTarget | import("./PBXAggregateTarget").PBXAggregateTarget | import("./PBXLegacyTarget").PBXLegacyTarget | import("./PBXTargetDependency").PBXTargetDependency | import("./XCBuildConfiguration").XCBuildConfiguration | import("./XCConfigurationList").XCConfigurationList | import("./PBXBuildRule").PBXBuildRule | PBXReferenceProxy) | undefined;
    getContainerPortalObject(): XcodeProject;
    /** @return `true` if this object points to a remote project. */
    isRemote(): boolean;
}
//# sourceMappingURL=PBXContainerItemProxy.d.ts.map