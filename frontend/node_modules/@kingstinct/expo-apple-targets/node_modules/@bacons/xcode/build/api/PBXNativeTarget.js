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
exports.PBXNativeTarget = void 0;
const json = __importStar(require("../json/types"));
const AbstractTarget_1 = require("./AbstractTarget");
const PBXSourcesBuildPhase_1 = require("./PBXSourcesBuildPhase");
const PBXFileReference_1 = require("./PBXFileReference");
const PBXTargetDependency_1 = require("./PBXTargetDependency");
const PBXContainerItemProxy_1 = require("./PBXContainerItemProxy");
class PBXNativeTarget extends AbstractTarget_1.AbstractTarget {
    static is(object) {
        return object.isa === PBXNativeTarget.isa;
    }
    static create(project, opts) {
        return project.createModel({
            isa: json.ISA.PBXNativeTarget,
            buildPhases: [],
            buildRules: [],
            dependencies: [],
            // TODO: Should we default the product name to the target name?
            ...opts,
        });
    }
    isReferencing(uuid) {
        if (this.props.buildRules.some((rule) => rule.uuid === uuid))
            return true;
        if (this.props.packageProductDependencies?.some((dep) => dep.uuid === uuid))
            return true;
        if (this.props.productReference?.uuid === uuid)
            return true;
        if (this.props.fileSystemSynchronizedGroups?.some((group) => group.uuid === uuid))
            return true;
        return super.isReferencing(uuid);
    }
    /** @returns the `PBXFrameworksBuildPhase` or creates one if there is none. Only one can exist. */
    getFrameworksBuildPhase() {
        return (this.getBuildPhase(PBXSourcesBuildPhase_1.PBXFrameworksBuildPhase) ??
            this.createBuildPhase(PBXSourcesBuildPhase_1.PBXFrameworksBuildPhase));
    }
    /** @returns the `PBXHeadersBuildPhase` or creates one if there is none. Only one can exist. */
    getHeadersBuildPhase() {
        return (this.getBuildPhase(PBXSourcesBuildPhase_1.PBXHeadersBuildPhase) ??
            this.createBuildPhase(PBXSourcesBuildPhase_1.PBXHeadersBuildPhase));
    }
    /** @returns the `PBXSourcesBuildPhase` or creates one if there is none. Only one can exist. */
    getSourcesBuildPhase() {
        return (this.getBuildPhase(PBXSourcesBuildPhase_1.PBXSourcesBuildPhase) ??
            this.createBuildPhase(PBXSourcesBuildPhase_1.PBXSourcesBuildPhase));
    }
    /** @returns the `PBXResourcesBuildPhase` or creates one if there is none. Only one can exist. */
    getResourcesBuildPhase() {
        return (this.getBuildPhase(PBXSourcesBuildPhase_1.PBXResourcesBuildPhase) ??
            this.createBuildPhase(PBXSourcesBuildPhase_1.PBXResourcesBuildPhase));
    }
    /** Ensures a list of frameworks are linked to the target, given a list like `['SwiftUI.framework', 'WidgetKit.framework']`. Also ensures the file references are added to the Frameworks display folder. */
    ensureFrameworks(frameworks) {
        const frameworksFolder = this.getXcodeProject().rootObject.getFrameworksGroup();
        // TODO: This might need OS-specific checks like https://github.com/CocoaPods/Xcodeproj/blob/ab3dfa504b5a97cae3a653a8924f4616dcaa062e/lib/xcodeproj/project/object/native_target.rb#L322-L328
        const getFrameworkFileReference = (name) => {
            const frameworkName = name.endsWith(".framework")
                ? name
                : name + ".framework";
            for (const [, entry] of this.getXcodeProject().entries()) {
                if (PBXFileReference_1.PBXFileReference.is(entry) &&
                    entry.props.lastKnownFileType === "wrapper.framework" &&
                    entry.props.sourceTree === "SDKROOT" &&
                    entry.props.name === frameworkName) {
                    // This should never happen but if it does then we can repair the state by adding the framework file reference to the Frameworks display group.
                    if (!frameworksFolder.props.children.find((child) => child.uuid === entry.uuid)) {
                        frameworksFolder.props.children.push(entry);
                    }
                    return entry;
                }
            }
            return frameworksFolder.createFile({
                path: "System/Library/Frameworks/" + frameworkName,
            });
        };
        return frameworks.map((framework) => {
            return this.getFrameworksBuildPhase().ensureFile({
                fileRef: getFrameworkFileReference(framework),
            });
        });
    }
    /**
     * Adds a dependency on the given target.
     *
     * @param  [AbstractTarget] target
     *         the target which should be added to the dependencies list of
     *         the receiver. The target may be a target of this target's
     *         project or of a subproject of this project. Note that the
     *         subproject must already be added to this target's project.
     *
     * @return [void]
     */
    addDependency(target) {
        const isSameProject = target.getXcodeProject().filePath === this.getXcodeProject().filePath;
        const existing = this.getDependencyForTarget(target);
        if (existing) {
            if (!isSameProject) {
                // Seems to only be used when the target is a subproject. https://github.com/CocoaPods/Xcodeproj/blob/ab3dfa504b5a97cae3a653a8924f4616dcaa062e/lib/xcodeproj/project/object/target_dependency.rb#L24-L25
                // Update existing props with the existing target.
                existing.props.name = target.props.name;
            }
            return;
        }
        const containerProxy = PBXContainerItemProxy_1.PBXContainerItemProxy.create(this.getXcodeProject(), {
            containerPortal: this.getXcodeProject().rootObject,
            proxyType: 1,
            remoteGlobalIDString: target.uuid,
            remoteInfo: target.props.name,
        });
        if (isSameProject) {
            containerProxy.props.containerPortal = this.getXcodeProject().rootObject;
        }
        else {
            throw new Error("adding dependencies to subprojects is not yet supported. Please open an issue if you need this feature.");
        }
        const dependency = PBXTargetDependency_1.PBXTargetDependency.create(this.getXcodeProject(), {
            target,
            targetProxy: containerProxy,
            // name: isSameProject ? undefined : target.props.name,
        });
        this.props.dependencies.push(dependency);
    }
    getCopyBuildPhaseForTarget(target) {
        const project = this.getXcodeProject();
        if (project.rootObject.getMainAppTarget("ios").uuid !== this.uuid) {
            throw new Error(`getCopyBuildPhaseForTarget can only be called on the main target`);
        }
        const WELL_KNOWN_COPY_EXTENSIONS_NAME = (() => {
            if (target.props.productType ===
                "com.apple.product-type.application.on-demand-install-capable") {
                return "Embed App Clips";
            }
            else if (target.props.productType === "com.apple.product-type.application") {
                return "Embed Watch Content";
            }
            else if (target.props.productType ===
                "com.apple.product-type.extensionkit-extension") {
                return "Embed ExtensionKit Extensions";
            }
            return "Embed Foundation Extensions";
        })();
        const existing = this.props.buildPhases.find((phase) => {
            // TODO: maybe there's a safer way to do this? The name is not a good identifier.
            return (PBXSourcesBuildPhase_1.PBXCopyFilesBuildPhase.is(phase) &&
                phase.props.name === WELL_KNOWN_COPY_EXTENSIONS_NAME);
        });
        if (existing) {
            return existing;
        }
        const phase = this.createBuildPhase(PBXSourcesBuildPhase_1.PBXCopyFilesBuildPhase, {
            name: WELL_KNOWN_COPY_EXTENSIONS_NAME,
            files: [],
        });
        phase.ensureDefaultsForTarget(target);
        return phase;
    }
    isWatchOSTarget() {
        return (this.props.productType === "com.apple.product-type.application" &&
            !!this.getDefaultBuildSetting("WATCHOS_DEPLOYMENT_TARGET"));
    }
    getObjectProps() {
        return {
            ...super.getObjectProps(),
            buildRules: [String],
            productReference: [String],
            packageProductDependencies: [String],
            fileSystemSynchronizedGroups: [String],
        };
    }
}
exports.PBXNativeTarget = PBXNativeTarget;
PBXNativeTarget.isa = json.ISA.PBXNativeTarget;
//# sourceMappingURL=PBXNativeTarget.js.map