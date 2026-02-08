import type { PBXNativeTarget } from "./PBXNativeTarget";
import * as json from "../json/types";
import { AbstractObject } from "./AbstractObject";
import type { SansIsa } from "./utils/util.types";
import type { XcodeProject } from "./XcodeProject";
import type { PBXFileReference } from "./PBXFileReference";
export declare type XCBuildConfigurationModel = json.XCBuildConfiguration<PBXFileReference>;
export declare class XCBuildConfiguration extends AbstractObject<XCBuildConfigurationModel> {
    static isa: json.ISA.XCBuildConfiguration;
    static is(object: any): object is XCBuildConfiguration;
    static create(project: XcodeProject, opts: SansIsa<XCBuildConfigurationModel>): XCBuildConfiguration;
    /** @returns the resolved absolute file path for the `INFOPLIST_FILE` build setting if it exists. `null` if the setting does not exist. */
    private resolveFilePath;
    /** @returns the resolved absolute file path for the `INFOPLIST_FILE` build setting if it exists. `null` if the setting does not exist. */
    getEntitlementsFilePath(): string | null;
    getEntitlements(): any;
    /** @returns the resolved absolute file path for the `INFOPLIST_FILE` build setting if it exists. `null` if the setting does not exist. */
    getInfoPlistFilePath(): string | null;
    getInfoPlist(): any;
    /** @returns a list of targets which refer to this build configuration. */
    getTargetReferrers(): PBXNativeTarget[];
    /**
     * Build settings can include environment variables (often defined by `xcodebuild`) and additional commands to mutate the value, e.g. `$(FOO:lower)` -> `process.env.FOO.toLowerCase()`
     *
     * @returns a resolved build setting with all commands and references interpolated out. */
    resolveBuildSetting<TSetting extends keyof json.BuildSettings>(buildSetting: TSetting): json.BuildSettings[TSetting];
    protected getObjectProps(): {
        baseConfigurationReference: StringConstructor;
    };
}
//# sourceMappingURL=XCBuildConfiguration.d.ts.map