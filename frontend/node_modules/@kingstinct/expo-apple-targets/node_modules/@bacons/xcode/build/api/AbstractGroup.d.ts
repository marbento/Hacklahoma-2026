import { PRODUCT_UTI_EXTENSIONS } from "./utils/constants";
import * as json from "../json/types";
import { AbstractObject } from "./AbstractObject";
import { PBXFileReference, PBXFileReferenceModel } from "./PBXFileReference";
import type { PickRequired, SansIsa } from "./utils/util.types";
import type { XcodeProject } from "./XcodeProject";
import type { PBXProject } from "./PBXProject";
import type { PBXReferenceProxy } from "./PBXReferenceProxy";
import type { PBXFileSystemSynchronizedRootGroup } from "./PBXFileSystemSynchronizedRootGroup";
export declare class AbstractGroup<TJSON extends json.PBXGroup<any, PBXGroup | PBXReferenceProxy | PBXFileReference | PBXFileSystemSynchronizedRootGroup>> extends AbstractObject<TJSON> {
    protected getObjectProps(): any;
    protected setupDefaults(): void;
    createGroup(opts: SansIsa<Partial<TJSON>>): PBXGroup;
    /**
     * Traverses the children groups and finds the children with the given
     * path, optionally, creating any needed group. If the given path is
     * `null` it returns itself.
     *
     * @param path a string with the names of the groups separated by a `/`.
     * @param shouldCreate whether the path should be created.
     *
     * @return `PBXGroup` the group if found.
     * @return `null` if the `path` could not be found and `shouldCreate` is `false`.
     */
    mkdir(path: string | string[], { recursive }?: {
        recursive?: boolean;
    }): PBXGroup | null;
    getChildGroups(): PBXGroup[];
    createNewProductRefForTarget(productBaseName: string, type: keyof typeof PRODUCT_UTI_EXTENSIONS): PBXFileReference;
    static move(object: PBXFileReference | PBXGroup, newParent: PBXGroup): void;
    getParent(): PBXGroup | PBXProject;
    getParents(): (PBXGroup | PBXProject)[];
    isReferencing(uuid: string): boolean;
    removeReference(uuid: string): void;
    getPath(): string;
    createFile(opts: SansIsa<PickRequired<PBXFileReferenceModel, "path">>): PBXFileReference;
    getDisplayName(): string;
}
export declare type PBXGroupModel = json.PBXGroup<json.ISA.PBXGroup, PBXGroup | PBXReferenceProxy | PBXFileReference | PBXFileSystemSynchronizedRootGroup>;
export declare class PBXGroup extends AbstractGroup<PBXGroupModel> {
    static isa: json.ISA.PBXGroup;
    static is(object: any): object is PBXGroup;
    static create(project: XcodeProject, opts: Partial<SansIsa<PBXGroupModel>>): PBXGroup;
}
//# sourceMappingURL=AbstractGroup.d.ts.map