import * as json from "../json/types";
import { AbstractObject } from "./AbstractObject";
import { PBXBuildFile } from "./PBXBuildFile";
import type { PickRequired, SansIsa } from "./utils/util.types";
import type { XcodeProject } from "./XcodeProject";
import type { PBXContainerItemProxy } from "./PBXContainerItemProxy";
export declare type PBXReferenceProxyModel = json.PBXReferenceProxy<PBXContainerItemProxy>;
export declare class PBXReferenceProxy extends AbstractObject<PBXReferenceProxyModel> {
    static isa: json.ISA.PBXReferenceProxy;
    static is(object: any): object is PBXReferenceProxy;
    static create(project: XcodeProject, opts: PickRequired<SansIsa<PBXReferenceProxyModel>, "remoteRef" | "fileType">): PBXReferenceProxy;
    protected getObjectProps(): Partial<{
        remoteRef: any;
    }>;
    /** Removes self and all PBXBuildFiles that this proxy is referencing. */
    removeFromProject(): void;
    getBuildFiles(): PBXBuildFile[];
}
//# sourceMappingURL=PBXReferenceProxy.d.ts.map