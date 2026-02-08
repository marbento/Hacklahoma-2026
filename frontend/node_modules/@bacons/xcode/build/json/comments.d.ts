import { PBXBuildFile, PBXFileReference, XcodeProject } from "./types";
/** Create a list of <UUID, Comment> */
export declare function createReferenceList(project: Partial<XcodeProject>): Record<string, string>;
export declare function isPBXBuildFile(val: any): val is PBXBuildFile;
export declare function isPBXFileReference(val: any): val is PBXFileReference;
//# sourceMappingURL=comments.d.ts.map