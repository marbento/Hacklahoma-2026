import * as json from "../json/types";
import { AbstractTarget } from "./AbstractTarget";
import { PBXCopyFilesBuildPhase, PBXFrameworksBuildPhase, PBXHeadersBuildPhase, PBXResourcesBuildPhase, PBXSourcesBuildPhase, type AnyBuildPhase } from "./PBXSourcesBuildPhase";
import { PBXFileReference } from "./PBXFileReference";
import type { PickRequired, SansIsa } from "./utils/util.types";
import type { XcodeProject } from "./XcodeProject";
import type { PBXBuildRule } from "./PBXBuildRule";
import { PBXTargetDependency } from "./PBXTargetDependency";
import type { XCConfigurationList } from "./XCConfigurationList";
import type { XCSwiftPackageProductDependency } from "./XCSwiftPackageProductDependency";
import type { PBXFileSystemSynchronizedRootGroup } from "./PBXFileSystemSynchronizedRootGroup";
export declare type PBXNativeTargetModel = json.PBXNativeTarget<XCConfigurationList, PBXTargetDependency, AnyBuildPhase, PBXBuildRule, PBXFileReference, XCSwiftPackageProductDependency, PBXFileSystemSynchronizedRootGroup>;
export declare class PBXNativeTarget extends AbstractTarget<PBXNativeTargetModel> {
    static isa: json.ISA.PBXNativeTarget;
    static is(object: any): object is PBXNativeTarget;
    static create(project: XcodeProject, opts: PickRequired<SansIsa<PBXNativeTargetModel>, "name" | "productType" | "buildConfigurationList">): PBXNativeTarget;
    isReferencing(uuid: string): boolean;
    /** @returns the `PBXFrameworksBuildPhase` or creates one if there is none. Only one can exist. */
    getFrameworksBuildPhase(): PBXFrameworksBuildPhase;
    /** @returns the `PBXHeadersBuildPhase` or creates one if there is none. Only one can exist. */
    getHeadersBuildPhase(): PBXHeadersBuildPhase;
    /** @returns the `PBXSourcesBuildPhase` or creates one if there is none. Only one can exist. */
    getSourcesBuildPhase(): PBXSourcesBuildPhase;
    /** @returns the `PBXResourcesBuildPhase` or creates one if there is none. Only one can exist. */
    getResourcesBuildPhase(): PBXResourcesBuildPhase;
    /** Ensures a list of frameworks are linked to the target, given a list like `['SwiftUI.framework', 'WidgetKit.framework']`. Also ensures the file references are added to the Frameworks display folder. */
    ensureFrameworks(frameworks: string[]): import("./PBXBuildFile").PBXBuildFile[];
    /**
     * Adds a dependency on the given target.
     *
     * @param  [AbstractTarget] target
     *         the target which should be added to the dependencies list of
     *         the receiver. The target may be a target of this target's
     *         project or of a subproject of this project. Note that the
     *         subproject must already be added to this target's project.
     *
     * @return [void]
     */
    addDependency(target: PBXNativeTarget): void;
    getCopyBuildPhaseForTarget(target: PBXNativeTarget): PBXCopyFilesBuildPhase;
    isWatchOSTarget(): boolean;
    protected getObjectProps(): Partial<{
        buildRules: any;
        productType: any;
        productReference?: any;
        productInstallPath?: any;
        packageProductDependencies?: any;
        productName?: any;
        buildConfigurationList: any;
        dependencies: any;
        buildPhases: any;
    }>;
}
//# sourceMappingURL=PBXNativeTarget.d.ts.map