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
exports.XCConfigurationList = void 0;
const json = __importStar(require("../json/types"));
const AbstractObject_1 = require("./AbstractObject");
class XCConfigurationList extends AbstractObject_1.AbstractObject {
    static is(object) {
        return object.isa === XCConfigurationList.isa;
    }
    static create(project, opts) {
        return project.createModel({
            isa: XCConfigurationList.isa,
            defaultConfigurationIsVisible: 0,
            ...opts,
        });
    }
    getObjectProps() {
        return {
            buildConfigurations: [String],
        };
    }
    /** Get the configuration for the `defaultConfigurationName` and assert if it isn't available. */
    getDefaultConfiguration() {
        const config = this.props.buildConfigurations.find((child) => child.props.name === this.props.defaultConfigurationName);
        if (!config) {
            throw new Error(`[XCConfigurationList][${this.uuid}]: ${this.props.defaultConfigurationName} not found in buildConfigurations. Available configurations: ${this.props.buildConfigurations
                .map((config) => `${config.props.name} (${config.uuid})`)
                .join(", ")})`);
        }
        return config;
    }
    removeReference(uuid) {
        const index = this.props.buildConfigurations.findIndex((child) => child.uuid === uuid);
        if (index !== -1) {
            this.props.buildConfigurations.splice(index, 1);
        }
    }
    isReferencing(uuid) {
        return this.props.buildConfigurations.some((child) => child.uuid === uuid);
    }
    /** Set a build setting on all build configurations. */
    setBuildSetting(key, value) {
        this.props.buildConfigurations.forEach((config) => {
            config.props.buildSettings[key] = value;
        });
        return value;
    }
    /** Remove a build setting on all build configurations. */
    removeBuildSetting(key) {
        this.props.buildConfigurations.forEach((config) => {
            delete config.props.buildSettings[key];
        });
    }
    /** @returns build setting from the default build configuration. */
    getDefaultBuildSetting(key) {
        return this.getDefaultConfiguration().props.buildSettings[key];
    }
}
exports.XCConfigurationList = XCConfigurationList;
XCConfigurationList.isa = json.ISA.XCConfigurationList;
//# sourceMappingURL=XCConfigurationList.js.map