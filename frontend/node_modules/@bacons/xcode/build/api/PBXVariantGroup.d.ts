import * as json from "../json/types";
import { AbstractGroup } from "./AbstractGroup";
import type { SansIsa } from "./utils/util.types";
import type { PBXGroup } from "./AbstractGroup";
import type { XcodeProject } from "./XcodeProject";
import type { PBXFileReference } from "./PBXFileReference";
import type { PBXReferenceProxy } from "./PBXReferenceProxy";
export declare type PBXVariantGroupModel = json.PBXVariantGroup<PBXGroup | PBXReferenceProxy | PBXFileReference>;
export declare class PBXVariantGroup extends AbstractGroup<PBXVariantGroupModel> {
    static isa: json.ISA.PBXVariantGroup;
    static is(object: any): object is PBXVariantGroup;
    static create(project: XcodeProject, opts: Partial<SansIsa<PBXVariantGroupModel>>): PBXVariantGroup;
}
//# sourceMappingURL=PBXVariantGroup.d.ts.map