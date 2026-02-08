import * as json from "../json/types";
import { AbstractGroup } from "./AbstractGroup";
import type { PickRequired, SansIsa } from "./utils/util.types";
import type { PBXGroup } from "./AbstractGroup";
import type { XcodeProject } from "./XcodeProject";
import type { PBXFileReference } from "./PBXFileReference";
import type { PBXReferenceProxy } from "./PBXReferenceProxy";
export declare type XCVersionGroupModel = json.XCVersionGroup<PBXGroup | PBXReferenceProxy | PBXFileReference>;
export declare class XCVersionGroup extends AbstractGroup<XCVersionGroupModel> {
    static isa: json.ISA.XCVersionGroup;
    static is(object: any): object is XCVersionGroup;
    static create(project: XcodeProject, opts: PickRequired<SansIsa<XCVersionGroupModel>, "currentVersion">): XCVersionGroup;
    protected setupDefaults(): void;
}
//# sourceMappingURL=XCVersionGroup.d.ts.map