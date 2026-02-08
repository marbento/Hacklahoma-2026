import * as json from "../json/types";
import { PBXGroup } from "./AbstractGroup";
import { AbstractObject } from "./AbstractObject";
import type { PickRequired, SansIsa } from "./utils/util.types";
import type { XcodeProject } from "./XcodeProject";
import { PBXContainerItemProxy } from "./PBXContainerItemProxy";
import { PBXReferenceProxy } from "./PBXReferenceProxy";
import { PBXTargetDependency } from "./PBXTargetDependency";
import type { PBXNativeTarget } from "./PBXNativeTarget";
export declare function getPossibleDefaultSourceTree(fileReference: Pick<PBXFileReferenceModel, "lastKnownFileType" | "explicitFileType">): json.SourceTree;
export declare type PBXFileReferenceModel = json.PBXFileReference;
export declare class PBXFileReference extends AbstractObject<PBXFileReferenceModel> {
    static isa: json.ISA.PBXFileReference;
    static is(object: any): object is PBXFileReference;
    static create(project: XcodeProject, opts: PickRequired<SansIsa<PBXFileReferenceModel>, "path">): PBXFileReference;
    protected getObjectProps(): {};
    protected setupDefaults(): void;
    getParent(): import("./PBXProject").PBXProject | PBXGroup;
    getParents(): (import("./PBXProject").PBXProject | PBXGroup)[];
    move(parent: PBXGroup): void;
    getRealPath(): string;
    getFullPath(): string;
    setLastKnownFileType(type?: json.FileType): void;
    setExplicitFileType(type?: json.FileType): void;
    getDisplayName(): any;
    getProxyContainers(): PBXContainerItemProxy[];
    setPath(path?: string): void;
    getBuildFiles(): AbstractObject<json.AbstractObject<any>>[];
    /**
     * If this file reference represents an external Xcode project reference
     * then this will return dependencies on targets contained in the
     * external Xcode project.
     *
     * @return [Array<PBXTargetDependency>] The dependencies on targets
     *         located in the external Xcode project.
     */
    getTargetDependencyProxies(): PBXTargetDependency[];
    removeFromProject(): void;
    getFileReferenceProxies(): PBXReferenceProxy[];
    /** @returns `true` if the file refers to an app extension, widget, etc. */
    isAppExtension(): boolean;
    getTargetReferrers(): PBXNativeTarget[];
}
//# sourceMappingURL=PBXFileReference.d.ts.map