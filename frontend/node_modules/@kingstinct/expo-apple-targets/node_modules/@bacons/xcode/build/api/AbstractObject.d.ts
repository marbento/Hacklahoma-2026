import * as json from "../json/types";
import type { PBXProject } from "./PBXProject";
import type { OnlyValuesOfType } from "./utils/util.types";
import type { XcodeProject } from "./XcodeProject";
declare type OrArray<T> = T | T[];
export interface ReferenceCapableObject {
    getReferrers(): AbstractObject[];
    isReferencing(uuid: string): boolean;
}
export declare abstract class AbstractObject<TJSON extends json.AbstractObject<any> = json.AbstractObject<any>> implements ReferenceCapableObject {
    uuid: string;
    props: TJSON;
    get isa(): any;
    protected abstract getObjectProps(): Partial<{
        [K in keyof Omit<OnlyValuesOfType<TJSON, OrArray<AbstractObject<any>>>, "isa" | "name">]: any;
    }>;
    getReferrers(): AbstractObject[];
    get project(): PBXProject;
    getXcodeProject(): XcodeProject;
    private readonly xcodeProject;
    constructor(xcodeProject: XcodeProject, uuid: string, props: TJSON);
    protected inflate(): void;
    protected setupDefaults(props: TJSON): void;
    getDisplayName(): string;
    /** @returns `true` if the provided UUID is used somewhere in the props. */
    isReferencing(uuid: string): boolean;
    toJSON(): TJSON;
    /** abstract method for removing a UUID from any props that might be referencing it. */
    removeReference(uuid: string): void;
    removeFromProject(): void;
}
export {};
//# sourceMappingURL=AbstractObject.d.ts.map