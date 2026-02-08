import * as json from "../json/types";
import { AbstractObject } from "./AbstractObject";
import type { PickRequired, SansIsa } from "./utils/util.types";
import type { XcodeProject } from "./XcodeProject";
import type { XCBuildConfiguration } from "./XCBuildConfiguration";
export declare type XCConfigurationListModel = json.XCConfigurationList<XCBuildConfiguration>;
export declare class XCConfigurationList extends AbstractObject<XCConfigurationListModel> {
    static isa: json.ISA.XCConfigurationList;
    static is(object: any): object is XCConfigurationList;
    static create(project: XcodeProject, opts: PickRequired<SansIsa<XCConfigurationListModel>, "defaultConfigurationName" | "buildConfigurations">): XCConfigurationList;
    protected getObjectProps(): {
        buildConfigurations: StringConstructor[];
    };
    /** Get the configuration for the `defaultConfigurationName` and assert if it isn't available. */
    getDefaultConfiguration(): XCBuildConfiguration;
    removeReference(uuid: string): void;
    isReferencing(uuid: string): boolean;
    /** Set a build setting on all build configurations. */
    setBuildSetting<TSetting extends keyof json.BuildSettings>(key: TSetting, value: json.BuildSettings[TSetting]): json.BuildSettings[TSetting];
    /** Remove a build setting on all build configurations. */
    removeBuildSetting<TSetting extends keyof json.BuildSettings>(key: TSetting): void;
    /** @returns build setting from the default build configuration. */
    getDefaultBuildSetting<TSetting extends keyof json.BuildSettings>(key: TSetting): json.BuildSettings[TSetting];
}
//# sourceMappingURL=XCConfigurationList.d.ts.map