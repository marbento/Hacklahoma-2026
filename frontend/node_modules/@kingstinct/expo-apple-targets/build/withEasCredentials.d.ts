import { XcodeProject } from "@bacons/xcode";
import { ConfigPlugin } from "expo/config-plugins";
import { Entitlements } from "./config";
export declare const withEASTargets: ConfigPlugin<{
    bundleIdentifier: string;
    targetName: string;
    entitlements?: Record<string, any>;
}>;
type EASCredentials = {
    targetName: string;
    bundleIdentifier: string;
    parentBundleIdentifier: string;
    entitlements?: Entitlements;
};
export declare const withAutoEasExtensionCredentials: ConfigPlugin;
export declare function getEASCredentialsForXcodeProject(project: XcodeProject): EASCredentials[];
export {};
