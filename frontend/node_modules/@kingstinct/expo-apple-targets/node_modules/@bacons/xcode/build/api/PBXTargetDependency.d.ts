import * as json from "../json/types";
import { AbstractObject } from "./AbstractObject";
import type { SansIsa } from "./utils/util.types";
import type { XcodeProject } from "./XcodeProject";
import type { PBXAggregateTarget } from "./PBXAggregateTarget";
import type { PBXContainerItemProxy } from "./PBXContainerItemProxy";
import type { PBXLegacyTarget } from "./PBXLegacyTarget";
import type { PBXNativeTarget } from "./PBXNativeTarget";
export declare type PBXTargetDependencyModel = json.PBXTargetDependency<PBXAggregateTarget | PBXLegacyTarget | PBXNativeTarget, 
/** targetProxy */
PBXContainerItemProxy>;
export declare class PBXTargetDependency extends AbstractObject<PBXTargetDependencyModel> {
    static isa: json.ISA.PBXTargetDependency;
    static is(object: any): object is PBXTargetDependency;
    static create(project: XcodeProject, opts: SansIsa<PBXTargetDependencyModel>): PBXTargetDependency;
    protected getObjectProps(): {
        target: StringConstructor;
        targetProxy: StringConstructor;
    };
    /**
     * @return uuid of the target, if the dependency is a native target, otherwise the uuid of the target in the sub-project if the dependency is a target proxy.
     */
    getNativeTargetUuid(): string;
    getDisplayName(): string;
}
//# sourceMappingURL=PBXTargetDependency.d.ts.map