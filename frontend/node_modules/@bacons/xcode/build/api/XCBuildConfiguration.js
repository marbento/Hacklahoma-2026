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
exports.XCBuildConfiguration = void 0;
const node_path_1 = __importDefault(require("node:path"));
const node_os_1 = __importDefault(require("node:os"));
const node_fs_1 = __importDefault(require("node:fs"));
const plist_1 = __importDefault(require("@expo/plist"));
const array_1 = require("./utils/array");
const json = __importStar(require("../json/types"));
const AbstractObject_1 = require("./AbstractObject");
const resolveBuildSettings_1 = require("./utils/resolveBuildSettings");
const debug = require("debug")("xcode:XCBuildConfiguration");
class XCBuildConfiguration extends AbstractObject_1.AbstractObject {
    static is(object) {
        return object.isa === XCBuildConfiguration.isa;
    }
    static create(project, opts) {
        return project.createModel({
            isa: json.ISA.XCBuildConfiguration,
            ...opts,
        });
    }
    /** @returns the resolved absolute file path for the `INFOPLIST_FILE` build setting if it exists. `null` if the setting does not exist. */
    resolveFilePath(key) {
        const fileRef = this.resolveBuildSetting(key);
        if (fileRef == null || typeof fileRef !== "string") {
            return null;
        }
        const root = this.getXcodeProject().getProjectRoot();
        // TODO: Maybe interpolate
        // TODO: Maybe add root projectRoot, currently this is always `""` in my fixtures.
        return node_path_1.default.join(root, fileRef);
    }
    /** @returns the resolved absolute file path for the `INFOPLIST_FILE` build setting if it exists. `null` if the setting does not exist. */
    getEntitlementsFilePath() {
        return this.resolveFilePath("CODE_SIGN_ENTITLEMENTS");
    }
    getEntitlements() {
        const filePath = this.getEntitlementsFilePath();
        if (!filePath)
            return null;
        return plist_1.default.parse(node_fs_1.default.readFileSync(filePath, "utf8"));
    }
    /** @returns the resolved absolute file path for the `INFOPLIST_FILE` build setting if it exists. `null` if the setting does not exist. */
    getInfoPlistFilePath() {
        return this.resolveFilePath("INFOPLIST_FILE");
    }
    getInfoPlist() {
        const filePath = this.getInfoPlistFilePath();
        if (!filePath)
            return null;
        return plist_1.default.parse(node_fs_1.default.readFileSync(filePath, "utf8"));
    }
    /** @returns a list of targets which refer to this build configuration. */
    getTargetReferrers() {
        const lists = this.getReferrers().filter((ref) => ref.isa === json.ISA.XCConfigurationList);
        const targets = lists
            .map((list) => {
            return list
                .getReferrers()
                .filter((ref) => ref.isa === json.ISA.PBXNativeTarget);
        })
            .flat();
        return (0, array_1.uniqueBy)(targets, (item) => item.uuid);
    }
    /**
     * Build settings can include environment variables (often defined by `xcodebuild`) and additional commands to mutate the value, e.g. `$(FOO:lower)` -> `process.env.FOO.toLowerCase()`
     *
     * @returns a resolved build setting with all commands and references interpolated out. */
    resolveBuildSetting(buildSetting) {
        const resolver = (sub) => {
            if (!(sub in this.props.buildSettings)) {
                if (process.env[sub] != null) {
                    debug('Using environment variable substitution for "%s"', sub);
                    return process.env[sub];
                }
                else if (
                // If the build settings aren't available then it means this process it being run outside of xcodebuild (likely)
                // so we'll fallback on defaults from a random HTML file I found on the internet.
                // https://opensource.apple.com/source/pb_makefiles/pb_makefiles-1005/platform-variables.make.auto.html
                sub in DEF_APPLE_BUILD_VARIABLES) {
                    debug('Dangerously using estimated default Apple build variable substitution for "%s"', sub);
                    return DEF_APPLE_BUILD_VARIABLES[sub];
                }
                // If the common value `TARGET_NAME` was used and we got here (no environment variable was found) then we'll just guess.
                if (sub === "TARGET_NAME") {
                    const parentTarget = this.getTargetReferrers();
                    if (parentTarget.length > 0) {
                        if (parentTarget.length > 1) {
                            console.warn(`[XCBuildConfiguration][${this.props.name}]: Multiple targets found for build setting "${buildSetting}". Using first target "${parentTarget[0].props.name}". Possible targets: ${parentTarget
                                .map((target) => target.getDisplayName())
                                .join(", ")}`);
                        }
                        return parentTarget[0].props.name;
                    }
                    else {
                        console.warn(`[XCBuildConfiguration][${this.props.name}]: Issue resolving special build setting "${buildSetting}". Substitute value "${sub}" not found in build settings, environment variables, or from a referring PBXNativeTarget.`);
                    }
                }
                else {
                    console.warn(`[XCBuildConfiguration][${this.props.name}]: Issue resolving build setting "${buildSetting}". Substitute value "${sub}" not found in build settings.`);
                }
            }
            if (Array.isArray(sub)) {
                console.warn(`[XCBuildConfiguration][${this.props.name}]: Issue resolving build setting "${buildSetting}". Substitute value "${sub}" is of type array––it's not clear how this should be resolved in a string.`);
            }
            // @ts-expect-error: A setting could refer to another setting that isn't of type string.
            return this.props.buildSettings[sub];
        };
        const setting = this.props.buildSettings[buildSetting];
        if (typeof setting === "string") {
            // @ts-expect-error
            return (0, resolveBuildSettings_1.resolveXcodeBuildSetting)(setting, resolver);
        }
        if (Array.isArray(setting)) {
            // @ts-expect-error
            return setting.map((s) => {
                return (0, resolveBuildSettings_1.resolveXcodeBuildSetting)(s, resolver);
            });
        }
        return setting;
    }
    getObjectProps() {
        return {
            baseConfigurationReference: String,
        };
    }
}
exports.XCBuildConfiguration = XCBuildConfiguration;
XCBuildConfiguration.isa = json.ISA.XCBuildConfiguration;
// https://opensource.apple.com/source/pb_makefiles/pb_makefiles-1005/platform-variables.make.auto.html
const DEF_APPLE_BUILD_VARIABLES = {
    HOME: node_os_1.default.homedir(),
    SYSTEM_APPS_DIR: "/Applications",
    SYSTEM_ADMIN_APPS_DIR: "/Applications/Utilities",
    SYSTEM_DEMOS_DIR: "/Applications/Extras",
    SYSTEM_DEVELOPER_DIR: "/Applications/Xcode.app/Contents/Developer",
    SYSTEM_DEVELOPER_APPS_DIR: "/Applications/Xcode.app/Contents/Applications",
    SYSTEM_DEVELOPER_JAVA_TOOLS_DIR: "/Applications/Xcode.app/Contents/Applications/Java Tools",
    SYSTEM_DEVELOPER_PERFORMANCE_TOOLS_DIR: "/Applications/Xcode.app/Contents/Applications/Performance Tools",
    SYSTEM_DEVELOPER_GRAPHICS_TOOLS_DIR: "/Applications/Xcode.app/Contents/Applications/Graphics Tools",
    SYSTEM_DEVELOPER_UTILITIES_DIR: "/Applications/Xcode.app/Contents/Applications/Utilities",
    SYSTEM_DEVELOPER_DEMOS_DIR: "/Applications/Xcode.app/Contents/Developer/Utilities/Built Examples",
    SYSTEM_DEVELOPER_DOC_DIR: "/Applications/Xcode.app/Contents/Developer/ADC Reference Library",
    SYSTEM_DEVELOPER_TOOLS_DOC_DIR: "/Applications/Xcode.app/Contents/Developer/ADC Reference Library/documentation/DeveloperTools",
    SYSTEM_DEVELOPER_RELEASENOTES_DIR: "/Applications/Xcode.app/Contents/Developer/ADC Reference Library/releasenotes",
    SYSTEM_DEVELOPER_TOOLS_RELEASENOTES_DIR: "/Applications/Xcode.app/Contents/Developer/ADC Reference Library/releasenotes/DeveloperTools",
    SYSTEM_LIBRARY_DIR: "/System/Library",
    SYSTEM_CORE_SERVICES_DIR: "/System/Library/CoreServices",
    SYSTEM_DOCUMENTATION_DIR: "/Library/Documentation",
    LOCAL_ADMIN_APPS_DIR: "/Applications/Utilities",
    LOCAL_APPS_DIR: "/Applications",
    LOCAL_DEVELOPER_DIR: "/Library/Developer",
    LOCAL_LIBRARY_DIR: "/Library",
    USER_APPS_DIR: "$(HOME)/Applications",
    USER_LIBRARY_DIR: "$(HOME)/Library",
    MAN_PAGE_DIRECTORIES: "/usr/share/man",
    SYSTEM_LIBRARY_EXECUTABLES_DIR: "",
    SYSTEM_DEVELOPER_EXECUTABLES_DIR: "",
    LOCAL_DEVELOPER_EXECUTABLES_DIR: "",
};
//# sourceMappingURL=XCBuildConfiguration.js.map