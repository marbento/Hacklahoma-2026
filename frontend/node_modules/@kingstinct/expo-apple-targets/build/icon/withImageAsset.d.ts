import { ConfigPlugin } from "@expo/config-plugins";
import { ContentsJsonImageIdiom, ContentsJsonImage } from "@expo/prebuild-config/build/plugins/icons/AssetContents";
export declare const withImageAsset: ConfigPlugin<{
    cwd: string;
    name: string;
    image: string | {
        "1x"?: string;
        "2x"?: string;
        "3x"?: string;
    };
}>;
export declare const ICON_CONTENTS: {
    idiom: ContentsJsonImageIdiom;
    sizes: {
        size: number;
        scales: (1 | 2 | 3)[];
    }[];
}[];
export declare function setIconsAsync(icon: string, projectRoot: string, iosNamedProjectRoot: string, cacheComponent: string): Promise<void>;
export declare function generateResizedImageAsync(icon: {
    "1x"?: string;
    "2x"?: string;
    "3x"?: string;
} | string, name: string, projectRoot: string, iosNamedProjectRoot: string, cacheComponent: string): Promise<ContentsJsonImage[]>;
export declare function generateIconsInternalAsync(icon: string, projectRoot: string, iosNamedProjectRoot: string, cacheComponent: string): Promise<ContentsJsonImage[]>;
export declare function generateWatchIconsInternalAsync(icon: string, projectRoot: string, iosNamedProjectRoot: string, cacheComponent: string): Promise<ContentsJsonImage[]>;
