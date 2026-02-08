import * as json from "../json/types";
import { AbstractObject } from "./AbstractObject";
import type { PickRequired, SansIsa } from "./utils/util.types";
import type { PBXGroup } from "./AbstractGroup";
import type { XcodeProject } from "./XcodeProject";
import type { PBXFileReference } from "./PBXFileReference";
import type { PBXReferenceProxy } from "./PBXReferenceProxy";
import type { PBXVariantGroup } from "./PBXVariantGroup";
import type { XCSwiftPackageProductDependency } from "./XCSwiftPackageProductDependency";
import type { XCVersionGroup } from "./XCVersionGroup";
export declare type PBXBuildFileModel = json.PBXBuildFile<PBXFileReference | PBXGroup | PBXVariantGroup | XCVersionGroup | PBXReferenceProxy, XCSwiftPackageProductDependency>;
export declare class PBXBuildFile extends AbstractObject<PBXBuildFileModel> {
    static isa: json.ISA.PBXBuildFile;
    static is(object: any): object is PBXBuildFile;
    static create(project: XcodeProject, opts: PickRequired<SansIsa<PBXBuildFileModel>, "fileRef">): PBXBuildFile;
    protected getObjectProps(): {
        fileRef: StringConstructor;
        productRef: StringConstructor;
    };
    isReferencing(uuid: string): boolean;
    getDisplayName(): any;
}
//# sourceMappingURL=PBXBuildFile.d.ts.map