"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPBXFileReference = exports.isPBXBuildFile = exports.createReferenceList = void 0;
/** Create a list of <UUID, Comment> */
function createReferenceList(project) {
    const strict = false;
    const objects = project?.objects ?? {};
    const referenceCache = {};
    function getXCConfigurationListComment(id) {
        for (const [innerId, obj] of Object.entries(objects)) {
            if (obj.buildConfigurationList === id) {
                let name = obj.name ?? obj.path ?? obj.productName;
                if (!name) {
                    name =
                        objects[obj.targets?.[0]]?.productName ??
                            objects[obj.targets?.[0]]?.name;
                    if (!name) {
                        // NOTE(EvanBacon): I have no idea what I'm doing...
                        // this is for the case where the build configuration list is pointing to the main `PBXProject` object (no name).
                        // We locate the proxy (which may or may not be related) and use the remoteInfo property.
                        const proxy = Object.values(objects).find((obj) => obj.isa === "PBXContainerItemProxy" &&
                            obj.containerPortal === innerId);
                        name = proxy?.remoteInfo;
                    }
                }
                return `Build configuration list for ${obj.isa} "${name}"`;
            }
        }
        return `Build configuration list for [unknown]`;
    }
    function getBuildPhaseNameContainingFile(buildFileId) {
        const buildPhase = Object.values(objects).find((obj) => obj.files?.includes(buildFileId));
        return buildPhase ? getBuildPhaseName(buildPhase) : null;
    }
    function getPBXBuildFileComment(id, buildFile) {
        const buildPhaseName = getBuildPhaseNameContainingFile(id) ?? "[missing build phase]";
        const name = getCommentForObject(buildFile.fileRef ?? buildFile.productRef, objects[buildFile.fileRef ?? buildFile.productRef]);
        return `${name} in ${buildPhaseName}`;
    }
    function getCommentForObject(id, object) {
        if (!object?.isa) {
            return null;
        }
        if (id in referenceCache) {
            return referenceCache[id];
        }
        if (isPBXBuildFile(object)) {
            referenceCache[id] = getPBXBuildFileComment(id, object);
        }
        else if (isXCConfigurationList(object)) {
            referenceCache[id] = getXCConfigurationListComment(id);
        }
        else if (isXCRemoteSwiftPackageReference(object)) {
            if (object.repositoryURL) {
                referenceCache[id] = `${object.isa} "${getRepoNameFromURL(object.repositoryURL)}"`;
            }
            else {
                referenceCache[id] = object.isa;
            }
        }
        else if (isXCLocalSwiftPackageReference(object)) {
            if (object.relativePath) {
                referenceCache[id] = `${object.isa} "${object.relativePath}"`;
            }
            else {
                referenceCache[id] = object.isa;
            }
        }
        else if (isPBXProject(object)) {
            referenceCache[id] = "Project object";
        }
        else if (object.isa?.endsWith("BuildPhase")) {
            referenceCache[id] = getBuildPhaseName(object) ?? "";
        }
        else {
            if (object.isa === "PBXGroup" &&
                object.name === undefined &&
                object.path === undefined) {
                referenceCache[id] = "";
            }
            else {
                referenceCache[id] =
                    object.name ??
                        object.productName ??
                        object.path ??
                        object.isa ??
                        null;
            }
        }
        return referenceCache[id] ?? null;
    }
    Object.entries(objects).forEach(([id, object]) => {
        if (!getCommentForObject(id, object)) {
            if (strict)
                throw new Error("Failed to find comment reference for ID: " +
                    id +
                    ", isa: " +
                    object.isa);
        }
    });
    return referenceCache;
}
exports.createReferenceList = createReferenceList;
function getRepoNameFromURL(repoUrl) {
    try {
        const url = new URL(repoUrl);
        // github.com/expo/spm-package -> spm-package
        if (url.hostname === "github.com") {
            return url.pathname.split("/").pop();
        }
    }
    catch { }
    return repoUrl;
}
function isPBXProject(val) {
    return val?.isa === "PBXProject";
}
function isPBXBuildFile(val) {
    return val?.isa === "PBXBuildFile";
}
exports.isPBXBuildFile = isPBXBuildFile;
function isPBXFileReference(val) {
    return val?.isa === "PBXFileReference";
}
exports.isPBXFileReference = isPBXFileReference;
function isXCRemoteSwiftPackageReference(val) {
    return val?.isa === "XCRemoteSwiftPackageReference";
}
function isXCLocalSwiftPackageReference(val) {
    return val?.isa === "XCLocalSwiftPackageReference";
}
function isXCConfigurationList(val) {
    return val?.isa === "XCConfigurationList";
}
function getBuildPhaseName(buildPhase) {
    return buildPhase.name ?? getDefaultBuildPhaseName(buildPhase.isa);
}
/** Return the default name for a build phase object based on the `isa` */
function getDefaultBuildPhaseName(isa) {
    return isa.match(/PBX([a-zA-Z]+)BuildPhase/)?.[1] ?? null;
}
//# sourceMappingURL=comments.js.map