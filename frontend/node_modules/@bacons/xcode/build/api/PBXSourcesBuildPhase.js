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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PBXShellScriptBuildPhase = exports.PBXFrameworksBuildPhase = exports.PBXRezBuildPhase = exports.PBXAppleScriptBuildPhase = exports.PBXHeadersBuildPhase = exports.PBXResourcesBuildPhase = exports.PBXSourcesBuildPhase = exports.PBXCopyFilesBuildPhase = exports.AbstractBuildPhase = void 0;
const json = __importStar(require("../json/types"));
const AbstractObject_1 = require("./AbstractObject");
const PBXBuildFile_1 = require("./PBXBuildFile");
class AbstractBuildPhase extends AbstractObject_1.AbstractObject {
    getObjectProps() {
        return { files: [String] };
    }
    /** Create a file and add it to the files array. To prevent creating duplicates, use `ensureFile` instead. */
    createFile(json) {
        const file = PBXBuildFile_1.PBXBuildFile.create(this.getXcodeProject(), json);
        this.props.files.push(file);
        return file;
    }
    /** Get or create a file. */
    ensureFile(json) {
        const existing = this.getBuildFile(json.fileRef);
        if (existing) {
            return existing;
        }
        return this.createFile(json);
    }
    getFileReferences() {
        return this.props.files.map((file) => file.props.fileRef);
    }
    /** @returns the first build file for a given file reference. */
    getBuildFile(file) {
        if (!this.props.files.length)
            return null;
        const refs = (typeof file === "string"
            ? this.getXcodeProject().getReferrers(file)
            : file.getReferrers()).filter((ref) => PBXBuildFile_1.PBXBuildFile.is(ref));
        return (refs.find((ref) => {
            return this.props.files.some((file) => file.uuid === ref.uuid);
        }) ?? null);
    }
    includesFile(file) {
        return !!this.getBuildFile(file);
    }
    isReferencing(uuid) {
        return !!this.props.files.find((file) => file.uuid === uuid);
    }
    removeFileReference(file) {
        const buildFiles = this.props.files.filter((buildFile) => buildFile.props.fileRef.uuid === file.uuid);
        buildFiles.forEach((buildFile) => {
            this.props.files.splice(this.props.files.indexOf(buildFile), 1);
            buildFile.removeFromProject();
        });
    }
    removeBuildFile(file) {
        file.removeFromProject();
    }
    setupDefaults() {
        if (this.props.buildActionMask == null) {
            this.props.buildActionMask = 2147483647;
        }
        if (this.props.runOnlyForDeploymentPostprocessing == null) {
            this.props.runOnlyForDeploymentPostprocessing = 0;
        }
        if (!this.props.files)
            this.props.files = [];
    }
}
exports.AbstractBuildPhase = AbstractBuildPhase;
class PBXCopyFilesBuildPhase extends AbstractBuildPhase {
    static is(object) {
        return object.isa === PBXCopyFilesBuildPhase.isa;
    }
    getDisplayName() {
        return super.getDisplayName().replace(/BuildPhase$/, "");
    }
    isAppExtensionFileRef(file) {
        if (file.props.fileRef &&
            file.props.fileRef.isa === "PBXFileReference" &&
            "isAppExtension" in file.props.fileRef &&
            file.props.fileRef.isAppExtension()) {
            return file.props.fileRef;
        }
        return null;
    }
    /** Given a target, set the default CopyBuildPhase values. This is useful for adding app extensions. */
    ensureDefaultsForTarget(target) {
        if (target.isWatchOSTarget()) {
            // Is WatchOS appex CopyFilesBuildPhase
            this.props.dstPath = "$(CONTENTS_FOLDER_PATH)/Watch";
            // WatchOS folder.
            this.props.dstSubfolderSpec = 16;
            this.props.name = "Embed Watch Content";
        }
        else if (target.props.productType ===
            "com.apple.product-type.application.on-demand-install-capable") {
            this.props.dstPath = "$(CONTENTS_FOLDER_PATH)/AppClips";
            this.props.dstSubfolderSpec = 16;
            this.props.name = "Embed App Clips";
        }
        else if (
        // Is Extension appex CopyFilesBuildPhase
        target.props.productType ===
            "com.apple.product-type.extensionkit-extension") {
            this.props.dstPath = "$(EXTENSIONS_FOLDER_PATH)";
            this.props.dstSubfolderSpec = 16;
            this.props.name = "Embed ExtensionKit Extensions";
        }
        else if (target.props.productReference?.isAppExtension()) {
            // PlugIns folder.
            this.props.dstSubfolderSpec = 13;
            this.props.name = "Embed Foundation Extensions";
        }
    }
    setupDefaults() {
        const appExtFiles = this.props.files
            .map((file) => typeof file !== "string" && this.isAppExtensionFileRef(file))
            .filter(Boolean);
        // Set defaults for copy build phases that are used to embed app extensions.
        if (appExtFiles.length) {
            const firstTarget = appExtFiles
                .map((ref) => ref.getTargetReferrers())
                .flat()
                .filter(Boolean)[0];
            if (firstTarget) {
                this.ensureDefaultsForTarget(firstTarget);
            }
        }
        if (!this.props.dstPath) {
            this.props.dstPath = "";
        }
        if (!this.props.dstSubfolderSpec) {
            // Resources folder.
            this.props.dstSubfolderSpec = 7;
        }
        super.setupDefaults();
    }
}
exports.PBXCopyFilesBuildPhase = PBXCopyFilesBuildPhase;
PBXCopyFilesBuildPhase.isa = json.ISA.PBXCopyFilesBuildPhase;
class PBXSourcesBuildPhase extends AbstractBuildPhase {
    static is(object) {
        return object.isa === PBXSourcesBuildPhase.isa;
    }
}
exports.PBXSourcesBuildPhase = PBXSourcesBuildPhase;
PBXSourcesBuildPhase.isa = json.ISA.PBXSourcesBuildPhase;
class PBXResourcesBuildPhase extends AbstractBuildPhase {
    static is(object) {
        return object.isa === PBXResourcesBuildPhase.isa;
    }
}
exports.PBXResourcesBuildPhase = PBXResourcesBuildPhase;
PBXResourcesBuildPhase.isa = json.ISA.PBXResourcesBuildPhase;
class PBXHeadersBuildPhase extends AbstractBuildPhase {
    static is(object) {
        return object.isa === PBXHeadersBuildPhase.isa;
    }
}
exports.PBXHeadersBuildPhase = PBXHeadersBuildPhase;
PBXHeadersBuildPhase.isa = json.ISA.PBXHeadersBuildPhase;
class PBXAppleScriptBuildPhase extends AbstractBuildPhase {
    static is(object) {
        return object.isa === PBXAppleScriptBuildPhase.isa;
    }
}
exports.PBXAppleScriptBuildPhase = PBXAppleScriptBuildPhase;
PBXAppleScriptBuildPhase.isa = json.ISA.PBXAppleScriptBuildPhase;
class PBXRezBuildPhase extends AbstractBuildPhase {
    static is(object) {
        return object.isa === PBXRezBuildPhase.isa;
    }
}
exports.PBXRezBuildPhase = PBXRezBuildPhase;
PBXRezBuildPhase.isa = json.ISA.PBXRezBuildPhase;
class PBXFrameworksBuildPhase extends AbstractBuildPhase {
    static is(object) {
        return object.isa === PBXFrameworksBuildPhase.isa;
    }
}
exports.PBXFrameworksBuildPhase = PBXFrameworksBuildPhase;
PBXFrameworksBuildPhase.isa = json.ISA.PBXFrameworksBuildPhase;
class PBXShellScriptBuildPhase extends AbstractBuildPhase {
    static is(object) {
        return object.isa === PBXShellScriptBuildPhase.isa;
    }
    setupDefaults() {
        if (!this.props.shellPath) {
            this.props.shellPath = "/bin/sh";
        }
        if (!this.props.shellScript) {
            this.props.shellScript =
                "# Type a script or drag a script file from your workspace to insert its path.\n";
        }
        if (!this.props.outputFileListPaths) {
            this.props.outputFileListPaths = [];
        }
        if (!this.props.outputPaths) {
            this.props.outputPaths = [];
        }
        if (!this.props.inputFileListPaths) {
            this.props.inputFileListPaths = [];
        }
        if (!this.props.inputPaths) {
            this.props.inputPaths = [];
        }
        super.setupDefaults();
    }
}
exports.PBXShellScriptBuildPhase = PBXShellScriptBuildPhase;
PBXShellScriptBuildPhase.isa = json.ISA.PBXShellScriptBuildPhase;
//# sourceMappingURL=PBXSourcesBuildPhase.js.map