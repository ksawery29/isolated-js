type AnyFunction = (...args: any[]) => any;
export interface PredefinedFunctions {
    [key: string]: AnyFunction;
}
