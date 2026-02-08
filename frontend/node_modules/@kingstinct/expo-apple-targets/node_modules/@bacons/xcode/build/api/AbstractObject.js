"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractObject = void 0;
const assert_1 = __importDefault(require("assert"));
const util_1 = __importDefault(require("util"));
const debug = require("debug")("xcparse:models");
class AbstractObject {
    constructor(xcodeProject, uuid, props) {
        this.uuid = uuid;
        this.props = props;
        Object.defineProperty(this, "xcodeProject", {
            get() {
                return xcodeProject;
            },
        });
        debug(`Inflating model (uuid: ${uuid}, isa: ${props.isa})`);
        this.setupDefaults(props);
    }
    get isa() {
        return this.props.isa;
    }
    getReferrers() {
        return this.getXcodeProject().getReferrers(this.uuid);
    }
    get project() {
        return this.getXcodeProject().rootObject;
    }
    getXcodeProject() {
        return this.xcodeProject;
    }
    inflate() {
        // Start inflating based on the input props.
        for (const [key, type] of Object.entries(this.getObjectProps())) {
            // Preserve undefined or nullish
            if (!(key in this.props)) {
                continue;
            }
            const jsonValue = this.props[key];
            if (Array.isArray(jsonValue)) {
                // If the xcode json is not the expected type.
                (0, assert_1.default)(type === Array || Array.isArray(type), `'${String(key)}' MUST be of type Array but instead found type: ${typeof jsonValue}`);
                // @ts-expect-error
                this.props[key] = jsonValue
                    .map((uuid) => {
                    if (typeof uuid !== "string") {
                        // Perhaps the model was already inflated.
                        return uuid;
                    }
                    try {
                        return this.getXcodeProject().getObject(uuid);
                    }
                    catch (error) {
                        if ("message" in error &&
                            error.message.includes("object with uuid")) {
                            console.warn(`[Malformed Xcode project]: Found orphaned reference: ${this.uuid} > ${this.isa}.${String(key)} > ${uuid}`);
                        }
                        else {
                            throw error;
                        }
                        return null;
                    }
                })
                    .filter(Boolean);
            }
            else if (jsonValue != null) {
                if (jsonValue instanceof AbstractObject) {
                    this.props[key] = this.getXcodeProject().getObject(jsonValue.uuid);
                    continue;
                }
                (0, assert_1.default)(typeof this.props[key] === "string", `'${String(key)}' MUST be of type string (UUID) but instead found type: ${typeof jsonValue}`);
                try {
                    this.props[key] = this.getXcodeProject().getObject(
                    // @ts-expect-error
                    jsonValue);
                }
                catch (error) {
                    if ("message" in error &&
                        error.message.includes("object with uuid")) {
                        console.warn(`[Malformed Xcode project]: Found orphaned reference: ${this.uuid} > ${this.isa}.${String(key)} > ${jsonValue}`);
                    }
                    else {
                        throw error;
                    }
                }
            }
        }
    }
    setupDefaults(props) { }
    getDisplayName() {
        if ("name" in this.props) {
            // @ts-expect-error
            return this.props.name;
        }
        return this.isa.replace(/^(PBX|XC)/, "");
    }
    /** @returns `true` if the provided UUID is used somewhere in the props. */
    isReferencing(uuid) {
        return false;
    }
    //   abstract toJSON(): TObject;
    toJSON() {
        (0, assert_1.default)(this.isa, "isa is not defined for " + this.uuid);
        debug("to JSON for", this.isa, this.uuid, this.constructor.name);
        const json = {
            ...this.props,
        };
        // Deflate models
        for (const key of Object.keys(this.getObjectProps())) {
            if (key in this.props) {
                const value = this.props[key];
                let resolvedValue = undefined;
                if (isModelArray(value)) {
                    const uuids = value.map((object) => object.uuid);
                    resolvedValue = uuids;
                }
                else if (Array.isArray(value)) {
                    throw new Error(util_1.default.format("Unable to serialize array of unknown objects (some missing 'uuid' property): %O", value));
                }
                else if (isModel(value)) {
                    resolvedValue = value.uuid;
                }
                if (resolvedValue) {
                    // @ts-expect-error: tried my best lol
                    json[key] = resolvedValue;
                }
                else {
                    throw new Error(util_1.default.format("Unable to serialize object: %O", value));
                }
            }
        }
        return json;
    }
    /** abstract method for removing a UUID from any props that might be referencing it. */
    removeReference(uuid) { }
    removeFromProject() {
        this.getXcodeProject().delete(this.uuid);
        const referrers = this.getReferrers();
        referrers.forEach((referrer) => {
            referrer.removeReference(this.uuid);
        });
    }
}
exports.AbstractObject = AbstractObject;
function isModelArray(value) {
    return (Array.isArray(value) && value.every((item) => typeof item.uuid === "string"));
}
function isModel(value) {
    return typeof value.uuid === "string" && typeof value.isa === "string";
}
//# sourceMappingURL=AbstractObject.js.map