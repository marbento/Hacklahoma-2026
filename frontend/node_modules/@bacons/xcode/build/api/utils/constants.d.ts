import * as json from "../../json/types";
/** The last known iOS SDK (stable). */
export declare const LAST_KNOWN_IOS_SDK = "18.0";
/** The last known macOS SDK (stable). */
export declare const LAST_KNOWN_OSX_SDK = "15.0";
/** The last known tvOS SDK (stable). */
export declare const LAST_KNOWN_TVOS_SDK = "18.0";
/** The last known visionOS SDK (unstable). */
export declare const LAST_KNOWN_VISIONOS_SDK = "2.0";
/** The last known watchOS SDK (stable). */
export declare const LAST_KNOWN_WATCHOS_SDK = "11.0";
/** The last known archive version to Xcodeproj. */
export declare const LAST_KNOWN_ARCHIVE_VERSION = 1;
/** The last known Swift version (stable). */
export declare const LAST_KNOWN_SWIFT_VERSION = "5.0";
/** The default object version for Xcodeproj. */
export declare const DEFAULT_OBJECT_VERSION = 46;
/** The last known object version to Xcodeproj. */
export declare const LAST_KNOWN_OBJECT_VERSION = 77;
/** The last known Xcode version to Xcodeproj. */
export declare const LAST_UPGRADE_CHECK = "1600";
/** The last known Swift upgrade version to Xcodeproj. */
export declare const LAST_SWIFT_UPGRADE_CHECK = "1600";
export declare const FILE_TYPES_BY_EXTENSION: Record<string, json.FileType>;
export declare const PRODUCT_UTI_EXTENSIONS: Readonly<{
    application: string;
    applicationOnDemandInstallCapable: string;
    framework: string;
    dynamicLibrary: string;
    staticLibrary: string;
    bundle: string;
    octestBundle: string;
    unitTestBundle: string;
    uiTestBundle: string;
    appExtension: string;
    messagesApplication: string;
    messagesExtension: string;
    stickerPack: string;
    watch2Extension: string;
    watch2App: string;
    watch2AppContainer: string;
}>;
export declare const SOURCETREE_BY_FILETYPE: Record<string, json.SourceTree>;
export declare const PROJECT_DEFAULT_BUILD_SETTINGS: Readonly<{
    readonly all: Readonly<{
        readonly ALWAYS_SEARCH_USER_PATHS: "NO";
        readonly CLANG_ANALYZER_NONNULL: "YES";
        readonly CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION: "YES_AGGRESSIVE";
        readonly CLANG_CXX_LANGUAGE_STANDARD: "gnu++14";
        readonly CLANG_CXX_LIBRARY: "libc++";
        readonly CLANG_ENABLE_MODULES: "YES";
        readonly CLANG_ENABLE_OBJC_ARC: "YES";
        readonly CLANG_ENABLE_OBJC_WEAK: "YES";
        readonly CLANG_WARN__DUPLICATE_METHOD_MATCH: "YES";
        readonly CLANG_WARN_BLOCK_CAPTURE_AUTORELEASING: "YES";
        readonly CLANG_WARN_BOOL_CONVERSION: "YES";
        readonly CLANG_WARN_COMMA: "YES";
        readonly CLANG_WARN_CONSTANT_CONVERSION: "YES";
        readonly CLANG_WARN_DEPRECATED_OBJC_IMPLEMENTATIONS: "YES";
        readonly CLANG_WARN_DIRECT_OBJC_ISA_USAGE: "YES_ERROR";
        readonly CLANG_WARN_DOCUMENTATION_COMMENTS: "YES";
        readonly CLANG_WARN_EMPTY_BODY: "YES";
        readonly CLANG_WARN_ENUM_CONVERSION: "YES";
        readonly CLANG_WARN_INFINITE_RECURSION: "YES";
        readonly CLANG_WARN_INT_CONVERSION: "YES";
        readonly CLANG_WARN_NON_LITERAL_NULL_CONVERSION: "YES";
        readonly CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF: "YES";
        readonly CLANG_WARN_OBJC_LITERAL_CONVERSION: "YES";
        readonly CLANG_WARN_OBJC_ROOT_CLASS: "YES_ERROR";
        readonly CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER: "YES";
        readonly CLANG_WARN_RANGE_LOOP_ANALYSIS: "YES";
        readonly CLANG_WARN_STRICT_PROTOTYPES: "YES";
        readonly CLANG_WARN_SUSPICIOUS_MOVE: "YES";
        readonly CLANG_WARN_UNGUARDED_AVAILABILITY: "YES_AGGRESSIVE";
        readonly CLANG_WARN_UNREACHABLE_CODE: "YES";
        readonly COPY_PHASE_STRIP: "NO";
        readonly ENABLE_STRICT_OBJC_MSGSEND: "YES";
        readonly GCC_C_LANGUAGE_STANDARD: "gnu11";
        readonly GCC_NO_COMMON_BLOCKS: "YES";
        readonly GCC_WARN_64_TO_32_BIT_CONVERSION: "YES";
        readonly GCC_WARN_ABOUT_RETURN_TYPE: "YES_ERROR";
        readonly GCC_WARN_UNDECLARED_SELECTOR: "YES";
        readonly GCC_WARN_UNINITIALIZED_AUTOS: "YES_AGGRESSIVE";
        readonly GCC_WARN_UNUSED_FUNCTION: "YES";
        readonly GCC_WARN_UNUSED_VARIABLE: "YES";
        readonly MTL_FAST_MATH: "YES";
        readonly PRODUCT_NAME: "$(TARGET_NAME)";
        readonly SWIFT_VERSION: "5.0";
    }>;
    readonly release: Readonly<{
        readonly DEBUG_INFORMATION_FORMAT: "dwarf-with-dsym";
        readonly ENABLE_NS_ASSERTIONS: "NO";
        readonly MTL_ENABLE_DEBUG_INFO: "NO";
        readonly SWIFT_COMPILATION_MODE: "wholemodule";
        readonly SWIFT_OPTIMIZATION_LEVEL: "-O";
    }>;
    readonly debug: Readonly<{
        readonly DEBUG_INFORMATION_FORMAT: "dwarf";
        readonly ENABLE_TESTABILITY: "YES";
        readonly GCC_DYNAMIC_NO_PIC: "NO";
        readonly GCC_OPTIMIZATION_LEVEL: "0";
        readonly GCC_PREPROCESSOR_DEFINITIONS: readonly ["DEBUG=1", "$(inherited)"];
        readonly MTL_ENABLE_DEBUG_INFO: "INCLUDE_SOURCE";
        readonly ONLY_ACTIVE_ARCH: "YES";
        readonly SWIFT_ACTIVE_COMPILATION_CONDITIONS: "DEBUG";
        readonly SWIFT_OPTIMIZATION_LEVEL: "-Onone";
    }>;
}>;
//# sourceMappingURL=constants.d.ts.map