import { CstNode, CstParser } from "./chevrotain";
export declare class PbxprojParser extends CstParser {
    constructor();
    head: import("@chevrotain/types").ParserMethod<[], CstNode>;
    array: import("@chevrotain/types").ParserMethod<[], CstNode>;
    object: import("@chevrotain/types").ParserMethod<[], CstNode>;
    objectItem: import("@chevrotain/types").ParserMethod<[], CstNode>;
    identifier: import("@chevrotain/types").ParserMethod<[], CstNode>;
    value: import("@chevrotain/types").ParserMethod<[], CstNode>;
}
export declare const BaseVisitor: new (...args: any[]) => import("@chevrotain/types").ICstVisitor<any, any>;
export declare function parse(text: string): CstNode;
//# sourceMappingURL=parser.d.ts.map