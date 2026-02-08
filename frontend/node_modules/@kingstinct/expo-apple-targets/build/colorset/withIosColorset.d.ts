import { ConfigPlugin } from "expo/config-plugins";
export declare const withIosColorset: ConfigPlugin<{
    cwd: string;
    name: string;
    color: string;
    darkColor?: string;
}>;
export declare function setColorAsync({ color, darkColor }: {
    color: string;
    darkColor?: string;
}, colorsetFilePath: string): Promise<void>;
