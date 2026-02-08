import * as json from "../json/types";
import { AbstractObject } from "./AbstractObject";
import { PBXBuildFile, PBXBuildFileModel } from "./PBXBuildFile";
import type { PickRequired, SansIsa } from "./utils/util.types";
import type { PBXGroup } from "./AbstractGroup";
import type { PBXFileReference } from "./PBXFileReference";
import type { PBXReferenceProxy } from "./PBXReferenceProxy";
import type { PBXVariantGroup } from "./PBXVariantGroup";
import type { XCVersionGroup } from "./XCVersionGroup";
import type { PBXNativeTarget } from "./PBXNativeTarget";
declare type AnyFileReference = PBXFileReference | PBXGroup | PBXVariantGroup | XCVersionGroup | PBXReferenceProxy;
export declare class AbstractBuildPhase<TJSON extends json.AbstractBuildPhase<any, PBXBuildFile>> extends AbstractObject<TJSON> {
    protected getObjectProps(): any;
    /** Create a file and add it to the files array. To prevent creating duplicates, use `ensureFile` instead. */
    createFile(json: PickRequired<SansIsa<PBXBuildFileModel>, "fileRef">): PBXBuildFile;
    /** Get or create a file. */
    ensureFile(json: PickRequired<SansIsa<PBXBuildFileModel>, "fileRef">): PBXBuildFile;
    getFileReferences(): (PBXGroup | PBXFileReference | PBXVariantGroup | XCVersionGroup | PBXReferenceProxy)[];
    /** @returns the first build file for a given file reference. */
    getBuildFile(file: AnyFileReference | string): PBXBuildFile | null;
    includesFile(file: AnyFileReference | string): boolean;
    isReferencing(uuid: string): boolean;
    removeFileReference(file: PBXFileReference): void;
    removeBuildFile(file: PBXBuildFile): void;
    protected setupDefaults(): void;
}
export declare class PBXCopyFilesBuildPhase extends AbstractBuildPhase<json.PBXCopyFilesBuildPhase<PBXBuildFile>> {
    static isa: json.ISA.PBXCopyFilesBuildPhase;
    static is(object: any): object is PBXCopyFilesBuildPhase;
    getDisplayName(): string;
    private isAppExtensionFileRef;
    /** Given a target, set the default CopyBuildPhase values. This is useful for adding app extensions. */
    ensureDefaultsForTarget(target: PBXNativeTarget): void;
    protected setupDefaults(): void;
}
export declare class PBXSourcesBuildPhase extends AbstractBuildPhase<json.PBXSourcesBuildPhase<PBXBuildFile>> {
    static isa: json.ISA.PBXSourcesBuildPhase;
    static is(object: any): object is PBXSourcesBuildPhase;
}
export declare class PBXResourcesBuildPhase extends AbstractBuildPhase<json.PBXResourcesBuildPhase<PBXBuildFile>> {
    static isa: json.ISA.PBXResourcesBuildPhase;
    static is(object: any): object is PBXResourcesBuildPhase;
}
export declare class PBXHeadersBuildPhase extends AbstractBuildPhase<json.PBXHeadersBuildPhase<PBXBuildFile>> {
    static isa: json.ISA.PBXHeadersBuildPhase;
    static is(object: any): object is PBXHeadersBuildPhase;
}
export declare class PBXAppleScriptBuildPhase extends AbstractBuildPhase<json.PBXAppleScriptBuildPhase<PBXBuildFile>> {
    static isa: json.ISA.PBXAppleScriptBuildPhase;
    static is(object: any): object is PBXAppleScriptBuildPhase;
}
export declare class PBXRezBuildPhase extends AbstractBuildPhase<json.PBXRezBuildPhase<PBXBuildFile>> {
    static isa: json.ISA.PBXRezBuildPhase;
    static is(object: any): object is PBXRezBuildPhase;
}
export declare class PBXFrameworksBuildPhase extends AbstractBuildPhase<json.PBXFrameworksBuildPhase<PBXBuildFile>> {
    static isa: json.ISA.PBXFrameworksBuildPhase;
    static is(object: any): object is PBXFrameworksBuildPhase;
}
export declare class PBXShellScriptBuildPhase extends AbstractBuildPhase<json.PBXShellScriptBuildPhase<PBXBuildFile>> {
    static isa: json.ISA.PBXShellScriptBuildPhase;
    static is(object: any): object is PBXShellScriptBuildPhase;
    protected setupDefaults(): void;
}
export declare type AnyBuildPhase = PBXCopyFilesBuildPhase | PBXSourcesBuildPhase | PBXResourcesBuildPhase | PBXHeadersBuildPhase | PBXAppleScriptBuildPhase | PBXRezBuildPhase | PBXFrameworksBuildPhase | PBXShellScriptBuildPhase;
export {};
//# sourceMappingURL=PBXSourcesBuildPhase.d.ts.map