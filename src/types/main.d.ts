type AnyFunction = (...args: any[]) => any;
export interface PredefinedFunctions {
    [key: string]: AnyFunction;
}

export interface IsolatedSettings {
    onConsole?: (
        type: "log" | "warn" | "error",
        content: string
    ) => void | Promise<void>; // on console.(log/warn/err)
    predefinedFunctions?: PredefinedFunctions | undefined;
    hide?: boolean;
    timeout?: number;
    beforeInit?: (element: HTMLIFrameElement) => void | Promise<void>;
    maxIframes?: number;
}
