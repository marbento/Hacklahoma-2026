import { ConfigPlugin } from "@expo/config-plugins";
import type { Config, ConfigFunction } from "./config";
export declare const withTargetsDir: ConfigPlugin<{
    appleTeamId?: string;
    match?: string;
    root?: string;
} | void>;
export { Config, ConfigFunction };
