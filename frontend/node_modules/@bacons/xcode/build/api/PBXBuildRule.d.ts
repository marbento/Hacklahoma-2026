import * as json from "../json/types";
import type { SansIsa } from "./utils/util.types";
import type { XcodeProject } from "./XcodeProject";
import type { PBXFileReference } from "./PBXFileReference";
import { AbstractObject } from "./AbstractObject";
export declare type PBXBuildRuleModel = json.PBXBuildRule<PBXFileReference, PBXFileReference>;
export declare class PBXBuildRule extends AbstractObject<PBXBuildRuleModel> {
    static isa: json.ISA.PBXBuildRule;
    static is(object: any): object is PBXBuildRule;
    static create(project: XcodeProject, opts: SansIsa<PBXBuildRuleModel>): PBXBuildRule;
    protected getObjectProps(): {
        inputFiles: StringConstructor[];
        outputFiles: StringConstructor[];
    };
    protected setupDefaults(): void;
    /**
     * Adds an output file with the specified compiler flags.
     */
    addOutputFile(file: PBXFileReference, compilerFlags?: string): void;
    getOutputFilesAndFlags(): [PBXFileReference, string][];
}
//# sourceMappingURL=PBXBuildRule.d.ts.map