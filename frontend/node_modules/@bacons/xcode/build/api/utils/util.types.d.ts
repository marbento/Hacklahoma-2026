/** The list of input keys will become optional, everything else will remain the same. */
export declare type PickPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
/** Makes everything optional except the list of input keys */
export declare type PickRequired<T, K extends keyof T> = Partial<Omit<T, K>> & Required<Pick<T, K>>;
/** Auto ignore isa */
export declare type SansIsa<T> = Omit<T, "isa">;
export declare type Entries<T> = {
    [K in keyof T]: [K, T[K]];
}[keyof T][];
export declare type EntriesAnyValue<T> = {
    [K in keyof T]: [K, any];
}[keyof T][];
/** Like `keysof` but for values. */
export declare type ValueOf<T> = T[keyof T];
export declare type OmitType<T, V, WithNevers = {
    [K in keyof T]: Exclude<T[K], undefined> extends V ? never : T[K] extends Record<string, unknown> ? OmitType<T[K], V> : T[K];
}> = Pick<WithNevers, {
    [K in keyof WithNevers]: WithNevers[K] extends never ? never : K;
}[keyof WithNevers]>;
export declare type OnlyValuesOfType<T, V, WithNevers = {
    [K in keyof T]: Exclude<T[K], undefined> extends V ? T[K] extends Record<string, unknown> ? OnlyValuesOfType<T[K], V> : T[K] : never;
}> = Pick<WithNevers, {
    [K in keyof WithNevers]: WithNevers[K] extends never ? never : K;
}[keyof WithNevers]>;
//# sourceMappingURL=util.types.d.ts.map