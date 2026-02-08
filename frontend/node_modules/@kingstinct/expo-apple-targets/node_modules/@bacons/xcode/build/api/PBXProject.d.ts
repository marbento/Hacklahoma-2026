import { PROJECT_DEFAULT_BUILD_SETTINGS } from "./utils/constants";
import * as json from "../json/types";
import { AbstractObject } from "./AbstractObject";
import { PBXNativeTarget, PBXNativeTargetModel } from "./PBXNativeTarget";
import { XCBuildConfiguration } from "./XCBuildConfiguration";
import type { PickRequired, SansIsa } from "./utils/util.types";
import type { PBXGroup } from "./AbstractGroup";
import type { XcodeProject } from "./XcodeProject";
import type { PBXAggregateTarget } from "./PBXAggregateTarget";
import type { PBXLegacyTarget } from "./PBXLegacyTarget";
import type { XCConfigurationList } from "./XCConfigurationList";
import type { XCRemoteSwiftPackageReference } from "./XCRemoteSwiftPackageReference";
import type { XCLocalSwiftPackageReference } from "./XCLocalSwiftPackageReference";
export declare type PBXProjectModel = json.PBXProject<XCConfigurationList, PBXGroup, PBXGroup, PBXAggregateTarget | PBXLegacyTarget | PBXNativeTarget, XCRemoteSwiftPackageReference | XCLocalSwiftPackageReference>;
export declare class PBXProject extends AbstractObject<PBXProjectModel> {
    static isa: json.ISA.PBXProject;
    static is(object: any): object is PBXProject;
    static create(project: XcodeProject, opts: SansIsa<PBXProjectModel>): PBXProject;
    protected getObjectProps(): Partial<{
        buildConfigurationList: any;
        compatibilityVersion: any;
        developmentRegion?: any;
        hasScannedForEncodings?: any;
        knownRegions: any;
        mainGroup: any;
        productRefGroup?: any;
        projectDirPath: any;
        projectRoot: any;
        targets: any;
        packageReferences?: any;
    }>;
    protected setupDefaults(props: PBXProjectModel): void;
    addBuildConfiguration(name: string, type: keyof typeof PROJECT_DEFAULT_BUILD_SETTINGS): XCBuildConfiguration;
    getName(): string;
    /**
     * Get or create the 'Products' group set as the `productRefGroup`.
     *
     * @returns The `productRefGroup` or a new group if it doesn't exist.
     */
    ensureProductGroup(): PBXGroup;
    /**
     * Get or create the child group for a given name in the `mainGroup`. Useful for querying the `'Frameworks'` group.
     *
     * @returns The main group child group for the given `name` or a new group if it doesn't exist.
     */
    ensureMainGroupChild(name: string): PBXGroup;
    /** @returns the `Frameworks` group and ensuring it exists. */
    getFrameworksGroup(): PBXGroup;
    createNativeTarget(json: PickRequired<SansIsa<PBXNativeTargetModel>, "name" | "productType" | "buildConfigurationList">): PBXNativeTarget;
    getNativeTarget(type: json.PBXProductType): PBXNativeTarget | null;
    /** Best effort helper method to return the main target for a given app type. */
    getMainAppTarget(type?: "ios" | "macos" | "tvos" | "watchos"): PBXNativeTarget | null;
    isReferencing(uuid: string): boolean;
}
//# sourceMappingURL=PBXProject.d.ts.map