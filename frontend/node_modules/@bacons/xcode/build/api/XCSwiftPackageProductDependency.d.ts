import * as json from "../json/types";
import { AbstractObject } from "./AbstractObject";
import type { SansIsa } from "./utils/util.types";
import type { XcodeProject } from "./XcodeProject";
import type { XCRemoteSwiftPackageReference } from "./XCRemoteSwiftPackageReference";
import type { XCLocalSwiftPackageReference } from "./XCLocalSwiftPackageReference";
export declare type XCSwiftPackageProductDependencyModel = json.XCSwiftPackageProductDependency<XCRemoteSwiftPackageReference | XCLocalSwiftPackageReference>;
export declare class XCSwiftPackageProductDependency extends AbstractObject<XCSwiftPackageProductDependencyModel> {
    static isa: json.ISA.XCSwiftPackageProductDependency;
    static is(object: any): object is XCSwiftPackageProductDependency;
    static create(project: XcodeProject, opts: SansIsa<XCSwiftPackageProductDependencyModel>): XCSwiftPackageProductDependency;
    protected getObjectProps(): {};
    getDisplayName(): string;
}
//# sourceMappingURL=XCSwiftPackageProductDependency.d.ts.map