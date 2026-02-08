/// <reference types="node" />
import { XcodeProject } from "./types";
export declare type JSONPrimitive = boolean | number | string | null | Buffer | undefined;
export declare type JSONValue = JSONPrimitive | JSONArray | JSONObject;
export interface JSONArray extends Array<JSONValue> {
}
export interface JSONObject {
    [key: string]: JSONValue | undefined;
}
export declare class Writer {
    private project;
    private options;
    private indent;
    private contents;
    private comments;
    pad(x: number): string;
    constructor(project: Partial<XcodeProject>, options?: {
        /** @default `\t`` */
        tab?: string;
        /** @default `!$*UTF8*$!` */
        shebang?: string;
        /** @default `false` */
        skipNullishValues?: boolean;
    });
    getResults(): string;
    private println;
    private write;
    private printAssignLn;
    private flush;
    private writeShebang;
    /** Format ID with optional comment reference. */
    private formatId;
    private writeProject;
    private keyHasFloatValue;
    private writeObject;
    private writePbxObjects;
    private writeArray;
    private writeObjectInclusive;
    private writeObjectWithoutIndent;
}
//# sourceMappingURL=writer.d.ts.map