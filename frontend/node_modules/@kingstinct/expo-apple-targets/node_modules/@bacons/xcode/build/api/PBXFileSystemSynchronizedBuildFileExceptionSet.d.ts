import * as json from "../json/types";
import type { SansIsa } from "./utils/util.types";
import type { XcodeProject } from "./XcodeProject";
import { AbstractObject } from "./AbstractObject";
import { PBXAggregateTarget } from "./PBXAggregateTarget";
import { PBXLegacyTarget } from "./PBXLegacyTarget";
import { PBXNativeTarget } from "./PBXNativeTarget";
export declare type PBXFileSystemSynchronizedBuildFileExceptionSetModel = json.PBXFileSystemSynchronizedBuildFileExceptionSet<PBXAggregateTarget | PBXLegacyTarget | PBXNativeTarget>;
export declare class PBXFileSystemSynchronizedBuildFileExceptionSet extends AbstractObject<PBXFileSystemSynchronizedBuildFileExceptionSetModel> {
    static isa: json.ISA.PBXFileSystemSynchronizedBuildFileExceptionSet;
    static is(object: any): object is PBXFileSystemSynchronizedBuildFileExceptionSet;
    static create(project: XcodeProject, opts: SansIsa<PBXFileSystemSynchronizedBuildFileExceptionSetModel>): PBXFileSystemSynchronizedBuildFileExceptionSet;
    protected getObjectProps(): {
        target: StringConstructor;
    };
    getDisplayName(): json.ISA.PBXFileSystemSynchronizedBuildFileExceptionSet;
}
//# sourceMappingURL=PBXFileSystemSynchronizedBuildFileExceptionSet.d.ts.map