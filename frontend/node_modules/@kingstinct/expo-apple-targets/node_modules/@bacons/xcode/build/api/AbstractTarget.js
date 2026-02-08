"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractTarget = void 0;
const AbstractObject_1 = require("./AbstractObject");
const XCBuildConfiguration_1 = require("./XCBuildConfiguration");
const XCConfigurationList_1 = require("./XCConfigurationList");
class AbstractTarget extends AbstractObject_1.AbstractObject {
    createConfigurationList(listOptions, configurations) {
        const objects = configurations.map((config) => XCBuildConfiguration_1.XCBuildConfiguration.create(this.getXcodeProject(), config));
        const list = XCConfigurationList_1.XCConfigurationList.create(this.getXcodeProject(), {
            buildConfigurations: objects,
            ...listOptions,
        });
        this.props.buildConfigurationList = list;
        return list;
    }
    /**
     * Checks whether this target has a dependency on the given target.
     */
    getDependencyForTarget(target) {
        return this.props.dependencies.find((dep) => {
            if (dep.props.targetProxy.isRemote()) {
                const subprojectReference = this.getXcodeProject().getReferenceForPath(target.getXcodeProject().filePath);
                if (subprojectReference) {
                    const uuid = subprojectReference.uuid;
                    return (dep.props.targetProxy.props.remoteGlobalIDString === target.uuid &&
                        dep.props.targetProxy.props.containerPortal.uuid === uuid);
                }
            }
            else {
                return dep.props.target.uuid === target.uuid;
            }
            return false;
        });
    }
    createBuildPhase(buildPhaseKlass, props) {
        const phase = this.getXcodeProject().createModel({
            isa: buildPhaseKlass.isa,
            ...props,
        });
        this.props.buildPhases.push(phase);
        return phase;
    }
    getBuildPhase(buildPhaseKlass) {
        const v = this.props.buildPhases.find((phase) => buildPhaseKlass.is(phase)) ??
            null;
        return v;
    }
    isReferencing(uuid) {
        if (this.props.buildConfigurationList.uuid === uuid)
            return true;
        if (this.props.dependencies.some((dep) => dep.uuid === uuid))
            return true;
        if (this.props.buildPhases.some((phase) => phase.uuid === uuid))
            return true;
        return false;
    }
    getObjectProps() {
        return {
            buildConfigurationList: String,
            dependencies: [String],
            buildPhases: [String],
        };
    }
    getDefaultConfiguration() {
        return this.props.buildConfigurationList.getDefaultConfiguration();
    }
    /** Set a build setting on all build configurations. */
    setBuildSetting(key, value) {
        return this.props.buildConfigurationList.setBuildSetting(key, value);
    }
    /** Remove a build setting on all build configurations. */
    removeBuildSetting(key) {
        return this.props.buildConfigurationList.removeBuildSetting(key);
    }
    /** @returns build setting from the default build configuration. */
    getDefaultBuildSetting(key) {
        return this.props.buildConfigurationList.getDefaultBuildSetting(key);
    }
    getAttributes() {
        return this.getXcodeProject().rootObject.props.attributes
            .TargetAttributes?.[this.uuid];
    }
}
exports.AbstractTarget = AbstractTarget;
//# sourceMappingURL=AbstractTarget.js.map