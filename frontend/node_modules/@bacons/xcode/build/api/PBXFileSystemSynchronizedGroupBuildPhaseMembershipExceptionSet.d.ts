import * as json from "../json/types";
import type { SansIsa } from "./utils/util.types";
import type { XcodeProject } from "./XcodeProject";
import { AbstractObject } from "./AbstractObject";
import { PBXCopyFilesBuildPhase, PBXSourcesBuildPhase } from "./PBXSourcesBuildPhase";
export declare type PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSetModel = json.PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet<PBXSourcesBuildPhase | PBXCopyFilesBuildPhase>;
export declare class PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet extends AbstractObject<PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSetModel> {
    static isa: json.ISA.PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet;
    static is(object: any): object is PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet;
    static create(project: XcodeProject, opts: SansIsa<PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSetModel>): PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet;
    protected getObjectProps(): {
        buildPhase: StringConstructor;
    };
    getDisplayName(): string;
}
//# sourceMappingURL=PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet.d.ts.map