import * as json from "../json/types";
import { AbstractObject } from "./AbstractObject";
import type { SansIsa } from "./utils/util.types";
import type { XcodeProject } from "./XcodeProject";
export declare type XCLocalSwiftPackageReferenceModel = json.XCLocalSwiftPackageReference;
export declare class XCLocalSwiftPackageReference extends AbstractObject<XCLocalSwiftPackageReferenceModel> {
    static isa: json.ISA.XCLocalSwiftPackageReference;
    static is(object: any): object is XCLocalSwiftPackageReference;
    static create(project: XcodeProject, opts: SansIsa<XCLocalSwiftPackageReferenceModel>): XCLocalSwiftPackageReference;
    protected getObjectProps(): {};
    getDisplayName(): string;
}
//# sourceMappingURL=XCLocalSwiftPackageReference.d.ts.map