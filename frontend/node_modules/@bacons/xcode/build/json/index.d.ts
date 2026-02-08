import { XcodeProject } from "./types";
/** @returns a JSON representation of the given `pbxproj` file in string format. */
export declare function parse(text: string): Partial<XcodeProject>;
/** @returns a string representation of the given `pbxproj` in Apple's [Old-Style Plist](http://www.opensource.apple.com/source/CF/CF-744.19/CFOldStylePList.c) `string` format. */
export declare function build(project: Partial<XcodeProject>): string;
export * from "./types";
//# sourceMappingURL=index.d.ts.map