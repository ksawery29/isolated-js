import { EventHandlerType } from "./iframe";

export type EventListener = { eventListener: { name: string; max: number } };
type AnyFunction = ((...args: any[]) => any) | null;
export interface PredefinedFunctions {
    [key: string]: AnyFunction | EventListener;
}

export interface IsolatedSettings {
    onConsole?: (type: EventHandlerType["method"], ...content: any[]) => void | Promise<void>; // on console.(log/warn/err)
    onError?: (error: any | Error) => void | Promise<void>; // on uncaught error by e.g throw new Error() in the isolated code
    predefinedFunctions?: PredefinedFunctions | undefined;
    hide?: boolean;
    timeout?: number;
    beforeInit?: (element: HTMLIFrameElement) => void | Promise<void>;
    maxIframes?: number;
    removeOnFinish?: boolean;
    showErrorOnBadOrigin?: boolean;
    allowEventCreationAfterInit?: boolean;
    maxGlobalEventListeners?: number; // max number of all event listeners, default is -1 (infinite)
    dangerousBeforeCode?: string;
    maxHeapSize?: number; // max heap size in bytes, default is 10000000 (10mb)
    reportHeapSize?: {
        shouldReport: boolean;
        interval: number; // in ms
        onHeapSize?: (size: number) => void | Promise<void>; // on heap size
    }; // report heap size in bytes, default is false, if true, every second it will be dispatched to _isolated_js_heap_size
}

export interface StartReturn {
    element: HTMLIFrameElement;
    dispatch: (name: string, args: object) => void;
}
