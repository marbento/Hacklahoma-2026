import type { PBXGroup, PBXFileReference, AbstractObject, PBXProject, PBXFileSystemSynchronizedBuildFileExceptionSet, PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet, PBXNativeTarget } from "../";
export declare function getParent(object: PBXGroup | PBXFileReference | PBXProject | PBXFileSystemSynchronizedBuildFileExceptionSet | PBXFileSystemSynchronizedGroupBuildPhaseMembershipExceptionSet): PBXGroup | PBXProject;
export declare function getParents(object: PBXGroup | PBXFileReference | PBXProject): (PBXGroup | PBXProject)[];
export declare function getRealPath(object: PBXGroup | PBXFileReference): string;
export declare function getSourceTreeRealPath(object: PBXGroup | PBXFileReference): string;
export declare function getFullPath(object: PBXGroup | PBXFileReference): string;
export declare function getReferringTargets(object: AbstractObject): PBXNativeTarget[];
//# sourceMappingURL=paths.d.ts.map