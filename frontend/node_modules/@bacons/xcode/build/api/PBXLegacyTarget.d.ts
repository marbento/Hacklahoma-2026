import * as json from "../json/types";
import { AbstractTarget } from "./AbstractTarget";
import type { AnyBuildPhase } from "./PBXSourcesBuildPhase";
import type { PBXTargetDependency } from "./PBXTargetDependency";
import type { XCConfigurationList } from "./XCConfigurationList";
export declare class PBXLegacyTarget extends AbstractTarget<json.PBXLegacyTarget<XCConfigurationList, PBXTargetDependency, AnyBuildPhase>> {
    static isa: json.ISA.PBXLegacyTarget;
    static is(object: any): object is PBXLegacyTarget;
}
//# sourceMappingURL=PBXLegacyTarget.d.ts.map