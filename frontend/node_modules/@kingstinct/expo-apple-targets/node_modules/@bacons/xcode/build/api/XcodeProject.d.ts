import * as json from "../json/types";
import { AbstractObject } from "./AbstractObject";
import type { ValueOf } from "./utils/util.types";
import type { PBXGroup } from "./AbstractGroup";
import type { PBXAggregateTarget } from "./PBXAggregateTarget";
import type { PBXBuildFile } from "./PBXBuildFile";
import type { PBXBuildRule } from "./PBXBuildRule";
import type { PBXContainerItemProxy } from "./PBXContainerItemProxy";
import type { PBXFileReference } from "./PBXFileReference";
import type { PBXLegacyTarget } from "./PBXLegacyTarget";
import type { PBXNativeTarget } from "./PBXNativeTarget";
import type { PBXProject } from "./PBXProject";
import type { PBXReferenceProxy } from "./PBXReferenceProxy";
import type { PBXAppleScriptBuildPhase, PBXCopyFilesBuildPhase, PBXFrameworksBuildPhase, PBXHeadersBuildPhase, PBXResourcesBuildPhase, PBXRezBuildPhase, PBXShellScriptBuildPhase, PBXSourcesBuildPhase } from "./PBXSourcesBuildPhase";
import type { PBXTargetDependency } from "./PBXTargetDependency";
import type { PBXVariantGroup } from "./PBXVariantGroup";
import type { XCBuildConfiguration } from "./XCBuildConfiguration";
import type { XCConfigurationList } from "./XCConfigurationList";
import type { XCVersionGroup } from "./XCVersionGroup";
import type { PBXFileSystemSynchronizedRootGroup } from "./PBXFileSystemSynchronizedRootGroup";
import type { PBXFileSystemSynchronizedBuildFileExceptionSet } from "./PBXFileSystemSynchronizedBuildFileExceptionSet";
import type { PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet } from "./PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet";
declare type IsaMapping = {
    [json.ISA.PBXBuildFile]: PBXBuildFile;
    [json.ISA.PBXAppleScriptBuildPhase]: PBXAppleScriptBuildPhase;
    [json.ISA.PBXCopyFilesBuildPhase]: PBXCopyFilesBuildPhase;
    [json.ISA.PBXFrameworksBuildPhase]: PBXFrameworksBuildPhase;
    [json.ISA.PBXHeadersBuildPhase]: PBXHeadersBuildPhase;
    [json.ISA.PBXResourcesBuildPhase]: PBXResourcesBuildPhase;
    [json.ISA.PBXShellScriptBuildPhase]: PBXShellScriptBuildPhase;
    [json.ISA.PBXSourcesBuildPhase]: PBXSourcesBuildPhase;
    [json.ISA.PBXContainerItemProxy]: PBXContainerItemProxy;
    [json.ISA.PBXFileReference]: PBXFileReference;
    [json.ISA.PBXGroup]: PBXGroup;
    [json.ISA.PBXVariantGroup]: PBXVariantGroup;
    [json.ISA.XCVersionGroup]: XCVersionGroup;
    [json.ISA
        .PBXFileSystemSynchronizedRootGroup]: PBXFileSystemSynchronizedRootGroup;
    [json.ISA
        .PBXFileSystemSynchronizedBuildFileExceptionSet]: PBXFileSystemSynchronizedBuildFileExceptionSet;
    [json.ISA
        .PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet]: PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet;
    [json.ISA.PBXNativeTarget]: PBXNativeTarget;
    [json.ISA.PBXAggregateTarget]: PBXAggregateTarget;
    [json.ISA.PBXLegacyTarget]: PBXLegacyTarget;
    [json.ISA.PBXProject]: PBXProject;
    [json.ISA.PBXTargetDependency]: PBXTargetDependency;
    [json.ISA.XCBuildConfiguration]: XCBuildConfiguration;
    [json.ISA.XCConfigurationList]: XCConfigurationList;
    [json.ISA.PBXBuildRule]: PBXBuildRule;
    [json.ISA.PBXReferenceProxy]: PBXReferenceProxy;
    [json.ISA.PBXRezBuildPhase]: PBXRezBuildPhase;
};
declare type AnyModel = ValueOf<IsaMapping>;
export declare class XcodeProject extends Map<json.UUID, AnyModel> {
    filePath: string;
    /**
     * Versioning system for the entire archive.
     * @example `1`
     */
    archiveVersion: number;
    /**
     * Versioning system for the `objects` dictionary.
     * @example `55`
     */
    objectVersion: number;
    /** UUID for the initial object in the `objects` dictionary. */
    rootObject: PBXProject;
    /** No idea what this does, I've Googled it a bit. */
    classes: Record<json.UUID, unknown>;
    /** JSON objects which haven't been inflated yet */
    private internalJsonObjects;
    /**
     * @param filePath -- path to a `pbxproj` file.
     * @returns a new instance of `XcodeProject`
     */
    static open(filePath: string): XcodeProject;
    constructor(filePath: string, props: Partial<json.XcodeProject>);
    /** The directory containing the `*.xcodeproj/project.pbxproj` file, e.g. `/ios/` in React Native. */
    getProjectRoot(): string;
    getObject(uuid: string): any;
    private _getObjectOptional;
    createObject<TKlass extends json.AbstractObject<any>, TInstance = InstanceType<IsaMapping[TKlass["isa"]]>>(uuid: string, obj: TKlass): TInstance;
    private ensureAllObjectsInflated;
    createModel<TProps extends json.AbstractObject<any>>(opts: TProps): InstanceType<IsaMapping[TProps["isa"]]>;
    getReferenceForPath(absolutePath: string): PBXFileReference | null;
    getReferrers(uuid: string): AbstractObject[];
    private isUniqueId;
    private getUniqueId;
    toJSON(): json.XcodeProject;
}
export {};
//# sourceMappingURL=XcodeProject.d.ts.map