import * as json from "../json/types";
import { AbstractObject } from "./AbstractObject";
import { XCBuildConfiguration, XCBuildConfigurationModel } from "./XCBuildConfiguration";
import { XCConfigurationList, XCConfigurationListModel } from "./XCConfigurationList";
import type { PickRequired, SansIsa } from "./utils/util.types";
import type { AnyBuildPhase, PBXAppleScriptBuildPhase, PBXCopyFilesBuildPhase, PBXFrameworksBuildPhase, PBXHeadersBuildPhase, PBXResourcesBuildPhase, PBXRezBuildPhase, PBXShellScriptBuildPhase, PBXSourcesBuildPhase } from "./PBXSourcesBuildPhase";
import type { PBXTargetDependency } from "./PBXTargetDependency";
export declare class AbstractTarget<TJSON extends json.AbstractTarget<any, XCConfigurationList, PBXTargetDependency, AnyBuildPhase>> extends AbstractObject<TJSON> {
    createConfigurationList(listOptions: PickRequired<Omit<XCConfigurationListModel, "isa" | "buildConfigurations">, "defaultConfigurationName">, configurations: Omit<XCBuildConfigurationModel, "isa">[]): XCConfigurationList;
    /**
     * Checks whether this target has a dependency on the given target.
     */
    getDependencyForTarget(target: AbstractTarget<any>): PBXTargetDependency | undefined;
    createBuildPhase<TBuildPhase extends typeof PBXSourcesBuildPhase | typeof PBXRezBuildPhase | typeof PBXHeadersBuildPhase | typeof PBXCopyFilesBuildPhase | typeof PBXResourcesBuildPhase | typeof PBXFrameworksBuildPhase | typeof PBXAppleScriptBuildPhase | typeof PBXShellScriptBuildPhase>(buildPhaseKlass: TBuildPhase, props?: SansIsa<Partial<ConstructorParameters<TBuildPhase>[2]>>): InstanceType<TBuildPhase>;
    getBuildPhase<TBuildPhase extends typeof PBXSourcesBuildPhase | typeof PBXRezBuildPhase | typeof PBXHeadersBuildPhase | typeof PBXCopyFilesBuildPhase | typeof PBXResourcesBuildPhase | typeof PBXFrameworksBuildPhase | typeof PBXAppleScriptBuildPhase | typeof PBXShellScriptBuildPhase>(buildPhaseKlass: TBuildPhase): InstanceType<TBuildPhase> | null;
    isReferencing(uuid: string): boolean;
    protected getObjectProps(): any;
    getDefaultConfiguration(): XCBuildConfiguration;
    /** Set a build setting on all build configurations. */
    setBuildSetting<TSetting extends keyof json.BuildSettings>(key: TSetting, value: json.BuildSettings[TSetting]): json.BuildSettings[TSetting];
    /** Remove a build setting on all build configurations. */
    removeBuildSetting<TSetting extends keyof json.BuildSettings>(key: TSetting): void;
    /** @returns build setting from the default build configuration. */
    getDefaultBuildSetting<TSetting extends keyof json.BuildSettings>(key: TSetting): json.BuildSettings[TSetting];
    getAttributes(): json.TargetAttribute | undefined;
}
//# sourceMappingURL=AbstractTarget.d.ts.map