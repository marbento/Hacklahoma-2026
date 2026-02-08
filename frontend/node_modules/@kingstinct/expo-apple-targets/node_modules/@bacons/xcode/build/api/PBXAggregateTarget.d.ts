import * as json from "../json/types";
import { AbstractTarget } from "./AbstractTarget";
import type { PickRequired, SansIsa } from "./utils/util.types";
import type { XcodeProject } from "./XcodeProject";
import type { AnyBuildPhase } from "./PBXSourcesBuildPhase";
import type { PBXTargetDependency } from "./PBXTargetDependency";
import type { XCConfigurationList } from "./XCConfigurationList";
export declare type PBXAggregateTargetModel = json.PBXAggregateTarget<XCConfigurationList, PBXTargetDependency, AnyBuildPhase>;
export declare class PBXAggregateTarget extends AbstractTarget<PBXAggregateTargetModel> {
    static isa: json.ISA.PBXAggregateTarget;
    static is(object: any): object is PBXAggregateTarget;
    static create(project: XcodeProject, opts: PickRequired<SansIsa<PBXAggregateTargetModel>, "name" | "buildConfigurationList">): PBXAggregateTarget;
}
//# sourceMappingURL=PBXAggregateTarget.d.ts.map