import * as json from "../json/types";
import type { SansIsa } from "./utils/util.types";
import type { XcodeProject } from "./XcodeProject";
import { AbstractObject } from "./AbstractObject";
import type { PBXFileSystemSynchronizedBuildFileExceptionSet } from "./PBXFileSystemSynchronizedBuildFileExceptionSet";
import type { PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet } from "./PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet";
export declare type PBXFileSystemSynchronizedRootGroupModel = json.PBXFileSystemSynchronizedRootGroup<PBXFileSystemSynchronizedBuildFileExceptionSet | PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet>;
export declare class PBXFileSystemSynchronizedRootGroup extends AbstractObject<PBXFileSystemSynchronizedRootGroupModel> {
    static isa: json.ISA.PBXFileSystemSynchronizedRootGroup;
    static is(object: any): object is PBXFileSystemSynchronizedRootGroup;
    static create(project: XcodeProject, opts: SansIsa<PBXFileSystemSynchronizedRootGroupModel>): PBXFileSystemSynchronizedRootGroup;
    protected getObjectProps(): {
        exceptions: StringConstructor[];
    };
}
//# sourceMappingURL=PBXFileSystemSynchronizedRootGroup.d.ts.map