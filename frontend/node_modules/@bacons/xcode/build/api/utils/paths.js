"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReferringTargets = exports.getFullPath = exports.getSourceTreeRealPath = exports.getRealPath = exports.getParents = exports.getParent = void 0;
// https://github.com/CocoaPods/Xcodeproj/blob/14c3954d05ca954ee7b43498def8077cc7495509/lib/xcodeproj/project/object/helpers/groupable_helper.rb#L100
const assert_1 = __importDefault(require("assert"));
const path_1 = __importDefault(require("path"));
const json = __importStar(require("../../json/types"));
function unique(array) {
    return Array.from(new Set(array));
}
function isPBXProject(value) {
    return value.isa === "PBXProject";
}
function isPBXGroup(value) {
    return value.isa === "PBXGroup";
}
function getReferringGroups(object) {
    let referrers = unique(object.getReferrers());
    if (referrers.length > 1) {
        return referrers.filter((referrer) => isPBXGroup(referrer));
    }
    else if (referrers.length === 1) {
        const reference = referrers[0];
        (0, assert_1.default)(isPBXProject(reference) || isPBXGroup(reference), "referring object is not a PBXGroup or PBXProject");
        return [reference];
    }
    return [];
}
function getParent(object) {
    const referrers = getReferringGroups(object);
    if (!referrers.length) {
        throw new Error(`Consistency issue: no parent for object: "${object.getDisplayName() || object.isa + " - " + object.uuid}"`);
    }
    else if (referrers.length > 1) {
        throw new Error(`Consistency issue: multiple parents for object: "${object.getDisplayName()}": ${referrers
            .map((referrer) => referrer.getDisplayName())
            .join(", ")}`);
    }
    return referrers[0];
}
exports.getParent = getParent;
function getParents(object) {
    if (isMainGroup(object)) {
        return [];
    }
    const parent = getParent(object);
    return [...getParents(parent), parent];
}
exports.getParents = getParents;
function isMainGroup(object) {
    return (object.uuid === object.getXcodeProject().rootObject.props.mainGroup.uuid);
}
function getRealPath(object) {
    let sourceTree = getSourceTreeRealPath(object);
    let _path = object.props.path || "";
    if (sourceTree) {
        return path_1.default.join(sourceTree, _path);
    }
    return _path;
}
exports.getRealPath = getRealPath;
function getSourceTreeRealPath(object) {
    if (object.props.sourceTree === "<group>") {
        const objectParent = getParent(object);
        if (isPBXProject(objectParent)) {
            return path_1.default.join(object.getXcodeProject().getProjectRoot(), object.project.props.projectDirPath);
        }
        return getRealPath(objectParent);
    }
    else if (object.props.sourceTree === "SOURCE_ROOT") {
        return path_1.default.resolve(object.getXcodeProject().getProjectRoot());
    }
    else if (object.props.sourceTree === "<absolute>") {
        return "";
    }
    return object.props.sourceTree;
}
exports.getSourceTreeRealPath = getSourceTreeRealPath;
function getResolvedRootPath(object) {
    if (object.props.sourceTree === "<group>") {
        const objectParent = getParent(object);
        if (isPBXProject(objectParent)) {
            return "";
        }
        return getFullPath(objectParent);
    }
    else if (object.props.sourceTree === "SOURCE_ROOT") {
        return "";
    }
    else if (object.props.sourceTree === "<absolute>") {
        return "/";
    }
    return object.props.sourceTree;
}
function getFullPath(object) {
    const rootPath = getResolvedRootPath(object);
    if (object.props.path) {
        return path_1.default.join(rootPath, object.props.path);
    }
    return rootPath;
}
exports.getFullPath = getFullPath;
function getReferringTargets(object) {
    return object.getReferrers().filter((ref) => {
        return isPBXNativeTarget(ref);
    });
}
exports.getReferringTargets = getReferringTargets;
function isPBXNativeTarget(object) {
    return object.isa === json.ISA.PBXNativeTarget;
}
//# sourceMappingURL=paths.js.map