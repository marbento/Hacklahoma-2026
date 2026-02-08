import { ConfigPlugin } from "@expo/config-plugins";
import { ContentsJsonImageIdiom } from "@expo/prebuild-config/build/plugins/icons/AssetContents";
import { ExtensionType } from "../target";
export declare const withIosIcon: ConfigPlugin<{
    cwd: string;
    type: ExtensionType;
    iconFilePath: string;
    isTransparent?: boolean;
}>;
export declare const ICON_CONTENTS: {
    idiom: ContentsJsonImageIdiom;
    sizes: {
        size: number;
        scales: (1 | 2 | 3)[];
    }[];
}[];
export declare function setIconsAsync(icon: string, projectRoot: string, iosNamedProjectRoot: string, cacheComponent: string, isTransparent: boolean): Promise<void>;
export declare function generateIconsInternalAsync(icon: string, projectRoot: string, iosNamedProjectRoot: string, cacheComponent: string, isTransparent: boolean): Promise<import("@expo/prebuild-config/build/plugins/icons/AssetContents").ContentsJsonImage[]>;
export declare function generateWatchIconsInternalAsync(icon: string, projectRoot: string, iosNamedProjectRoot: string, cacheComponent: string, isTransparent: boolean): Promise<import("@expo/prebuild-config/build/plugins/icons/AssetContents").ContentsJsonImage[]>;
