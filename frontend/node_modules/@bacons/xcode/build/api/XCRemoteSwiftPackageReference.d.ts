import * as json from "../json/types";
import { AbstractObject } from "./AbstractObject";
import type { SansIsa } from "./utils/util.types";
import type { XcodeProject } from "./XcodeProject";
export declare type XCRemoteSwiftPackageReferenceModel = json.XCRemoteSwiftPackageReference;
export declare class XCRemoteSwiftPackageReference extends AbstractObject<XCRemoteSwiftPackageReferenceModel> {
    static isa: json.ISA.XCRemoteSwiftPackageReference;
    static is(object: any): object is XCRemoteSwiftPackageReference;
    static create(project: XcodeProject, opts: SansIsa<XCRemoteSwiftPackageReferenceModel>): XCRemoteSwiftPackageReference;
    protected getObjectProps(): {};
    getDisplayName(): string;
}
//# sourceMappingURL=XCRemoteSwiftPackageReference.d.ts.map